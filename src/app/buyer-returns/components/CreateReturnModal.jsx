'use client';
import { useState, useEffect } from 'react';
import { returnService } from '../../../lib/services/returnService';
import { emailService } from '../../../lib/services/emailService';

export default function CreateReturnModal({ onClose, onSuccess }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const returnReasons = [
    { value: 'defective', label: 'Defective or damaged product' },
    { value: 'wrong_item', label: 'Wrong item received' },
    { value: 'not_as_described', label: 'Not as described' },
    { value: 'damaged', label: 'Arrived damaged' },
    { value: 'size_issue', label: 'Size or fit issue' },
    { value: 'changed_mind', label: 'Changed my mind' },
    { value: 'quality_issue', label: 'Quality not as expected' },
    { value: 'other', label: 'Other reason' }
  ];

  useEffect(() => {
    loadEligibleOrders();
  }, []);

  const loadEligibleOrders = async () => {
    try {
      const data = await returnService?.getEligibleOrders();
      setOrders(data);
    } catch (err) {
      setError(err?.message || 'Failed to load orders');
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setSelectedItems([]);
  };

  const handleItemToggle = (item) => {
    setSelectedItems(prev => {
      const exists = prev?.find(i => i?.id === item?.id);
      if (exists) {
        return prev?.filter(i => i?.id !== item?.id);
      } else {
        return [...prev, { 
          orderItemId: item?.id, 
          quantity: 1,
          refundAmount: item?.totalPrice 
        }];
      }
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedOrder || selectedItems?.length === 0 || !returnReason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const returnData = await returnService?.createReturn({
        orderId: selectedOrder?.id,
        vendorId: selectedOrder?.vendorId,
        returnReason,
        reasonDetails
      });

      await returnService?.addReturnItems(returnData?.id, selectedItems);

      try {
        await emailService?.sendReturnConfirmation({
          customerEmail: returnData?.buyerEmail || 'customer@example.com',
          customerName: 'Customer',
          rmaNumber: returnData?.rmaNumber,
          orderNumber: selectedOrder?.orderNumber,
          returnReason: returnReasons?.find(r => r?.value === returnReason)?.label || returnReason
        });

        await emailService?.sendVendorNewReturn({
          vendorEmail: selectedOrder?.vendor?.businessEmail || 'vendor@example.com',
          rmaNumber: returnData?.rmaNumber,
          orderNumber: selectedOrder?.orderNumber,
          customerName: 'Customer',
          returnReason: returnReasons?.find(r => r?.value === returnReason)?.label || returnReason,
          reasonDetails: reasonDetails || 'No additional details provided'
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }

      onSuccess?.();
    } catch (err) {
      setError(err?.message || 'Failed to create return request');
    } finally {
      setLoading(false);
    }
  };

  const totalRefundAmount = selectedItems?.reduce((sum, item) => sum + (item?.refundAmount || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Create Return Request</h3>
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

          {/* Select Order */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Order <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedOrder?.id || ''}
              onChange={(e) => {
                const order = orders?.find(o => o?.id === e?.target?.value);
                handleOrderSelect(order);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Choose an order...</option>
              {orders?.map((order) => (
                <option key={order?.id} value={order?.id}>
                  {order?.orderNumber} - ${order?.totalAmount} - {new Date(order?.createdAt)?.toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Select Items */}
          {selectedOrder && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Items to Return <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                {selectedOrder?.items?.map((item) => (
                  <label key={item?.id} className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems?.some(i => i?.orderItemId === item?.id) || false}
                      onChange={() => handleItemToggle(item)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{item?.productName}</span>
                        <span className="text-sm text-gray-500">${item?.totalPrice}</span>
                      </div>
                      <p className="text-xs text-gray-500">Qty: {item?.quantity} × ${item?.unitPrice}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Return Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e?.target?.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Choose a reason...</option>
              {returnReasons?.map((reason) => (
                <option key={reason?.value} value={reason?.value}>
                  {reason?.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Details */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e?.target?.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Please provide any additional details about your return..."
            />
          </div>

          {/* Total Refund */}
          {selectedItems?.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Estimated Refund Amount:</span>
                <span className="text-lg font-bold text-blue-600">${totalRefundAmount?.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedOrder || selectedItems?.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}