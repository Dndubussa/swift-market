'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function QuickActionsPanel({ actions }) {
  const handleActionClick = (actionId) => {
    console.log(`Action clicked: ${actionId}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => handleActionClick(action?.id)}
            className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-primary/10 hover:border-primary border border-transparent transition-all duration-200 group"
          >
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
              <Icon name={action?.icon} size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{action?.label}</p>
              <p className="text-xs text-muted-foreground">{action?.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

QuickActionsPanel.propTypes = {
  actions: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      label: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired,
      icon: PropTypes?.string?.isRequired,
    })
  )?.isRequired,
};