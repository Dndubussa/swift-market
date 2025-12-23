import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function VendorInfoCard({ vendor }) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
            {vendor?.storeName}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="MapPinIcon" size={16} />
            <span>{vendor?.location}</span>
          </div>
        </div>
        <Link
          href="/vendor-store-management"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
        >
          Visit Store
        </Link>
      </div>
      <div className="space-y-3">
        {/* Rating */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Seller Rating</span>
          <div className="flex items-center space-x-1">
            <Icon name="StarIcon" size={16} className="text-accent fill-accent" />
            <span className="text-sm font-semibold text-foreground">
              {vendor?.rating?.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({vendor?.totalReviews} reviews)
            </span>
          </div>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Response Time</span>
          <span className="text-sm font-medium text-foreground">{vendor?.responseTime}</span>
        </div>

        {/* Products Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Products</span>
          <span className="text-sm font-medium text-foreground">{vendor?.totalProducts}</span>
        </div>

        {/* Join Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Member Since</span>
          <span className="text-sm font-medium text-foreground">{vendor?.joinDate}</span>
        </div>
      </div>
      {/* Contact Vendor */}
      <button className="w-full mt-4 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200 flex items-center justify-center space-x-2">
        <Icon name="ChatBubbleLeftRightIcon" size={18} />
        <span>Contact Vendor</span>
      </button>
    </div>
  );
}

VendorInfoCard.propTypes = {
  vendor: PropTypes?.shape({
    storeName: PropTypes?.string?.isRequired,
    location: PropTypes?.string?.isRequired,
    rating: PropTypes?.number?.isRequired,
    totalReviews: PropTypes?.number?.isRequired,
    responseTime: PropTypes?.string?.isRequired,
    totalProducts: PropTypes?.number?.isRequired,
    joinDate: PropTypes?.string?.isRequired,
  })?.isRequired,
};