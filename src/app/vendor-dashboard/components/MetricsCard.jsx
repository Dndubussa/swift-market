import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function MetricsCard({ title, value, change, changeType, icon, iconBg }) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-dropdown transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-heading font-bold text-foreground mb-2">{value}</p>
          {change && (
            <div className="flex items-center space-x-1">
              <Icon
                name={isPositive ? 'ArrowTrendingUpIcon' : isNegative ? 'ArrowTrendingDownIcon' : 'MinusIcon'}
                size={16}
                className={isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-muted-foreground'}
              />
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-muted-foreground'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon name={icon} size={24} className="text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}

MetricsCard.propTypes = {
  title: PropTypes?.string?.isRequired,
  value: PropTypes?.string?.isRequired,
  change: PropTypes?.string,
  changeType: PropTypes?.oneOf(['positive', 'negative', 'neutral']),
  icon: PropTypes?.string?.isRequired,
  iconBg: PropTypes?.string?.isRequired,
};