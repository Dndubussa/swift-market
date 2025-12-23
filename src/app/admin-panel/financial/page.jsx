import FinancialOverviewInteractive from './components/FinancialOverviewInteractive';

export const metadata = {
  title: 'Financial Overview - Admin Panel',
  description: 'Platform revenue, commission tracking, and financial analytics for Blinno Marketplace'
};

export default function FinancialOverviewPage() {
  const mockData = {
    metrics: [
      {
        id: 'total_revenue',
        label: 'Total Revenue',
        value: 'TZS 125.8M',
        change: '+18.2%',
        trend: 'up',
        icon: 'CurrencyDollarIcon',
        description: 'This month'
      },
      {
        id: 'commission',
        label: 'Commission Earned',
        value: 'TZS 6.3M',
        change: '+15.7%',
        trend: 'up',
        icon: 'BanknotesIcon',
        description: '5% platform fee'
      },
      {
        id: 'pending_payouts',
        label: 'Pending Payouts',
        value: 'TZS 18.5M',
        change: '-8.3%',
        trend: 'down',
        icon: 'ClockIcon',
        description: 'To 847 vendors'
      },
      {
        id: 'escrow_balance',
        label: 'Escrow Balance',
        value: 'TZS 42.1M',
        change: '+12.4%',
        trend: 'up',
        icon: 'ShieldCheckIcon',
        description: 'Buyer protection'
      }
    ],
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Gross Revenue',
          data: [85000000, 92000000, 98000000, 105000000, 115000000, 125800000]
        },
        {
          label: 'Commission',
          data: [4250000, 4600000, 4900000, 5250000, 5750000, 6290000]
        }
      ]
    },
    topVendorPayouts: [
      {
        id: 1,
        vendor_name: 'Dar Electronics Hub',
        amount: 2450000,
        status: 'pending',
        due_date: '2025-12-25'
      },
      {
        id: 2,
        vendor_name: 'Zanzibar Spice Market',
        amount: 1890000,
        status: 'pending',
        due_date: '2025-12-25'
      },
      {
        id: 3,
        vendor_name: 'Arusha Fashion Boutique',
        amount: 1650000,
        status: 'processing',
        due_date: '2025-12-24'
      },
      {
        id: 4,
        vendor_name: 'Mwanza Home Decor',
        amount: 1420000,
        status: 'pending',
        due_date: '2025-12-26'
      },
      {
        id: 5,
        vendor_name: 'Dodoma Digital Arts',
        amount: 980000,
        status: 'pending',
        due_date: '2025-12-25'
      }
    ],
    recentTransactions: [
      {
        id: 'TXN-2025-9847',
        type: 'sale',
        vendor: 'Dar Electronics Hub',
        buyer: 'John Mwangi',
        amount: 450000,
        commission: 22500,
        status: 'completed',
        created_at: '2025-12-21T14:30:00Z'
      },
      {
        id: 'TXN-2025-9846',
        type: 'payout',
        vendor: 'Arusha Fashion Boutique',
        amount: 1200000,
        status: 'completed',
        created_at: '2025-12-21T12:15:00Z'
      },
      {
        id: 'TXN-2025-9845',
        type: 'refund',
        vendor: 'Mwanza Home Decor',
        buyer: 'Sarah Kimaro',
        amount: 85000,
        status: 'completed',
        created_at: '2025-12-21T10:45:00Z'
      },
      {
        id: 'TXN-2025-9844',
        type: 'sale',
        vendor: 'Zanzibar Spice Market',
        buyer: 'Michael Hassan',
        amount: 320000,
        commission: 16000,
        status: 'escrow',
        created_at: '2025-12-21T09:20:00Z'
      }
    ],
    payoutSchedule: {
      next_payout_date: '2025-12-25',
      vendor_count: 847,
      total_amount: 18500000,
      processing_count: 12
    }
  };

  return <FinancialOverviewInteractive initialData={mockData} />;
}
