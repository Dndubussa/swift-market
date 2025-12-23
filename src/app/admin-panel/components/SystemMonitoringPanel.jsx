import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function SystemMonitoringPanel({ systems }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return { icon: 'CheckCircleIcon', color: 'text-success' };
      case 'degraded':
        return { icon: 'ExclamationTriangleIcon', color: 'text-warning' };
      case 'down':
        return { icon: 'XCircleIcon', color: 'text-error' };
      default:
        return { icon: 'QuestionMarkCircleIcon', color: 'text-muted-foreground' };
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">System Monitoring</h3>
        <span className="text-xs text-muted-foreground">Last updated: 2 min ago</span>
      </div>
      <div className="space-y-4">
        {systems?.map((system) => {
          const statusInfo = getStatusIcon(system?.status);
          return (
            <div key={system?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-center space-x-3 flex-1">
                <Icon name={statusInfo?.icon} size={24} variant="solid" className={statusInfo?.color} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{system?.name}</p>
                  <p className="text-xs text-muted-foreground">{system?.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{system?.uptime}</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

SystemMonitoringPanel.propTypes = {
  systems: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      name: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired,
      status: PropTypes?.oneOf(['operational', 'degraded', 'down'])?.isRequired,
      uptime: PropTypes?.string?.isRequired,
    })
  )?.isRequired,
};