'use client';

import { useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import LoginForm from './LoginForm';
import SocialLoginButtons from './SocialLoginButtons';
import LanguageToggle from './LanguageToggle';
import SecurityFeatures from './SecurityFeatures';

export default function LoginInteractive({ mockCredentials }) {
  const [showGuestInfo, setShowGuestInfo] = useState(false);

  const handleLoginSuccess = (userData) => {
    console.log('Login successful:', userData);
  };

  const handleSocialLogin = (provider) => {
    console.log('Social login with:', provider);
  };

  const toggleGuestInfo = () => {
    setShowGuestInfo(!showGuestInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center mb-8">
            <Link href="/" className="flex items-center gap-3 group">
              <AppImage
                src="/logo.png"
                alt="Blinno Marketplace"
                width={160}
                height={48}
                className="h-12 w-auto object-contain"
                priority
              />
              <span className="text-2xl font-bold text-gray-900">Blinno</span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100">
              <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to access your Blinno marketplace account
                </p>
              </div>

              <SocialLoginButtons onSocialLogin={handleSocialLogin} />

              <div className="mt-6">
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Don't have an account?</span>
                  <Link
                    href="/user-registration"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>Create Account</span>
                    <Icon name="ArrowRightIcon" size={16} />
                  </Link>
                </div>

                <button
                  onClick={toggleGuestInfo}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 font-medium"
                >
                  <Icon name="UserIcon" size={20} />
                  <span>Continue as Guest</span>
                </button>

                {showGuestInfo && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg animate-fade-in">
                    <div className="flex items-start space-x-3">
                      <Icon name="InformationCircleIcon" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium mb-1">Guest Browsing</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          You can browse products without an account, but you'll need to sign in to make purchases or save items to your wishlist.
                        </p>
                        <Link
                          href="/product-catalog"
                          className="inline-flex items-center space-x-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                        >
                          <span>Browse Products</span>
                          <Icon name="ArrowRightIcon" size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <SecurityFeatures />
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon name="ShoppingBagIcon" size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-white">
                      Tanzania's Premier Marketplace
                    </h2>
                    <p className="text-sm text-white/80">Shop local, support businesses</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: 'BuildingStorefrontIcon',
                      title: 'Multi-Vendor Platform',
                      description: 'Access thousands of products from verified Tanzanian vendors'
                    },
                    {
                      icon: 'DevicePhoneMobileIcon',
                      title: 'Mobile Money Integration',
                      description: 'Pay with M-Pesa, Tigo Pesa, Airtel Money, or Halopesa'
                    },
                    {
                      icon: 'TruckIcon',
                      title: 'Nationwide Delivery',
                      description: 'Fast shipping to Dar es Salaam, Arusha, Mwanza, and beyond'
                    },
                    {
                      icon: 'ShieldCheckIcon',
                      title: 'Buyer Protection',
                      description: 'Secure escrow system ensures safe transactions'
                    }
                  ]?.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon name={feature?.icon} size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {feature?.title}
                        </h3>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {feature?.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl">
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Icon name="KeyIcon" size={20} className="text-blue-600" />
                  <span>Test Credentials</span>
                </h3>
                <div className="space-y-3">
                  {mockCredentials?.map((cred, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                          {cred?.role}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                          Demo
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-800 font-mono">
                          <span className="text-gray-500">Email:</span> {cred?.identifier}
                        </p>
                        <p className="text-xs text-gray-800 font-mono">
                          <span className="text-gray-500">Pass:</span> {cred?.password}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-500 text-center">
                  Use these credentials to explore different user roles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

LoginInteractive.propTypes = {
  mockCredentials: PropTypes?.arrayOf(
    PropTypes?.shape({
      identifier: PropTypes?.string?.isRequired,
      password: PropTypes?.string?.isRequired,
      role: PropTypes?.string?.isRequired,
      name: PropTypes?.string?.isRequired
    })
  )?.isRequired
};