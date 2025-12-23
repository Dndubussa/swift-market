import EscrowManagementInteractive from './components/EscrowManagementInteractive';

export const metadata = {
  title: 'Escrow Management - Admin Panel',
  description: 'Monitor and manage escrow transactions for buyer protection on Blinno Marketplace'
};

export default function EscrowManagementPage() {
  const mockData = {
    summary: {
      total_balance: 42100000,
      active_transactions: 234,
      pending_release: 18900000,
      pending_refund: 3200000,
      held_amount: 20000000
    },
    transactions: [
      {
        id: 'ESC-2025-1847',
        order_id: 'ORD-2025-5632',
        buyer_name: 'John Mwangi',
        vendor_name: 'Dar Electronics Hub',
        amount: 450000,
        status: 'held',
        reason: 'awaiting_delivery',
        created_at: '2025-12-18T10:30:00Z',
        release_date: '2025-12-28',
        days_held: 3
      },
      {
        id: 'ESC-2025-1846',
        order_id: 'ORD-2025-5631',
        buyer_name: 'Sarah Kimaro',
        vendor_name: 'Arusha Fashion Boutique',
        amount: 280000,
        status: 'pending_release',
        reason: 'delivery_confirmed',
        created_at: '2025-12-15T14:20:00Z',
        confirmed_at: '2025-12-20T16:45:00Z',
        release_date: '2025-12-23',
        days_held: 6
      },
      {
        id: 'ESC-2025-1845',
        order_id: 'ORD-2025-5630',
        buyer_name: 'Michael Hassan',
        vendor_name: 'Zanzibar Spice Market',
        amount: 120000,
        status: 'dispute',
        reason: 'quality_issue',
        created_at: '2025-12-10T09:15:00Z',
        dispute_opened_at: '2025-12-17T11:30:00Z',
        days_held: 11
      },
      {
        id: 'ESC-2025-1844',
        order_id: 'ORD-2025-5629',
        buyer_name: 'Grace Ndungu',
        vendor_name: 'Mwanza Home Decor',
        amount: 650000,
        status: 'pending_refund',
        reason: 'return_approved',
        created_at: '2025-12-08T13:45:00Z',
        return_approved_at: '2025-12-19T10:20:00Z',
        days_held: 13
      },
      {
        id: 'ESC-2025-1843',
        order_id: 'ORD-2025-5628',
        buyer_name: 'David Kamau',
        vendor_name: 'Dodoma Digital Arts',
        amount: 180000,
        status: 'released',
        reason: 'delivery_confirmed',
        created_at: '2025-12-05T11:00:00Z',
        released_at: '2025-12-15T14:30:00Z',
        days_held: 10
      },
      {
        id: 'ESC-2025-1842',
        order_id: 'ORD-2025-5627',
        buyer_name: 'Lucy Wanjiru',
        vendor_name: 'Tanga Furniture Makers',
        amount: 890000,
        status: 'held',
        reason: 'awaiting_delivery',
        created_at: '2025-12-19T15:20:00Z',
        release_date: '2025-12-29',
        days_held: 2
      },
      {
        id: 'ESC-2025-1841',
        order_id: 'ORD-2025-5626',
        buyer_name: 'Peter Omondi',
        vendor_name: 'Mbeya Organic Farm',
        amount: 95000,
        status: 'refunded',
        reason: 'order_cancelled',
        created_at: '2025-12-12T08:30:00Z',
        refunded_at: '2025-12-14T16:00:00Z',
        days_held: 2
      }
    ],
    statusBreakdown: {
      held: 156,
      pending_release: 45,
      dispute: 8,
      pending_refund: 12,
      released: 543,
      refunded: 89
    }
  };

  return <EscrowManagementInteractive initialData={mockData} />;
}
