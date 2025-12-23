import FulfillmentInteractive from './components/FulfillmentInteractive';

export const metadata = {
  title: 'Order Fulfillment - Admin Panel',
  description: 'Manage order processing and shipping'
};

export default function FulfillmentPage() {
  const mockData = {
    summary: {
      pending_fulfillment: 892,
      ready_to_ship: 234,
      in_transit: 567,
      avg_fulfillment_time: '1.8 days'
    },
    orders: [
      {
        id: 'ORD-2025-5630',
        buyer_name: 'Sarah Johnson',
        vendor_name: 'Kilimanjaro Crafts',
        vendor_id: '3',
        status: 'processing',
        items: [
          { name: 'Handcrafted Makonde Wood Sculpture', quantity: 2, price: 150000 }
        ],
        total_amount: 185000,
        shipping_address: 'Moshi, Tanzania',
        shipping_method: 'Standard Delivery',
        order_date: '2025-12-22T08:45:00Z',
        estimated_delivery: '2025-12-27T00:00:00Z'
      },
      {
        id: 'ORD-2025-5629',
        buyer_name: 'David Brown',
        vendor_name: 'Pwani Beauty Supplies',
        vendor_id: '4',
        status: 'pending',
        items: [
          { name: 'Organic Shea Butter Moisturizer 250ml', quantity: 1, price: 45000 }
        ],
        total_amount: 95000,
        shipping_address: 'Dodoma, Tanzania',
        shipping_method: 'Express Delivery',
        order_date: '2025-12-22T16:20:00Z',
        estimated_delivery: '2025-12-25T00:00:00Z'
      },
      {
        id: 'ORD-2025-5628',
        buyer_name: 'Emma Wilson',
        vendor_name: 'Arusha Fashion Boutique',
        vendor_id: '5',
        status: 'ready_to_ship',
        items: [
          { name: 'Traditional Kanga Fabric Set', quantity: 2, price: 35000 },
          { name: 'Maasai Beaded Necklace', quantity: 2, price: 85000 }
        ],
        total_amount: 245000,
        shipping_address: 'Mwanza, Tanzania',
        shipping_method: 'Standard Delivery',
        order_date: '2025-12-21T11:30:00Z',
        estimated_delivery: '2025-12-26T00:00:00Z'
      }
    ]
  };

  return <FulfillmentInteractive initialData={mockData} />;
}
