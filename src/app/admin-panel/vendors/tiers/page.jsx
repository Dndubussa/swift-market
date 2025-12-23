import TierManagementInteractive from './components/TierManagementInteractive';

export const metadata = {
  title: 'Tier Management - Admin Panel',
  description: 'Manage vendor tier system and requirements'
};

export default function TierManagementPage() {
  const mockData = {
    tiers: [
      {
        id: 'gold',
        name: 'Gold',
        level: 3,
        color: '#FFD700',
        badge_color: 'yellow',
        requirements: {
          min_sales: 10000000,
          min_orders: 500,
          min_rating: 4.5,
          max_return_rate: 3,
          min_response_rate: 95,
          min_on_time_delivery: 90
        },
        benefits: {
          commission_rate: 8,
          priority_support: true,
          featured_listing: true,
          bulk_upload: true,
          advanced_analytics: true,
          marketing_support: true,
          dedicated_account_manager: true
        },
        current_vendors: 156,
        monthly_growth: 12
      },
      {
        id: 'silver',
        name: 'Silver',
        level: 2,
        color: '#C0C0C0',
        badge_color: 'gray',
        requirements: {
          min_sales: 3000000,
          min_orders: 150,
          min_rating: 4.0,
          max_return_rate: 5,
          min_response_rate: 90,
          min_on_time_delivery: 85
        },
        benefits: {
          commission_rate: 10,
          priority_support: true,
          featured_listing: false,
          bulk_upload: true,
          advanced_analytics: true,
          marketing_support: false,
          dedicated_account_manager: false
        },
        current_vendors: 389,
        monthly_growth: 23
      },
      {
        id: 'bronze',
        name: 'Bronze',
        level: 1,
        color: '#CD7F32',
        badge_color: 'orange',
        requirements: {
          min_sales: 500000,
          min_orders: 30,
          min_rating: 3.5,
          max_return_rate: 8,
          min_response_rate: 80,
          min_on_time_delivery: 75
        },
        benefits: {
          commission_rate: 12,
          priority_support: false,
          featured_listing: false,
          bulk_upload: false,
          advanced_analytics: false,
          marketing_support: false,
          dedicated_account_manager: false
        },
        current_vendors: 302,
        monthly_growth: 45
      }
    ],
    upgrade_requests: [
      {
        id: '1',
        vendor_id: 'V-1234',
        vendor_name: 'Tanga Furniture Makers',
        current_tier: 'bronze',
        requested_tier: 'silver',
        submitted_at: '2025-12-20T10:30:00Z',
        metrics: {
          total_sales: 3500000,
          total_orders: 180,
          rating: 4.2,
          return_rate: 4.0,
          response_rate: 92,
          on_time_delivery: 88
        },
        meets_requirements: true
      },
      {
        id: '2',
        vendor_id: 'V-5678',
        vendor_name: 'Dodoma Digital Arts',
        current_tier: 'bronze',
        requested_tier: 'silver',
        submitted_at: '2025-12-19T14:15:00Z',
        metrics: {
          total_sales: 2800000,
          total_orders: 140,
          rating: 3.8,
          return_rate: 6.2,
          response_rate: 85,
          on_time_delivery: 82
        },
        meets_requirements: false
      }
    ]
  };

  return <TierManagementInteractive initialData={mockData} />;
}