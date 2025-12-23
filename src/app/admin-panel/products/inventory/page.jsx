import InventoryOverviewInteractive from './components/InventoryOverviewInteractive';

export const metadata = {
  title: 'Inventory Overview - Admin Panel',
  description: 'Monitor stock levels and inventory alerts'
};

export default function InventoryOverviewPage() {
  const mockData = {
    summary: {
      total_stock_value: 890000000,
      out_of_stock: 234,
      low_stock: 567,
      overstocked: 89,
      total_products: 15678
    },
    alerts: [
      {
        id: '1',
        type: 'out_of_stock',
        product_name: 'Organic Shea Butter Moisturizer 250ml',
        product_id: '4',
        sku: 'BEAT-SB-MOIST-250',
        vendor_name: 'Pwani Beauty Supplies',
        vendor_id: '4',
        current_stock: 0,
        recommended_stock: 50,
        last_restocked: '2025-12-15T10:00:00Z',
        sales_velocity: 15,
        priority: 'high'
      },
      {
        id: '2',
        type: 'low_stock',
        product_name: 'Handcrafted Makonde Wood Sculpture',
        product_id: '3',
        sku: 'ART-MK-WS-001',
        vendor_name: 'Kilimanjaro Crafts',
        vendor_id: '3',
        current_stock: 5,
        recommended_stock: 25,
        last_restocked: '2025-12-10T08:30:00Z',
        sales_velocity: 3,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'low_stock',
        product_name: 'Samsung Galaxy S24 Ultra 256GB',
        product_id: '1',
        sku: 'ELEC-SS-S24U-256',
        vendor_name: 'Dar Electronics Hub',
        vendor_id: '1',
        current_stock: 8,
        recommended_stock: 30,
        last_restocked: '2025-12-18T14:00:00Z',
        sales_velocity: 12,
        priority: 'high'
      },
      {
        id: '4',
        type: 'overstocked',
        product_name: 'Traditional Kanga Fabric Set',
        product_id: '5',
        sku: 'FASH-TK-SET-002',
        vendor_name: 'Arusha Fashion Boutique',
        vendor_id: '5',
        current_stock: 250,
        recommended_stock: 50,
        last_restocked: '2025-12-20T16:45:00Z',
        sales_velocity: 2,
        priority: 'low'
      }
    ],
    categories: [
      { name: 'Electronics', total_stock: 3456, value: 425000000, out_of_stock: 45, low_stock: 123 },
      { name: 'Fashion & Clothing', total_stock: 5678, value: 198000000, out_of_stock: 67, low_stock: 234 },
      { name: 'Food & Beverages', total_stock: 8901, value: 89000000, out_of_stock: 34, low_stock: 89 },
      { name: 'Arts & Crafts', total_stock: 1234, value: 156000000, out_of_stock: 23, low_stock: 45 },
      { name: 'Beauty & Personal Care', total_stock: 2345, value: 78000000, out_of_stock: 56, low_stock: 67 }
    ]
  };

  return <InventoryOverviewInteractive initialData={mockData} />;
}
