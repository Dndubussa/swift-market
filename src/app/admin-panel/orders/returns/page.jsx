import ReturnsInteractive from './components/ReturnsInteractive';

export const metadata = {
  title: 'Returns Management - Admin Panel',
  description: 'Review and manage all return requests and refunds'
};

export default function ReturnsPage() {
  const mockData = {
    summary: {
      total_returns: 1245,
      pending: 234,
      approved: 678,
      rejected: 123,
      refund_pending: 89,
      refund_processed: 456
    },
    returns: [
      {
        id: 'RET-2025-1045',
        order_id: 'ORD-2025-5632',
        buyer_name: 'Jane Doe',
        buyer_email: 'jane.doe@example.com',
        vendor_name: 'Dar Electronics Hub',
        vendor_id: '1',
        status: 'pending',
        refund_status: 'pending',
        reason: 'Received damaged product',
        method: 'refund',
        refund_amount: 2500000,
        items_count: 1,
        created_at: '2025-12-21T10:30:00Z'
      },
      {
        id: 'RET-2025-1044',
        order_id: 'ORD-2025-5631',
        buyer_name: 'Mark Smith',
        buyer_email: 'mark.smith@example.com',
        vendor_name: 'Zanzibar Spice Market',
        vendor_id: '2',
        status: 'approved',
        refund_status: 'processed',
        reason: 'Wrong item delivered',
        method: 'refund',
        refund_amount: 150000,
        items_count: 3,
        created_at: '2025-12-19T09:15:00Z'
      },
      {
        id: 'RET-2025-1043',
        order_id: 'ORD-2025-5630',
        buyer_name: 'Sarah Johnson',
        buyer_email: 'sarah.j@example.com',
        vendor_name: 'Kilimanjaro Crafts',
        vendor_id: '3',
        status: 'processing',
        refund_status: 'pending',
        reason: 'Product not as described',
        method: 'replacement',
        refund_amount: 185000,
        items_count: 2,
        created_at: '2025-12-22T08:45:00Z'
      },
      {
        id: 'RET-2025-1042',
        order_id: 'ORD-2025-5629',
        buyer_name: 'David Brown',
        buyer_email: 'david.brown@example.com',
        vendor_name: 'Pwani Beauty Supplies',
        vendor_id: '4',
        status: 'rejected',
        refund_status: 'none',
        reason: 'Outside return window',
        method: 'refund',
        refund_amount: 95000,
        items_count: 1,
        created_at: '2025-12-23T16:20:00Z'
      },
      {
        id: 'RET-2025-1041',
        order_id: 'ORD-2025-5628',
        buyer_name: 'Emma Wilson',
        buyer_email: 'emma.w@example.com',
        vendor_name: 'Arusha Fashion Boutique',
        vendor_id: '5',
        status: 'approved',
        refund_status: 'pending',
        reason: 'Size does not fit',
        method: 'store_credit',
        refund_amount: 245000,
        items_count: 4,
        created_at: '2025-12-21T11:30:00Z'
      },
      {
        id: 'RET-2025-1040',
        order_id: 'ORD-2025-5627',
        buyer_name: 'Michael Lee',
        buyer_email: 'michael.lee@example.com',
        vendor_name: 'Moshi Tech Solutions',
        vendor_id: '6',
        status: 'completed',
        refund_status: 'processed',
        reason: 'Digital download not accessible',
        method: 'refund',
        refund_amount: 3200000,
        items_count: 1,
        created_at: '2025-12-16T09:00:00Z'
      }
    ]
  };

  return <ReturnsInteractive initialData={mockData} />;
}
