import AdminPanelInteractive from './components/AdminPanelInteractive';

export const metadata = {
  title: 'Admin Panel - Blinno Marketplace',
  description: 'Comprehensive platform management with vendor oversight and system analytics for Blinno Marketplace administrators'
};

export default function AdminPanelPage() {
  const mockData = {
    currentUser: {
      name: "Admin User",
      email: "admin@blinno.co.tz",
      role: "admin"
    },
    metrics: [
    {
      title: "Total Vendors",
      value: "1,247",
      change: "+12.5%",
      icon: "BuildingStorefrontIcon",
      trend: "up"
    },
    {
      title: "Active Buyers",
      value: "8,932",
      change: "+8.3%",
      icon: "UsersIcon",
      trend: "up"
    },
    {
      title: "Transaction Volume",
      value: "TZS 45.2M",
      change: "+15.7%",
      icon: "BanknotesIcon",
      trend: "up"
    },
    {
      title: "Platform Revenue",
      value: "TZS 2.8M",
      change: "+10.2%",
      icon: "ChartBarIcon",
      trend: "up"
    }],

    vendors: [
    {
      id: 1,
      name: "Dar Electronics Hub",
      email: "contact@darelectronics.co.tz",
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_14e110ecc-1764635347348.png",
      logoAlt: "Modern electronics store logo with blue circuit board design",
      businessType: "Electronics",
      status: "pending",
      rating: 4.8,
      reviews: 234,
      productCount: 156
    },
    {
      id: 2,
      name: "Arusha Fashion Boutique",
      email: "info@arushafashion.co.tz",
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1e8969f8d-1764779131785.png",
      logoAlt: "Elegant fashion boutique logo with golden thread and needle design",
      businessType: "Fashion & Clothing",
      status: "approved",
      rating: 4.9,
      reviews: 567,
      productCount: 289
    },
    {
      id: 3,
      name: "Mwanza Home Decor",
      email: "sales@mwanzahomedecor.co.tz",
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1e7ca982b-1766133144891.png",
      logoAlt: "Artistic home decor logo with colorful African pattern design",
      businessType: "Home Décor",
      status: "approved",
      rating: 4.7,
      reviews: 189,
      productCount: 124
    },
    {
      id: 4,
      name: "Dodoma Digital Arts",
      email: "hello@dodomadigitalarts.co.tz",
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_177e5240c-1764648369778.png",
      logoAlt: "Creative digital arts logo with colorful paint brush strokes",
      businessType: "Digital Products",
      status: "pending",
      rating: 4.6,
      reviews: 92,
      productCount: 67
    },
    {
      id: 5,
      name: "Zanzibar Spice Market",
      email: "orders@zanzibarspice.co.tz",
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1c358c2aa-1764675873604.png",
      logoAlt: "Traditional spice market logo with aromatic spices and herbs",
      businessType: "Groceries",
      status: "approved",
      rating: 4.9,
      reviews: 423,
      productCount: 198
    }],

    systems: [
    {
      id: 1,
      name: "ClickPesa Payment Gateway",
      description: "Mobile money and card payment processing",
      status: "operational",
      uptime: "99.8%"
    },
    {
      id: 2,
      name: "SMS Notification Service",
      description: "Order updates and verification codes",
      status: "operational",
      uptime: "99.5%"
    },
    {
      id: 3,
      name: "Email Delivery System",
      description: "Transactional and marketing emails",
      status: "operational",
      uptime: "99.9%"
    },
    {
      id: 4,
      name: "Product Image Storage",
      description: "Vendor product media hosting",
      status: "operational",
      uptime: "99.7%"
    }],

    financials: [
    {
      id: 1,
      label: "Commission Collected",
      value: "TZS 2.8M",
      description: "This month",
      icon: "CurrencyDollarIcon"
    },
    {
      id: 2,
      label: "Pending Payouts",
      value: "TZS 18.5M",
      description: "To 847 vendors",
      icon: "ArrowTrendingUpIcon"
    },
    {
      id: 3,
      label: "VAT Collected",
      value: "TZS 8.1M",
      description: "18% on transactions",
      icon: "ReceiptPercentIcon"
    },
    {
      id: 4,
      label: "Escrow Balance",
      value: "TZS 12.3M",
      description: "Buyer protection fund",
      icon: "ShieldCheckIcon"
    }],

    quickActions: [
    {
      id: "approve_vendors",
      label: "Approve Vendors",
      description: "Review pending applications",
      icon: "CheckBadgeIcon"
    },
    {
      id: "process_payouts",
      label: "Process Payouts",
      description: "Release vendor earnings",
      icon: "BanknotesIcon"
    },
    {
      id: "manage_categories",
      label: "Manage Categories",
      description: "Update product categories",
      icon: "TagIcon"
    },
    {
      id: "create_campaign",
      label: "Create Campaign",
      description: "Launch marketing campaign",
      icon: "MegaphoneIcon"
    }],

    moderationQueue: [
    {
      id: 1,
      type: "product",
      title: "Samsung Galaxy S23 Ultra 256GB",
      description: "High-end smartphone with advanced camera system",
      submittedBy: "Dar Electronics Hub",
      submittedAt: "2 hours ago",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b144f14a-1765300020336.png",
      imageAlt: "Modern black smartphone with large display and triple camera setup"
    },
    {
      id: 2,
      type: "vendor",
      title: "Tanga Furniture Makers",
      description: "Handcrafted wooden furniture manufacturer",
      submittedBy: "John Mwakasege",
      submittedAt: "5 hours ago",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_109407143-1766052851425.png",
      imageAlt: "Elegant wooden furniture showroom with modern designs"
    },
    {
      id: 3,
      type: "dispute",
      title: "Order #BL-2025-8934 - Product Quality Issue",
      description: "Buyer claims product does not match description",
      submittedBy: "Sarah Kimaro",
      submittedAt: "1 day ago"
    },
    {
      id: 4,
      type: "product",
      title: "African Print Ankara Dress",
      description: "Traditional Tanzanian fashion with modern design",
      submittedBy: "Arusha Fashion Boutique",
      submittedAt: "3 hours ago",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_10d4e187d-1765380917656.png",
      imageAlt: "Colorful African print dress with vibrant patterns and modern cut"
    }],

    recentActivities: [
    {
      id: 1,
      type: "vendor_approval",
      description: "Approved vendor application for Mbeya Crafts Co.",
      user: "Admin User",
      timestamp: "15 minutes ago"
    },
    {
      id: 2,
      type: "payment_processed",
      description: "Processed payout of TZS 450,000 to Zanzibar Spice Market",
      user: "Finance Team",
      timestamp: "1 hour ago"
    },
    {
      id: 3,
      type: "dispute_resolved",
      description: "Resolved dispute #DS-2025-234 in favor of buyer",
      user: "Support Team",
      timestamp: "2 hours ago"
    },
    {
      id: 4,
      type: "product_moderation",
      description: "Approved 12 new product listings from various vendors",
      user: "Admin User",
      timestamp: "3 hours ago"
    },
    {
      id: 5,
      type: "user_suspended",
      description: "Suspended vendor account for policy violation",
      user: "Compliance Team",
      timestamp: "5 hours ago"
    },
    {
      id: 6,
      type: "vendor_approval",
      description: "Approved vendor application for Iringa Electronics",
      user: "Admin User",
      timestamp: "6 hours ago"
    }]

  };

  return <AdminPanelInteractive initialData={mockData} />;
}