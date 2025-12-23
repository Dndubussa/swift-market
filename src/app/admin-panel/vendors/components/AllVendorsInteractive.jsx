'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function AllVendorsInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [actionType, setActionType] = useState(null);

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

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      suspended: 'bg-error/10 text-error border-error/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getTierColor = (tier) => {
    const colors = {
      gold: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      silver: 'bg-gray-400/10 text-gray-600 border-gray-400/20',
      bronze: 'bg-orange-600/10 text-orange-600 border-orange-600/20'
    };
    return colors[tier] || 'bg-muted text-muted-foreground';
  };

  const filteredVendors = initialData?.vendors?.filter(vendor => {
    const statusMatch = selectedStatus === 'all' || vendor.status === selectedStatus;
    const tierMatch = selectedTier === 'all' || vendor.tier === selectedTier;
    const verificationMatch = selectedVerification === 'all' || vendor.verification_status === selectedVerification;
    return statusMatch && tierMatch && verificationMatch;
  }) || [];

  const handleAction = (vendor, action) => {
    setSelectedVendor(vendor);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    const messages = {
      approve: `Vendor ${selectedVendor.business_name} approved`,
      suspend: `Vendor ${selectedVendor.business_name} suspended`,
      activate: `Vendor ${selectedVendor.business_name} activated`,
      verify: `Vendor ${selectedVendor.business_name} verified`
    };
    alert(messages[actionType] || 'Action completed');
    setShowActionModal(false);
  };

  return (
    <DashboardLayout
      role="admin"
      title="All Vendors"
      subtitle="View and manage all marketplace vendors"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BuildingStorefrontIcon" size={20} className="text-primary" />
            <p className="text-sm text-muted-foreground">Total Vendors</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_vendors}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CheckCircleIcon" size={20} className="text-success" />
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.active_vendors}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ClockIcon" size={20} className="text-warning" />
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.pending_approval}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="XCircleIcon" size={20} className="text-error" />
            <p className="text-sm text-muted-foreground">Suspended</p>
          </div>
          <p className="text-2xl font-bold text-error">{initialData?.summary?.suspended_vendors}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="PlusCircleIcon" size={20} className="text-info" />
            <p className="text-sm text-muted-foreground">New This Month</p>
          </div>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.new_this_month}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Tier</label>
            <div className="flex flex-wrap gap-2">
              {initialData?.filters?.tiers?.map(tier => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedTier === tier
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Verification</label>
            <div className="flex flex-wrap gap-2">
              {initialData?.filters?.verification?.map(verification => (
                <button
                  key={verification}
                  onClick={() => setSelectedVerification(verification)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedVerification === verification
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {verification.charAt(0).toUpperCase() + verification.slice(1)}
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
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Owner</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Tier</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Performance</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Joined</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <Link
                        href={`/admin-panel/vendors/${vendor.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {vendor.business_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{vendor.business_email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Icon name="StarIcon" size={14} className="text-yellow-500" />
                        <span className="text-xs font-medium text-foreground">{vendor.rating || 'N/A'}</span>
                        {vendor.verification_status === 'verified' && (
                          <Icon name="CheckBadgeIcon" size={14} className="text-success ml-1" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{vendor.owner_name}</p>
                      <p className="text-muted-foreground">{vendor.phone}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(vendor.status)}`}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </span>
                    {vendor.suspension_reason && (
                      <p className="text-xs text-error mt-1">{vendor.suspension_reason}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTierColor(vendor.tier)}`}>
                      {vendor.tier.charAt(0).toUpperCase() + vendor.tier.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">{formatCurrency(vendor.total_sales)}</p>
                      <p className="text-xs text-muted-foreground">{vendor.orders_count} orders</p>
                      <p className="text-xs text-muted-foreground">{vendor.products_count} products</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-foreground">{formatDate(vendor.joined_date)}</p>
                      <p className="text-xs text-muted-foreground">Active: {formatDate(vendor.last_active)}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {vendor.status === 'pending' && (
                        <button
                          onClick={() => handleAction(vendor, 'approve')}
                          className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                          title="Approve Vendor"
                        >
                          <Icon name="CheckCircleIcon" size={16} />
                        </button>
                      )}
                      {vendor.status === 'suspended' && (
                        <button
                          onClick={() => handleAction(vendor, 'activate')}
                          className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                          title="Activate Vendor"
                        >
                          <Icon name="CheckCircleIcon" size={16} />
                        </button>
                      )}
                      {vendor.status === 'active' && (
                        <button
                          onClick={() => handleAction(vendor, 'suspend')}
                          className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                          title="Suspend Vendor"
                        >
                          <Icon name="XCircleIcon" size={16} />
                        </button>
                      )}
                      <Link
                        href={`/admin-panel/vendors/${vendor.id}`}
                        className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        title="View Details"
                      >
                        <Icon name="EyeIcon" size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVendors.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vendors found for the selected filters</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {actionType === 'approve' && 'Approve Vendor'}
                {actionType === 'suspend' && 'Suspend Vendor'}
                {actionType === 'activate' && 'Activate Vendor'}
                {actionType === 'verify' && 'Verify Vendor'}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">{selectedVendor.business_name}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Owner: {selectedVendor.owner_name}</p>
                  <p className="text-muted-foreground">Email: {selectedVendor.business_email}</p>
                  <p className="text-muted-foreground">Phone: {selectedVendor.phone}</p>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${
                actionType === 'approve' || actionType === 'activate' ? 'bg-success/10 border-success/20' :
                actionType === 'suspend' ? 'bg-error/10 border-error/20' :
                'bg-info/10 border-info/20'
              }`}>
                <p className="text-sm">
                  {actionType === 'approve' && 'This will approve the vendor and allow them to start selling.'}
                  {actionType === 'suspend' && 'This will suspend the vendor and prevent them from selling.'}
                  {actionType === 'activate' && 'This will reactivate the vendor account.'}
                  {actionType === 'verify' && 'This will mark the vendor as verified.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  actionType === 'approve' || actionType === 'activate' ? 'bg-success text-white hover:bg-success/90' :
                  actionType === 'suspend' ? 'bg-error text-white hover:bg-error/90' :
                  'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

AllVendorsInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    vendors: PropTypes.array,
    filters: PropTypes.object
  })
};
