'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import PlatformMetricsCard from './PlatformMetricsCard';
import VendorManagementTable from './VendorManagementTable';
import SystemMonitoringPanel from './SystemMonitoringPanel';
import FinancialOverviewCard from './FinancialOverviewCard';
import ContentModerationQueue from './ContentModerationQueue';
import QuickActionsPanel from './QuickActionsPanel';
import RecentActivityFeed from './RecentActivityFeed';
import SellerGradingPanel from './SellerGradingPanel';
import EscrowManagementPanel from './EscrowManagementPanel';
import AdminPayoutsPanel from './AdminPayoutsPanel';
import ReturnsManagementPanel from './ReturnsManagementPanel';
import TierManagementPanel from './TierManagementPanel';
import NotificationTemplatesPanel from './NotificationTemplatesPanel';
import OrderFulfillmentPanel from './OrderFulfillmentPanel';
import DisputeResolutionPanel from './DisputeResolutionPanel';
import InventoryOverviewPanel from './InventoryOverviewPanel';
import ReviewModerationPanel from './ReviewModerationPanel';
import SupportTicketPanel from './SupportTicketPanel';

export default function AdminPanelInteractive({ initialData }) {
  const [activeView, setActiveView] = useState('overview');

  // Action buttons for the header
  const headerActions = (
    <>
      <button
        onClick={() => setActiveView('overview')}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        title="Refresh Dashboard"
      >
        <Icon name="ArrowPathIcon" size={20} className="text-foreground" />
      </button>
      <button
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        title="Notifications"
      >
        <Icon name="BellIcon" size={20} className="text-foreground" />
      </button>
    </>
  );

  return (
    <DashboardLayout
      role="admin"
      title="Admin Panel"
      subtitle="Comprehensive platform management and oversight"
      actions={headerActions}
      badges={{
        disputes: 3,
        pendingVendors: 2
      }}
    >
      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {initialData?.metrics?.map((metric) => (
          <PlatformMetricsCard key={metric?.title} {...metric} />
        ))}
      </div>

      {/* Seller Grading Panel */}
      <div className="mb-8">
        <SellerGradingPanel />
      </div>

      {/* Vendor Management & System Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <VendorManagementTable vendors={initialData?.vendors} />
        </div>
        <div className="space-y-6">
          <SystemMonitoringPanel systems={initialData?.systems} />
        </div>
      </div>

      {/* Financial Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FinancialOverviewCard financials={initialData?.financials} />
        <QuickActionsPanel actions={initialData?.quickActions} />
      </div>

      {/* Escrow Management Panel */}
      <div className="mb-8">
        <EscrowManagementPanel />
      </div>

      {/* Admin Management Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <AdminPayoutsPanel />
          <div className="mt-6"><ReturnsManagementPanel /></div>
        </div>
        <div>
          <TierManagementPanel />
          <div className="mt-6"><NotificationTemplatesPanel /></div>
        </div>
        <div>
          <OrderFulfillmentPanel />
          <div className="mt-6"><DisputeResolutionPanel /></div>
        </div>
      </div>

      {/* Additional Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <InventoryOverviewPanel />
        </div>
        <div>
          <ReviewModerationPanel />
        </div>
        <div>
          <SupportTicketPanel />
        </div>
      </div>

      {/* Content Moderation & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentModerationQueue items={initialData?.moderationQueue} />
        </div>
        <div>
          <RecentActivityFeed activities={initialData?.recentActivities} />
        </div>
      </div>
    </DashboardLayout>
  );
}

AdminPanelInteractive.propTypes = {
  initialData: PropTypes.shape({
    metrics: PropTypes.array,
    vendors: PropTypes.array,
    systems: PropTypes.array,
    financials: PropTypes.array,
    quickActions: PropTypes.array,
    moderationQueue: PropTypes.array,
    recentActivities: PropTypes.array,
  }),
};