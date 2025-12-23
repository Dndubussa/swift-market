'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import { getVendorProfile } from '@/lib/services/productService';
import { getVendorDisputes, getDisputeStats } from '@/lib/services/disputeService';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const DISPUTE_STATUSES = [
  { value: 'all', label: 'All Disputes', color: 'bg-muted' },
  { value: 'awaiting_vendor', label: 'Awaiting Response', color: 'bg-warning' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-info' },
  { value: 'resolution_proposed', label: 'Resolution Proposed', color: 'bg-accent' },
  { value: 'escalated', label: 'Escalated', color: 'bg-error' },
  { value: 'resolved', label: 'Resolved', color: 'bg-success' },
];

const PRIORITY_COLORS = {
  low: 'text-muted-foreground bg-muted',
  medium: 'text-warning bg-warning/10',
  high: 'text-error bg-error/10',
  urgent: 'text-white bg-error'
};

export default function VendorDisputesInteractive() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
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
      loadDisputes();
    }
  }, [vendorProfile, statusFilter, priorityFilter, searchQuery, currentPage]);

  const loadVendorProfile = async () => {
    const profile = await getVendorProfile(user.id);
    if (profile) {
      setVendorProfile(profile);
      const disputeStats = await getDisputeStats(profile.id);
      setStats(disputeStats);
    }
    setLoading(false);
  };

  const loadDisputes = async () => {
    const { disputes: fetchedDisputes, count } = await getVendorDisputes(vendorProfile.id, {
      page: currentPage,
      limit: pageSize,
      status: statusFilter,
      priority: priorityFilter,
      search: searchQuery
    });
    setDisputes(fetchedDisputes);
    setTotalCount(count);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getStatusColor = (status) => {
    const statusObj = DISPUTE_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'bg-muted';
  };

  const getStatusLabel = (status) => {
    const statusObj = DISPUTE_STATUSES.find(s => s.value === status);
    return statusObj?.label || status;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayout
      role="vendor"
      title="Disputes & Tickets"
      subtitle="Manage customer issues and resolve conflicts"
      badges={{ disputes: stats?.awaiting_vendor || 0 }}
    >
      {(authLoading || loading) ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading disputes...</p>
          </div>
        </div>
      ) : (
      <>
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-warning">Awaiting Response</p>
              <p className="text-2xl font-bold text-warning">{stats.awaiting_vendor}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-info">In Progress</p>
              <p className="text-2xl font-bold text-info">{stats.in_progress}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-error">Escalated</p>
              <p className="text-2xl font-bold text-error">{stats.escalated}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-success">Resolved</p>
              <p className="text-2xl font-bold text-success">{stats.resolved}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-error">Urgent</p>
              <p className="text-2xl font-bold text-error">{stats.urgent + stats.high_priority}</p>
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
                  placeholder="Search by ticket # or subject..."
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
              {DISPUTE_STATUSES.slice(0, 4).map(status => (
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
                {DISPUTE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Disputes List */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          {disputes.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="ChatBubbleLeftRightIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Disputes Found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' 
                  ? `No ${getStatusLabel(statusFilter).toLowerCase()} disputes.`
                  : 'No customer disputes have been raised yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Ticket</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Order</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Updated</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {disputes.map((dispute) => (
                      <tr key={dispute.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <Link 
                            href={`/vendor-dashboard/disputes/${dispute.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {dispute.ticket_number}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{dispute.subject}</p>
                            <p className="text-xs text-muted-foreground">{dispute.type_label}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {dispute.buyer?.avatar_url ? (
                                <AppImage 
                                  src={dispute.buyer.avatar_url} 
                                  alt={dispute.buyer.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Icon name="UserIcon" size={16} className="text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-sm text-foreground">{dispute.buyer?.full_name || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {dispute.order ? (
                            <Link 
                              href={`/vendor-dashboard/orders/${dispute.order.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {dispute.order.order_number}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[dispute.priority] || PRIORITY_COLORS.low}`}>
                            {dispute.priority?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(dispute.status)}`}>
                            {getStatusLabel(dispute.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-muted-foreground">{formatTime(dispute.updated_at)}</p>
                          {dispute.message_count > 0 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Icon name="ChatBubbleLeftIcon" size={12} />
                              {dispute.message_count} messages
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/vendor-dashboard/disputes/${dispute.id}`}
                              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                            >
                              {dispute.status === 'awaiting_vendor' ? 'Respond' : 'View'}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-border">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link 
                          href={`/vendor-dashboard/disputes/${dispute.id}`}
                          className="font-medium text-primary"
                        >
                          {dispute.ticket_number}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatTime(dispute.updated_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[dispute.priority] || PRIORITY_COLORS.low}`}>
                          {dispute.priority?.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(dispute.status)}`}>
                          {getStatusLabel(dispute.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{dispute.subject}</p>
                    <p className="text-xs text-muted-foreground mb-3">{dispute.type_label} • {dispute.buyer?.full_name}</p>
                    <Link
                      href={`/vendor-dashboard/disputes/${dispute.id}`}
                      className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                    >
                      {dispute.status === 'awaiting_vendor' ? 'Respond Now' : 'View Details'}
                    </Link>
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

