import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function OrderProductCard({ product, vendorName, trackingNumber }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-card transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        <Link href={`/product-details?id=${product?.id}`} className="flex-shrink-0">
          <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
            <AppImage
              src={product?.image}
              alt={product?.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/product-details?id=${product?.id}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200 line-clamp-2"
          >
            {product?.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            Vendor: <span className="font-medium text-foreground">{vendorName}</span>
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              <p className="text-xs text-muted-foreground">
                Qty: <span className="font-medium text-foreground">{product?.quantity}</span>
              </p>
              <p className="text-sm font-bold text-primary">{product?.price}</p>
            </div>
          </div>
          {trackingNumber && (
            <div className="mt-2 flex items-center space-x-2 bg-muted/50 rounded px-2 py-1">
              <Icon name="TruckIcon" size={14} className="text-muted-foreground" />
              <p className="text-xs text-foreground">
                Tracking: <span className="font-mono font-medium">{trackingNumber}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

OrderProductCard.propTypes = {
  product: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    image: PropTypes?.string?.isRequired,
    alt: PropTypes?.string?.isRequired,
    quantity: PropTypes?.number?.isRequired,
    price: PropTypes?.string?.isRequired,
  })?.isRequired,
  vendorName: PropTypes?.string?.isRequired,
  trackingNumber: PropTypes?.string,
};