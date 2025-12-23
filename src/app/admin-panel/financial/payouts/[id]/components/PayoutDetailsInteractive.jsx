'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function PayoutDetailsInteractive({ payout }) {
  const router = useRouter();
  const [showProcessModal, setShowProcessModal] = useState(false);

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
      pending: 'bg-warning/10 text-warning border-warning/20',
      processing: 'bg-info/10 text-info border-info/20',
      completed: 'bg-success/10 text-success border-success/20',
      failed: 'bg-error/10 text-error border-error/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'ClockIcon',
      processing: 'ArrowPathIcon',
      completed: 'CheckCircleIcon',
      failed: 'XCircleIcon'
    };
    return icons[status] || 'QuestionMarkCircleIcon';
  };

  const handleProcess = () => {
    alert(`Payout ${payout.id} processed successfully!`);
    setShowProcessModal(false);
    router.push('/admin-panel/financial/payouts');
  };

  return (
    <DashboardLayout
      role="admin"
      title={`Payout Details - ${payout.id}`}
      subtitle="View and manage vendor payout information"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin-panel/financial/payouts"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeftIcon" size={20} />
          Back to Payouts
        </Link>
        
        {payout.status === 'pending' && (
          <button
            onClick={() => setShowProcessModal(true)}
            className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
          >
            <Icon name="CheckCircleIcon" size={18} />
            Process Payout
          </button>
        )}
      </div>

      {/* Payout Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{payout.vendor_name}</h2>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon name="EnvelopeIcon" size={16} />
                  {payout.vendor_email}
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="PhoneIcon" size={16} />
                  {payout.vendor_phone}
                </div>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(payout.status)}`}>
              <Icon name={getStatusIcon(payout.status)} size={16} />
              {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payout ID</p>
              <p className="text-lg font-semibold text-foreground">{payout.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Orders Included</p>
              <p className="text-lg font-semibold text-foreground">{payout.order_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created Date</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(payout.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Due Date</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(payout.due_date)}</p>
            </div>
          </div>
        </div>

        {/* Amount Breakdown Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Amount Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gross Amount</span>
              <span className="font-semibold text-foreground">{formatCurrency(payout.amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Commission ({payout.commission_rate}%)</span>
              <span className="font-semibold text-error">-{formatCurrency(payout.commission)}</span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-foreground">Net Payout</span>
                <span className="text-2xl font-bold text-success">{formatCurrency(payout.net_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="BanknotesIcon" size={20} />
          Bank Account Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
            <p className="font-medium text-foreground">{payout.bank_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Account Holder</p>
            <p className="font-medium text-foreground">{payout.account_holder}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Account Number</p>
            <p className="font-mono text-foreground">{payout.bank_account}</p>
          </div>
        </div>
      </div>

      {/* Included Orders */}
      <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Included Orders ({payout.orders?.length || 0})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Buyer</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Commission</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payout.orders?.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/order-tracking?id=${order.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground">{order.buyer_name}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(order.amount)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{formatCurrency(order.commission)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      {payout.payment_history && payout.payment_history.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Payment History</h3>
          </div>
          <div className="divide-y divide-border">
            {payout.payment_history.map((payment) => (
              <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium text-foreground">{payment.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.method} • {formatDate(payment.processed_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">{formatCurrency(payment.amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Process Payout</h3>
              <button
                onClick={() => setShowProcessModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">{payout.vendor_name}</p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Amount</span>
                    <span className="font-bold text-success">{formatCurrency(payout.net_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank Account</span>
                    <span className="font-mono text-foreground">{payout.bank_account}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  <Icon name="ExclamationTriangleIcon" size={16} className="inline mr-1" />
                  This action will initiate a bank transfer. Please confirm the details before proceeding.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90"
              >
                Confirm & Process
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

PayoutDetailsInteractive.propTypes = {
  payout: PropTypes.shape({
    id: PropTypes.string.isRequired,
    vendor_name: PropTypes.string.isRequired,
    vendor_email: PropTypes.string,
    vendor_phone: PropTypes.string,
    amount: PropTypes.number.isRequired,
    commission: PropTypes.number.isRequired,
    commission_rate: PropTypes.number,
    net_amount: PropTypes.number.isRequired,
    order_count: PropTypes.number,
    status: PropTypes.string.isRequired,
    due_date: PropTypes.string,
    bank_name: PropTypes.string,
    bank_account: PropTypes.string,
    account_holder: PropTypes.string,
    created_at: PropTypes.string,
    orders: PropTypes.array,
    payment_history: PropTypes.array
  }).isRequired
};
