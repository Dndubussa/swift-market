import TransactionsInteractive from './components/TransactionsInteractive';

export const metadata = {
  title: 'Transactions - Admin Panel',
  description: 'View and manage all financial transactions on Blinno Marketplace'
};

export default function TransactionsPage() {
  const mockData = {
    summary: {
      total_volume_today: 8500000,
      total_volume_month: 125800000,
      transaction_count_today: 234,
      transaction_count_month: 5847,
      avg_transaction_value: 21517
    },
    transactions: [
      {
        id: 'TXN-2025-9847',
        type: 'sale',
        order_id: 'ORD-2025-5632',
        buyer_name: 'John Mwangi',
        vendor_name: 'Dar Electronics Hub',
        amount: 450000,
        commission: 22500,
        net_amount: 427500,
        payment_method: 'M-Pesa',
        status: 'completed',
        created_at: '2025-12-21T14:30:00Z',
        completed_at: '2025-12-21T14:30:15Z'
      },
      {
        id: 'TXN-2025-9846',
        type: 'payout',
        payout_id: 'PO-2025-001',
        vendor_name: 'Arusha Fashion Boutique',
        amount: 1567500,
        payment_method: 'Bank Transfer',
        status: 'processing',
        created_at: '2025-12-21T13:45:00Z'
      },
      {
        id: 'TXN-2025-9845',
        type: 'refund',
        order_id: 'ORD-2025-5628',
        buyer_name: 'Sarah Kimaro',
        vendor_name: 'Zanzibar Spice Market',
        amount: 120000,
        refund_reason: 'Product damaged',
        payment_method: 'M-Pesa',
        status: 'completed',
        created_at: '2025-12-21T12:20:00Z',
        completed_at: '2025-12-21T12:25:00Z'
      },
      {
        id: 'TXN-2025-9844',
        type: 'sale',
        order_id: 'ORD-2025-5631',
        buyer_name: 'Michael Hassan',
        vendor_name: 'Mwanza Home Decor',
        amount: 650000,
        commission: 32500,
        net_amount: 617500,
        payment_method: 'Card',
        status: 'completed',
        created_at: '2025-12-21T11:15:00Z',
        completed_at: '2025-12-21T11:15:10Z'
      },
      {
        id: 'TXN-2025-9843',
        type: 'commission',
        order_id: 'ORD-2025-5630',
        vendor_name: 'Dodoma Digital Arts',
        amount: 9000,
        commission_rate: 5,
        order_amount: 180000,
        status: 'completed',
        created_at: '2025-12-21T10:45:00Z'
      },
      {
        id: 'TXN-2025-9842',
        type: 'sale',
        order_id: 'ORD-2025-5629',
        buyer_name: 'Grace Ndungu',
        vendor_name: 'Tanga Furniture Makers',
        amount: 890000,
        commission: 44500,
        net_amount: 845500,
        payment_method: 'M-Pesa',
        status: 'pending',
        created_at: '2025-12-21T10:00:00Z'
      },
      {
        id: 'TXN-2025-9841',
        type: 'refund',
        order_id: 'ORD-2025-5627',
        buyer_name: 'David Kamau',
        vendor_name: 'Mbeya Organic Farm',
        amount: 95000,
        refund_reason: 'Order cancelled',
        payment_method: 'M-Pesa',
        status: 'failed',
        created_at: '2025-12-21T09:30:00Z',
        failed_at: '2025-12-21T09:35:00Z',
        error_message: 'Insufficient balance in refund account'
      },
      {
        id: 'TXN-2025-9840',
        type: 'payout',
        payout_id: 'PO-2025-002',
        vendor_name: 'Dar Electronics Hub',
        amount: 2327500,
        payment_method: 'Bank Transfer',
        status: 'pending',
        created_at: '2025-12-21T09:00:00Z'
      },
      {
        id: 'TXN-2025-9839',
        type: 'sale',
        order_id: 'ORD-2025-5626',
        buyer_name: 'Lucy Wanjiru',
        vendor_name: 'Zanzibar Spice Market',
        amount: 280000,
        commission: 14000,
        net_amount: 266000,
        payment_method: 'Card',
        status: 'completed',
        created_at: '2025-12-21T08:15:00Z',
        completed_at: '2025-12-21T08:15:08Z'
      },
      {
        id: 'TXN-2025-9838',
        type: 'commission',
        order_id: 'ORD-2025-5625',
        vendor_name: 'Arusha Fashion Boutique',
        amount: 12500,
        commission_rate: 5,
        order_amount: 250000,
        status: 'completed',
        created_at: '2025-12-20T16:30:00Z'
      }
    ],
    filters: {
      types: ['all', 'sale', 'payout', 'refund', 'commission'],
      statuses: ['all', 'completed', 'pending', 'processing', 'failed'],
      payment_methods: ['all', 'M-Pesa', 'Card', 'Bank Transfer'],
      date_ranges: ['today', 'week', 'month', 'custom']
    },
    analytics: {
      by_type: {
        sale: { count: 5847, amount: 98500000 },
        payout: { count: 234, amount: 18900000 },
        refund: { count: 89, amount: 4200000 },
        commission: { count: 5847, amount: 4200000 }
      },
      by_method: {
        'M-Pesa': { count: 3245, amount: 56700000 },
        'Card': { count: 1892, amount: 38900000 },
        'Bank Transfer': { count: 710, amount: 29900000 }
      }
    }
  };

  return <TransactionsInteractive initialData={mockData} />;
}
