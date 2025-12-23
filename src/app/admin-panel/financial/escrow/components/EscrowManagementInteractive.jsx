'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function EscrowManagementInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
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
      order_cancelled: 'Order Cancelled',
      buyer_request: 'Buyer Request'
    };
    return labels[reason] || reason;
  };

  const filteredTransactions = initialData?.transactions?.filter(txn => 
    selectedStatus === 'all' || txn.status === selectedStatus
  ) || [];

  const handleAction = (transaction, action) => {
    setSelectedTransaction(transaction);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    const actionMessages = {
      release: `Funds released to vendor for ${selectedTransaction.id}`,
      refund: `Refund processed for ${selectedTransaction.id}`,
      hold: `Transaction ${selectedTransaction.id} placed on extended hold`,
      escalate: `Dispute ${selectedTransaction.id} escalated to senior admin`
    };
    
    alert(actionMessages[actionType] || 'Action completed');
    setShowActionModal(false);
    setSelectedTransaction(null);
    setActionType(null);
  };

  const statusOptions = [
    { value: 'all', label: 'All Transactions', count: initialData?.transactions?.length || 0 },
    { value: 'held', label: 'Held', count: initialData?.statusBreakdown?.held || 0 },
    { value: 'pending_release', label: 'Pending Release', count: initialData?.statusBreakdown?.pending_release || 0 },
    { value: 'dispute', label: 'In Dispute', count: initialData?.statusBreakdown?.dispute || 0 },
    { value: 'pending_refund', label: 'Pending Refund', count: initialData?.statusBreakdown?.pending_refund || 0 }
  ];

  return (
    <DashboardLayout
      role="admin"
      title="Escrow Management"
      subtitle="Monitor and manage escrow transactions for buyer protection"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BanknotesIcon" size={20} className="text-primary" />
            <p className="text-sm text-muted-foreground">Total Balance</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(initialData?.summary?.total_balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.summary?.active_transactions} active transactions
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="LockClosedIcon" size={20} className="text-accent" />
            <p className="text-sm text-muted-foreground">Held</p>
          </div>
          <p className="text-2xl font-bold text-accent">
            {formatCurrency(initialData?.summary?.held_amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.statusBreakdown?.held} transactions
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ClockIcon" size={20} className="text-success" />
            <p className="text-sm text-muted-foreground">Pending Release</p>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(initialData?.summary?.pending_release)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.statusBreakdown?.pending_release} awaiting
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ArrowUturnLeftIcon" size={20} className="text-warning" />
            <p className="text-sm text-muted-foreground">Pending Refund</p>
          </div>
          <p className="text-2xl font-bold text-warning">
            {formatCurrency(initialData?.summary?.pending_refund)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.statusBreakdown?.pending_refund} requests
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ExclamationTriangleIcon" size={20} className="text-error" />
            <p className="text-sm text-muted-foreground">In Dispute</p>
          </div>
          <p className="text-2xl font-bold text-error">
            {initialData?.statusBreakdown?.dispute}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Active disputes</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Escrow ID</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Order</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Parties</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Duration</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/admin-panel/financial/escrow/${txn.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {txn.id}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {txn.order_id}
                    </p>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/order-tracking?id=${txn.order_id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {txn.order_id}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        <Icon name="UserIcon" size={14} className="inline mr-1" />
                        {txn.buyer_name}
                      </p>
                      <p className="text-muted-foreground">
                        <Icon name="BuildingStorefrontIcon" size={14} className="inline mr-1" />
                        {txn.vendor_name}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(txn.amount)}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                      <Icon name={getStatusIcon(txn.status)} size={14} />
                      {txn.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getReasonLabel(txn.reason)}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{txn.days_held} days</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(txn.created_at)}
                      </p>
                      {txn.release_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(txn.release_date)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {txn.status === 'pending_release' && (
                        <button
                          onClick={() => handleAction(txn, 'release')}
                          className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                          title="Release Funds"
                        >
                          <Icon name="CheckCircleIcon" size={16} />
                        </button>
                      )}
                      {txn.status === 'pending_refund' && (
                        <button
                          onClick={() => handleAction(txn, 'refund')}
                          className="p-2 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors"
                          title="Process Refund"
                        >
                          <Icon name="ArrowUturnLeftIcon" size={16} />
                        </button>
                      )}
                      {txn.status === 'dispute' && (
                        <button
                          onClick={() => handleAction(txn, 'escalate')}
                          className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                          title="Escalate Dispute"
                        >
                          <Icon name="ExclamationTriangleIcon" size={16} />
                        </button>
                      )}
                      {txn.status === 'held' && (
                        <button
                          onClick={() => handleAction(txn, 'hold')}
                          className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
                          title="Extend Hold"
                        >
                          <Icon name="ClockIcon" size={16} />
                        </button>
                      )}
                      <Link
                        href={`/admin-panel/financial/escrow/${txn.id}`}
                        className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        title="View Details"
                      >
                        <Icon name="EyeIcon" size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No escrow transactions found for the selected filter</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedTransaction && (
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
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Escrow ID</p>
                    <p className="font-medium text-foreground">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order ID</p>
                    <p className="font-medium text-foreground">{selectedTransaction.order_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Buyer</p>
                    <p className="font-medium text-foreground">{selectedTransaction.buyer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vendor</p>
                    <p className="font-medium text-foreground">{selectedTransaction.vendor_name}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-muted-foreground text-sm">Amount</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    Held for {selectedTransaction.days_held} days
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${
                actionType === 'release' ? 'bg-success/10 border-success/20' :
                actionType === 'refund' ? 'bg-warning/10 border-warning/20' :
                actionType === 'escalate' ? 'bg-error/10 border-error/20' :
                'bg-info/10 border-info/20'
              }`}>
                <p className="text-sm">
                  {actionType === 'release' && (
                    <>
                      <Icon name="InformationCircleIcon" size={16} className="inline mr-1" />
                      This will release the funds to the vendor's account. Ensure delivery confirmation is verified.
                    </>
                  )}
                  {actionType === 'refund' && (
                    <>
                      <Icon name="ExclamationTriangleIcon" size={16} className="inline mr-1" />
                      This will refund the amount to the buyer. Ensure return/cancellation is approved.
                    </>
                  )}
                  {actionType === 'hold' && (
                    <>
                      <Icon name="InformationCircleIcon" size={16} className="inline mr-1" />
                      This will extend the hold period by 7 days for further investigation.
                    </>
                  )}
                  {actionType === 'escalate' && (
                    <>
                      <Icon name="ExclamationTriangleIcon" size={16} className="inline mr-1" />
                      This will escalate the dispute to senior admin for resolution.
                    </>
                  )}
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

EscrowManagementInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    transactions: PropTypes.array,
    statusBreakdown: PropTypes.object
  })
};
