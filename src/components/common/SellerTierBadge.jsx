'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorTierStatus, formatTierCurrency } from '@/lib/services/sellerTierService';
import Icon from '@/components/ui/AppIcon';

export default function SellerTierBadge({ compact = false }) {
  const { user } = useAuth();
  const [tierStatus, setTierStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTierStatus();
    }
  }, [user]);

  const loadTierStatus = async () => {
    const status = await getVendorTierStatus(user.id);
    setTierStatus(status);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-muted rounded-lg ${compact ? 'h-8 w-24' : 'h-16 w-full'}`} />
    );
  }

  if (!tierStatus) return null;

  const { currentTierData: tier, nextTierData: nextTier, progress } = tierStatus;

  if (compact) {
    return (
      <Link
        href="/vendor-dashboard/seller-tier"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${tier.color} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
      >
        <span>{tier.icon}</span>
        <span>{tier.name.split(' ')[0]}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/vendor-dashboard/seller-tier"
      className="block bg-card rounded-xl border border-border shadow-card hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${tier.color} p-4`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tier.icon}</span>
          <div className="text-white">
            <h4 className="font-bold">{tier.name}</h4>
            <p className="text-white/80 text-sm">{tier.commissionRate}% commission</p>
          </div>
        </div>
      </div>
      
      {nextTier && progress && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Progress to {nextTier.name}
            </span>
            <span className="text-sm font-medium text-foreground">{progress.overall}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${nextTier.color} transition-all duration-500`}
              style={{ width: `${progress.overall}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Icon name="ArrowTrendingUpIcon" size={12} />
            View tier details & benefits
          </p>
        </div>
      )}
      
      {!nextTier && (
        <div className="p-4 text-center">
          <p className="text-sm text-success font-medium flex items-center justify-center gap-1">
            <Icon name="CheckBadgeIcon" size={16} />
            Highest Tier Achieved!
          </p>
        </div>
      )}
    </Link>
  );
}

SellerTierBadge.propTypes = {
  compact: PropTypes.bool
};

