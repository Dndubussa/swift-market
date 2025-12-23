'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function InventoryOverviewInteractive({ initialData }) {
  const [selectedType, setSelectedType] = useState('all');

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

  const getTypeColor = (type) => {
    const colors = {
      out_of_stock: 'bg-error/10 text-error border-error/20',
      low_stock: 'bg-warning/10 text-warning border-warning/20',
      overstocked: 'bg-info/10 text-info border-info/20'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const getTypeIcon = (type) => {
    const icons = {
      out_of_stock: 'ExclamationCircleIcon',
      low_stock: 'ExclamationTriangleIcon',
      overstocked: 'InformationCircleIcon'
    };
    return icons[type] || 'InformationCircleIcon';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-error/10 text-error',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-info/10 text-info'
    };
    return colors[priority] || 'bg-muted text-muted-foreground';
  };

  const filteredAlerts = selectedType === 'all'
    ? initialData?.alerts
    : initialData?.alerts?.filter(a => a.type === selectedType) || [];

  return (
    <DashboardLayout
      role="admin"
      title="Inventory Overview"
      subtitle="Monitor stock levels and inventory alerts"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Stock Value</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(initialData?.summary?.total_stock_value)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-error">{initialData?.summary?.out_of_stock}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.low_stock}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Overstocked</p>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.overstocked}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Products</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_products}</p>
        </div>
      </div>

      {/* Category Stock Overview */}
      <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Stock by Category</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Total Stock</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Stock Value</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Out of Stock</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Low Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialData?.categories?.map((category, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{category.name}</td>
                  <td className="p-4 text-foreground">{category.total_stock.toLocaleString()} units</td>
                  <td className="p-4 font-semibold text-primary">{formatCurrency(category.value)}</td>
                  <td className="p-4">
                    <span className="text-error font-medium">{category.out_of_stock}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-warning font-medium">{category.low_stock}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Inventory Alerts</h2>
          <div className="flex gap-2">
            {['all', 'out_of_stock', 'low_stock', 'overstocked'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {type === 'all' ? 'All' : type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredAlerts?.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getTypeColor(alert.type)}`}>
                  <Icon name={getTypeIcon(alert.type)} size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{alert.product_name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>SKU: {alert.sku}</span>
                        <span>•</span>
                        <Link href={`/admin-panel/vendors/${alert.vendor_id}`} className="text-primary hover:underline">
                          {alert.vendor_name}
                        </Link>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                      {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)} Priority
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Current Stock</p>
                      <p className="text-lg font-bold text-foreground">{alert.current_stock}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Recommended</p>
                      <p className="text-lg font-bold text-success">{alert.recommended_stock}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Sales Velocity</p>
                      <p className="text-lg font-bold text-primary">{alert.sales_velocity}/day</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Last Restocked</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(alert.last_restocked)}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Stock Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(alert.type)}`}>
                        {alert.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Link
                      href={`/product-details?id=${alert.product_id}`}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Icon name="EyeIcon" size={16} />
                      View Product
                    </Link>
                    <Link
                      href={`/admin-panel/vendors/${alert.vendor_id}`}
                      className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                    >
                      <Icon name="UserIcon" size={16} />
                      Contact Vendor
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredAlerts?.length === 0 && (
            <div className="p-12 text-center">
              <Icon name="CheckCircleIcon" size={48} className="text-success mx-auto mb-4" />
              <p className="text-muted-foreground">No inventory alerts for this category</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

InventoryOverviewInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    alerts: PropTypes.array,
    categories: PropTypes.array
  })
};
