'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function NotificationPreferences({ initialPreferences, onUpdate }) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (type) => {
    const updated = {
      ...preferences,
      [type]: !preferences?.[type],
    };
    setPreferences(updated);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(preferences);
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2">
        <Icon name="BellIcon" size={18} className="text-primary" />
        <span>Notification Preferences</span>
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="EnvelopeIcon" size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive order updates via email</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('email')}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              preferences?.email ? 'bg-success' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                preferences?.email ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="DevicePhoneMobileIcon" size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">SMS Notifications</p>
              <p className="text-xs text-muted-foreground">Receive order updates via SMS</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('sms')}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              preferences?.sms ? 'bg-success' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                preferences?.sms ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="BellAlertIcon" size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Receive instant app notifications</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('push')}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              preferences?.push ? 'bg-success' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                preferences?.push ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}

NotificationPreferences.propTypes = {
  initialPreferences: PropTypes?.shape({
    email: PropTypes?.bool?.isRequired,
    sms: PropTypes?.bool?.isRequired,
    push: PropTypes?.bool?.isRequired,
  })?.isRequired,
  onUpdate: PropTypes?.func?.isRequired,
};