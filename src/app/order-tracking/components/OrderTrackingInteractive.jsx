'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import OrderTimelineStep from './OrderTimelineStep';
import OrderProductCard from './OrderProductCard';
import VendorInfoCard from './VendorInfoCard';
import DeliveryTrackingMap from './DeliveryTrackingMap';
import OrderActionsPanel from './OrderActionsPanel';
import NotificationPreferences from './NotificationPreferences';
import VendorChatPanel from './VendorChatPanel';
import DigitalProductDownload from './DigitalProductDownload';
import Icon from '@/components/ui/AppIcon';

export default function OrderTrackingInteractive({ initialOrderData }) {
  const [selectedOrder, setSelectedOrder] = useState(initialOrderData?.orders?.[0]);
  const [showChat, setShowChat] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: true,
    push: true,
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem('notificationPreferences');
    if (savedPrefs) {
      try {
        setNotificationPrefs(JSON.parse(savedPrefs));
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }
  }, []);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setShowChat(false);
  };

  const handleOrderAction = (action, data) => {
    console.log('Order action:', action, data);
    alert(`${action?.charAt(0)?.toUpperCase() + action?.slice(1)} request submitted successfully!`);
  };

  const handleNotificationUpdate = (preferences) => {
    setNotificationPrefs(preferences);
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      alert('Notification preferences updated successfully!');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };

  const handleSendMessage = (message) => {
    console.log('Message sent:', message);
  };

  const getCurrentStepIndex = () => {
    const statusMap = {
      confirmed: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
    };
    return statusMap?.[selectedOrder?.status] || 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            Order Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your orders and communicate with vendors in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Order #{selectedOrder?.id}</h2>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(selectedOrder.orderDate)?.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold text-primary">{selectedOrder?.totalAmount}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Order Timeline</h3>
                <div className="space-y-0">
                  {selectedOrder?.timeline?.map((step, index) => (
                    <OrderTimelineStep
                      key={index}
                      step={step}
                      isActive={index === currentStepIndex}
                      isCompleted={index < currentStepIndex}
                      isLast={index === selectedOrder?.timeline?.length - 1}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder?.products?.map((product) => (
                    <OrderProductCard
                      key={product?.id}
                      product={product}
                      vendorName={selectedOrder?.vendor?.name}
                      trackingNumber={product?.trackingNumber}
                    />
                  ))}
                </div>
              </div>
            </div>

            {selectedOrder?.deliveryInfo && (
              <DeliveryTrackingMap deliveryInfo={selectedOrder?.deliveryInfo} />
            )}

            {selectedOrder?.digitalProducts && selectedOrder?.digitalProducts?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Digital Products</h3>
                {selectedOrder?.digitalProducts?.map((product) => (
                  <DigitalProductDownload key={product?.id} product={product} />
                ))}
              </div>
            )}

            {showChat && (
              <VendorChatPanel
                vendorName={selectedOrder?.vendor?.name}
                orderId={selectedOrder?.id}
                initialMessages={selectedOrder?.chatMessages || []}
                onSendMessage={handleSendMessage}
              />
            )}
          </div>

          <div className="space-y-6">
            <VendorInfoCard
              vendor={selectedOrder?.vendor}
              onMessageVendor={() => setShowChat(!showChat)}
            />

            <OrderActionsPanel
              orderId={selectedOrder?.id}
              orderStatus={selectedOrder?.status}
              onAction={handleOrderAction}
            />

            <NotificationPreferences
              initialPreferences={notificationPrefs}
              onUpdate={handleNotificationUpdate}
            />

            {initialOrderData?.orders?.length > 1 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Other Orders</h3>
                <div className="space-y-2">
                  {initialOrderData?.orders?.filter((order) => order?.id !== selectedOrder?.id)?.map((order) => (
                      <button
                        key={order?.id}
                        onClick={() => handleOrderSelect(order)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">Order #{order?.id}</p>
                          <p className="text-xs text-muted-foreground">{order?.vendor?.name}</p>
                        </div>
                        <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

OrderTrackingInteractive.propTypes = {
  initialOrderData: PropTypes?.shape({
    orders: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        status: PropTypes?.string?.isRequired,
        orderDate: PropTypes?.string?.isRequired,
        totalAmount: PropTypes?.string?.isRequired,
        timeline: PropTypes?.array?.isRequired,
        products: PropTypes?.array?.isRequired,
        vendor: PropTypes?.object?.isRequired,
        deliveryInfo: PropTypes?.object,
        digitalProducts: PropTypes?.array,
        chatMessages: PropTypes?.array,
      })
    )?.isRequired,
  })?.isRequired,
};