import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function RecentOrderCard({ order }) {
  const getStatusColor = (status) => {
    const colors = {
      'delivered': 'bg-success/10 text-success',
      'in-transit': 'bg-accent/10 text-accent-foreground',
      'processing': 'bg-warning/10 text-warning-foreground',
      'pending': 'bg-muted text-muted-foreground'
    };
    return colors?.[status] || colors?.['pending'];
  };

  const getStatusIcon = (status) => {
    const icons = {
      'delivered': 'CheckCircleIcon',
      'in-transit': 'TruckIcon',
      'processing': 'ClockIcon',
      'pending': 'ExclamationCircleIcon'
    };
    return icons?.[status] || icons?.['pending'];
  };

  return (
    <Link href={`/order-tracking?orderId=${order?.id}`} className="block">
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-card transition-all duration-200 group">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
            <AppImage
              src={order?.productImage}
              alt={order?.productImageAlt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {order?.productName}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ${getStatusColor(order?.status)}`}>
                <Icon name={getStatusIcon(order?.status)} size={14} />
                {order?.statusLabel}
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              Order #{order?.orderNumber}
            </p>
            
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                TZS {order?.amount?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {order?.date}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

RecentOrderCard.propTypes = {
  order: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    productImage: PropTypes?.string?.isRequired,
    productImageAlt: PropTypes?.string?.isRequired,
    productName: PropTypes?.string?.isRequired,
    status: PropTypes?.string?.isRequired,
    statusLabel: PropTypes?.string?.isRequired,
    orderNumber: PropTypes?.string?.isRequired,
    amount: PropTypes?.number?.isRequired,
    date: PropTypes?.string?.isRequired
  })?.isRequired
};