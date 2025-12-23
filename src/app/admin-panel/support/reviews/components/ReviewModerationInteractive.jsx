'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function ReviewModerationInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      flagged: 'bg-error/10 text-error border-error/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="StarIcon"
        size={16}
        className={i < rating ? 'text-warning fill-warning' : 'text-muted-foreground'}
      />
    ));
  };

  const filteredReviews = initialData?.reviews?.filter(review => {
    const statusMatch = selectedStatus === 'all' || review.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const searchMatch = !query ||
      review.product_name.toLowerCase().includes(query) ||
      review.reviewer_name.toLowerCase().includes(query) ||
      review.title.toLowerCase().includes(query);

    return statusMatch && searchMatch;
  }) || [];

  const handleApprove = (review) => {
    alert(`Review by ${review.reviewer_name} for "${review.product_name}" approved!`);
  };

  const handleReject = (review) => {
    alert(`Review by ${review.reviewer_name} for "${review.product_name}" rejected!`);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Review Moderation"
      subtitle="Moderate and manage product reviews"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_reviews}</p>
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
          <p className="text-sm text-muted-foreground mb-1">Flagged</p>
          <p className="text-2xl font-bold text-error">{initialData?.summary?.flagged}</p>
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
                placeholder="Search by product, reviewer, or title..."
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
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Showing {filteredReviews.length} of {initialData?.reviews?.length || 0} reviews
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/product-details?id=${review.product_id}`}
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {review.product_name}
                    </Link>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.status)}`}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>By: {review.reviewer_name}</span>
                    <span>•</span>
                    <span>{formatDateTime(review.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getRatingStars(review.rating)}
                  <span className="ml-2 text-sm font-semibold text-foreground">{review.rating}.0</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-base font-semibold text-foreground mb-2">{review.title}</h4>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>

              {/* Flags */}
              {review.flags && review.flags.length > 0 && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="ExclamationTriangleIcon" size={18} className="text-error mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-error mb-1">Automated Flags Detected:</p>
                      <div className="flex flex-wrap gap-2">
                        {review.flags.map((flag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-error/20 text-error rounded text-xs font-medium">
                            {flag.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviewer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Reviewer Email</p>
                  <p className="text-sm font-medium text-foreground">{review.reviewer_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm font-medium text-foreground">{formatDateTime(review.created_at)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {review.status === 'pending' || review.status === 'flagged' ? (
                  <>
                    <button
                      onClick={() => handleApprove(review)}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
                    >
                      <Icon name="CheckCircleIcon" size={18} />
                      Approve Review
                    </button>
                    <button
                      onClick={() => handleReject(review)}
                      className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors flex items-center gap-2"
                    >
                      <Icon name="XMarkIcon" size={18} />
                      Reject Review
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {review.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                  </span>
                )}
                <Link
                  href={`/product-details?id=${review.product_id}`}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                >
                  <Icon name="EyeIcon" size={18} />
                  View Product
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews found matching your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

ReviewModerationInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    reviews: PropTypes.array
  })
};
