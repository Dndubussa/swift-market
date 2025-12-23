import AllProductsInteractive from './components/AllProductsInteractive';

export const metadata = {
  title: 'All Products - Admin Panel',
  description: 'Manage all marketplace products'
};

export default function AllProductsPage() {
  const mockData = {
    summary: {
      total_products: 15678,
      active: 12456,
      inactive: 2134,
      pending_approval: 1088,
      total_value: 890000000
    },
    products: [
      {
        id: '1',
        name: 'Samsung Galaxy S24 Ultra 256GB',
        sku: 'ELEC-SS-S24U-256',
        vendor_name: 'Dar Electronics Hub',
        vendor_id: '1',
        category: 'Electronics',
        price: 2500000,
        stock: 45,
        status: 'active',
        rating: 4.8,
        reviews_count: 234,
        sales_count: 156,
        created_at: '2024-03-15T10:00:00Z',
        image_url: '/products/samsung-s24.jpg'
      },
      {
        id: '2',
        name: 'Zanzibar Clove Spice Mix 500g',
        sku: 'FOOD-ZS-CLV-500',
        vendor_name: 'Zanzibar Spice Market',
        vendor_id: '2',
        category: 'Food & Beverages',
        price: 25000,
        stock: 234,
        status: 'active',
        rating: 4.9,
        reviews_count: 567,
        sales_count: 892,
        created_at: '2024-01-20T14:30:00Z',
        image_url: '/products/clove-mix.jpg'
      },
      {
        id: '3',
        name: 'Handcrafted Makonde Wood Sculpture',
        sku: 'ART-MK-WS-001',
        vendor_name: 'Kilimanjaro Crafts',
        vendor_id: '3',
        category: 'Arts & Crafts',
        price: 150000,
        stock: 12,
        status: 'active',
        rating: 5.0,
        reviews_count: 89,
        sales_count: 45,
        created_at: '2024-06-10T09:15:00Z',
        image_url: '/products/makonde-sculpture.jpg'
      },
      {
        id: '4',
        name: 'Organic Shea Butter Moisturizer 250ml',
        sku: 'BEAT-SB-MOIST-250',
        vendor_name: 'Pwani Beauty Supplies',
        vendor_id: '4',
        category: 'Beauty & Personal Care',
        price: 45000,
        stock: 0,
        status: 'inactive',
        rating: 4.6,
        reviews_count: 123,
        sales_count: 267,
        created_at: '2024-08-22T11:20:00Z',
        image_url: '/products/shea-butter.jpg'
      },
      {
        id: '5',
        name: 'Traditional Kanga Fabric Set (2 pieces)',
        sku: 'FASH-TK-SET-002',
        vendor_name: 'Arusha Fashion Boutique',
        vendor_id: '5',
        category: 'Fashion & Clothing',
        price: 35000,
        status: 'pending_approval',
        stock: 156,
        rating: 0,
        reviews_count: 0,
        sales_count: 0,
        created_at: '2025-12-20T16:45:00Z',
        image_url: '/products/kanga-set.jpg'
      },
      {
        id: '6',
        name: 'iPhone 15 Pro 512GB',
        sku: 'ELEC-AP-IP15P-512',
        vendor_name: 'Moshi Tech Solutions',
        vendor_id: '6',
        category: 'Electronics',
        price: 3200000,
        stock: 23,
        status: 'active',
        rating: 4.7,
        reviews_count: 89,
        sales_count: 67,
        created_at: '2024-09-15T13:00:00Z',
        image_url: '/products/iphone-15.jpg'
      }
    ]
  };

  return <AllProductsInteractive initialData={mockData} />;
}
