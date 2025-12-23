import VendorStoreManagementInteractive from './components/VendorStoreManagementInteractive';

export const metadata = {
  title: 'Vendor Store Management - Blinno Marketplace',
  description: 'Comprehensive store management dashboard for vendors to customize their store, manage products, configure business settings, and track performance analytics on Blinno Marketplace.'
};

// This page loads mock data initially, then the interactive component
// will fetch real data from Supabase based on the logged-in vendor
export default function VendorStoreManagementPage() {
  // Initial mock data structure (real data is loaded client-side based on auth)
  const initialData = {
    storeProfile: {
      storeName: "Your Store",
      description: "Loading store information...",
      email: "",
      phone: "",
      address: "",
      bannerImage: "/no_image.png",
      logoImage: "/no_image.png",
      isVerified: false,
      category: "",
      rating: 0,
      totalReviews: 0,
      totalProducts: 0,
      joinedDate: "",
      storeUrl: ""
    },
    products: [],
    customization: {
      theme: "modern",
      layout: "grid",
      colors: {
        primary: "#2D5A5A",
        secondary: "#E67E22",
        accent: "#F39C12"
      }
    },
    businessSettings: {
      shipping: {
        zones: [
          { name: "Dar es Salaam", rate: "TZS 5,000" },
          { name: "Arusha", rate: "TZS 8,000" },
          { name: "Mwanza", rate: "TZS 10,000" },
          { name: "Dodoma", rate: "TZS 7,500" }
        ],
        processingTime: "3-5",
        freeShippingEnabled: true
      },
      returns: {
        window: "14",
        policy: "We accept returns within 14 days of delivery for unused items in original packaging.",
        acceptReturns: true,
        restockingFee: false
      },
      payment: {
        methods: [
          { name: "M-Pesa", type: "Mobile Money", enabled: true },
          { name: "Tigo Pesa", type: "Mobile Money", enabled: true },
          { name: "Airtel Money", type: "Mobile Money", enabled: true },
          { name: "Visa/Mastercard", type: "Card Payment", enabled: true }
        ],
        cashOnDelivery: true
      },
      tax: {
        vatRate: "18",
        taxId: "",
        includeTaxInPrice: true
      }
    },
    analytics: {
      totalVisitors: 0,
      conversionRate: 0,
      totalRevenue: "TZS 0",
      avgOrderValue: "TZS 0",
      salesTrend: [],
      topProducts: [],
      demographics: [],
      recentActivity: []
    },
    verification: {
      status: "pending",
      steps: [
        {
          title: "Business Registration",
          description: "Upload your business registration certificate",
          icon: "DocumentTextIcon",
          completed: false,
          required: true,
          action: null
        },
        {
          title: "Tax Identification",
          description: "Provide your TIN (Tax Identification Number)",
          icon: "IdentificationIcon",
          completed: false,
          required: true,
          action: null
        },
        {
          title: "Bank Account Verification",
          description: "Link your bank account for payouts",
          icon: "BanknotesIcon",
          completed: false,
          required: true,
          action: null
        },
        {
          title: "Identity Verification",
          description: "Upload government-issued ID (NIDA or Passport)",
          icon: "UserCircleIcon",
          completed: false,
          required: true,
          action: null
        },
        {
          title: "Store Information",
          description: "Complete your store profile and policies",
          icon: "BuildingStorefrontIcon",
          completed: false,
          required: false,
          action: null
        }
      ],
      requiredDocuments: []
    }
  };

  return <VendorStoreManagementInteractive initialData={initialData} />;
}
