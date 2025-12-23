import { notFound } from 'next/navigation';
import PayoutDetailsInteractive from './components/PayoutDetailsInteractive';

export const metadata = {
  title: 'Payout Details - Admin Panel',
  description: 'View and manage vendor payout details'
};

export default function PayoutDetailsPage({ params }) {
  const { id } = params;

  // Mock data - in real app, fetch from database using id
  const mockPayout = {
    id: id,
    vendor_id: '1',
    vendor_name: 'Dar Electronics Hub',
    vendor_email: 'contact@darelectronics.co.tz',
    vendor_phone: '+255 712 345 678',
    amount: 2450000,
    commission: 122500,
    commission_rate: 5,
    net_amount: 2327500,
    order_count: 45,
    status: 'pending',
    due_date: '2025-12-25',
    bank_name: 'CRDB Bank',
    bank_account: '****5678',
    bank_account_full: '01234567895678',
    account_holder: 'Dar Electronics Hub Ltd',
    created_at: '2025-12-15T10:00:00Z',
    orders: [
      {
        id: 'ORD-2025-5632',
        buyer_name: 'John Mwangi',
        amount: 450000,
        commission: 22500,
        status: 'delivered',
        created_at: '2025-12-10T14:30:00Z'
      },
      {
        id: 'ORD-2025-5625',
        buyer_name: 'Sarah Kimaro',
        amount: 280000,
        commission: 14000,
        status: 'delivered',
        created_at: '2025-12-11T09:15:00Z'
      },
      {
        id: 'ORD-2025-5618',
        buyer_name: 'Michael Hassan',
        amount: 650000,
        commission: 32500,
        status: 'delivered',
        created_at: '2025-12-12T16:45:00Z'
      },
      {
        id: 'ORD-2025-5610',
        buyer_name: 'Grace Ndungu',
        amount: 180000,
        commission: 9000,
        status: 'delivered',
        created_at: '2025-12-13T11:20:00Z'
      },
      {
        id: 'ORD-2025-5605',
        buyer_name: 'David Kamau',
        amount: 890000,
        commission: 44500,
        status: 'delivered',
        created_at: '2025-12-14T13:30:00Z'
      }
    ],
    payment_history: [
      {
        id: 'PAY-2025-001',
        amount: 1850000,
        status: 'completed',
        method: 'Bank Transfer',
        processed_at: '2025-11-25T10:00:00Z'
      },
      {
        id: 'PAY-2025-002',
        amount: 2150000,
        status: 'completed',
        method: 'Bank Transfer',
        processed_at: '2025-10-25T10:00:00Z'
      }
    ]
  };

  if (!mockPayout) {
    notFound();
  }

  return <PayoutDetailsInteractive payout={mockPayout} />;
}
