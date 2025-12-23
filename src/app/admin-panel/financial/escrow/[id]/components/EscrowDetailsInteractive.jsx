'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function EscrowDetailsInteractive({ escrow }) {
  const router = useRouter();
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      held: 'bg-accent/10 text-accent border-accent/20',
      pending_release: 'bg-success/10 text-success border-success/20',
      dispute: 'bg-error/10 text-error border-error/20',
      pending_refund: 'bg-warning/10 text-warning border-warning/20',
      released: 'bg-muted text-muted-foreground border-border',
      refunded: 'bg-muted text-muted-foreground border-border'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status) => {
    const icons = {
      held: 'LockClosedIcon',
      pending_release: 'ClockIcon',
      dispute: 'ExclamationTriangleIcon',
      pending_refund: 'ArrowUturnLeftIcon',
      released: 'CheckCircleIcon',
      refunded: 'ArrowUturnLeftIcon'
    };
    return icons[status] || 'QuestionMarkCircleIcon';
  };

  const getReasonLabel = (reason) => {
    const labels = {
      awaiting_delivery: 'Awaiting Delivery',
      delivery_confirmed: 'Delivery Confirmed',
      quality_issue: 'Quality Issue',
      return_approved: 'Return Approved',
      order_cancelled: 'Order Cancelled'
    };
    return labels[reason] || reason;
  };

  const handleAction = (action) => {
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    const messages = {
      release: 'Funds released to vendor',
      refund: 'Refund processed for buyer',
      hold: 'Hold period extended',
      escalate: 'Dispute escalated to senior admin'
    };
    alert(messages[actionType] || 'Action completed');
    setShowActionModal(false);
    router.push('/admin-panel/financial/escrow');
  };

  return (
    <DashboardLayout
      role="admin"
      title={`Escrow Transaction - ${escrow.id}`}
      subtitle="View and manage escrow transaction details"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin-panel/financial/escrow"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeftIcon" size={20} />
          Back to Escrow Management
        </Link>
        
        <div className="flex gap-2">
          {escrow.status === 'pending_release' && (
            <button
              onClick={() => handleAction('release')}
              className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
            >
              <Icon name="CheckCircleIcon" size={18} />
              Release Funds
            </button>
          )}
          {escrow.status === 'pending_refund' && (
            <button
              onClick={() => handleAction('refund')}
              className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors flex items-center gap-2"
            >
              <Icon name="ArrowUturnLeftIcon" size={18} />
              Process Refund
            </button>
          )}
          {escrow.status === 'dispute' && (
            <button
              onClick={() => handleAction('escalate')}
              className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors flex items-center gap-2"
            >
              <Icon name="ExclamationTriangleIcon" size={18} />
              Escalate Dispute
            </button>
          )}
          {escrow.status === 'held' && (
            <button
              onClick={() => handleAction('hold')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Icon name="ClockIcon" size={18} />
              Extend Hold
            </button>
          )}
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Escrow Transaction</h2>
              <p className="text-sm text-muted-foreground">
                {getReasonLabel(escrow.reason)}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(escrow.status)}`}>
              <Icon name={getStatusIcon(escrow.status)} size={16} />
              {escrow.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Escrow ID</p>
              <p className="text-lg font-semibold text-foreground">{escrow.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <Link href={`/order-tracking?id=${escrow.order_id}`} className="text-lg font-semibold text-primary hover:underline">
                {escrow.order_id}
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created Date</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(escrow.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Days Held</p>
              <p className="text-lg font-semibold text-foreground">{escrow.days_held} days</p>
            </div>
            {escrow.release_date && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Expected Release Date</p>
                <p className="text-lg font-semibold text-foreground">{formatDate(escrow.release_date)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Amount Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Escrowed Amount</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Held in Escrow</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(escrow.amount)}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                This amount is securely held until delivery confirmation or dispute resolution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Parties Involved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Buyer */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon name="UserIcon" size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Buyer</h3>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{escrow.buyer_name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon name="EnvelopeIcon" size={16} />
              {escrow.buyer_email}
            </p>
          </div>
        </div>

        {/* Vendor */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <Icon name="BuildingStorefrontIcon" size={24} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Vendor</h3>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{escrow.vendor_name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon name="EnvelopeIcon" size={16} />
              {escrow.vendor_email}
            </p>
          </div>
        </div>
      </div>

      {/* Product Details */}
      {escrow.product_details && (
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Product Details</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
              <Icon name="CubeIcon" size={32} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{escrow.product_details.name}</p>
              <p className="text-sm text-muted-foreground">Quantity: {escrow.product_details.quantity}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{formatCurrency(escrow.product_details.price)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Transaction Timeline</h3>
        <div className="space-y-4">
          {escrow.timeline?.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${index === 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon name={item.icon} size={20} className={item.color} />
                </div>
                {index < escrow.timeline.length - 1 && (
                  <div className="w-0.5 h-12 bg-border mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-8">
                <p className="font-medium text-foreground">{item.event}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(item.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {actionType === 'release' && 'Release Escrow Funds'}
                {actionType === 'refund' && 'Process Refund'}
                {actionType === 'hold' && 'Extend Hold Period'}
                {actionType === 'escalate' && 'Escalate Dispute'}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escrow ID</span>
                    <span className="font-medium text-foreground">{escrow.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-foreground">{formatCurrency(escrow.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Held for</span>
                    <span className="text-foreground">{escrow.days_held} days</span>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${
                actionType === 'release' ? 'bg-success/10 border-success/20' :
                actionType === 'refund' ? 'bg-warning/10 border-warning/20' :
                actionType === 'escalate' ? 'bg-error/10 border-error/20' :
                'bg-info/10 border-info/20'
              }`}>
                <p className="text-sm">
                  {actionType === 'release' && 'This will release the funds to the vendor.'}
                  {actionType === 'refund' && 'This will refund the amount to the buyer.'}
                  {actionType === 'hold' && 'This will extend the hold period by 7 days.'}
                  {actionType === 'escalate' && 'This will escalate the dispute to senior admin.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  actionType === 'release' ? 'bg-success text-white hover:bg-success/90' :
                  actionType === 'refund' ? 'bg-warning text-white hover:bg-warning/90' :
                  actionType === 'escalate' ? 'bg-error text-white hover:bg-error/90' :
                  'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

EscrowDetailsInteractive.propTypes = {
  escrow: PropTypes.shape({
    id: PropTypes.string.isRequired,
    order_id: PropTypes.string.isRequired,
    buyer_name: PropTypes.string.isRequired,
    buyer_email: PropTypes.string,
    vendor_name: PropTypes.string.isRequired,
    vendor_email: PropTypes.string,
    amount: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    reason: PropTypes.string,
    created_at: PropTypes.string,
    release_date: PropTypes.string,
    days_held: PropTypes.number,
    timeline: PropTypes.array,
    product_details: PropTypes.object
  }).isRequired
};
