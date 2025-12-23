import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function RecentActivityFeed({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'vendor_approval':
        return { icon: 'CheckBadgeIcon', color: 'text-success' };
      case 'product_moderation':
        return { icon: 'ShoppingBagIcon', color: 'text-primary' };
      case 'dispute_resolved':
        return { icon: 'ScaleIcon', color: 'text-accent' };
      case 'payment_processed':
        return { icon: 'BanknotesIcon', color: 'text-success' };
      case 'user_suspended':
        return { icon: 'NoSymbolIcon', color: 'text-error' };
      default:
        return { icon: 'BellIcon', color: 'text-muted-foreground' };
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200">
          View All
        </button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => {
          const activityInfo = getActivityIcon(activity?.type);
          return (
            <div key={activity?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-150">
              <div className={`p-2 rounded-full bg-muted ${activityInfo?.color}`}>
                <Icon name={activityInfo?.icon} size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{activity?.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">{activity?.user}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{activity?.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

RecentActivityFeed.propTypes = {
  activities: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      type: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired,
      user: PropTypes?.string?.isRequired,
      timestamp: PropTypes?.string?.isRequired,
    })
  )?.isRequired,
};