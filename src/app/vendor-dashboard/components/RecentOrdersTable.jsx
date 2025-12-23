'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function RecentOrdersTable({ orders }) {
  const [selectedOrders, setSelectedOrders] = useState([]);

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      setSelectedOrders(orders?.map((order) => order?.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev?.includes(orderId) ? prev?.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      processing: 'bg-accent/10 text-accent-foreground border-accent/20',
      shipped: 'bg-primary/10 text-primary border-primary/20',
      delivered: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-error/10 text-error border-error/20',
    };
    return colors?.[status] || colors?.pending;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Recent Orders</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage and track your customer orders</p>
          </div>
          <Link
            href="/vendor-dashboard/orders"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
          >
            View All Orders
          </Link>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders?.length === orders?.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders?.map((order) => (
              <tr key={order?.id} className="hover:bg-muted/30 transition-colors duration-200">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders?.includes(order?.id)}
                    onChange={() => handleSelectOrder(order?.id)}
                    className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-primary">#{order?.id}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{order?.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order?.customerEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{order?.productName}</td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">{order?.amount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      order?.status
                    )}`}
                  >
                    {order?.status?.charAt(0)?.toUpperCase() + order?.status?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/vendor-dashboard/orders/${order?.id}`}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors duration-200"
                      aria-label="View order details"
                    >
                      <Icon name="EyeIcon" size={18} className="text-muted-foreground" />
                    </Link>
                    <Link
                      href={`/vendor-dashboard/orders/${order?.id}`}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors duration-200"
                      aria-label="Manage order"
                    >
                      <Icon name="PencilIcon" size={18} className="text-muted-foreground" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {orders?.map((order) => (
          <div key={order?.id} className="p-4 hover:bg-muted/30 transition-colors duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedOrders?.includes(order?.id)}
                  onChange={() => handleSelectOrder(order?.id)}
                  className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                />
                <div>
                  <p className="text-sm font-medium text-primary">#{order?.id}</p>
                  <p className="text-xs text-muted-foreground">{order?.customerName}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  order?.status
                )}`}
              >
                {order?.status?.charAt(0)?.toUpperCase() + order?.status?.slice(1)}
              </span>
            </div>
            <div className="space-y-2 mb-3">
              <p className="text-sm text-foreground">{order?.productName}</p>
              <p className="text-sm font-semibold text-foreground">{order?.amount}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                href={`/vendor-dashboard/orders/${order?.id}`}
                className="flex-1 px-3 py-2 border border-input rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200 text-center"
              >
                View Details
              </Link>
              <Link 
                href={`/vendor-dashboard/orders/${order?.id}`}
                className="px-3 py-2 border border-input rounded-md hover:bg-muted transition-colors duration-200"
              >
                <Icon name="PencilIcon" size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

RecentOrdersTable.propTypes = {
  orders: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      customerName: PropTypes?.string?.isRequired,
      customerEmail: PropTypes?.string?.isRequired,
      productName: PropTypes?.string?.isRequired,
      amount: PropTypes?.string?.isRequired,
      status: PropTypes?.oneOf(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])?.isRequired,
    })
  )?.isRequired,
};