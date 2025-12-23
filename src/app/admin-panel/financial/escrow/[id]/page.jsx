import { notFound } from 'next/navigation';
import EscrowDetailsInteractive from './components/EscrowDetailsInteractive';

export const metadata = {
  title: 'Escrow Details - Admin Panel',
  description: 'View and manage escrow transaction details'
};

export default function EscrowDetailsPage({ params }) {
  const { id } = params;

  // Mock data - in real app, fetch from database using id
  const mockEscrow = {
    id: id,
    order_id: 'ORD-2025-5632',
    buyer_id: 'buyer_001',
    buyer_name: 'John Mwangi',
    buyer_email: 'john.mwangi@example.com',
    vendor_id: 'vendor_001',
    vendor_name: 'Dar Electronics Hub',
    vendor_email: 'contact@darelectronics.co.tz',
    amount: 450000,
    status: 'held',
    reason: 'awaiting_delivery',
    created_at: '2025-12-18T10:30:00Z',
    release_date: '2025-12-28',
    days_held: 3,
    timeline: [
      {
        id: 1,
        event: 'Escrow Created',
        description: 'Payment received and held in escrow',
        timestamp: '2025-12-18T10:30:00Z',
        icon: 'LockClosedIcon',
        color: 'text-primary'
      },
      {
        id: 2,
        event: 'Order Confirmed',
        description: 'Vendor confirmed the order',
        timestamp: '2025-12-18T10:35:00Z',
        icon: 'CheckCircleIcon',
        color: 'text-success'
      },
      {
        id: 3,
        event: 'Order Shipped',
        description: 'Package shipped to buyer',
        timestamp: '2025-12-19T14:20:00Z',
        icon: 'TruckIcon',
        color: 'text-info'
      }
    ],
    product_details: {
      name: 'Samsung Galaxy S24 Ultra',
      quantity: 1,
      price: 450000,
      image: '/assets/images/no_image.png'
    }
  };

  if (!mockEscrow) {
    notFound();
  }

  return <EscrowDetailsInteractive escrow={mockEscrow} />;
}
