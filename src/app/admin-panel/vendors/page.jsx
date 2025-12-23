import AllVendorsInteractive from './components/AllVendorsInteractive';

export const metadata = {
  title: 'All Vendors - Admin Panel',
  description: 'View and manage all vendors on Blinno Marketplace'
};

export default function AllVendorsPage() {
  const mockData = {
    summary: {
      total_vendors: 847,
      active_vendors: 732,
      pending_approval: 45,
      suspended_vendors: 70,
      new_this_month: 123
    },
    vendors: [
      {
        id: '1',
        business_name: 'Dar Electronics Hub',
        business_email: 'contact@darelectronics.co.tz',
        owner_name: 'John Mwangi',
        phone: '+255 712 345 678',
        status: 'active',
        tier: 'gold',
        rating: 4.8,
        total_sales: 25600000,
        products_count: 234,
        orders_count: 1245,
        joined_date: '2024-03-15T10:00:00Z',
        last_active: '2025-12-21T14:30:00Z',
        verification_status: 'verified'
      },
      {
        id: '2',
        business_name: 'Zanzibar Spice Market',
        business_email: 'orders@zanzibarspice.co.tz',
        owner_name: 'Fatuma Hassan',
        phone: '+255 778 234 567',
        status: 'active',
        tier: 'silver',
        rating: 4.6,
        total_sales: 18900000,
        products_count: 156,
        orders_count: 892,
        joined_date: '2024-05-20T09:30:00Z',
        last_active: '2025-12-21T10:15:00Z',
        verification_status: 'verified'
      },
      {
        id: '3',
        business_name: 'Arusha Fashion Boutique',
        business_email: 'info@arushafashion.co.tz',
        owner_name: 'Sarah Kimaro',
        phone: '+255 765 123 456',
        status: 'pending',
        tier: 'bronze',
        rating: 0,
        total_sales: 0,
        products_count: 45,
        orders_count: 0,
        joined_date: '2025-12-18T16:45:00Z',
        last_active: '2025-12-20T11:20:00Z',
        verification_status: 'pending'
      },
      {
        id: '4',
        business_name: 'Mwanza Home Decor',
        business_email: 'sales@mwanzahomedecor.co.tz',
        owner_name: 'Michael Ndege',
        phone: '+255 754 987 654',
        status: 'active',
        tier: 'gold',
        rating: 4.9,
        total_sales: 32100000,
        products_count: 345,
        orders_count: 1678,
        joined_date: '2024-01-10T08:00:00Z',
        last_active: '2025-12-21T09:45:00Z',
        verification_status: 'verified'
      },
      {
        id: '5',
        business_name: 'Dodoma Digital Arts',
        business_email: 'hello@dodomadigitalarts.co.tz',
        owner_name: 'Grace Ndungu',
        phone: '+255 745 678 901',
        status: 'suspended',
        tier: 'bronze',
        rating: 3.2,
        total_sales: 4500000,
        products_count: 67,
        orders_count: 234,
        joined_date: '2024-08-12T14:20:00Z',
        last_active: '2025-12-10T15:30:00Z',
        verification_status: 'verified',
        suspension_reason: 'Multiple policy violations'
      },
      {
        id: '6',
        business_name: 'Tanga Furniture Makers',
        business_email: 'contact@tangafurniture.co.tz',
        owner_name: 'David Kamau',
        phone: '+255 732 456 789',
        status: 'active',
        tier: 'silver',
        rating: 4.7,
        total_sales: 21200000,
        products_count: 189,
        orders_count: 956,
        joined_date: '2024-04-08T11:00:00Z',
        last_active: '2025-12-21T13:00:00Z',
        verification_status: 'verified'
      }
    ],
    filters: {
      statuses: ['all', 'active', 'pending', 'suspended'],
      tiers: ['all', 'gold', 'silver', 'bronze'],
      verification: ['all', 'verified', 'pending', 'unverified']
    }
  };

  return <AllVendorsInteractive initialData={mockData} />;
}
