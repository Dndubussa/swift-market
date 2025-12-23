'use client';
import Link from 'next/link';

export default function ReturnCard({ returnData, statusColor }) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRefundStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600',
      processing: 'text-blue-600',
      completed: 'text-green-600',
      failed: 'text-red-600'
    };
    return colors?.[status] || 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">
                RMA: {returnData?.rmaNumber}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                {returnData?.status?.replace('_', ' ')?.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Order: <Link href={`/order-tracking?orderId=${returnData?.orderId}`} className="text-blue-600 hover:underline">
                {returnData?.order?.orderNumber}
              </Link>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Requested</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(returnData?.requestedAt)}</p>
          </div>
        </div>

        {/* Return Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Return Reason</p>
            <p className="mt-1 text-sm text-gray-900 capitalize">
              {returnData?.returnReason?.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Refund Status</p>
            <p className={`mt-1 text-sm font-medium capitalize ${getRefundStatusColor(returnData?.refundStatus)}`}>
              {returnData?.refundStatus?.replace('_', ' ')}
            </p>
          </div>
          {returnData?.refundAmount && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Refund Amount</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                ${returnData?.refundAmount?.toFixed(2)}
              </p>
            </div>
          )}
          {returnData?.refundMethod && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Refund Method</p>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {returnData?.refundMethod?.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Items to Return</p>
          <div className="space-y-2">
            {returnData?.returnItems?.map((item) => (
              <div key={item?.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                {item?.productImage && (
                  <img
                    src={item?.productImage}
                    alt={item?.productName || 'Product'}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item?.productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item?.quantity} × ${item?.unitPrice?.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${item?.refundAmount?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status-specific Messages */}
        {returnData?.status === 'approved' && returnData?.vendorNotes && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-xs font-medium text-green-800 mb-1">Vendor Notes:</p>
            <p className="text-sm text-green-700">{returnData?.vendorNotes}</p>
          </div>
        )}

        {returnData?.status === 'rejected' && returnData?.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-700">{returnData?.rejectionReason}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              <span className="font-medium">Requested:</span> {formatDate(returnData?.requestedAt)}
            </div>
            {returnData?.approvedAt && (
              <div>
                <span className="font-medium">Approved:</span> {formatDate(returnData?.approvedAt)}
              </div>
            )}
            {returnData?.rejectedAt && (
              <div>
                <span className="font-medium">Rejected:</span> {formatDate(returnData?.rejectedAt)}
              </div>
            )}
            {returnData?.completedAt && (
              <div>
                <span className="font-medium">Completed:</span> {formatDate(returnData?.completedAt)}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end">
          <Link
            href={`/buyer-returns/${returnData?.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}