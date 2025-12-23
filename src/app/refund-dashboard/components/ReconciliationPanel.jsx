'use client';

import { useState, useEffect } from 'prop-types';
import PropTypes from 'prop-types';

export default function ReconciliationPanel({ refunds, payments }) {
  const [reconciliations, setReconciliations] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);

  useEffect(() => {
    performReconciliation();
  }, [refunds, payments]);

  const performReconciliation = () => {
    const matched = [];
    const unmatched = [];

    // Match refunds with payments
    refunds?.forEach(refund => {
      const matchingPayment = payments?.find(p => 
        p?.order_id === refund?.orderId && 
        Math.abs(parseFloat(p?.amount) - parseFloat(refund?.amount)) < 1
      );

      if (matchingPayment) {
        matched?.push({
          refundId: refund?.id,
          paymentId: matchingPayment?.id,
          orderId: refund?.orderId,
          amount: refund?.amount,
          status: 'matched',
          matchedAt: new Date()?.toISOString()
        });
      } else if (['pending', 'approved']?.includes(refund?.status)) {
        unmatched?.push({
          refundId: refund?.id,
          orderId: refund?.orderId,
          amount: refund?.amount,
          type: refund?.type,
          status: 'unmatched',
          reason: 'No matching payment found'
        });
      }
    });

    setReconciliations(matched);
    setDiscrepancies(unmatched);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS'
    })?.format(amount || 0);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Reconciliation Panel</h2>
        <p className="mt-1 text-sm text-gray-500">
          Automated matching between refund requests and payment confirmations
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Matched Reconciliations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Matched Transactions</h3>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {reconciliations?.length} matched
            </span>
          </div>
          
          {reconciliations?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No matched transactions yet</p>
          ) : (
            <div className="space-y-2">
              {reconciliations?.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{rec?.orderId}</p>
                      <p className="text-xs text-gray-500">Refund and payment matched</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatAmount(rec?.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discrepancies */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Discrepancies for Review</h3>
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              {discrepancies?.length} unmatched
            </span>
          </div>
          
          {discrepancies?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No discrepancies found</p>
          ) : (
            <div className="space-y-2">
              {discrepancies?.map((disc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{disc?.orderId}</p>
                      <p className="text-xs text-gray-500">{disc?.reason}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                        {disc?.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatAmount(disc?.amount)}</p>
                    <button className="mt-1 text-xs text-blue-600 hover:text-blue-800">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{reconciliations?.length}</p>
              <p className="text-xs text-gray-500">Matched</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{discrepancies?.length}</p>
              <p className="text-xs text-gray-500">Discrepancies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {reconciliations?.length + discrepancies?.length}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReconciliationPanel.propTypes = {
  refunds: PropTypes?.array?.isRequired,
  payments: PropTypes?.array?.isRequired
};