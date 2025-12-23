'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function FulfillmentInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

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
      pending: 'bg-warning/10 text-warning border-warning/20',
      processing: 'bg-info/10 text-info border-info/20',
      ready_to_ship: 'bg-primary/10 text-primary border-primary/20',
      shipped: 'bg-success/10 text-success border-success/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const filteredOrders = selectedStatus === 'all'
    ? initialData?.orders
    : initialData?.orders?.filter(o => o.status === selectedStatus) || [];

  const handleMarkReadyToShip = (order) => {
    alert(`Order ${order.id} marked as ready to ship!`);
  };

  const handleShip = (order) => {
    setSelectedOrder(order);
    setShowShipModal(true);
  };

  const confirmShip = () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }
    alert(`Order ${selectedOrder.id} marked as shipped! Tracking: ${trackingNumber}`);
    setShowShipModal(false);
    setTrackingNumber('');
  };

  return (
    <DashboardLayout
      role="admin"
      title="Order Fulfillment"
      subtitle="Manage order processing and shipping"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Fulfillment</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.pending_fulfillment}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Ready to Ship</p>
          <p className="text-2xl font-bold text-primary">{initialData?.summary?.ready_to_ship}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">In Transit</p>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.in_transit}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Fulfillment</p>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.avg_fulfillment_time}</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'processing', 'ready_to_ship', 'shipped'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status === 'all' ? 'All' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Fulfillment Queue */}
      <div className="space-y-4">
        {filteredOrders?.map((order) => (
          <div key={order.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/order-tracking?id=${order.id}`} className="text-lg font-semibold text-primary hover:underline">
                      {order.id}
                    </Link>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Buyer: {order.buyer_name}</span>
                    <span>•</span>
                    <Link href={`/admin-panel/vendors/${order.vendor_id}`} className="text-primary hover:underline">
                      Vendor: {order.vendor_name}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Order Items</h4>
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(order.total_amount)}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Order Date</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(order.order_date)}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Est. Delivery</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(order.estimated_delivery)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="TruckIcon" size={16} />
                    Shipping Details
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Address</p>
                      <p className="text-sm font-medium text-foreground">{order.shipping_address}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Method</p>
                      <p className="text-sm font-medium text-foreground">{order.shipping_method}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleMarkReadyToShip(order)}
                    className="px-4 py-2 bg-info text-white rounded-lg hover:bg-info/90 transition-colors flex items-center gap-2"
                  >
                    <Icon name="CheckCircleIcon" size={18} />
                    Mark as Processing
                  </button>
                )}
                {order.status === 'processing' && (
                  <button
                    onClick={() => handleMarkReadyToShip(order)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Icon name="CheckCircleIcon" size={18} />
                    Mark Ready to Ship
                  </button>
                )}
                {order.status === 'ready_to_ship' && (
                  <button
                    onClick={() => handleShip(order)}
                    className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
                  >
                    <Icon name="TruckIcon" size={18} />
                    Mark as Shipped
                  </button>
                )}
                <Link
                  href={`/order-tracking?id=${order.id}`}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                >
                  <Icon name="EyeIcon" size={18} />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders?.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="CheckCircleIcon" size={48} className="text-success mx-auto mb-4" />
            <p className="text-muted-foreground">No orders in this fulfillment stage</p>
          </div>
        )}
      </div>

      {/* Ship Order Modal */}
      {showShipModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Mark Order as Shipped</h3>
              <button
                onClick={() => setShowShipModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">{selectedOrder.id}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Buyer: {selectedOrder.buyer_name}</p>
                  <p className="text-muted-foreground">Destination: {selectedOrder.shipping_address}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm text-success">
                  <Icon name="InformationCircleIcon" size={16} className="inline mr-1" />
                  Customer will be notified via email with tracking details.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowShipModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmShip}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90"
              >
                Confirm Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

FulfillmentInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    orders: PropTypes.array
  })
};
