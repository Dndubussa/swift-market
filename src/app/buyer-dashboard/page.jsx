import BuyerDashboardInteractive from './components/BuyerDashboardInteractive';

export const metadata = {
  title: 'Buyer Dashboard - Blinno Marketplace',
  description: 'Manage your orders, wishlist, and shopping experience on Blinno Marketplace. Track deliveries, discover new products, and earn rewards.'
};

export default function BuyerDashboard() {
  const mockData = {
    stats: {
      orders: 12,
      wishlistItems: 8,
      rewardsPoints: 2450
    },
    recentOrders: [
    {
      id: "ORD001",
      productImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1119295e3-1765076790006.png",
      productImageAlt: "Modern wireless headphones in matte black finish on white background",
      productName: "Premium Wireless Headphones",
      status: "in-transit",
      statusLabel: "In Transit",
      orderNumber: "BLN2025001234",
      amount: 185000,
      date: "15 Dec 2025"
    },
    {
      id: "ORD002",
      productImage: "https://images.unsplash.com/photo-1621500600029-00ff71efde5b",
      productImageAlt: "Elegant silver wristwatch with leather strap displayed on marble surface",
      productName: "Classic Leather Watch",
      status: "delivered",
      statusLabel: "Delivered",
      orderNumber: "BLN2025001189",
      amount: 125000,
      date: "10 Dec 2025"
    },
    {
      id: "ORD003",
      productImage: "https://images.unsplash.com/photo-1603326312979-e294dea62421",
      productImageAlt: "Comfortable running shoes in blue and white color combination on wooden floor",
      productName: "Sports Running Shoes",
      status: "processing",
      statusLabel: "Processing",
      orderNumber: "BLN2025001267",
      amount: 95000,
      date: "18 Dec 2025"
    },
    {
      id: "ORD004",
      productImage: "https://img.rocket.new/generatedImages/rocket_gen_img_14e74e1b8-1765955319665.png",
      productImageAlt: "Stylish backpack in navy blue canvas material with leather accents",
      productName: "Canvas Travel Backpack",
      status: "pending",
      statusLabel: "Pending",
      orderNumber: "BLN2025001298",
      amount: 75000,
      date: "19 Dec 2025"
    }],

    recommendedProducts: [
    {
      id: "PROD001",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1119295e3-1765076790006.png",
      imageAlt: "Black wireless headphones with cushioned ear cups on gradient background",
      name: "Wireless Bluetooth Headphones",
      vendor: "TechZone Tanzania",
      rating: 4.8,
      reviews: 156,
      price: 165000,
      originalPrice: 220000,
      discount: 25
    },
    {
      id: "PROD002",
      image: "https://images.unsplash.com/photo-1563430363828-8368ec782d91",
      imageAlt: "Modern laptop computer with sleek aluminum body and backlit keyboard",
      name: "Ultra-Slim Laptop 15.6 inch",
      vendor: "Digital Hub",
      rating: 4.6,
      reviews: 89,
      price: 1250000,
      originalPrice: null,
      discount: null
    },
    {
      id: "PROD003",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b0a39cac-1765023383801.png",
      imageAlt: "Smartphone with edge-to-edge display showing colorful home screen",
      name: "Smartphone 128GB Storage",
      vendor: "Mobile Masters",
      rating: 4.7,
      reviews: 234,
      price: 850000,
      originalPrice: 950000,
      discount: 11
    }],

    trendingProducts: [
    {
      id: "TREND001",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_17c82307f-1764860450590.png",
      imageAlt: "White cotton t-shirt with minimalist design on mannequin",
      name: "Premium Cotton T-Shirt",
      vendor: "Fashion Forward",
      rating: 4.5,
      reviews: 67,
      price: 35000,
      originalPrice: null,
      discount: null
    },
    {
      id: "TREND002",
      image: "https://images.unsplash.com/photo-1508431822127-707daa5c7f21",
      imageAlt: "Fresh red apples arranged in wooden basket with green leaves",
      name: "Organic Fresh Apples 1kg",
      vendor: "Farm Fresh Tanzania",
      rating: 4.9,
      reviews: 145,
      price: 12000,
      originalPrice: 15000,
      discount: 20
    },
    {
      id: "TREND003",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a3b8b2f1-1764849865040.png",
      imageAlt: "Hardcover book with elegant cover design on wooden table with reading glasses",
      name: "Bestselling Novel Collection",
      vendor: "BookWorld Tanzania",
      rating: 4.8,
      reviews: 92,
      price: 45000,
      originalPrice: null,
      discount: null
    }],

    orderTracking: [
    {
      id: "TRACK001",
      title: "Premium Wireless Headphones",
      orderNumber: "BLN2025001234",
      progress: 75,
      status: "Out for delivery - Expected today"
    },
    {
      id: "TRACK002",
      title: "Sports Running Shoes",
      orderNumber: "BLN2025001267",
      progress: 40,
      status: "Package prepared - Awaiting pickup"
    }],

    wishlistItems: [
    {
      id: "WISH001",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1feac01c5-1764748002392.png",
      imageAlt: "Modern desk lamp with adjustable arm in brushed metal finish",
      name: "Modern Desk Lamp LED",
      price: 85000,
      priceChange: -15
    },
    {
      id: "WISH002",
      image: "https://images.unsplash.com/photo-1652180690327-b6f05e6ed7d9",
      imageAlt: "Wireless computer mouse with ergonomic design in matte black",
      name: "Wireless Gaming Mouse",
      price: 55000,
      priceChange: null
    },
    {
      id: "WISH003",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e755ae2a-1765510204009.png",
      imageAlt: "Stainless steel water bottle with insulated design and carrying handle",
      name: "Insulated Water Bottle 1L",
      price: 28000,
      priceChange: 10
    }],

    loyaltyRewards: {
      points: 2450,
      value: 24500,
      nextReward: {
        points: 3000,
        progress: 82,
        remaining: 550
      },
      offers: [
      {
        id: "OFFER001",
        title: "10% Off Next Purchase",
        description: "Use 500 points",
        link: "/product-catalog?offer=10off"
      },
      {
        id: "OFFER002",
        title: "Free Shipping Voucher",
        description: "Use 300 points",
        link: "/product-catalog?offer=freeship"
      }]

    },
    recentActivities: [
    {
      id: "ACT001",
      productId: "PROD001",
      productImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1119295e3-1765076790006.png",
      productImageAlt: "Black wireless headphones with cushioned ear cups on gradient background",
      productName: "Wireless Bluetooth Headphones",
      type: "view",
      action: "Viewed product",
      time: "1 hour ago"
    },
    {
      id: "ACT002",
      productId: "PROD002",
      productImage: "https://images.unsplash.com/photo-1563430363828-8368ec782d91",
      productImageAlt: "Modern laptop computer with sleek aluminum body and backlit keyboard",
      productName: "Ultra-Slim Laptop 15.6 inch",
      type: "wishlist",
      action: "Added to wishlist",
      time: "3 hours ago"
    },
    {
      id: "ACT003",
      productId: "ORD002",
      productImage: "https://images.unsplash.com/photo-1621500600029-00ff71efde5b",
      productImageAlt: "Elegant silver wristwatch with leather strap displayed on marble surface",
      productName: "Classic Leather Watch",
      type: "purchase",
      action: "Purchased",
      time: "9 days ago"
    },
    {
      id: "ACT004",
      productId: "ORD002",
      productImage: "https://images.unsplash.com/photo-1621500600029-00ff71efde5b",
      productImageAlt: "Elegant silver wristwatch with leather strap displayed on marble surface",
      productName: "Classic Leather Watch",
      type: "review",
      action: "Left a review",
      time: "9 days ago"
    }]

  };

  return <BuyerDashboardInteractive initialData={mockData} />;
}