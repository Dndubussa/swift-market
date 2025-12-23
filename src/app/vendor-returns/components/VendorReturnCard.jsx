'use client';

export default function VendorReturnCard({ returnData, onApprove, onReject }) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canApproveOrReject = returnData?.status === 'pending';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">
                RMA: {returnData?.rmaNumber}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(returnData?.status)}`}>
                {returnData?.status?.replace('_', ' ')?.toUpperCase()}
              </span>
              {returnData?.status === 'pending' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                  Requires Action
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Order: {returnData?.order?.orderNumber} • Requested {formatDate(returnData?.requestedAt)}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Customer Information</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{returnData?.buyer?.fullName}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{returnData?.buyer?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{returnData?.buyer?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Return Details */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Return Reason</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {returnData?.returnReason?.replace(/_/g, ' ')}
              </p>
              {returnData?.reasonDetails && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {returnData?.reasonDetails}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimated Refund</p>
              <p className="text-2xl font-bold text-gray-900">
                ${returnData?.returnItems?.reduce((sum, item) => sum + (item?.refundAmount || 0), 0)?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Items to Return</p>
          <div className="space-y-2">
            {returnData?.returnItems?.map((item) => (
              <div key={item?.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                {item?.productImage && (
                  <img
                    src={item?.productImage}
                    alt={item?.productName || 'Product'}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item?.productName}
                  </p>
                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                    <span>Qty to return: {item?.quantity}</span>
                    <span>•</span>
                    <span>Original qty: {item?.originalQuantity}</span>
                    <span>•</span>
                    <span>${item?.unitPrice?.toFixed(2)} each</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  ${item?.refundAmount?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {canApproveOrReject && (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onReject?.(returnData)}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
            <button
              onClick={() => onApprove?.(returnData)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve Return
            </button>
          </div>
        )}

        {/* Status Information */}
        {!canApproveOrReject && (
          <div className="pt-4 border-t border-gray-200">
            {returnData?.status === 'approved' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-xs font-medium text-green-800 mb-1">Approved</p>
                <p className="text-sm text-green-700">
                  Approved on {formatDate(returnData?.approvedAt)} • Refund: ${returnData?.refundAmount?.toFixed(2)}
                </p>
                {returnData?.vendorNotes && (
                  <p className="mt-2 text-sm text-green-700">Notes: {returnData?.vendorNotes}</p>
                )}
              </div>
            )}
            {returnData?.status === 'rejected' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-xs font-medium text-red-800 mb-1">Rejected</p>
                <p className="text-sm text-red-700">
                  Rejected on {formatDate(returnData?.rejectedAt)}
                </p>
                {returnData?.rejectionReason && (
                  <p className="mt-2 text-sm text-red-700">Reason: {returnData?.rejectionReason}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}