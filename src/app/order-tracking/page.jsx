import OrderTrackingInteractive from './components/OrderTrackingInteractive';

export const metadata = {
  title: 'Order Tracking - Blinno Marketplace',
  description: 'Track your orders in real-time with detailed status updates, vendor communication, and delivery tracking on Blinno Marketplace.'
};

export default function OrderTrackingPage() {
  const mockOrderData = {
    orders: [
    {
      id: 'ORD-2025-001234',
      status: 'shipped',
      orderDate: '2025-12-15T10:30:00',
      totalAmount: 'TZS 245,000',
      vendor: {
        id: 'vendor-001',
        name: 'Dar Electronics Hub',
        location: 'Kariakoo, Dar es Salaam',
        phone: '+255 712 345 678',
        rating: 4.8,
        reviews: 1247
      },
      timeline: [
      {
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared',
        icon: 'CheckCircleIcon',
        timestamp: '2025-12-15T10:30:00',
        action: 'Dar Electronics Hub'
      },
      {
        title: 'Processing',
        description: 'Vendor is preparing your items for shipment',
        icon: 'CubeIcon',
        timestamp: '2025-12-15T14:20:00',
        action: 'Dar Electronics Hub'
      },
      {
        title: 'Shipped',
        description: 'Your order is on the way to your delivery address',
        icon: 'TruckIcon',
        timestamp: '2025-12-16T09:15:00',
        action: 'DHL Tanzania'
      },
      {
        title: 'Delivered',
        description: 'Order will be delivered to your address',
        icon: 'HomeIcon',
        timestamp: null,
        action: null
      }],

      products: [
      {
        id: 'prod-001',
        name: 'Samsung Galaxy A54 5G Smartphone - 128GB Storage',
        image: "https://images.unsplash.com/photo-1613365039441-79f6f7538d3e",
        alt: 'Modern black Samsung smartphone with large display showing home screen',
        quantity: 1,
        price: 'TZS 180,000',
        trackingNumber: 'DHL-TZ-2025-8934567'
      },
      {
        id: 'prod-002',
        name: 'Wireless Bluetooth Earbuds with Charging Case',
        image: "https://images.unsplash.com/photo-1638549779117-489634c6b834",
        alt: 'White wireless earbuds in open charging case on wooden surface',
        quantity: 2,
        price: 'TZS 65,000',
        trackingNumber: 'DHL-TZ-2025-8934567'
      }],

      deliveryInfo: {
        status: 'In Transit to Dar es Salaam Hub',
        location: 'Mwanza Regional Distribution Center',
        lastUpdate: '2025-12-18T15:30:00',
        estimatedDelivery: '19 Dec 2025, 2:00 PM - 5:00 PM',
        coordinates: {
          lat: -6.7924,
          lng: 39.2083
        },
        driverInfo: {
          name: 'John Mwakasege',
          phone: '+255 754 123 456'
        }
      },
      chatMessages: [
      {
        id: 'msg-001',
        text: 'Hello! Your order has been confirmed and we are preparing it for shipment.',
        sender: 'vendor',
        timestamp: '2025-12-15T10:35:00',
        read: true
      },
      {
        id: 'msg-002',
        text: 'Thank you! When will it be shipped?',
        sender: 'buyer',
        timestamp: '2025-12-15T11:20:00',
        read: true
      },
      {
        id: 'msg-003',
        text: 'Your order will be shipped tomorrow morning. You will receive tracking details via SMS.',
        sender: 'vendor',
        timestamp: '2025-12-15T11:45:00',
        read: true
      }]

    },
    {
      id: 'ORD-2025-001189',
      status: 'delivered',
      orderDate: '2025-12-10T14:20:00',
      totalAmount: 'TZS 85,000',
      vendor: {
        id: 'vendor-002',
        name: 'Arusha Fashion Store',
        location: 'Sokoine Road, Arusha',
        phone: '+255 765 987 654',
        rating: 4.6,
        reviews: 892
      },
      timeline: [
      {
        title: 'Order Confirmed',
        description: 'Your order has been confirmed',
        icon: 'CheckCircleIcon',
        timestamp: '2025-12-10T14:20:00',
        action: 'Arusha Fashion Store'
      },
      {
        title: 'Processing',
        description: 'Order prepared for shipment',
        icon: 'CubeIcon',
        timestamp: '2025-12-10T16:30:00',
        action: 'Arusha Fashion Store'
      },
      {
        title: 'Shipped',
        description: 'Order shipped to delivery address',
        icon: 'TruckIcon',
        timestamp: '2025-12-11T08:00:00',
        action: 'Posta Tanzania'
      },
      {
        title: 'Delivered',
        description: 'Order successfully delivered',
        icon: 'HomeIcon',
        timestamp: '2025-12-13T11:30:00',
        action: 'Posta Tanzania'
      }],

      products: [
      {
        id: 'prod-003',
        name: 'Traditional Kitenge Fabric Dress - African Print',
        image: "https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d",
        alt: 'Colorful African print dress with vibrant geometric patterns in red, yellow and blue',
        quantity: 1,
        price: 'TZS 85,000',
        trackingNumber: 'POSTA-TZ-2025-5678901'
      }],

      deliveryInfo: null,
      digitalProducts: [
      {
        id: 'digital-001',
        name: 'E-book: Swahili Cooking Recipes Collection',
        description: 'Comprehensive guide to traditional Tanzanian cuisine with 150+ recipes',
        fileSize: '12.5 MB',
        format: 'PDF',
        downloadUrl: 'https://example.com/downloads/swahili-recipes.pdf',
        downloadAttempts: 1,
        maxDownloads: 3,
        expiresAt: '2026-01-10T23:59:59'
      }],

      chatMessages: []
    }]

  };

  return <OrderTrackingInteractive initialOrderData={mockOrderData} />;
}