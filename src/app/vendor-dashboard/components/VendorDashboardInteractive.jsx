'use client';

import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import MetricsCard from './MetricsCard';
import SalesChart from './SalesChart';
import RecentOrdersTable from './RecentOrdersTable';
import InventoryAlerts from './InventoryAlerts';
import EarningsPanel from './EarningsPanel';
import ReviewNotifications from './ReviewNotifications';
import SellerTierBadge from '@/components/common/SellerTierBadge';
import Icon from '@/components/ui/AppIcon';

export default function VendorDashboardInteractive({ initialData }) {
  // Mock badges - in production these would come from real data
  const badges = {
    orders: 23,
    returns: 2,
    disputes: 1,
    notifications: 5
  };

  return (
    <DashboardLayout 
      role="vendor"
      title="Dashboard"
      subtitle={`Here's what's happening today - ${new Date().toLocaleDateString('en-GB')}`}
      badges={badges}
      actions={
        <div className="flex items-center gap-3">
          <SellerTierBadge compact />
          <Link
            href="/vendor-store-management/add-product"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Icon name="PlusIcon" size={18} />
            Add Product
          </Link>
        </div>
      }
    >
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {initialData?.metrics?.map((metric) => (
          <MetricsCard key={metric?.id} {...metric} />
        ))}
      </div>

      {/* Sales Chart */}
      <div className="mb-6 sm:mb-8">
        <SalesChart data={initialData?.salesData} />
      </div>

      {/* Recent Orders */}
      <div className="mb-6 sm:mb-8">
        <RecentOrdersTable orders={initialData?.recentOrders} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Inventory Alerts */}
        <InventoryAlerts alerts={initialData?.inventoryAlerts} />

        {/* Review Notifications */}
        <ReviewNotifications reviews={initialData?.reviews} />
      </div>

      {/* Earnings Panel */}
      <div className="mb-6 sm:mb-8">
        <EarningsPanel earnings={initialData?.earnings} />
      </div>
    </DashboardLayout>
  );
}

VendorDashboardInteractive.propTypes = {
  initialData: PropTypes?.shape({
    metrics: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        title: PropTypes?.string?.isRequired,
        value: PropTypes?.string?.isRequired,
        change: PropTypes?.string,
        changeType: PropTypes?.oneOf(['positive', 'negative', 'neutral', 'warning']),
        icon: PropTypes?.string?.isRequired,
        iconBg: PropTypes?.string?.isRequired,
      })
    )?.isRequired,
    salesData: PropTypes?.arrayOf(
      PropTypes?.shape({
        date: PropTypes?.string?.isRequired,
        sales: PropTypes?.number?.isRequired,
        orders: PropTypes?.number?.isRequired,
      })
    )?.isRequired,
    recentOrders: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        customerName: PropTypes?.string?.isRequired,
        customerEmail: PropTypes?.string?.isRequired,
        productName: PropTypes?.string?.isRequired,
        amount: PropTypes?.string?.isRequired,
        status: PropTypes?.oneOf(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])?.isRequired,
      })
    )?.isRequired,
    inventoryAlerts: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        productName: PropTypes?.string?.isRequired,
        sku: PropTypes?.string?.isRequired,
        message: PropTypes?.string?.isRequired,
        currentStock: PropTypes?.number?.isRequired,
        level: PropTypes?.oneOf(['critical', 'warning', 'info'])?.isRequired,
        image: PropTypes?.string,
      })
    )?.isRequired,
    reviews: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        customerName: PropTypes?.string?.isRequired,
        productName: PropTypes?.string?.isRequired,
        rating: PropTypes?.number?.isRequired,
        comment: PropTypes?.string?.isRequired,
        date: PropTypes?.string?.isRequired,
        responded: PropTypes?.bool?.isRequired,
      })
    )?.isRequired,
    earnings: PropTypes?.shape({
      availableBalance: PropTypes?.string?.isRequired,
      pendingPayments: PropTypes?.string?.isRequired,
      totalEarnings: PropTypes?.string?.isRequired,
      recentTransactions: PropTypes?.arrayOf(
        PropTypes?.shape({
          id: PropTypes?.string?.isRequired,
          description: PropTypes?.string?.isRequired,
          amount: PropTypes?.string?.isRequired,
          date: PropTypes?.string?.isRequired,
          type: PropTypes?.oneOf(['credit', 'debit'])?.isRequired,
        })
      )?.isRequired,
    })?.isRequired,
  })?.isRequired,
};
