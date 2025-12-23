'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function TierManagementInteractive({ initialData }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTierColor = (tier) => {
    const colors = {
      gold: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      silver: 'bg-gray-400/10 text-gray-600 border-gray-400/20',
      bronze: 'bg-orange-600/10 text-orange-600 border-orange-600/20'
    };
    return colors[tier] || 'bg-muted text-muted-foreground';
  };

  const handleViewTier = (tier) => {
    setSelectedTier(tier);
    setShowTierModal(true);
  };

  const handleReviewRequest = (request) => {
    setSelectedRequest(request);
    setShowUpgradeModal(true);
  };

  const handleApproveUpgrade = () => {
    alert(`Upgrade request approved! ${selectedRequest.vendor_name} → ${selectedRequest.requested_tier.toUpperCase()}`);
    setShowUpgradeModal(false);
  };

  const handleRejectUpgrade = () => {
    alert(`Upgrade request rejected for ${selectedRequest.vendor_name}`);
    setShowUpgradeModal(false);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Tier Management"
      subtitle="Manage vendor tier system and upgrade requests"
    >
      {/* Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {initialData?.tiers?.map((tier) => (
          <div key={tier.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className={`p-6 ${getTierColor(tier.id)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{tier.name} Tier</h3>
                <span className="text-3xl">
                  {tier.id === 'gold' && '👑'}
                  {tier.id === 'silver' && '🥈'}
                  {tier.id === 'bronze' && '🥉'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Vendors</span>
                  <span className="font-semibold">{tier.current_vendors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Growth</span>
                  <span className="font-semibold text-success">+{tier.monthly_growth}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Commission</span>
                  <span className="font-semibold">{tier.benefits.commission_rate}%</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <button
                onClick={() => handleViewTier(tier)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade Requests */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Pending Upgrade Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">Review and approve vendor tier upgrades</p>
        </div>

        <div className="divide-y divide-border">
          {initialData?.upgrade_requests?.map((request) => (
            <div key={request.id} className="p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link 
                      href={`/admin-panel/vendors/${request.vendor_id}`}
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {request.vendor_name}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(request.submitted_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(request.current_tier)}`}>
                      {request.current_tier.charAt(0).toUpperCase() + request.current_tier.slice(1)}
                    </span>
                    <Icon name="ArrowRightIcon" size={16} className="text-muted-foreground" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(request.requested_tier)}`}>
                      {request.requested_tier.charAt(0).toUpperCase() + request.requested_tier.slice(1)}
                    </span>
                    {request.meets_requirements && (
                      <span className="ml-2 text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                        ✓ Meets Requirements
                      </span>
                    )}
                    {!request.meets_requirements && (
                      <span className="ml-2 text-xs px-2 py-1 bg-error/10 text-error rounded-full">
                        ✗ Below Requirements
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(request.metrics.total_sales)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="text-sm font-semibold text-foreground">{request.metrics.total_orders}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="text-sm font-semibold text-foreground">{request.metrics.rating} ⭐</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Return Rate</p>
                  <p className="text-sm font-semibold text-foreground">{request.metrics.return_rate}%</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Response</p>
                  <p className="text-sm font-semibold text-foreground">{request.metrics.response_rate}%</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">On-Time</p>
                  <p className="text-sm font-semibold text-foreground">{request.metrics.on_time_delivery}%</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReviewRequest(request)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Review Request
                </button>
                <Link
                  href={`/admin-panel/vendors/${request.vendor_id}`}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                >
                  <Icon name="EyeIcon" size={16} />
                  View Vendor
                </Link>
              </div>
            </div>
          ))}

          {initialData?.upgrade_requests?.length === 0 && (
            <div className="p-12 text-center">
              <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending upgrade requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Tier Details Modal */}
      {showTierModal && selectedTier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">{selectedTier.name} Tier Details</h3>
                <button
                  onClick={() => setShowTierModal(false)}
                  className="p-1 hover:bg-muted rounded-lg"
                >
                  <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Requirements */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Requirements</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Minimum Sales</p>
                    <p className="font-semibold text-foreground">{formatCurrency(selectedTier.requirements.min_sales)}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Minimum Orders</p>
                    <p className="font-semibold text-foreground">{selectedTier.requirements.min_orders}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Minimum Rating</p>
                    <p className="font-semibold text-foreground">{selectedTier.requirements.min_rating} ⭐</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Max Return Rate</p>
                    <p className="font-semibold text-foreground">{selectedTier.requirements.max_return_rate}%</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Min Response Rate</p>
                    <p className="font-semibold text-foreground">{selectedTier.requirements.min_response_rate}%</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Min On-Time Delivery</p>
                    <p className="font-semibold text-foreground">{selectedTier.requirements.min_on_time_delivery}%</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Benefits</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-foreground">Commission Rate</span>
                    <span className="font-semibold text-success">{selectedTier.benefits.commission_rate}%</span>
                  </div>
                  {Object.entries(selectedTier.benefits).filter(([key]) => key !== 'commission_rate').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      {value ? (
                        <Icon name="CheckCircleIcon" size={20} className="text-success" />
                      ) : (
                        <Icon name="XCircleIcon" size={20} className="text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setShowTierModal(false)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Request Review Modal */}
      {showUpgradeModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Review Upgrade Request</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{selectedRequest.vendor_name}</p>
                  <p className="text-sm text-muted-foreground">Vendor ID: {selectedRequest.vendor_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(selectedRequest.current_tier)}`}>
                    {selectedRequest.current_tier.toUpperCase()}
                  </span>
                  <Icon name="ArrowRightIcon" size={16} />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(selectedRequest.requested_tier)}`}>
                    {selectedRequest.requested_tier.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Requirements Check */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Requirements Check</h4>
                {(() => {
                  const targetTier = initialData.tiers.find(t => t.id === selectedRequest.requested_tier);
                  if (!targetTier) return null;
                  
                  return (
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between p-3 rounded-lg ${selectedRequest.metrics.total_sales >= targetTier.requirements.min_sales ? 'bg-success/10' : 'bg-error/10'}`}>
                        <span className="text-sm">Minimum Sales: {formatCurrency(targetTier.requirements.min_sales)}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{formatCurrency(selectedRequest.metrics.total_sales)}</span>
                          {selectedRequest.metrics.total_sales >= targetTier.requirements.min_sales ? (
                            <Icon name="CheckCircleIcon" size={20} className="text-success" />
                          ) : (
                            <Icon name="XCircleIcon" size={20} className="text-error" />
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center justify-between p-3 rounded-lg ${selectedRequest.metrics.total_orders >= targetTier.requirements.min_orders ? 'bg-success/10' : 'bg-error/10'}`}>
                        <span className="text-sm">Minimum Orders: {targetTier.requirements.min_orders}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{selectedRequest.metrics.total_orders}</span>
                          {selectedRequest.metrics.total_orders >= targetTier.requirements.min_orders ? (
                            <Icon name="CheckCircleIcon" size={20} className="text-success" />
                          ) : (
                            <Icon name="XCircleIcon" size={20} className="text-error" />
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center justify-between p-3 rounded-lg ${selectedRequest.metrics.rating >= targetTier.requirements.min_rating ? 'bg-success/10' : 'bg-error/10'}`}>
                        <span className="text-sm">Minimum Rating: {targetTier.requirements.min_rating}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{selectedRequest.metrics.rating}</span>
                          {selectedRequest.metrics.rating >= targetTier.requirements.min_rating ? (
                            <Icon name="CheckCircleIcon" size={20} className="text-success" />
                          ) : (
                            <Icon name="XCircleIcon" size={20} className="text-error" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {selectedRequest.meets_requirements ? (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm text-success">
                    <Icon name="CheckCircleIcon" size={16} className="inline mr-1" />
                    This vendor meets all requirements for {selectedRequest.requested_tier.toUpperCase()} tier upgrade.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">
                    <Icon name="ExclamationTriangleIcon" size={16} className="inline mr-1" />
                    This vendor does not meet all requirements. Manual approval may be needed.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectUpgrade}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90"
              >
                Reject
              </button>
              <button
                onClick={handleApproveUpgrade}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90"
              >
                Approve Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

TierManagementInteractive.propTypes = {
  initialData: PropTypes.shape({
    tiers: PropTypes.array,
    upgrade_requests: PropTypes.array
  })
};
