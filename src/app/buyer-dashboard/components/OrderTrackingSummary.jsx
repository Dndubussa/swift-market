import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function OrderTrackingSummary({ trackingData }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">
          Order Tracking
        </h2>
        <Link 
          href="/order-tracking" 
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          View All
          <Icon name="ChevronRightIcon" size={16} />
        </Link>
      </div>
      <div className="space-y-4">
        {trackingData?.map((item) => (
          <div key={item?.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="TruckIcon" size={20} className="text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm mb-1">
                {item?.title}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Order #{item?.orderNumber}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${item?.progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {item?.progress}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {item?.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

OrderTrackingSummary.propTypes = {
  trackingData: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      title: PropTypes?.string?.isRequired,
      orderNumber: PropTypes?.string?.isRequired,
      progress: PropTypes?.number?.isRequired,
      status: PropTypes?.string?.isRequired
    })
  )?.isRequired
};