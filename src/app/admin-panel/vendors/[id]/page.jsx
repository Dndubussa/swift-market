import { notFound } from 'next/navigation';
import VendorDetailsInteractive from './components/VendorDetailsInteractive';

export const metadata = {
  title: 'Vendor Details - Admin Panel',
  description: 'View and manage vendor details'
};

export default function VendorDetailsPage({ params }) {
  const { id } = params;

  // Mock data - in real app, fetch from database using id
  const mockVendor = {
    id: id,
    business_name: 'Dar Electronics Hub',
    business_email: 'contact@darelectronics.co.tz',
    owner_name: 'John Mwangi',
    owner_email: 'john.mwangi@example.com',
    phone: '+255 712 345 678',
    status: 'active',
    tier: 'gold',
    rating: 4.8,
    total_sales: 25600000,
    products_count: 234,
    orders_count: 1245,
    joined_date: '2024-03-15T10:00:00Z',
    last_active: '2025-12-21T14:30:00Z',
    verification_status: 'verified',
    business_type: 'Electronics & Gadgets',
    tax_id: 'TIN-123456789',
    address: 'Dar es Salaam, Tanzania',
    bank_name: 'CRDB Bank',
    bank_account: '****5678',
    reviews_count: 567,
    response_rate: 98,
    avg_response_time: '2 hours',
    return_rate: 2.5,
    on_time_delivery: 96,
    recent_orders: [
      {
        id: 'ORD-2025-5632',
        buyer: 'Jane Doe',
        amount: 450000,
        status: 'delivered',
        date: '2025-12-20T10:30:00Z'
      },
      {
        id: 'ORD-2025-5625',
        buyer: 'Mark Smith',
        amount: 280000,
        status: 'shipped',
        date: '2025-12-19T14:15:00Z'
      }
    ],
    top_products: [
      { id: 1, name: 'Samsung Galaxy S24', sales: 45, revenue: 2250000 },
      { id: 2, name: 'iPhone 15 Pro', sales: 38, revenue: 1900000 },
      { id: 3, name: 'Sony WH-1000XM5', sales: 67, revenue: 1340000 }
    ]
  };

  if (!mockVendor) {
    notFound();
  }

  return <VendorDetailsInteractive vendor={mockVendor} />;
}
