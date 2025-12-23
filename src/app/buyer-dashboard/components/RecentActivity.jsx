import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function RecentActivity({ activities }) {
  const getActivityIcon = (type) => {
    const icons = {
      'view': 'EyeIcon',
      'purchase': 'ShoppingCartIcon',
      'wishlist': 'HeartIcon',
      'review': 'StarIcon'
    };
    return icons?.[type] || icons?.['view'];
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-heading font-bold text-foreground mb-4">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <Link
            key={activity?.id}
            href={`/product-details?id=${activity?.productId}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200 group"
          >
            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
              <AppImage
                src={activity?.productImage}
                alt={activity?.productImageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {activity?.productName}
              </p>
              <div className="flex items-center gap-2">
                <Icon name={getActivityIcon(activity?.type)} size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {activity?.action}
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity?.time}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

RecentActivity.propTypes = {
  activities: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      productId: PropTypes?.string?.isRequired,
      productImage: PropTypes?.string?.isRequired,
      productImageAlt: PropTypes?.string?.isRequired,
      productName: PropTypes?.string?.isRequired,
      type: PropTypes?.string?.isRequired,
      action: PropTypes?.string?.isRequired,
      time: PropTypes?.string?.isRequired
    })
  )?.isRequired
};