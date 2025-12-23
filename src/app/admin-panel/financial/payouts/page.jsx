import VendorPayoutsInteractive from './components/VendorPayoutsInteractive';

export const metadata = {
  title: 'Vendor Payouts - Admin Panel',
  description: 'Process and manage vendor payout requests for Blinno Marketplace'
};

export default function VendorPayoutsPage() {
  const mockData = {
    summary: {
      total_pending: 18500000,
      pending_count: 847,
      processing_count: 12,
      next_payout_date: '2025-12-25',
      total_processed_this_month: 45200000
    },
    payouts: [
      {
        id: 'PO-2025-001',
        vendor_id: '1',
        vendor_name: 'Dar Electronics Hub',
        vendor_email: 'contact@darelectronics.co.tz',
        amount: 2450000,
        commission: 122500,
        net_amount: 2327500,
        order_count: 45,
        status: 'pending',
        due_date: '2025-12-25',
        bank_account: '****5678',
        created_at: '2025-12-15T10:00:00Z'
      },
      {
        id: 'PO-2025-002',
        vendor_id: '2',
        vendor_name: 'Zanzibar Spice Market',
        vendor_email: 'orders@zanzibarspice.co.tz',
        amount: 1890000,
        commission: 94500,
        net_amount: 1795500,
        order_count: 38,
        status: 'pending',
        due_date: '2025-12-25',
        bank_account: '****1234',
        created_at: '2025-12-15T10:00:00Z'
      },
      {
        id: 'PO-2025-003',
        vendor_id: '3',
        vendor_name: 'Arusha Fashion Boutique',
        vendor_email: 'info@arushafashion.co.tz',
        amount: 1650000,
        commission: 82500,
        net_amount: 1567500,
        order_count: 32,
        status: 'processing',
        due_date: '2025-12-24',
        bank_account: '****9012',
        processing_at: '2025-12-21T14:00:00Z',
        created_at: '2025-12-14T10:00:00Z'
      },
      {
        id: 'PO-2025-004',
        vendor_id: '4',
        vendor_name: 'Mwanza Home Decor',
        vendor_email: 'sales@mwanzahomedecor.co.tz',
        amount: 1420000,
        commission: 71000,
        net_amount: 1349000,
        order_count: 28,
        status: 'pending',
        due_date: '2025-12-26',
        bank_account: '****3456',
        created_at: '2025-12-16T10:00:00Z'
      },
      {
        id: 'PO-2025-005',
        vendor_id: '5',
        vendor_name: 'Dodoma Digital Arts',
        vendor_email: 'hello@dodomadigitalarts.co.tz',
        amount: 980000,
        commission: 49000,
        net_amount: 931000,
        order_count: 18,
        status: 'completed',
        due_date: '2025-12-20',
        bank_account: '****7890',
        completed_at: '2025-12-20T16:30:00Z',
        transaction_ref: 'TXN-PAY-2025-789',
        created_at: '2025-12-13T10:00:00Z'
      },
      {
        id: 'PO-2025-006',
        vendor_id: '6',
        vendor_name: 'Tanga Furniture Makers',
        vendor_email: 'contact@tangafurniture.co.tz',
        amount: 1250000,
        commission: 62500,
        net_amount: 1187500,
        order_count: 22,
        status: 'pending',
        due_date: '2025-12-25',
        bank_account: '****2468',
        created_at: '2025-12-15T10:00:00Z'
      },
      {
        id: 'PO-2025-007',
        vendor_id: '7',
        vendor_name: 'Mbeya Organic Farm',
        vendor_email: 'sales@mbeyaorganic.co.tz',
        amount: 875000,
        commission: 43750,
        net_amount: 831250,
        order_count: 15,
        status: 'failed',
        due_date: '2025-12-23',
        bank_account: '****1357',
        error_message: 'Invalid bank account number',
        failed_at: '2025-12-23T10:15:00Z',
        created_at: '2025-12-13T10:00:00Z'
      }
    ],
    filters: {
      statuses: ['all', 'pending', 'processing', 'completed', 'failed'],
      date_ranges: ['today', 'week', 'month', 'custom']
    }
  };

  return <VendorPayoutsInteractive initialData={mockData} />;
}
