'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function FinancialOverviewInteractive({ initialData }) {
  const [timeRange, setTimeRange] = useState('month');

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      processing: 'bg-info/10 text-info',
      escrow: 'bg-accent/10 text-accent',
      failed: 'bg-error/10 text-error'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getTransactionIcon = (type) => {
    const icons = {
      sale: 'ShoppingCartIcon',
      payout: 'ArrowUpTrayIcon',
      refund: 'ArrowUturnLeftIcon',
      commission: 'PercentBadgeIcon'
    };
    return icons[type] || 'DocumentIcon';
  };

  return (
    <DashboardLayout
      role="admin"
      title="Financial Overview"
      subtitle="Platform revenue, commissions, and payout management"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {initialData?.metrics?.map((metric) => (
          <div
            key={metric.id}
            className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon name={metric.icon} size={24} className="text-primary" />
              </div>
              {metric.change && (
                <span
                  className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-success' : 'text-error'
                  }`}
                >
                  {metric.change}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {metric.value}
            </h3>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart & Payout Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Revenue Trend</h2>
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    timeRange === range
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Chart Placeholder */}
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="ChartBarIcon" size={48} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Revenue chart visualization</p>
              <p className="text-xs text-muted-foreground mt-1">
                Chart library integration pending
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-muted-foreground">Gross Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm text-muted-foreground">Commission</span>
            </div>
          </div>
        </div>

        {/* Payout Schedule */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Next Payout</h2>
          
          <div className="bg-primary/10 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CalendarIcon" size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {formatDate(initialData?.payoutSchedule?.next_payout_date)}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(initialData?.payoutSchedule?.total_amount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              To {initialData?.payoutSchedule?.vendor_count} vendors
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Processing</span>
              <span className="text-sm font-medium text-foreground">
                {initialData?.payoutSchedule?.processing_count}
              </span>
            </div>
            <Link
              href="/admin-panel/financial/payouts"
              className="block w-full px-4 py-2 bg-primary text-primary-foreground text-center rounded-lg hover:bg-primary/90 transition-colors"
            >
              Manage Payouts
            </Link>
          </div>
        </div>
      </div>

      {/* Top Vendor Payouts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendor Payouts */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Top Pending Payouts</h2>
            <Link
              href="/admin-panel/financial/payouts"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {initialData?.topVendorPayouts?.map((payout) => (
              <div key={payout.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">
                    {payout.vendor_name}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(payout.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      payout.status
                    )}`}
                  >
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Due {formatDate(payout.due_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Link
              href="/admin-panel/financial/transactions"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {initialData?.recentTransactions?.map((txn) => (
              <div key={txn.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                    <Icon name={getTransactionIcon(txn.type)} size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {txn.id}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(txn.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {txn.vendor}
                      {txn.buyer && ` → ${txn.buyer}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                          txn.status
                        )}`}
                      >
                        {txn.status}
                      </span>
                      {txn.commission && (
                        <span className="text-xs text-muted-foreground">
                          Fee: {formatCurrency(txn.commission)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

FinancialOverviewInteractive.propTypes = {
  initialData: PropTypes.shape({
    metrics: PropTypes.array,
    revenueChart: PropTypes.object,
    topVendorPayouts: PropTypes.array,
    recentTransactions: PropTypes.array,
    payoutSchedule: PropTypes.object
  })
};
