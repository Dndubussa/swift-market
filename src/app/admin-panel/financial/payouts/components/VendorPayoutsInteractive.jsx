'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function VendorPayoutsInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPayouts, setSelectedPayouts] = useState([]);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingPayout, setProcessingPayout] = useState(null);

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      processing: 'bg-info/10 text-info border-info/20',
      completed: 'bg-success/10 text-success border-success/20',
      failed: 'bg-error/10 text-error border-error/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'ClockIcon',
      processing: 'ArrowPathIcon',
      completed: 'CheckCircleIcon',
      failed: 'XCircleIcon'
    };
    return icons[status] || 'QuestionMarkCircleIcon';
  };

  const filteredPayouts = initialData?.payouts?.filter(payout => 
    selectedStatus === 'all' || payout.status === selectedStatus
  ) || [];

  const handleSelectPayout = (payoutId) => {
    setSelectedPayouts(prev => 
      prev.includes(payoutId)
        ? prev.filter(id => id !== payoutId)
        : [...prev, payoutId]
    );
  };

  const handleSelectAll = () => {
    const pendingIds = filteredPayouts
      .filter(p => p.status === 'pending')
      .map(p => p.id);
    
    if (selectedPayouts.length === pendingIds.length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(pendingIds);
    }
  };

  const handleProcessPayout = (payout) => {
    setProcessingPayout(payout);
    setShowProcessModal(true);
  };

  const handleBulkProcess = () => {
    if (selectedPayouts.length === 0) {
      alert('Please select at least one payout to process');
      return;
    }
    // Simulate bulk processing
    alert(`Processing ${selectedPayouts.length} payouts...`);
  };

  const confirmProcess = () => {
    alert(`Payout ${processingPayout.id} processed successfully!`);
    setShowProcessModal(false);
    setProcessingPayout(null);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Vendor Payouts"
      subtitle="Process and manage vendor payment requests"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Amount</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(initialData?.summary?.total_pending)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.summary?.pending_count} vendors
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Processing</p>
          <p className="text-2xl font-bold text-info">
            {initialData?.summary?.processing_count}
          </p>
          <p className="text-xs text-muted-foreground mt-1">In progress</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Next Payout</p>
          <p className="text-lg font-bold text-foreground">
            {formatDate(initialData?.summary?.next_payout_date)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Scheduled date</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">This Month</p>
          <p className="text-lg font-bold text-success">
            {formatCurrency(initialData?.summary?.total_processed_this_month)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Processed</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Selected</p>
          <p className="text-2xl font-bold text-primary">
            {selectedPayouts.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedPayouts.length > 0 
              ? formatCurrency(
                  filteredPayouts
                    .filter(p => selectedPayouts.includes(p.id))
                    .reduce((sum, p) => sum + p.net_amount, 0)
                )
              : 'No selection'
            }
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {initialData?.filters?.statuses?.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {selectedPayouts.length > 0 && (
              <button
                onClick={handleBulkProcess}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
              >
                <Icon name="CheckCircleIcon" size={18} />
                Process Selected ({selectedPayouts.length})
              </button>
            )}
            <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
              <Icon name="FunnelIcon" size={18} />
              Filters
            </button>
            <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
              <Icon name="ArrowDownTrayIcon" size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPayouts.length > 0 && selectedPayouts.length === filteredPayouts.filter(p => p.status === 'pending').length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-border"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Payout ID</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Orders</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    {payout.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedPayouts.includes(payout.id)}
                        onChange={() => handleSelectPayout(payout.id)}
                        className="w-4 h-4 rounded border-border"
                      />
                    )}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin-panel/financial/payouts/${payout.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {payout.id}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{payout.vendor_name}</p>
                      <p className="text-xs text-muted-foreground">{payout.vendor_email}</p>
                      <p className="text-xs text-muted-foreground">A/C: {payout.bank_account}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(payout.net_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        Gross: {formatCurrency(payout.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fee: {formatCurrency(payout.commission)}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground">{payout.order_count}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payout.status)}`}>
                      <Icon name={getStatusIcon(payout.status)} size={14} />
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                    {payout.error_message && (
                      <p className="text-xs text-error mt-1">{payout.error_message}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-foreground">{formatDate(payout.due_date)}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {formatDate(payout.created_at)}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {payout.status === 'pending' && (
                        <button
                          onClick={() => handleProcessPayout(payout)}
                          className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                          title="Process Payout"
                        >
                          <Icon name="CheckCircleIcon" size={16} />
                        </button>
                      )}
                      <Link
                        href={`/admin-panel/financial/payouts/${payout.id}`}
                        className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        title="View Details"
                      >
                        <Icon name="EyeIcon" size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayouts.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No payouts found for the selected filter</p>
          </div>
        )}
      </div>

      {/* Process Modal */}
      {showProcessModal && processingPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Process Payout</h3>
              <button
                onClick={() => setShowProcessModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">{processingPayout.vendor_name}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payout ID</p>
                    <p className="font-medium text-foreground">{processingPayout.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Orders</p>
                    <p className="font-medium text-foreground">{processingPayout.order_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gross Amount</p>
                    <p className="font-medium text-foreground">{formatCurrency(processingPayout.amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Commission (5%)</p>
                    <p className="font-medium text-foreground">{formatCurrency(processingPayout.commission)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-muted-foreground text-sm">Net Payout</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(processingPayout.net_amount)}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Bank Account: {processingPayout.bank_account}</p>
                </div>
              </div>

              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  <Icon name="ExclamationTriangleIcon" size={16} className="inline mr-1" />
                  This action will initiate a bank transfer. Please confirm the details before proceeding.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmProcess}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90"
              >
                Confirm & Process
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

VendorPayoutsInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    payouts: PropTypes.array,
    filters: PropTypes.object
  })
};
