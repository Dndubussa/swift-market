'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';

export default function PayoutHistory({ payouts }) {
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS'
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      mobile_money: 'Mobile Money',
      bank_transfer: 'Bank Transfer',
      card: 'Card',
      clickpesa: 'ClickPesa'
    };
    return labels?.[method] || method;
  };

  const filteredPayouts = payouts?.filter(payout => {
    if (filterMethod !== 'all' && payout?.payment_method !== filterMethod) {
      return false;
    }
    
    if (dateRange !== 'all') {
      const payoutDate = new Date(payout.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now - payoutDate) / (1000 * 60 * 60 * 24));
      
      if (dateRange === '7days' && daysDiff > 7) return false;
      if (dateRange === '30days' && daysDiff > 30) return false;
      if (dateRange === '90days' && daysDiff > 90) return false;
    }
    
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
            <p className="mt-1 text-sm text-gray-500">
              Chronological record of all processed refunds
            </p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e?.target?.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="clickpesa">ClickPesa</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e?.target?.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayouts?.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-sm">No payout history found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayouts?.map((payout) => (
                <tr key={payout?.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {payout?.transaction_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payout?.orders?.order_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payout?.orders?.buyer?.full_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatAmount(payout?.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getPaymentMethodLabel(payout?.payment_method)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payout?.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {filteredPayouts?.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2 text-sm">No payout history found</p>
          </div>
        ) : (
          filteredPayouts?.map((payout) => (
            <div key={payout?.id} className="px-6 py-4">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {getPaymentMethodLabel(payout?.payment_method)}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatAmount(payout?.amount)}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order:</span>
                  <span className="text-gray-900">{payout?.orders?.order_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer:</span>
                  <span className="text-gray-900">{payout?.orders?.buyer?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{payout?.transaction_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-900">{formatDate(payout?.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Footer Summary */}
      {filteredPayouts?.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {filteredPayouts?.length} of {payouts?.length} transactions
            </span>
            <span className="text-sm font-semibold text-gray-900">
              Total: {formatAmount(filteredPayouts?.reduce((sum, p) => sum + parseFloat(p?.amount || 0), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

PayoutHistory.propTypes = {
  payouts: PropTypes?.arrayOf(PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    amount: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number])?.isRequired,
    payment_method: PropTypes?.string,
    transaction_id: PropTypes?.string,
    created_at: PropTypes?.string?.isRequired,
    orders: PropTypes?.shape({
      order_number: PropTypes?.string,
      buyer: PropTypes?.shape({
        full_name: PropTypes?.string
      })
    })
  }))?.isRequired
};