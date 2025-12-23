import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function InventoryAlerts({ alerts }) {
  const getAlertColor = (level) => {
    const colors = {
      critical: 'border-l-error bg-error/5',
      warning: 'border-l-warning bg-warning/5',
      info: 'border-l-primary bg-primary/5',
    };
    return colors?.[level] || colors?.info;
  };

  const getAlertIcon = (level) => {
    const icons = {
      critical: 'ExclamationTriangleIcon',
      warning: 'ExclamationCircleIcon',
      info: 'InformationCircleIcon',
    };
    return icons?.[level] || icons?.info;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="BellAlertIcon" size={24} className="text-warning" />
            <h2 className="text-xl font-heading font-bold text-foreground">Inventory Alerts</h2>
          </div>
          <Link
            href="/vendor-store-management"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
          >
            Manage Inventory
          </Link>
        </div>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {alerts?.map((alert) => (
          <div
            key={alert?.id}
            className={`p-4 border-l-4 ${getAlertColor(alert?.level)} hover:bg-muted/30 transition-colors duration-200`}
          >
            <div className="flex items-start space-x-3">
              <Icon name={getAlertIcon(alert?.level)} size={20} className="text-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{alert?.productName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">SKU: {alert?.sku}</p>
                  </div>
                  {alert?.image && (
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-border ml-3">
                      <AppImage
                        src={alert?.image}
                        alt={`Product image of ${alert?.productName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-foreground mb-2">{alert?.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Current Stock: <span className="font-semibold text-foreground">{alert?.currentStock}</span>
                  </span>
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors duration-200">
                    Restock Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

InventoryAlerts.propTypes = {
  alerts: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      productName: PropTypes?.string?.isRequired,
      sku: PropTypes?.string?.isRequired,
      message: PropTypes?.string?.isRequired,
      currentStock: PropTypes?.number?.isRequired,
      level: PropTypes?.oneOf(['critical', 'warning', 'info'])?.isRequired,
      image: PropTypes?.string,
    })
  )?.isRequired,
};