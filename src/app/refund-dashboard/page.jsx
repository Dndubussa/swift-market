'use client';

import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase';
import RefundTable from './components/RefundTable';
import PaymentStatusTracker from './components/PaymentStatusTracker';
import ReconciliationPanel from './components/ReconciliationPanel';
import FinancialSummary from './components/FinancialSummary';
import PayoutHistory from './components/PayoutHistory';
import RefundFilters from './components/RefundFilters';

export default function RefundDashboard() {
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    refundType: 'all',
    status: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  const supabase = createClient();

  useEffect(() => {
    fetchRefundData();
  }, [filters]);

  const fetchRefundData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pending refunds from disputes
      const { data: disputeRefunds, error: disputeError } = await supabase?.from('disputes')?.select(`
          id,
          order_id,
          dispute_type,
          amount,
          status,
          resolution,
          created_at,
          orders (
            id,
            order_number,
            total_amount,
            buyer:buyer_id (
              id,
              full_name,
              email
            )
          )
        `)?.in('status', ['pending', 'under_review', 'resolved'])?.order('created_at', { ascending: false });

      if (disputeError) throw disputeError;

      // Fetch pending refunds from returns
      const { data: returnRefunds, error: returnError } = await supabase?.from('returns')?.select(`
          id,
          order_id,
          reason,
          refund_amount,
          status,
          created_at,
          orders (
            id,
            order_number,
            total_amount,
            buyer:buyer_id (
              id,
              full_name,
              email
            )
          )
        `)?.in('status', ['pending', 'approved'])?.order('created_at', { ascending: false });

      if (returnError) throw returnError;

      // Fetch payment statuses
      const { data: payments, error: paymentError } = await supabase?.from('payments')?.select('*')?.in('payment_status', ['pending', 'processing', 'refund_pending'])?.order('created_at', { ascending: false });

      if (paymentError) throw paymentError;

      // Fetch payout history
      const { data: payouts, error: payoutError } = await supabase?.from('payments')?.select(`
          id,
          amount,
          payment_method,
          payment_status,
          transaction_id,
          created_at,
          orders (
            order_number,
            buyer:buyer_id (
              full_name
            )
          )
        `)?.eq('payment_status', 'refunded')?.order('created_at', { ascending: false })?.limit(50);

      if (payoutError) throw payoutError;

      // Format and combine refund data
      const formattedDisputeRefunds = disputeRefunds?.map(dispute => ({
        id: dispute?.id,
        type: 'dispute',
        refundType: dispute?.dispute_type,
        orderId: dispute?.orders?.order_number || 'N/A',
        customerName: dispute?.orders?.buyer?.full_name || 'Unknown',
        customerEmail: dispute?.orders?.buyer?.email || 'N/A',
        amount: dispute?.amount || dispute?.orders?.total_amount || 0,
        status: dispute?.status,
        createdAt: dispute?.created_at,
        resolution: dispute?.resolution
      })) || [];

      const formattedReturnRefunds = returnRefunds?.map(returnItem => ({
        id: returnItem?.id,
        type: 'return',
        refundType: returnItem?.reason,
        orderId: returnItem?.orders?.order_number || 'N/A',
        customerName: returnItem?.orders?.buyer?.full_name || 'Unknown',
        customerEmail: returnItem?.orders?.buyer?.email || 'N/A',
        amount: returnItem?.refund_amount || returnItem?.orders?.total_amount || 0,
        status: returnItem?.status,
        createdAt: returnItem?.created_at,
        resolution: null
      })) || [];

      const allRefunds = [...formattedDisputeRefunds, ...formattedReturnRefunds];

      // Apply filters
      let filteredRefunds = allRefunds;
      if (filters?.refundType !== 'all') {
        filteredRefunds = filteredRefunds?.filter(r => r?.type === filters?.refundType);
      }
      if (filters?.status !== 'all') {
        filteredRefunds = filteredRefunds?.filter(r => r?.status === filters?.status);
      }
      if (filters?.searchQuery) {
        const query = filters?.searchQuery?.toLowerCase();
        filteredRefunds = filteredRefunds?.filter(r => 
          r?.orderId?.toLowerCase()?.includes(query) ||
          r?.customerName?.toLowerCase()?.includes(query) ||
          r?.customerEmail?.toLowerCase()?.includes(query)
        );
      }

      setPendingRefunds(filteredRefunds);
      setPaymentStatuses(payments || []);
      setPayoutHistory(payouts || []);

      // Calculate financial summary
      const totalPending = filteredRefunds?.reduce((sum, r) => 
        ['pending', 'under_review', 'approved']?.includes(r?.status) ? sum + parseFloat(r?.amount || 0) : sum, 0
      );
      const totalProcessed = payouts?.reduce((sum, p) => sum + parseFloat(p?.amount || 0), 0) || 0;
      const totalDisputes = formattedDisputeRefunds?.length;
      const totalReturns = formattedReturnRefunds?.length;

      setFinancialSummary({
        totalPending,
        totalProcessed,
        totalDisputes,
        totalReturns,
        outstandingBalance: totalPending
      });

    } catch (err) {
      console.error('Error fetching refund data:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (refundId, refundType) => {
    try {
      const table = refundType === 'dispute' ? 'disputes' : 'returns';
      const { error } = await supabase?.from(table)?.update({ 
          status: 'resolved',
          resolution: refundType === 'dispute' ? 'refund_approved' : null,
          updated_at: new Date()?.toISOString()
        })?.eq('id', refundId);

      if (error) throw error;
      
      await fetchRefundData();
    } catch (err) {
      console.error('Error approving refund:', err);
      alert(`Error: ${err?.message}`);
    }
  };

  const handleBulkApproval = async (refundIds) => {
    try {
      const disputeIds = refundIds?.filter(r => r?.type === 'dispute')?.map(r => r?.id);
      const returnIds = refundIds?.filter(r => r?.type === 'return')?.map(r => r?.id);

      if (disputeIds?.length > 0) {
        const { error: disputeError } = await supabase?.from('disputes')?.update({ 
            status: 'resolved',
            resolution: 'refund_approved',
            updated_at: new Date()?.toISOString()
          })?.in('id', disputeIds);
        
        if (disputeError) throw disputeError;
      }

      if (returnIds?.length > 0) {
        const { error: returnError } = await supabase?.from('returns')?.update({ 
            status: 'resolved',
            updated_at: new Date()?.toISOString()
          })?.in('id', returnIds);
        
        if (returnError) throw returnError;
      }

      await fetchRefundData();
    } catch (err) {
      console.error('Error processing bulk approval:', err);
      alert(`Error: ${err?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading refund dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchRefundData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Refund Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Unified financial operations for disputes, returns, and payouts
              </p>
            </div>
            <button
              onClick={fetchRefundData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Summary Cards */}
        {financialSummary && (
          <FinancialSummary summary={financialSummary} />
        )}

        {/* Filters */}
        <div className="mt-6">
          <RefundFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Pending Refunds Table */}
        <div className="mt-6">
          <RefundTable
            refunds={pendingRefunds}
            onApprove={handleApproveRefund}
            onBulkApprove={handleBulkApproval}
          />
        </div>

        {/* Payment Status Tracker */}
        <div className="mt-6">
          <PaymentStatusTracker payments={paymentStatuses} />
        </div>

        {/* Reconciliation Panel */}
        <div className="mt-6">
          <ReconciliationPanel 
            refunds={pendingRefunds}
            payments={paymentStatuses}
          />
        </div>

        {/* Payout History */}
        <div className="mt-6">
          <PayoutHistory payouts={payoutHistory} />
        </div>
      </div>
    </div>
  );
}