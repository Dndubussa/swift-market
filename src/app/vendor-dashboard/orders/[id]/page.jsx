import OrderDetailsInteractive from './components/OrderDetailsInteractive';

export const metadata = {
  title: 'Order Details - Blinno Marketplace',
  description: 'View and manage order details, update status, and add tracking information'
};

export default function OrderDetailsPage({ params }) {
  return <OrderDetailsInteractive orderId={params.id} />;
}

