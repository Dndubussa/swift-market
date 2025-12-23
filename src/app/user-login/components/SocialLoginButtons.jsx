'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function SocialLoginButtons({ onSocialLogin }) {
  const [loadingProvider, setLoadingProvider] = useState(null);

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'GlobeAltIcon',
      bgColor: 'bg-card hover:bg-muted',
      textColor: 'text-foreground',
      borderColor: 'border-input'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'UserGroupIcon',
      bgColor: 'bg-[#1877F2] hover:bg-[#1877F2]/90',
      textColor: 'text-white',
      borderColor: 'border-[#1877F2]'
    }
  ];

  const handleSocialLogin = (provider) => {
    setLoadingProvider(provider?.id);
    
    setTimeout(() => {
      onSocialLogin?.(provider?.id);
      setLoadingProvider(null);
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground font-medium">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialProviders?.map((provider) => (
          <button
            key={provider?.id}
            onClick={() => handleSocialLogin(provider)}
            disabled={loadingProvider !== null}
            className={`flex items-center justify-center space-x-2 px-4 py-3 border rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${provider?.bgColor} ${provider?.textColor} ${provider?.borderColor}`}
          >
            {loadingProvider === provider?.id ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon name={provider?.icon} size={20} />
            )}
            <span>{provider?.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

SocialLoginButtons.propTypes = {
  onSocialLogin: PropTypes?.func
};