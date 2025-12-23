import DisputesInteractive from './components/DisputesInteractive';

export const metadata = {
  title: 'Disputes Management - Admin Panel',
  description: 'Review and resolve order disputes'
};

export default function DisputesPage() {
  const mockData = {
    summary: {
      total_disputes: 567,
      reported: 89,
      vendor_responded: 156,
      admin_reviewing: 67,
      resolved: 255
    },
    disputes: [
      {
        id: '1',
        dispute_number: 'DIS-2025-0089',
        order_id: 'ORD-2025-5632',
        buyer_name: 'Jane Doe',
        buyer_email: 'jane.doe@example.com',
        vendor_name: 'Dar Electronics Hub',
        vendor_id: '1',
        status: 'reported',
        issue_type: 'defective_product',
        description: 'Phone screen has dead pixels and touch not working properly',
        amount: 2500000,
        reported_at: '2025-12-22T10:30:00Z',
        priority: 'high'
      },
      {
        id: '2',
        dispute_number: 'DIS-2025-0088',
        order_id: 'ORD-2025-5631',
        buyer_name: 'Mark Smith',
        buyer_email: 'mark.smith@example.com',
        vendor_name: 'Zanzibar Spice Market',
        vendor_id: '2',
        status: 'vendor_responded',
        issue_type: 'wrong_item',
        description: 'Received different spices than ordered',
        amount: 150000,
        reported_at: '2025-12-21T09:15:00Z',
        vendor_responded_at: '2025-12-22T14:20:00Z',
        priority: 'medium'
      },
      {
        id: '3',
        dispute_number: 'DIS-2025-0087',
        order_id: 'ORD-2025-5630',
        buyer_name: 'Sarah Johnson',
        buyer_email: 'sarah.j@example.com',
        vendor_name: 'Kilimanjaro Crafts',
        vendor_id: '3',
        status: 'admin_reviewing',
        issue_type: 'not_as_described',
        description: 'Wood sculpture quality is poor, not handcrafted as advertised',
        amount: 185000,
        reported_at: '2025-12-20T08:45:00Z',
        vendor_responded_at: '2025-12-21T11:00:00Z',
        priority: 'high'
      },
      {
        id: '4',
        dispute_number: 'DIS-2025-0086',
        order_id: 'ORD-2025-5629',
        buyer_name: 'David Brown',
        buyer_email: 'david.brown@example.com',
        vendor_name: 'Pwani Beauty Supplies',
        vendor_id: '4',
        status: 'resolved',
        issue_type: 'damaged_delivery',
        description: 'Product bottle was broken during shipping',
        amount: 95000,
        reported_at: '2025-12-19T16:20:00Z',
        vendor_responded_at: '2025-12-20T09:00:00Z',
        resolved_at: '2025-12-21T10:30:00Z',
        resolution: 'refund_approved',
        priority: 'medium'
      },
      {
        id: '5',
        dispute_number: 'DIS-2025-0085',
        order_id: 'ORD-2025-5628',
        buyer_name: 'Emma Wilson',
        buyer_email: 'emma.w@example.com',
        vendor_name: 'Arusha Fashion Boutique',
        vendor_id: '5',
        status: 'reported',
        issue_type: 'counterfeit',
        description: 'Traditional fabric appears to be machine-made, not authentic',
        amount: 245000,
        reported_at: '2025-12-22T11:30:00Z',
        priority: 'high'
      }
    ]
  };

  return <DisputesInteractive initialData={mockData} />;
}
