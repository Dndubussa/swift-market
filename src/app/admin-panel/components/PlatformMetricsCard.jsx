import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function PlatformMetricsCard({ title, value, change, icon, trend }) {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
          <div className="flex items-center space-x-1">
            <Icon 
              name={isPositive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} 
              size={16} 
              className={isPositive ? 'text-success' : 'text-error'} 
            />
            <span className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
              {change}
            </span>
            <span className="text-sm text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-primary/10'}`}>
          <Icon name={icon} size={24} className={isPositive ? 'text-success' : 'text-primary'} />
        </div>
      </div>
    </div>
  );
}

PlatformMetricsCard.propTypes = {
  title: PropTypes?.string?.isRequired,
  value: PropTypes?.string?.isRequired,
  change: PropTypes?.string?.isRequired,
  icon: PropTypes?.string?.isRequired,
  trend: PropTypes?.oneOf(['up', 'down'])?.isRequired,
};