'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function TransactionsInteractive({ initialData }) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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

  const getTypeColor = (type) => {
    const colors = {
      sale: 'bg-success/10 text-success border-success/20',
      payout: 'bg-primary/10 text-primary border-primary/20',
      refund: 'bg-warning/10 text-warning border-warning/20',
      commission: 'bg-accent/10 text-accent border-accent/20'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      processing: 'bg-info/10 text-info border-info/20',
      failed: 'bg-error/10 text-error border-error/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getTypeIcon = (type) => {
    const icons = {
      sale: 'ShoppingCartIcon',
      payout: 'ArrowUpTrayIcon',
      refund: 'ArrowUturnLeftIcon',
      commission: 'PercentBadgeIcon'
    };
    return icons[type] || 'DocumentIcon';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: 'CheckCircleIcon',
      pending: 'ClockIcon',
      processing: 'ArrowPathIcon',
      failed: 'XCircleIcon'
    };
    return icons[status] || 'QuestionMarkCircleIcon';
  };

  const filteredTransactions = initialData?.transactions?.filter(txn => {
    const typeMatch = selectedType === 'all' || txn.type === selectedType;
    const statusMatch = selectedStatus === 'all' || txn.status === selectedStatus;
    const methodMatch = selectedPaymentMethod === 'all' || txn.payment_method === selectedPaymentMethod;
    return typeMatch && statusMatch && methodMatch;
  }) || [];

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Transaction History"
      subtitle="View and manage all platform financial transactions"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CurrencyDollarIcon" size={20} className="text-primary" />
            <p className="text-sm text-muted-foreground">Today's Volume</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(initialData?.summary?.total_volume_today)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.summary?.transaction_count_today} transactions
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BanknotesIcon" size={20} className="text-success" />
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(initialData?.summary?.total_volume_month)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.summary?.transaction_count_month} transactions
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ChartBarIcon" size={20} className="text-accent" />
            <p className="text-sm text-muted-foreground">Avg Transaction</p>
          </div>
          <p className="text-2xl font-bold text-accent">
            {formatCurrency(initialData?.summary?.avg_transaction_value)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Average value</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ShoppingCartIcon" size={20} className="text-success" />
            <p className="text-sm text-muted-foreground">Sales</p>
          </div>
          <p className="text-lg font-bold text-success">
            {formatCurrency(initialData?.analytics?.by_type?.sale?.amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.analytics?.by_type?.sale?.count} transactions
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ArrowUpTrayIcon" size={20} className="text-primary" />
            <p className="text-sm text-muted-foreground">Payouts</p>
          </div>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(initialData?.analytics?.by_type?.payout?.amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initialData?.analytics?.by_type?.payout?.count} transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Transaction Type</label>
            <div className="flex flex-wrap gap-2">
              {initialData?.filters?.types?.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {initialData?.filters?.statuses?.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Payment Method</label>
            <div className="flex flex-wrap gap-2">
              {initialData?.filters?.payment_methods?.map(method => (
                <button
                  key={method}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedPaymentMethod === method
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
            <Icon name="FunnelIcon" size={18} />
            Advanced Filters
          </button>
          <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
            <Icon name="ArrowDownTrayIcon" size={18} />
            Export CSV
          </button>
          <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
            <Icon name="DocumentChartBarIcon" size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Transaction ID</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Parties</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Method</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-medium text-primary">{txn.id}</p>
                    {txn.order_id && (
                      <p className="text-xs text-muted-foreground">Order: {txn.order_id}</p>
                    )}
                    {txn.payout_id && (
                      <p className="text-xs text-muted-foreground">Payout: {txn.payout_id}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(txn.type)}`}>
                      <Icon name={getTypeIcon(txn.type)} size={14} />
                      {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {txn.buyer_name && (
                        <p className="text-foreground">
                          <Icon name="UserIcon" size={14} className="inline mr-1" />
                          {txn.buyer_name}
                        </p>
                      )}
                      {txn.vendor_name && (
                        <p className="text-muted-foreground">
                          <Icon name="BuildingStorefrontIcon" size={14} className="inline mr-1" />
                          {txn.vendor_name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">{formatCurrency(txn.amount)}</p>
                      {txn.commission && (
                        <p className="text-xs text-muted-foreground">Fee: {formatCurrency(txn.commission)}</p>
                      )}
                      {txn.net_amount && (
                        <p className="text-xs text-success">Net: {formatCurrency(txn.net_amount)}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground">{txn.payment_method || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                      <Icon name={getStatusIcon(txn.status)} size={14} />
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </span>
                    {txn.error_message && (
                      <p className="text-xs text-error mt-1">{txn.error_message}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-foreground">{formatDate(txn.created_at)}</p>
                    {txn.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Done: {formatDate(txn.completed_at)}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewDetails(txn)}
                      className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                      title="View Details"
                    >
                      <Icon name="EyeIcon" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions found for the selected filters</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Transaction Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Transaction Header */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="text-lg font-bold text-foreground">{selectedTransaction.id}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium text-foreground capitalize">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium text-foreground">{selectedTransaction.payment_method || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Amount Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-foreground">{formatCurrency(selectedTransaction.amount)}</span>
                  </div>
                  {selectedTransaction.commission && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission (5%)</span>
                      <span className="text-foreground">{formatCurrency(selectedTransaction.commission)}</span>
                    </div>
                  )}
                  {selectedTransaction.net_amount && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-medium text-foreground">Net Amount</span>
                      <span className="font-bold text-success">{formatCurrency(selectedTransaction.net_amount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parties Involved */}
              {(selectedTransaction.buyer_name || selectedTransaction.vendor_name) && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">Parties</h4>
                  <div className="space-y-2">
                    {selectedTransaction.buyer_name && (
                      <div className="flex items-center gap-2">
                        <Icon name="UserIcon" size={16} className="text-muted-foreground" />
                        <span className="text-foreground">{selectedTransaction.buyer_name}</span>
                        <span className="text-xs text-muted-foreground">(Buyer)</span>
                      </div>
                    )}
                    {selectedTransaction.vendor_name && (
                      <div className="flex items-center gap-2">
                        <Icon name="BuildingStorefrontIcon" size={16} className="text-muted-foreground" />
                        <span className="text-foreground">{selectedTransaction.vendor_name}</span>
                        <span className="text-xs text-muted-foreground">(Vendor)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">{formatDate(selectedTransaction.created_at)}</span>
                  </div>
                  {selectedTransaction.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="text-foreground">{formatDate(selectedTransaction.completed_at)}</span>
                    </div>
                  )}
                  {selectedTransaction.failed_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Failed</span>
                      <span className="text-error">{formatDate(selectedTransaction.failed_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {(selectedTransaction.order_id || selectedTransaction.payout_id || selectedTransaction.refund_reason) && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">Additional Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedTransaction.order_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID</span>
                        <Link href={`/order-tracking?id=${selectedTransaction.order_id}`} className="text-primary hover:underline">
                          {selectedTransaction.order_id}
                        </Link>
                      </div>
                    )}
                    {selectedTransaction.payout_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payout ID</span>
                        <Link href={`/admin-panel/financial/payouts/${selectedTransaction.payout_id}`} className="text-primary hover:underline">
                          {selectedTransaction.payout_id}
                        </Link>
                      </div>
                    )}
                    {selectedTransaction.refund_reason && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Refund Reason</span>
                        <span className="text-foreground">{selectedTransaction.refund_reason}</span>
                      </div>
                    )}
                    {selectedTransaction.error_message && (
                      <div className="p-2 bg-error/10 border border-error/20 rounded">
                        <p className="text-error text-xs">{selectedTransaction.error_message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

TransactionsInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    transactions: PropTypes.array,
    filters: PropTypes.object,
    analytics: PropTypes.object
  })
};
