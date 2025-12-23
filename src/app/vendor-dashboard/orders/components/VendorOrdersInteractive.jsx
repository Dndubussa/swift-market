'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import { getVendorProfile } from '@/lib/services/productService';
import { getVendorOrders, getOrderStats, updateOrderStatus, bulkUpdateOrderStatus, exportOrdersToCSV } from '@/lib/services/orderService';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders', color: 'bg-muted' },
  { value: 'pending', label: 'Pending', color: 'bg-warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-info' },
  { value: 'processing', label: 'Processing', color: 'bg-accent' },
  { value: 'shipped', label: 'Shipped', color: 'bg-primary' },
  { value: 'delivered', label: 'Delivered', color: 'bg-success' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-error' },
  { value: 'refunded', label: 'Refunded', color: 'bg-muted-foreground' },
];

export default function VendorOrdersInteractive() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Selection
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  
  const pageSize = 20;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/user-login');
        return;
      }
      
      if (userProfile?.role !== 'vendor') {
        router.push('/');
        return;
      }
      
      loadVendorProfile();
    }
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    if (vendorProfile) {
      loadOrders();
    }
  }, [vendorProfile, statusFilter, searchQuery, dateFrom, dateTo, currentPage, sortBy, sortOrder]);

  const loadVendorProfile = async () => {
    const profile = await getVendorProfile(user.id);
    if (profile) {
      setVendorProfile(profile);
      const orderStats = await getOrderStats(profile.id);
      setStats(orderStats);
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    const { orders: fetchedOrders, count } = await getVendorOrders(vendorProfile.id, {
      page: currentPage,
      limit: pageSize,
      status: statusFilter,
      search: searchQuery,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      sortBy,
      sortOrder
    });
    setOrders(fetchedOrders);
    setTotalCount(count);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const result = await updateOrderStatus(orderId, vendorProfile.id, newStatus);
    if (result.success) {
      loadOrders();
      const orderStats = await getOrderStats(vendorProfile.id);
      setStats(orderStats);
    } else {
      alert(result.error || 'Failed to update order status');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;
    
    if (confirm(`Update ${selectedOrders.length} order(s) to ${bulkAction}?`)) {
      const result = await bulkUpdateOrderStatus(selectedOrders, vendorProfile.id, bulkAction);
      alert(`Successfully updated ${result.success} orders. ${result.failed} failed.`);
      setSelectedOrders([]);
      setBulkAction('');
      loadOrders();
      const orderStats = await getOrderStats(vendorProfile.id);
      setStats(orderStats);
    }
  };

  const handleExport = async () => {
    const csv = await exportOrdersToCSV(vendorProfile.id, {
      status: statusFilter,
      search: searchQuery,
      dateFrom,
      dateTo
    });
    
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'bg-muted';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayout
      role="vendor"
      title="Order Management"
      subtitle="Manage and track your customer orders"
      badges={{ orders: stats?.pending || 0, returns: 0, disputes: 0 }}
      actions={
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm"
        >
          <Icon name="ArrowDownTrayIcon" size={18} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      }
    >
      {(authLoading || loading) ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      ) : (
        <>
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold text-foreground">{stats.today}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-warning">Pending</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-primary">Processing</p>
              <p className="text-2xl font-bold text-primary">{stats.processing + stats.confirmed}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-accent">Shipped</p>
              <p className="text-2xl font-bold text-accent">{stats.shipped}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-success">Delivered</p>
              <p className="text-2xl font-bold text-success">{stats.delivered}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by order number or customer name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.slice(0, 5).map(status => (
                <button
                  key={status.value}
                  onClick={() => {
                    setStatusFilter(status.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {status.label}
                </button>
              ))}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm"
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4 flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              {selectedOrders.length} order(s) selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm"
            >
              <option value="">Select action...</option>
              <option value="confirmed">Mark as Confirmed</option>
              <option value="processing">Mark as Processing</option>
              <option value="shipped">Mark as Shipped</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="px-4 py-1.5 bg-muted text-foreground rounded-lg text-sm"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="ClipboardDocumentListIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} orders match your filters.`
                  : 'You haven\'t received any orders yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === orders.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-input"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Order</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Items</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleSelectOrder(order.id)}
                            className="w-4 h-4 rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <Link 
                            href={`/vendor-dashboard/orders/${order.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {order.order_number}
                          </Link>
                          {order.tracking_number && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Track: {order.tracking_number}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {order.buyer?.avatar_url ? (
                                <AppImage 
                                  src={order.buyer.avatar_url} 
                                  alt={order.buyer.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Icon name="UserIcon" size={16} className="text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{order.buyer?.full_name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{order.buyer?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-foreground">
                            {order.order_items?.length || 0} item(s)
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {order.order_items?.map(i => i.product_name).join(', ')}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-medium text-foreground">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/vendor-dashboard/orders/${order.id}`}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Icon name="EyeIcon" size={18} className="text-muted-foreground" />
                            </Link>
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'confirmed')}
                                className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                                title="Confirm Order"
                              >
                                <Icon name="CheckCircleIcon" size={18} className="text-success" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <div>
                          <Link 
                            href={`/vendor-dashboard/orders/${order.id}`}
                            className="font-medium text-primary"
                          >
                            {order.order_number}
                          </Link>
                          <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground">{order.buyer?.full_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.order_items?.length || 0} item(s) • {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                      <Link
                        href={`/vendor-dashboard/orders/${order.id}`}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </>
      )}
    </DashboardLayout>
  );
}

