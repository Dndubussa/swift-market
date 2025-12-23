'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function ReturnsInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRefundStatus, setSelectedRefundStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDateTime = (dateString) => {
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
      approved: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-error/10 text-error border-error/20',
      processing: 'bg-info/10 text-info border-info/20',
      completed: 'bg-muted text-muted-foreground border-muted'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getRefundStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning/10 text-warning',
      processed: 'bg-success/10 text-success',
      none: 'bg-muted text-muted-foreground'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const filteredReturns = initialData?.returns?.filter(returnItem => {
    const statusMatch = selectedStatus === 'all' || returnItem.status === selectedStatus;
    const refundStatusMatch = selectedRefundStatus === 'all' || returnItem.refund_status === selectedRefundStatus;
    const query = searchQuery.toLowerCase();
    const searchMatch = !query ||
      returnItem.id.toLowerCase().includes(query) ||
      returnItem.order_id.toLowerCase().includes(query) ||
      returnItem.buyer_name.toLowerCase().includes(query) ||
      returnItem.vendor_name.toLowerCase().includes(query);

    return statusMatch && refundStatusMatch && searchMatch;
  }) || [];

  const handleApprove = (returnItem) => {
    alert(`Return ${returnItem.id} approved. Refund: ${formatCurrency(returnItem.refund_amount)} (${returnItem.method})`);
  };

  const handleReject = (returnItem) => {
    alert(`Return ${returnItem.id} rejected. Reason should be recorded in the system.`);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Returns Management"
      subtitle="Review and manage all return requests and refunds"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Returns</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_returns}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.pending}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Approved</p>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.approved}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Rejected</p>
          <p className="text-2xl font-bold text-error">{initialData?.summary?.rejected}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Refund Pending</p>
          <p className="text-lg font-bold text-warning">{initialData?.summary?.refund_pending}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Refund Processed</p>
          <p className="text-lg font-bold text-success">{initialData?.summary?.refund_processed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by return ID, order ID, buyer, or vendor..."
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Return Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Refund Status</label>
            <select
              value={selectedRefundStatus}
              onChange={(e) => setSelectedRefundStatus(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Refund Status</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="none">No Refund</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Showing {filteredReturns.length} of {initialData?.returns?.length || 0} returns
          </p>
          <Link
            href="/refund-dashboard"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Icon name="ArrowPathIcon" size={16} />
            Open Refund Dashboard
          </Link>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Return ID</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Order</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Buyer</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Reason</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Refund</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Created</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-sm text-foreground">{ret.id}</span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/order-tracking?id=${ret.order_id}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {ret.order_id}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">{ret.items_count} {ret.items_count === 1 ? 'item' : 'items'}</p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ret.buyer_name}</p>
                      <p className="text-xs text-muted-foreground">{ret.buyer_email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin-panel/vendors/${ret.vendor_id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {ret.vendor_name}
                    </Link>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-sm text-foreground truncate" title={ret.reason}>{ret.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">Method: {ret.method.replace('_', ' ')}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-foreground">{formatCurrency(ret.refund_amount)}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRefundStatusColor(ret.refund_status)}`}>
                      {ret.refund_status === 'none' ? 'No Refund' : ret.refund_status.charAt(0).toUpperCase() + ret.refund_status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ret.status)}`}>
                      {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground">{formatDateTime(ret.created_at)}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {ret.status === 'pending' || ret.status === 'processing' ? (
                        <>
                          <button
                            onClick={() => handleApprove(ret)}
                            className="px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 text-xs flex items-center gap-1"
                          >
                            <Icon name="CheckCircleIcon" size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(ret)}
                            className="px-3 py-1.5 bg-error text-white rounded-lg hover:bg-error/90 text-xs flex items-center gap-1"
                          >
                            <Icon name="XMarkIcon" size={14} />
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">No actions</span>
                      )}
                      <Link
                        href="/refund-dashboard"
                        className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 inline-flex"
                        title="Open in refund dashboard"
                      >
                        <Icon name="ArrowPathIcon" size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReturns.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No returns found matching your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

ReturnsInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    returns: PropTypes.array
  })
};
