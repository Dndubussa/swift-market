import PendingApprovalsInteractive from './components/PendingApprovalsInteractive';

export const metadata = {
  title: 'Pending Vendor Approvals - Admin Panel',
  description: 'Review and approve pending vendor applications'
};

export default function PendingApprovalsPage() {
  const mockData = {
    summary: {
      total_pending: 45,
      submitted_today: 8,
      submitted_this_week: 23,
      avg_approval_time: '2.5 days'
    },
    applications: [
      {
        id: 'APP-2025-089',
        business_name: 'Arusha Fashion Boutique',
        business_email: 'info@arushafashion.co.tz',
        owner_name: 'Sarah Kimaro',
        phone: '+255 765 123 456',
        business_type: 'Fashion & Clothing',
        tax_id: 'TIN-123456789',
        bank_account: '****5678',
        bank_name: 'CRDB Bank',
        address: 'Arusha, Tanzania',
        submitted_at: '2025-12-18T16:45:00Z',
        documents: [
          { id: 1, name: 'Business License', status: 'submitted', url: '#' },
          { id: 2, name: 'Tax Certificate', status: 'submitted', url: '#' },
          { id: 3, name: 'ID Copy', status: 'submitted', url: '#' }
        ],
        initial_products: 45,
        priority: 'normal'
      },
      {
        id: 'APP-2025-088',
        business_name: 'Moshi Tech Solutions',
        business_email: 'contact@moshitech.co.tz',
        owner_name: 'James Mollel',
        phone: '+255 756 987 654',
        business_type: 'Electronics & Gadgets',
        tax_id: 'TIN-987654321',
        bank_account: '****1234',
        bank_name: 'NMB Bank',
        address: 'Moshi, Tanzania',
        submitted_at: '2025-12-19T10:20:00Z',
        documents: [
          { id: 1, name: 'Business License', status: 'submitted', url: '#' },
          { id: 2, name: 'Tax Certificate', status: 'pending', url: '#' },
          { id: 3, name: 'ID Copy', status: 'submitted', url: '#' }
        ],
        initial_products: 78,
        priority: 'high'
      },
      {
        id: 'APP-2025-087',
        business_name: 'Kilimanjaro Crafts',
        business_email: 'sales@kilimanjarocrafts.co.tz',
        owner_name: 'Mary Lyimo',
        phone: '+255 745 234 567',
        business_type: 'Handicrafts & Art',
        tax_id: 'TIN-456789123',
        bank_account: '****9012',
        bank_name: 'Equity Bank',
        address: 'Moshi, Tanzania',
        submitted_at: '2025-12-20T14:15:00Z',
        documents: [
          { id: 1, name: 'Business License', status: 'submitted', url: '#' },
          { id: 2, name: 'Tax Certificate', status: 'submitted', url: '#' },
          { id: 3, name: 'ID Copy', status: 'submitted', url: '#' }
        ],
        initial_products: 23,
        priority: 'normal'
      },
      {
        id: 'APP-2025-086',
        business_name: 'Pwani Beauty Supplies',
        business_email: 'info@pwanibeauty.co.tz',
        owner_name: 'Amina Juma',
        phone: '+255 734 567 890',
        business_type: 'Beauty & Cosmetics',
        tax_id: 'TIN-789123456',
        bank_account: '****3456',
        bank_name: 'CRDB Bank',
        address: 'Dar es Salaam, Tanzania',
        submitted_at: '2025-12-21T08:30:00Z',
        documents: [
          { id: 1, name: 'Business License', status: 'submitted', url: '#' },
          { id: 2, name: 'Tax Certificate', status: 'submitted', url: '#' },
          { id: 3, name: 'ID Copy', status: 'submitted', url: '#' }
        ],
        initial_products: 156,
        priority: 'high'
      }
    ]
  };

  return <PendingApprovalsInteractive initialData={mockData} />;
}
