'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function CouponInput({ onApplyCoupon, appliedCoupon }) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  const handleApply = () => {
    if (!couponCode?.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    setError('');

    setTimeout(() => {
      const success = onApplyCoupon(couponCode);
      if (!success) {
        setError('Invalid or expired coupon code');
      } else {
        setCouponCode('');
      }
      setIsApplying(false);
    }, 500);
  };

  const handleRemove = () => {
    onApplyCoupon(null);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="TicketIcon" size={20} className="text-primary" />
        <h3 className="font-semibold text-foreground">Apply Coupon</h3>
      </div>
      {appliedCoupon ? (
        <div className="bg-success/10 border border-success rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircleIcon" size={20} className="text-success" variant="solid" />
              <div>
                <p className="text-sm font-semibold text-foreground">{appliedCoupon?.code}</p>
                <p className="text-xs text-muted-foreground">{appliedCoupon?.description}</p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-error/10 rounded transition-colors duration-200"
              aria-label="Remove coupon"
            >
              <Icon name="XMarkIcon" size={18} className="text-error" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e?.target?.value?.toUpperCase());
                setError('');
              }}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <button
              onClick={handleApply}
              disabled={isApplying || !couponCode?.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-2 text-error text-sm">
              <Icon name="ExclamationCircleIcon" size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

CouponInput.propTypes = {
  onApplyCoupon: PropTypes?.func?.isRequired,
  appliedCoupon: PropTypes?.shape({
    code: PropTypes?.string?.isRequired,
    description: PropTypes?.string?.isRequired,
    discount: PropTypes?.number?.isRequired,
  }),
};