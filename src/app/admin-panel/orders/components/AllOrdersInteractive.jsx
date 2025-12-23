'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function AllOrdersInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
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
      processing: 'bg-info/10 text-info border-info/20',
      shipped: 'bg-primary/10 text-primary border-primary/20',
      delivered: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-error/10 text-error border-error/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      failed: 'bg-error/10 text-error'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const filteredOrders = initialData?.orders?.filter(order => {
    const statusMatch = selectedStatus === 'all' || order.status === selectedStatus;
    const searchMatch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  }) || [];

  return (
    <DashboardLayout
      role="admin"
      title="All Orders"
      subtitle="Manage all marketplace orders"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_orders}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.pending}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Processing</p>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.processing}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Shipped</p>
          <p className="text-2xl font-bold text-primary">{initialData?.summary?.shipped}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Delivered</p>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.delivered}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(initialData?.summary?.total_revenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, buyer, or vendor..."
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Buyer</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Items</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Payment</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <Link href={`/order-tracking?id=${order.id}`} className="font-mono text-sm text-primary hover:underline">
                      {order.id}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{order.buyer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.buyer_email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin-panel/vendors/${order.vendor_id}`} className="text-sm text-primary hover:underline">
                      {order.vendor_name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-foreground">{formatCurrency(order.total_amount)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-foreground">{order.items_count} {order.items_count === 1 ? 'item' : 'items'}</p>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{order.payment_method}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/order-tracking?id=${order.id}`}
                      className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors inline-flex"
                      title="View Details"
                    >
                      <Icon name="EyeIcon" size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found matching your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

AllOrdersInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    orders: PropTypes.array
  })
};
