import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function FinancialOverviewCard({ financials }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Financial Overview</h3>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200">
          View Details
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {financials?.map((item) => (
          <div key={item?.id} className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{item?.label}</span>
              <Icon name={item?.icon} size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{item?.value}</p>
            <p className="text-xs text-muted-foreground">{item?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

FinancialOverviewCard.propTypes = {
  financials: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      label: PropTypes?.string?.isRequired,
      value: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired,
      icon: PropTypes?.string?.isRequired,
    })
  )?.isRequired,
};