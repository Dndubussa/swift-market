'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function DeliveryTrackingMap({ deliveryInfo }) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <Icon name="MapPinIcon" size={18} className="text-primary" />
          <span>Delivery Tracking</span>
        </h3>
        <button
          onClick={() => setShowMap(!showMap)}
          className="text-xs text-primary hover:text-primary/80 transition-colors duration-200 flex items-center space-x-1"
        >
          <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          <Icon name={showMap ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <Icon name="TruckIcon" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{deliveryInfo?.status}</p>
            <p className="text-xs text-muted-foreground mt-1">{deliveryInfo?.location}</p>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(deliveryInfo.lastUpdate)?.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {deliveryInfo?.estimatedDelivery && (
          <div className="flex items-center space-x-2 bg-accent/10 rounded-md px-3 py-2">
            <Icon name="ClockIcon" size={16} className="text-accent" />
            <p className="text-xs text-foreground">
              Estimated delivery: <span className="font-semibold">{deliveryInfo?.estimatedDelivery}</span>
            </p>
          </div>
        )}

        {deliveryInfo?.driverInfo && (
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs font-semibold text-foreground mb-2">Delivery Personnel</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-semibold">
                    {deliveryInfo?.driverInfo?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{deliveryInfo?.driverInfo?.name}</p>
                  <p className="text-xs text-muted-foreground">{deliveryInfo?.driverInfo?.phone}</p>
                </div>
              </div>
              <a
                href={`tel:${deliveryInfo?.driverInfo?.phone}`}
                className="p-2 bg-success text-success-foreground rounded-full hover:bg-success/90 transition-colors duration-200"
                aria-label="Call driver"
              >
                <Icon name="PhoneIcon" size={16} />
              </a>
            </div>
          </div>
        )}
      </div>
      {showMap && (
        <div className="mt-4 rounded-lg overflow-hidden border border-border">
          <div className="w-full h-64 bg-muted">
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              title="Delivery Location"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${deliveryInfo?.coordinates?.lat},${deliveryInfo?.coordinates?.lng}&z=14&output=embed`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

DeliveryTrackingMap.propTypes = {
  deliveryInfo: PropTypes?.shape({
    status: PropTypes?.string?.isRequired,
    location: PropTypes?.string?.isRequired,
    lastUpdate: PropTypes?.string?.isRequired,
    estimatedDelivery: PropTypes?.string,
    coordinates: PropTypes?.shape({
      lat: PropTypes?.number?.isRequired,
      lng: PropTypes?.number?.isRequired,
    })?.isRequired,
    driverInfo: PropTypes?.shape({
      name: PropTypes?.string?.isRequired,
      phone: PropTypes?.string?.isRequired,
    }),
  })?.isRequired,
};