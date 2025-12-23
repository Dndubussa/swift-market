import AllOrdersInteractive from './components/AllOrdersInteractive';

export const metadata = {
  title: 'All Orders - Admin Panel',
  description: 'Manage all marketplace orders'
};

export default function AllOrdersPage() {
  const mockData = {
    summary: {
      total_orders: 45678,
      pending: 892,
      processing: 1234,
      shipped: 567,
      delivered: 42345,
      total_revenue: 1250000000
    },
    orders: [
      {
        id: 'ORD-2025-5632',
        buyer_name: 'Jane Doe',
        buyer_email: 'jane.doe@example.com',
        vendor_name: 'Dar Electronics Hub',
        vendor_id: '1',
        status: 'shipped',
        total_amount: 2500000,
        items_count: 1,
        payment_status: 'paid',
        payment_method: 'M-Pesa',
        created_at: '2025-12-20T10:30:00Z',
        shipping_address: 'Dar es Salaam, Tanzania'
      },
      {
        id: 'ORD-2025-5631',
        buyer_name: 'Mark Smith',
        buyer_email: 'mark.smith@example.com',
        vendor_name: 'Zanzibar Spice Market',
        vendor_id: '2',
        status: 'delivered',
        total_amount: 150000,
        items_count: 3,
        payment_status: 'paid',
        payment_method: 'Card',
        created_at: '2025-12-18T14:15:00Z',
        shipping_address: 'Arusha, Tanzania'
      },
      {
        id: 'ORD-2025-5630',
        buyer_name: 'Sarah Johnson',
        buyer_email: 'sarah.j@example.com',
        vendor_name: 'Kilimanjaro Crafts',
        vendor_id: '3',
        status: 'processing',
        total_amount: 185000,
        items_count: 2,
        payment_status: 'paid',
        payment_method: 'M-Pesa',
        created_at: '2025-12-22T08:45:00Z',
        shipping_address: 'Moshi, Tanzania'
      },
      {
        id: 'ORD-2025-5629',
        buyer_name: 'David Brown',
        buyer_email: 'david.brown@example.com',
        vendor_name: 'Pwani Beauty Supplies',
        vendor_id: '4',
        status: 'pending',
        total_amount: 95000,
        items_count: 1,
        payment_status: 'pending',
        payment_method: 'Bank Transfer',
        created_at: '2025-12-22T16:20:00Z',
        shipping_address: 'Dodoma, Tanzania'
      },
      {
        id: 'ORD-2025-5628',
        buyer_name: 'Emma Wilson',
        buyer_email: 'emma.w@example.com',
        vendor_name: 'Arusha Fashion Boutique',
        vendor_id: '5',
        status: 'shipped',
        total_amount: 245000,
        items_count: 4,
        payment_status: 'paid',
        payment_method: 'M-Pesa',
        created_at: '2025-12-21T11:30:00Z',
        shipping_address: 'Mwanza, Tanzania'
      },
      {
        id: 'ORD-2025-5627',
        buyer_name: 'Michael Lee',
        buyer_email: 'michael.lee@example.com',
        vendor_name: 'Moshi Tech Solutions',
        vendor_id: '6',
        status: 'delivered',
        total_amount: 3200000,
        items_count: 1,
        payment_status: 'paid',
        payment_method: 'Card',
        created_at: '2025-12-15T09:00:00Z',
        shipping_address: 'Dar es Salaam, Tanzania'
      }
    ]
  };

  return <AllOrdersInteractive initialData={mockData} />;
}
