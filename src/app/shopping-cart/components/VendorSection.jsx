import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function VendorSection({ vendor, children }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Vendor Header */}
      <div className="bg-muted/30 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Icon name="BuildingStorefrontIcon" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <Link href={`/vendor-store?id=${vendor?.id}`}>
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors duration-200">
                  {vendor?.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center">
                  <Icon name="StarIcon" size={14} className="text-accent" variant="solid" />
                  <span className="text-xs text-muted-foreground ml-1">
                    {vendor?.rating} ({vendor?.reviews} reviews)
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{vendor?.location}</span>
              </div>
            </div>
          </div>
          <Link
            href={`/vendor-store?id=${vendor?.id}`}
            className="hidden sm:flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors duration-200"
          >
            <span>Visit Store</span>
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>
      </div>
      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {children}
      </div>
      {/* Shipping Options */}
      <div className="px-4 pb-4">
        <div className="bg-muted/20 rounded-lg p-3 border border-border">
          <div className="flex items-start gap-2">
            <Icon name="TruckIcon" size={20} className="text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Shipping to {vendor?.shippingRegion}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated delivery: {vendor?.deliveryTime}
              </p>
              <p className="text-sm font-semibold text-foreground mt-2">
                Shipping cost: TZS {vendor?.shippingCost?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

VendorSection.propTypes = {
  vendor: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    rating: PropTypes?.number?.isRequired,
    reviews: PropTypes?.number?.isRequired,
    location: PropTypes?.string?.isRequired,
    shippingRegion: PropTypes?.string?.isRequired,
    deliveryTime: PropTypes?.string?.isRequired,
    shippingCost: PropTypes?.number?.isRequired,
  })?.isRequired,
  children: PropTypes?.node?.isRequired,
};