'use client';
import { useState } from 'react';
import { returnService } from '../../../lib/services/returnService';
import { emailService } from '../../../lib/services/emailService';

export default function RejectReturnModal({ returnData, onClose }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonReasons = [
    'Items not eligible for return',
    'Return window has expired',
    'Items show signs of use or damage',
    'Missing original packaging',
    'Items do not match return request',
    'Other (specify below)'
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!rejectionReason?.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await returnService?.rejectReturn(returnData?.id, rejectionReason);

      try {
        await emailService?.sendReturnRejection({
          customerEmail: returnData?.buyer?.email || 'customer@example.com',
          customerName: returnData?.buyer?.fullName || 'Customer',
          rmaNumber: returnData?.rmaNumber,
          rejectionReason: rejectionReason
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      onClose?.();
    } catch (err) {
      setError(err?.message || 'Failed to reject return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Reject Return Request</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Return Info */}
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">Warning: This action cannot be undone</p>
            <p className="text-sm text-red-700 mt-1">
              RMA: {returnData?.rmaNumber} • Customer: {returnData?.buyer?.fullName}
            </p>
          </div>

          {/* Quick Select Reasons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Common Rejection Reasons
            </label>
            <div className="space-y-2">
              {commonReasons?.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectionReason(reason)}
                  className={`w-full text-left px-3 py-2 border rounded-md text-sm ${
                    rejectionReason === reason
                      ? 'border-red-500 bg-red-50 text-red-700' :'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e?.target?.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              placeholder="Provide a clear reason for rejecting this return request..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This reason will be sent to the customer via email
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !rejectionReason?.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Rejecting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Return
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}