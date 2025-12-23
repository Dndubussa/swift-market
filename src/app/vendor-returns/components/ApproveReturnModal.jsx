'use client';
import { useState } from 'react';
import { returnService } from '../../../lib/services/returnService';
import { emailService } from '../../../lib/services/emailService';

export default function ApproveReturnModal({ returnData, onClose }) {
  const [vendorNotes, setVendorNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState(
    returnData?.returnItems?.reduce((sum, item) => sum + (item?.refundAmount || 0), 0)?.toFixed(2) || '0.00'
  );
  const [refundMethod, setRefundMethod] = useState('original_payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      setError('');

      await returnService?.approveReturn(
        returnData?.id,
        vendorNotes,
        parseFloat(refundAmount),
        refundMethod
      );

      try {
        await emailService?.sendReturnApproval({
          customerEmail: returnData?.buyer?.email || 'customer@example.com',
          customerName: returnData?.buyer?.fullName || 'Customer',
          rmaNumber: returnData?.rmaNumber,
          refundAmount: parseFloat(refundAmount),
          refundMethod: refundMethod?.replace('_', ' ')
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      onClose?.();
    } catch (err) {
      setError(err?.message || 'Failed to approve return');
    } finally {
      setLoading(false);
    }
  };

  const maxRefundAmount = returnData?.returnItems?.reduce((sum, item) => sum + (item?.refundAmount || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Approve Return Request</h3>
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
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">RMA Number: {returnData?.rmaNumber}</p>
            <p className="text-sm text-gray-600">Customer: {returnData?.buyer?.fullName}</p>
            <p className="text-sm text-gray-600">
              Items: {returnData?.returnItems?.length} item(s)
            </p>
          </div>

          {/* Refund Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={maxRefundAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e?.target?.value)}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Maximum refundable amount: ${maxRefundAmount?.toFixed(2)}
            </p>
          </div>

          {/* Refund Method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Method <span className="text-red-500">*</span>
            </label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e?.target?.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              required
            >
              <option value="original_payment">Original Payment Method</option>
              <option value="store_credit">Store Credit</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Vendor Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes for Customer (Optional)
            </label>
            <textarea
              value={vendorNotes}
              onChange={(e) => setVendorNotes(e?.target?.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              placeholder="Add any instructions or notes for the customer..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Approving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Return
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}