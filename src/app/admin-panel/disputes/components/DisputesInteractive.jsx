'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function DisputesInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

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
      reported: 'bg-error/10 text-error border-error/20',
      vendor_responded: 'bg-info/10 text-info border-info/20',
      admin_reviewing: 'bg-warning/10 text-warning border-warning/20',
      resolved: 'bg-success/10 text-success border-success/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-error/10 text-error',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-info/10 text-info'
    };
    return colors[priority] || 'bg-muted text-muted-foreground';
  };

  const getIssueTypeLabel = (type) => {
    const labels = {
      defective_product: 'Defective Product',
      wrong_item: 'Wrong Item',
      not_as_described: 'Not As Described',
      damaged_delivery: 'Damaged Delivery',
      counterfeit: 'Counterfeit Suspected',
      not_received: 'Not Received',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const filteredDisputes = initialData?.disputes?.filter(dispute => {
    const statusMatch = selectedStatus === 'all' || dispute.status === selectedStatus;
    const priorityMatch = selectedPriority === 'all' || dispute.priority === selectedPriority;
    const query = searchQuery.toLowerCase();
    const searchMatch = !query ||
      dispute.dispute_number.toLowerCase().includes(query) ||
      dispute.order_id.toLowerCase().includes(query) ||
      dispute.buyer_name.toLowerCase().includes(query) ||
      dispute.vendor_name.toLowerCase().includes(query);

    return statusMatch && priorityMatch && searchMatch;
  }) || [];

  const handleResolve = (dispute) => {
    setSelectedDispute(dispute);
    setResolution('refund_approved');
    setResolutionNotes('');
    setShowResolveModal(true);
  };

  const confirmResolve = () => {
    if (!resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }
    alert(`Dispute ${selectedDispute.dispute_number} resolved: ${resolution}\nNotes: ${resolutionNotes}`);
    setShowResolveModal(false);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Disputes Management"
      subtitle="Review and resolve order disputes"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Disputes</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_disputes}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Reported</p>
          <p className="text-2xl font-bold text-error">{initialData?.summary?.reported}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Vendor Responded</p>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.vendor_responded}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Admin Reviewing</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.admin_reviewing}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.resolved}</p>
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
                placeholder="Search by dispute ID, order ID, buyer, or vendor..."
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
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="vendor_responded">Vendor Responded</option>
              <option value="admin_reviewing">Admin Reviewing</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Showing {filteredDisputes.length} of {initialData?.disputes?.length || 0} disputes
          </p>
          <Link
            href="/dispute-management"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Icon name="ChatBubbleLeftRightIcon" size={16} />
            Open Full Dispute System
          </Link>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href="/dispute-management"
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {dispute.dispute_number}
                    </Link>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                      {dispute.status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)} Priority
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>Order: <Link href={`/order-tracking?id=${dispute.order_id}`} className="text-primary hover:underline">{dispute.order_id}</Link></span>
                    <span>•</span>
                    <span>Buyer: {dispute.buyer_name}</span>
                    <span>•</span>
                    <span>Vendor: <Link href={`/admin-panel/vendors/${dispute.vendor_id}`} className="text-primary hover:underline">{dispute.vendor_name}</Link></span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Icon name="ExclamationTriangleIcon" size={16} />
                    Issue Details
                  </h4>
                  <div className="p-4 bg-muted/30 rounded-lg mb-4">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {getIssueTypeLabel(dispute.issue_type)}
                    </p>
                    <p className="text-sm text-muted-foreground">{dispute.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Dispute Amount</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(dispute.amount)}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Reported</p>
                      <p className="text-sm font-medium text-foreground">{formatDateTime(dispute.reported_at)}</p>
                    </div>
                    {dispute.resolved_at && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Resolved</p>
                        <p className="text-sm font-medium text-foreground">{formatDateTime(dispute.resolved_at)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-error mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">Reported</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(dispute.reported_at)}</p>
                      </div>
                    </div>
                    {dispute.vendor_responded_at && (
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-info mt-1.5"></div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">Vendor Responded</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(dispute.vendor_responded_at)}</p>
                        </div>
                      </div>
                    )}
                    {dispute.resolved_at && (
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-success mt-1.5"></div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">Resolved</p>
                          <p className="text-xs text-muted-foreground">
                            {dispute.resolution?.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                {dispute.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => handleResolve(dispute)}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
                    >
                      <Icon name="CheckCircleIcon" size={18} />
                      Resolve Dispute
                    </button>
                    <button
                      className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors flex items-center gap-2"
                    >
                      <Icon name="ExclamationTriangleIcon" size={18} />
                      Request More Info
                    </button>
                  </>
                )}
                <Link
                  href="/dispute-management"
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                >
                  <Icon name="ChatBubbleLeftRightIcon" size={18} />
                  Open Full Details
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredDisputes.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No disputes found matching your filters</p>
          </div>
        )}
      </div>

      {/* Resolve Dispute Modal */}
      {showResolveModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Resolve Dispute</h3>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">{selectedDispute.dispute_number}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Order: {selectedDispute.order_id}</p>
                  <p className="text-muted-foreground">Buyer: {selectedDispute.buyer_name}</p>
                  <p className="text-muted-foreground">Amount: {formatCurrency(selectedDispute.amount)}</p>
                  <p className="text-muted-foreground">Issue: {getIssueTypeLabel(selectedDispute.issue_type)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resolution Type *
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="refund_approved">Full Refund Approved</option>
                  <option value="partial_refund">Partial Refund</option>
                  <option value="replacement">Replacement Offered</option>
                  <option value="vendor_fault">Vendor at Fault</option>
                  <option value="buyer_fault">Buyer at Fault</option>
                  <option value="no_action">No Action Required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resolution Notes *
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain the decision and any actions taken..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>

              <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-sm text-info">
                  <Icon name="InformationCircleIcon" size={16} className="inline mr-1" />
                  Both buyer and vendor will be notified via email of this resolution.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmResolve}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

DisputesInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    disputes: PropTypes.array
  })
};
