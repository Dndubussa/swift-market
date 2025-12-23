import VendorDashboardInteractive from './components/VendorDashboardInteractive';

export const metadata = {
  title: 'Vendor Dashboard - Blinno Marketplace',
  description: 'Manage your store, track sales, monitor inventory, and grow your business on Blinno Marketplace'
};

export default function VendorDashboardPage() {
  const mockData = {
    metrics: [
    {
      id: '1',
      title: 'Total Sales',
      value: 'TZS 4,850,000',
      change: '+12.5% from last month',
      changeType: 'positive',
      icon: 'CurrencyDollarIcon',
      iconBg: 'bg-success'
    },
    {
      id: '2',
      title: 'Pending Orders',
      value: '23',
      change: '5 require immediate action',
      changeType: 'warning',
      icon: 'ClipboardDocumentListIcon',
      iconBg: 'bg-warning'
    },
    {
      id: '3',
      title: 'Inventory Alerts',
      value: '8',
      change: '3 critical low stock',
      changeType: 'negative',
      icon: 'ExclamationTriangleIcon',
      iconBg: 'bg-error'
    },
    {
      id: '4',
      title: 'Customer Rating',
      value: '4.8',
      change: '+0.3 from last month',
      changeType: 'positive',
      icon: 'StarIcon',
      iconBg: 'bg-accent'
    }],

    salesData: [
    { date: '13 Dec', sales: 450000, orders: 12 },
    { date: '14 Dec', sales: 520000, orders: 15 },
    { date: '15 Dec', sales: 380000, orders: 10 },
    { date: '16 Dec', sales: 680000, orders: 18 },
    { date: '17 Dec', sales: 720000, orders: 21 },
    { date: '18 Dec', sales: 590000, orders: 16 },
    { date: '19 Dec', sales: 850000, orders: 24 }],

    recentOrders: [
    {
      id: 'ORD-2025-1234',
      customerName: 'Amina Hassan',
      customerEmail: 'amina.hassan@example.com',
      productName: 'Handcrafted Wooden Coffee Table',
      amount: 'TZS 185,000',
      status: 'pending'
    },
    {
      id: 'ORD-2025-1235',
      customerName: 'John Mwangi',
      customerEmail: 'john.mwangi@example.com',
      productName: 'Traditional Maasai Beaded Necklace',
      amount: 'TZS 45,000',
      status: 'processing'
    },
    {
      id: 'ORD-2025-1236',
      customerName: 'Grace Kimani',
      customerEmail: 'grace.kimani@example.com',
      productName: 'Kitenge Fabric Dress - Size M',
      amount: 'TZS 75,000',
      status: 'shipped'
    },
    {
      id: 'ORD-2025-1237',
      customerName: 'David Omondi',
      customerEmail: 'david.omondi@example.com',
      productName: 'Swahili Poetry E-book Collection',
      amount: 'TZS 15,000',
      status: 'delivered'
    },
    {
      id: 'ORD-2025-1238',
      customerName: 'Fatuma Ali',
      customerEmail: 'fatuma.ali@example.com',
      productName: 'Ceramic Serving Bowl Set (6 pieces)',
      amount: 'TZS 95,000',
      status: 'processing'
    }],

    inventoryAlerts: [
    {
      id: '1',
      productName: 'Handwoven Basket - Large',
      sku: 'HWB-LG-001',
      message: 'Critical: Only 2 units remaining. Restock immediately to avoid stockouts.',
      currentStock: 2,
      level: 'critical',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_112c3b995-1765164632111.png"
    },
    {
      id: '2',
      productName: 'Tanzanite Gemstone Earrings',
      sku: 'TGE-SLV-023',
      message: 'Warning: Stock running low with 5 units left. Consider restocking soon.',
      currentStock: 5,
      level: 'warning',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_14eabdd44-1765025891982.png"
    },
    {
      id: '3',
      productName: 'African Print Cushion Covers',
      sku: 'APC-MIX-045',
      message: 'Low stock alert: 8 units remaining. Popular item - restock recommended.',
      currentStock: 8,
      level: 'warning',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_14eabdd44-1765025891982.png"
    }],

    reviews: [
    {
      id: '1',
      customerName: 'Sarah Mwamba',
      productName: 'Handcrafted Wooden Coffee Table',
      rating: 5,
      comment: `Absolutely beautiful craftsmanship! The table arrived well-packaged and in perfect condition. The wood quality is exceptional and it fits perfectly in my living room. The seller was very responsive to my questions before purchase. Highly recommend this vendor for authentic Tanzanian furniture!`,
      date: '18 Dec 2025',
      responded: false
    },
    {
      id: '2',
      customerName: 'Michael Njoroge',
      productName: 'Traditional Maasai Beaded Necklace',
      rating: 4,
      comment: `Great product with authentic Maasai beadwork. The colors are vibrant and the quality is good. Delivery was prompt. Only minor issue was the clasp could be stronger, but overall very satisfied with my purchase. Will definitely buy from this store again.`,
      date: '17 Dec 2025',
      responded: true
    },
    {
      id: '3',
      customerName: 'Zainab Mohammed',
      productName: 'Kitenge Fabric Dress',
      rating: 5,
      comment: `This dress exceeded my expectations! The fabric quality is outstanding and the tailoring is perfect. True to size and the colors are even more beautiful in person. Fast shipping and excellent customer service. Thank you for this amazing piece!`,
      date: '16 Dec 2025',
      responded: false
    }],

    earnings: {
      availableBalance: 'TZS 2,450,000',
      pendingPayments: 'TZS 850,000',
      totalEarnings: 'TZS 12,850,000',
      recentTransactions: [
      {
        id: '1',
        description: 'Order Payment - ORD-2025-1234',
        amount: 'TZS 185,000',
        date: '19 Dec 2025',
        type: 'credit'
      },
      {
        id: '2',
        description: 'Withdrawal to M-Pesa',
        amount: 'TZS 500,000',
        date: '18 Dec 2025',
        type: 'debit'
      },
      {
        id: '3',
        description: 'Order Payment - ORD-2025-1230',
        amount: 'TZS 75,000',
        date: '17 Dec 2025',
        type: 'credit'
      },
      {
        id: '4',
        description: 'Platform Commission',
        amount: 'TZS 12,500',
        date: '17 Dec 2025',
        type: 'debit'
      },
      {
        id: '5',
        description: 'Order Payment - ORD-2025-1228',
        amount: 'TZS 95,000',
        date: '16 Dec 2025',
        type: 'credit'
      }]

    }
  };

  return <VendorDashboardInteractive initialData={mockData} />;
}