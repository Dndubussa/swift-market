import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function VendorInfoCard({ vendor, onMessageVendor }) {
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Vendor Information</h3>
        <Link
          href={`/vendor-store?id=${vendor?.id}`}
          className="text-xs text-primary hover:text-primary/80 transition-colors duration-200 flex items-center space-x-1"
        >
          <span>Visit Store</span>
          <Icon name="ArrowTopRightOnSquareIcon" size={14} />
        </Link>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Icon name="BuildingStorefrontIcon" size={16} className="text-muted-foreground" />
          <p className="text-sm text-foreground font-medium">{vendor?.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="MapPinIcon" size={16} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{vendor?.location}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="PhoneIcon" size={16} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{vendor?.phone}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="StarIcon" size={16} className="text-accent" variant="solid" />
          <p className="text-xs text-foreground">
            {vendor?.rating} <span className="text-muted-foreground">({vendor?.reviews} reviews)</span>
          </p>
        </div>
      </div>
      <button
        onClick={onMessageVendor}
        className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <Icon name="ChatBubbleLeftRightIcon" size={18} />
        <span>Message Vendor</span>
      </button>
    </div>
  );
}

VendorInfoCard.propTypes = {
  vendor: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    location: PropTypes?.string?.isRequired,
    phone: PropTypes?.string?.isRequired,
    rating: PropTypes?.number?.isRequired,
    reviews: PropTypes?.number?.isRequired,
  })?.isRequired,
  onMessageVendor: PropTypes?.func?.isRequired,
};