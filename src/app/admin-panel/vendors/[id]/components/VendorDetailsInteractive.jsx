'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function VendorDetailsInteractive({ vendor }) {
  const [showActionModal, setShowActionModal] = useState(false);
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

  const handleAction = (action) => {
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    const messages = {
      suspend: `Vendor ${vendor.business_name} suspended`,
      activate: `Vendor ${vendor.business_name} activated`,
      verify: `Vendor ${vendor.business_name} verified`,
      upgrade: `Vendor tier upgraded`
    };
    alert(messages[actionType] || 'Action completed');
    setShowActionModal(false);
  };

  return (
    <DashboardLayout
      role="admin"
      title={`Vendor Details - ${vendor.business_name}`}
      subtitle="View and manage vendor information"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin-panel/vendors"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeftIcon" size={20} />
          Back to Vendors
        </Link>
        
        <div className="flex gap-2">
          {vendor.status === 'active' && (
            <button
              onClick={() => handleAction('suspend')}
              className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors flex items-center gap-2"
            >
              <Icon name="XCircleIcon" size={18} />
              Suspend Vendor
            </button>
          )}
          {vendor.status === 'suspended' && (
            <button
              onClick={() => handleAction('activate')}
              className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
            >
              <Icon name="CheckCircleIcon" size={18} />
              Activate Vendor
            </button>
          )}
        </div>
      </div>

      {/* Vendor Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{vendor.business_name}</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(vendor.status)}`}>
                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(vendor.tier)}`}>
                  {vendor.tier.charAt(0).toUpperCase() + vendor.tier.slice(1)} Tier
                </span>
                {vendor.verification_status === 'verified' && (
                  <div className="flex items-center gap-1 text-success">
                    <Icon name="CheckBadgeIcon" size={20} />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Icon name="StarIcon" size={20} className="text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-semibold text-foreground">{vendor.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">({vendor.reviews_count} reviews)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Email</p>
              <p className="text-foreground">{vendor.business_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Type</p>
              <p className="text-foreground">{vendor.business_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Owner</p>
              <p className="text-foreground">{vendor.owner_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <p className="text-foreground">{vendor.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tax ID</p>
              <p className="font-mono text-foreground">{vendor.tax_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Address</p>
              <p className="text-foreground">{vendor.address}</p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Response Rate</span>
                <span className="font-semibold text-foreground">{vendor.response_rate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: `${vendor.response_rate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">On-Time Delivery</span>
                <span className="font-semibold text-foreground">{vendor.on_time_delivery}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: `${vendor.on_time_delivery}%` }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-lg font-semibold text-foreground">{vendor.avg_response_time}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return Rate</p>
              <p className="text-lg font-semibold text-foreground">{vendor.return_rate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales & Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(vendor.total_sales)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-foreground">{vendor.orders_count}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Products</p>
          <p className="text-2xl font-bold text-foreground">{vendor.products_count}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Member Since</p>
          <p className="text-lg font-semibold text-foreground">{formatDate(vendor.joined_date)}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
          </div>
          <div className="divide-y divide-border">
            {vendor.recent_orders?.map((order) => (
              <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/order-tracking?id=${order.id}`} className="text-sm font-medium text-primary hover:underline">
                    {order.id}
                  </Link>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(order.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{order.buyer}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Top Products</h3>
          </div>
          <div className="divide-y divide-border">
            {vendor.top_products?.map((product) => (
              <div key={product.id} className="p-4 hover:bg-muted/30 transition-colors">
                <p className="font-medium text-foreground mb-2">{product.name}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{product.sales} sales</span>
                  <span className="font-semibold text-success">{formatCurrency(product.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banking Info */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="BanknotesIcon" size={20} />
          Banking Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
            <p className="font-medium text-foreground">{vendor.bank_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Account Number</p>
            <p className="font-mono text-foreground">{vendor.bank_account}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last Active</p>
            <p className="font-medium text-foreground">{formatDate(vendor.last_active)}</p>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
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
                <p className="font-medium text-foreground mb-2">{vendor.business_name}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Owner: {vendor.owner_name}</p>
                  <p className="text-muted-foreground">Email: {vendor.business_email}</p>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${
                actionType === 'suspend' ? 'bg-error/10 border-error/20' :
                'bg-success/10 border-success/20'
              }`}>
                <p className="text-sm">
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
                  actionType === 'suspend' ? 'bg-error text-white hover:bg-error/90' :
                  'bg-success text-white hover:bg-success/90'
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

VendorDetailsInteractive.propTypes = {
  vendor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    business_name: PropTypes.string.isRequired,
    business_email: PropTypes.string,
    owner_name: PropTypes.string,
    phone: PropTypes.string,
    status: PropTypes.string.isRequired,
    tier: PropTypes.string,
    rating: PropTypes.number,
    total_sales: PropTypes.number,
    products_count: PropTypes.number,
    orders_count: PropTypes.number,
    joined_date: PropTypes.string,
    last_active: PropTypes.string,
    verification_status: PropTypes.string,
    business_type: PropTypes.string,
    tax_id: PropTypes.string,
    address: PropTypes.string,
    bank_name: PropTypes.string,
    bank_account: PropTypes.string,
    reviews_count: PropTypes.number,
    response_rate: PropTypes.number,
    avg_response_time: PropTypes.string,
    return_rate: PropTypes.number,
    on_time_delivery: PropTypes.number,
    recent_orders: PropTypes.array,
    top_products: PropTypes.array
  }).isRequired
};
