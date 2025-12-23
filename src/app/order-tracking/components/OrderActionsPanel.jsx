'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function OrderActionsPanel({ orderId, orderStatus, onAction }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');

  const canCancel = ['confirmed', 'processing']?.includes(orderStatus);
  const canReturn = orderStatus === 'delivered';

  const handleCancelSubmit = () => {
    if (cancelReason?.trim()) {
      onAction('cancel', { orderId, reason: cancelReason });
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  const handleReturnSubmit = () => {
    if (returnReason?.trim()) {
      onAction('return', { orderId, reason: returnReason });
      setShowReturnModal(false);
      setReturnReason('');
    }
  };

  const handleReorder = () => {
    onAction('reorder', { orderId });
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Order Actions</h3>
        <div className="space-y-2">
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full px-4 py-2 bg-error text-error-foreground rounded-md text-sm font-medium hover:bg-error/90 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Icon name="XCircleIcon" size={18} />
              <span>Cancel Order</span>
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="w-full px-4 py-2 bg-warning text-warning-foreground rounded-md text-sm font-medium hover:bg-warning/90 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Icon name="ArrowUturnLeftIcon" size={18} />
              <span>Request Return</span>
            </button>
          )}
          <button
            onClick={handleReorder}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="ArrowPathIcon" size={18} />
            <span>Reorder Items</span>
          </button>
        </div>
      </div>
      {showCancelModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-lg shadow-modal max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Cancel Order</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 hover:bg-muted rounded transition-colors duration-200"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for cancellation. This will be sent to the vendor for approval.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e?.target?.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm min-h-[100px] resize-none"
            />
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={!cancelReason?.trim()}
                className="flex-1 px-4 py-2 bg-error text-error-foreground rounded-md text-sm font-medium hover:bg-error/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
      {showReturnModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-lg shadow-modal max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Request Return</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-1 hover:bg-muted rounded transition-colors duration-200"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for return. The vendor will review your request.
            </p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e?.target?.value)}
              placeholder="Enter return reason..."
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm min-h-[100px] resize-none"
            />
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnSubmit}
                disabled={!returnReason?.trim()}
                className="flex-1 px-4 py-2 bg-warning text-warning-foreground rounded-md text-sm font-medium hover:bg-warning/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

OrderActionsPanel.propTypes = {
  orderId: PropTypes?.string?.isRequired,
  orderStatus: PropTypes?.string?.isRequired,
  onAction: PropTypes?.func?.isRequired,
};