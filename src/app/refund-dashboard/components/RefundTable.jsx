'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';

export default function RefundTable({ refunds, onApprove, onBulkApprove }) {
  const [selectedRefunds, setSelectedRefunds] = useState([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      setSelectedRefunds(refunds?.filter(r => 
        ['pending', 'under_review', 'approved']?.includes(r?.status)
      ));
    } else {
      setSelectedRefunds([]);
    }
  };

  const handleSelectRefund = (refund) => {
    setSelectedRefunds(prev => {
      const exists = prev?.find(r => r?.id === refund?.id);
      if (exists) {
        return prev?.filter(r => r?.id !== refund?.id);
      }
      return [...prev, refund];
    });
  };

  const handleBulkApprove = () => {
    if (selectedRefunds?.length === 0) return;
    setShowBulkConfirm(true);
  };

  const confirmBulkApproval = () => {
    onBulkApprove(selectedRefunds);
    setSelectedRefunds([]);
    setShowBulkConfirm(false);
  };

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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      resolved: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    return type === 'dispute' ?'bg-purple-100 text-purple-800' :'bg-indigo-100 text-indigo-800';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pending Refunds</h2>
            <p className="mt-1 text-sm text-gray-500">
              {refunds?.length} refunds requiring processing
            </p>
          </div>
          {selectedRefunds?.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve {selectedRefunds?.length} Selected
            </button>
          )}
        </div>
      </div>
      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRefunds?.length === refunds?.filter(r => 
                    ['pending', 'under_review', 'approved']?.includes(r?.status)
                  )?.length && refunds?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {refunds?.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm">No pending refunds found</p>
                  </div>
                </td>
              </tr>
            ) : (
              refunds?.map((refund) => (
                <tr key={`${refund?.type}-${refund?.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {['pending', 'under_review', 'approved']?.includes(refund?.status) && (
                      <input
                        type="checkbox"
                        checked={selectedRefunds?.some(r => r?.id === refund?.id)}
                        onChange={() => handleSelectRefund(refund)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(refund?.type)}`}>
                      {refund?.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {refund?.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{refund?.customerName}</div>
                    <div className="text-sm text-gray-500">{refund?.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatAmount(refund?.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(refund?.status)}`}>
                      {refund?.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(refund?.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {['pending', 'under_review', 'approved']?.includes(refund?.status) && (
                      <button
                        onClick={() => onApprove(refund?.id, refund?.type)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {refunds?.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm">No pending refunds found</p>
          </div>
        ) : (
          refunds?.map((refund) => (
            <div key={`${refund?.type}-${refund?.id}`} className="px-6 py-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {['pending', 'under_review', 'approved']?.includes(refund?.status) && (
                    <input
                      type="checkbox"
                      checked={selectedRefunds?.some(r => r?.id === refund?.id)}
                      onChange={() => handleSelectRefund(refund)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(refund?.type)}`}>
                    {refund?.type}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(refund?.status)}`}>
                  {refund?.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Order ID:</span>
                  <span className="text-sm font-medium text-gray-900">{refund?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Customer:</span>
                  <span className="text-sm text-gray-900">{refund?.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatAmount(refund?.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Date:</span>
                  <span className="text-sm text-gray-900">{formatDate(refund?.createdAt)}</span>
                </div>
              </div>
              {['pending', 'under_review', 'approved']?.includes(refund?.status) && (
                <button
                  onClick={() => onApprove(refund?.id, refund?.type)}
                  className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve Refund
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {/* Bulk Approval Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Bulk Approval</h3>
            <p className="text-gray-600 mb-4">
              You are about to approve {selectedRefunds?.length} refunds totaling{' '}
              {formatAmount(selectedRefunds?.reduce((sum, r) => sum + parseFloat(r?.amount || 0), 0))}.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkApproval}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

RefundTable.propTypes = {
  refunds: PropTypes?.arrayOf(PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    type: PropTypes?.string?.isRequired,
    orderId: PropTypes?.string?.isRequired,
    customerName: PropTypes?.string?.isRequired,
    customerEmail: PropTypes?.string?.isRequired,
    amount: PropTypes?.number?.isRequired,
    status: PropTypes?.string?.isRequired,
    createdAt: PropTypes?.string?.isRequired
  }))?.isRequired,
  onApprove: PropTypes?.func?.isRequired,
  onBulkApprove: PropTypes?.func?.isRequired
};