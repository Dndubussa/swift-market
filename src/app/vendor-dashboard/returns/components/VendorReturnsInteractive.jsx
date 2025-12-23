'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import { getVendorProfile } from '@/lib/services/productService';
import { getVendorReturns, getReturnStats, approveReturn, rejectReturn } from '@/lib/services/returnService';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const RETURN_STATUSES = [
  { value: 'all', label: 'All Returns', color: 'bg-muted' },
  { value: 'pending', label: 'Pending', color: 'bg-warning' },
  { value: 'approved', label: 'Approved', color: 'bg-info' },
  { value: 'processing', label: 'Processing', color: 'bg-accent' },
  { value: 'completed', label: 'Completed', color: 'bg-success' },
  { value: 'rejected', label: 'Rejected', color: 'bg-error' },
];

export default function VendorReturnsInteractive() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState(null);
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Quick action modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  
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
      loadReturns();
    }
  }, [vendorProfile, statusFilter, searchQuery, currentPage]);

  const loadVendorProfile = async () => {
    const profile = await getVendorProfile(user.id);
    if (profile) {
      setVendorProfile(profile);
      const returnStats = await getReturnStats(profile.id);
      setStats(returnStats);
    }
    setLoading(false);
  };

  const loadReturns = async () => {
    const { returns: fetchedReturns, count } = await getVendorReturns(vendorProfile.id, {
      page: currentPage,
      limit: pageSize,
      status: statusFilter,
      search: searchQuery
    });
    setReturns(fetchedReturns);
    setTotalCount(count);
  };

  const handleQuickApprove = async (returnId) => {
    if (!confirm('Approve this return request?')) return;
    
    setProcessing(true);
    const result = await approveReturn(returnId, vendorProfile.id);
    
    if (result.success) {
      loadReturns();
      const returnStats = await getReturnStats(vendorProfile.id);
      setStats(returnStats);
    } else {
      alert(result.error || 'Failed to approve return');
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setProcessing(true);
    const result = await rejectReturn(selectedReturn.id, vendorProfile.id, rejectionReason);
    
    if (result.success) {
      setShowRejectModal(false);
      setSelectedReturn(null);
      setRejectionReason('');
      loadReturns();
      const returnStats = await getReturnStats(vendorProfile.id);
      setStats(returnStats);
    } else {
      alert(result.error || 'Failed to reject return');
    }
    setProcessing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const statusObj = RETURN_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'bg-muted';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayout
      role="vendor"
      title="Returns Management"
      subtitle="Handle return requests and process refunds"
      badges={{ returns: stats?.pending || 0 }}
    >
      {(authLoading || loading) ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading returns...</p>
          </div>
        </div>
      ) : (
      <>
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Returns</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-warning">Pending</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-info">Approved</p>
              <p className="text-2xl font-bold text-info">{stats.approved}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-accent">Processing</p>
              <p className="text-2xl font-bold text-accent">{stats.processing}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-success">Completed</p>
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Refunded</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalRefunded)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border shadow-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by RMA number..."
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
              {RETURN_STATUSES.map(status => (
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
            </div>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          {returns.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="ArrowUturnLeftIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Returns Found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} returns match your filters.`
                  : 'You haven\'t received any return requests yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">RMA #</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Order</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Reason</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Items</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {returns.map((returnItem) => (
                      <tr key={returnItem.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <Link 
                            href={`/vendor-dashboard/returns/${returnItem.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {returnItem.rma_number}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {returnItem.buyer?.avatar_url ? (
                                <AppImage 
                                  src={returnItem.buyer.avatar_url} 
                                  alt={returnItem.buyer.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Icon name="UserIcon" size={16} className="text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{returnItem.buyer?.full_name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{returnItem.buyer?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-foreground">{returnItem.order?.order_number}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(returnItem.order?.total_amount)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-foreground">{returnItem.reason_label}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-foreground">{returnItem.return_items?.length || 0} item(s)</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(returnItem.status)}`}>
                            {returnItem.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {formatDate(returnItem.requested_at)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/vendor-dashboard/returns/${returnItem.id}`}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Icon name="EyeIcon" size={18} className="text-muted-foreground" />
                            </Link>
                            {returnItem.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleQuickApprove(returnItem.id)}
                                  disabled={processing}
                                  className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                                  title="Approve Return"
                                >
                                  <Icon name="CheckCircleIcon" size={18} className="text-success" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedReturn(returnItem);
                                    setShowRejectModal(true);
                                  }}
                                  className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                                  title="Reject Return"
                                >
                                  <Icon name="XCircleIcon" size={18} className="text-error" />
                                </button>
                              </>
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
                {returns.map((returnItem) => (
                  <div key={returnItem.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link 
                          href={`/vendor-dashboard/returns/${returnItem.id}`}
                          className="font-medium text-primary"
                        >
                          {returnItem.rma_number}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatDate(returnItem.requested_at)}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-foreground">{returnItem.buyer?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{returnItem.reason_label}</p>
                      <p className="text-xs text-muted-foreground">
                        Order: {returnItem.order?.order_number} • {returnItem.return_items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/vendor-dashboard/returns/${returnItem.id}`}
                        className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm text-center"
                      >
                        View Details
                      </Link>
                      {returnItem.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleQuickApprove(returnItem.id)}
                            disabled={processing}
                            className="px-3 py-2 bg-success/10 text-success rounded-lg text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReturn(returnItem);
                              setShowRejectModal(true);
                            }}
                            className="px-3 py-2 bg-error/10 text-error rounded-lg text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
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

      {/* Reject Modal */}
      {showRejectModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Reject Return Request</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedReturn(null);
                  setRejectionReason('');
                }}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Return: <span className="font-medium text-foreground">{selectedReturn.rma_number}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Reason: {selectedReturn.reason_label}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Rejection Reason <span className="text-error">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this return is being rejected..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedReturn(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Icon name="XCircleIcon" size={18} />
                )}
                Reject Return
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </DashboardLayout>
  );
}

