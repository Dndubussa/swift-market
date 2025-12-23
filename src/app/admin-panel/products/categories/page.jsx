import CategoriesManagementInteractive from './components/CategoriesManagementInteractive';

export const metadata = {
  title: 'Product Categories - Admin Panel',
  description: 'Manage product categories and hierarchies'
};

export default function CategoriesManagementPage() {
  const mockData = {
    summary: {
      total_categories: 24,
      active: 21,
      inactive: 3,
      total_products: 15678
    },
    categories: [
      {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices, gadgets, and accessories',
        parent_id: null,
        status: 'active',
        product_count: 4523,
        subcategories: ['Mobile Phones', 'Computers', 'Audio & Video'],
        created_at: '2024-01-15T10:00:00Z',
        order: 1
      },
      {
        id: '2',
        name: 'Fashion & Clothing',
        slug: 'fashion-clothing',
        description: 'Apparel, footwear, and fashion accessories',
        parent_id: null,
        status: 'active',
        product_count: 3892,
        subcategories: ['Men\'s Wear', 'Women\'s Wear', 'Kids Fashion'],
        created_at: '2024-01-15T10:00:00Z',
        order: 2
      },
      {
        id: '3',
        name: 'Food & Beverages',
        slug: 'food-beverages',
        description: 'Food products, drinks, and culinary items',
        parent_id: null,
        status: 'active',
        product_count: 2134,
        subcategories: ['Spices', 'Coffee & Tea', 'Organic Foods'],
        created_at: '2024-01-15T10:00:00Z',
        order: 3
      },
      {
        id: '4',
        name: 'Arts & Crafts',
        slug: 'arts-crafts',
        description: 'Handmade items, artwork, and craft supplies',
        parent_id: null,
        status: 'active',
        product_count: 1567,
        subcategories: ['Traditional Art', 'Jewelry', 'Home Decor'],
        created_at: '2024-01-15T10:00:00Z',
        order: 4
      },
      {
        id: '5',
        name: 'Beauty & Personal Care',
        slug: 'beauty-personal-care',
        description: 'Cosmetics, skincare, and personal care products',
        parent_id: null,
        status: 'active',
        product_count: 1889,
        subcategories: ['Skincare', 'Makeup', 'Hair Care'],
        created_at: '2024-01-15T10:00:00Z',
        order: 5
      },
      {
        id: '6',
        name: 'Health & Wellness',
        slug: 'health-wellness',
        description: 'Health products, supplements, and wellness items',
        parent_id: null,
        status: 'active',
        product_count: 892,
        subcategories: ['Supplements', 'Fitness', 'Natural Remedies'],
        created_at: '2024-01-15T10:00:00Z',
        order: 6
      },
      {
        id: '7',
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home furnishings, decor, and garden supplies',
        parent_id: null,
        status: 'active',
        product_count: 1234,
        subcategories: ['Furniture', 'Kitchen', 'Garden Tools'],
        created_at: '2024-01-15T10:00:00Z',
        order: 7
      },
      {
        id: '8',
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports equipment and outdoor gear',
        parent_id: null,
        status: 'inactive',
        product_count: 234,
        subcategories: [],
        created_at: '2024-01-15T10:00:00Z',
        order: 8
      }
    ]
  };

  return <CategoriesManagementInteractive initialData={mockData} />;
}
