import SupportTicketsInteractive from './components/SupportTicketsInteractive';

export const metadata = {
  title: 'Support Tickets - Admin Panel',
  description: 'Manage customer support tickets and inquiries'
};

export default function SupportTicketsPage() {
  const mockData = {
    summary: {
      total_tickets: 1892,
      open: 234,
      in_progress: 156,
      pending_customer: 89,
      resolved: 1413
    },
    tickets: [
      {
        id: '1',
        ticket_number: 'TKT-2025-0567',
        user_name: 'Jane Doe',
        user_email: 'jane.doe@example.com',
        user_type: 'buyer',
        status: 'open',
        priority: 'high',
        category: 'technical_issue',
        subject: 'Cannot download purchased digital product',
        description: 'I purchased a PDF ebook but the download link shows an error',
        created_at: '2025-12-23T10:30:00Z',
        last_updated: '2025-12-23T10:30:00Z'
      },
      {
        id: '2',
        ticket_number: 'TKT-2025-0566',
        user_name: 'Mark Smith',
        user_email: 'mark.smith@example.com',
        user_type: 'vendor',
        status: 'in_progress',
        priority: 'medium',
        category: 'account_issue',
        subject: 'Unable to update store information',
        description: 'Getting error when trying to change store description and logo',
        created_at: '2025-12-22T09:15:00Z',
        last_updated: '2025-12-23T08:20:00Z',
        assigned_to: 'Admin Team'
      },
      {
        id: '3',
        ticket_number: 'TKT-2025-0565',
        user_name: 'Sarah Johnson',
        user_email: 'sarah.j@example.com',
        user_type: 'buyer',
        status: 'pending_customer',
        priority: 'low',
        category: 'general_inquiry',
        subject: 'How to track my order?',
        description: 'I cannot find the tracking information for my recent order',
        created_at: '2025-12-21T14:45:00Z',
        last_updated: '2025-12-22T16:30:00Z',
        assigned_to: 'Support Agent 1'
      },
      {
        id: '4',
        ticket_number: 'TKT-2025-0564',
        user_name: 'David Brown',
        user_email: 'david.brown@example.com',
        user_type: 'vendor',
        status: 'resolved',
        priority: 'high',
        category: 'payment_issue',
        subject: 'Payout not received',
        description: 'Expected payout from sales last week has not arrived',
        created_at: '2025-12-20T11:00:00Z',
        last_updated: '2025-12-22T15:45:00Z',
        resolved_at: '2025-12-22T15:45:00Z',
        assigned_to: 'Finance Team'
      },
      {
        id: '5',
        ticket_number: 'TKT-2025-0563',
        user_name: 'Emma Wilson',
        user_email: 'emma.w@example.com',
        user_type: 'buyer',
        status: 'open',
        priority: 'medium',
        category: 'order_issue',
        subject: 'Wrong product received',
        description: 'Ordered size M but received size L clothing',
        created_at: '2025-12-23T08:20:00Z',
        last_updated: '2025-12-23T08:20:00Z'
      }
    ]
  };

  return <SupportTicketsInteractive initialData={mockData} />;
}
