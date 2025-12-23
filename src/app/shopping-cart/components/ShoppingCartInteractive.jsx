'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import VendorSection from './VendorSection';
import CartItemCard from './CartItemCard';
import CartSummary from './CartSummary';
import CouponInput from './CouponInput';
import EmptyCart from './EmptyCart';
import MobileSummaryFooter from './MobileSummaryFooter';

export default function ShoppingCartInteractive({ initialCartData }) {
  const [cartData, setCartData] = useState(initialCartData);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('blinno_cart');
      if (savedCart) {
        try {
          setCartData(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && cartData?.vendors?.length > 0) {
      try {
        localStorage.setItem('blinno_cart', JSON.stringify(cartData));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  }, [cartData]);

  const handleQuantityChange = (itemId, newQuantity) => {
    setCartData(prevData => {
      const updatedVendors = prevData?.vendors?.map(vendor => ({
        ...vendor,
        items: vendor?.items?.map(item =>
          item?.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));
      return { ...prevData, vendors: updatedVendors };
    });
  };

  const handleRemoveItem = (itemId) => {
    setCartData(prevData => {
      const updatedVendors = prevData?.vendors?.map(vendor => ({
          ...vendor,
          items: vendor?.items?.filter(item => item?.id !== itemId),
        }))?.filter(vendor => vendor?.items?.length > 0);
      return { ...prevData, vendors: updatedVendors };
    });
  };

  const handleSaveForLater = (itemId) => {
    setShowSaveNotification(true);
    handleRemoveItem(itemId);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const handleApplyCoupon = (code) => {
    if (!code) {
      setAppliedCoupon(null);
      return true;
    }

    const validCoupons = {
      'WELCOME10': { code: 'WELCOME10', description: '10% off your order', discount: 0.10 },
      'SAVE5000': { code: 'SAVE5000', description: 'TZS 5,000 off', discount: 5000 },
      'FREESHIP': { code: 'FREESHIP', description: 'Free shipping', discount: 0 },
    };

    if (validCoupons?.[code]) {
      setAppliedCoupon(validCoupons?.[code]);
      return true;
    }
    return false;
  };

  const calculateSummary = () => {
    let subtotal = 0;
    let shipping = 0;
    let itemCount = 0;

    cartData?.vendors?.forEach(vendor => {
      vendor?.items?.forEach(item => {
        subtotal += item?.price * item?.quantity;
        itemCount += item?.quantity;
      });
      shipping += vendor?.shippingCost;
    });

    const tax = Math.round(subtotal * 0.18);
    let discount = 0;

    if (appliedCoupon) {
      if (appliedCoupon?.code === 'FREESHIP') {
        discount = shipping;
      } else if (appliedCoupon?.discount < 1) {
        discount = Math.round(subtotal * appliedCoupon?.discount);
      } else {
        discount = appliedCoupon?.discount;
      }
    }

    const total = subtotal + shipping + tax - discount;

    return {
      subtotal,
      shipping: appliedCoupon?.code === 'FREESHIP' ? 0 : shipping,
      tax,
      discount,
      total,
      itemCount,
      estimatedDelivery: '3-7 business days',
    };
  };

  const summary = calculateSummary();

  if (cartData?.vendors?.length === 0) {
    return <EmptyCart />;
  }

  return (
    <>
      {showSaveNotification && (
        <div className="fixed top-20 right-4 bg-success text-success-foreground px-4 py-3 rounded-lg shadow-modal z-50 flex items-center gap-2 animate-fade-in">
          <Icon name="CheckCircleIcon" size={20} variant="solid" />
          <span className="font-medium">Item saved to wishlist</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Header */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                <Icon name="ShoppingCartIcon" size={28} className="text-primary" />
                Shopping Cart
              </h1>
              <span className="text-sm text-muted-foreground">
                {summary?.itemCount} {summary?.itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Vendor Sections */}
          {cartData?.vendors?.map(vendor => (
            <VendorSection key={vendor?.id} vendor={vendor}>
              {vendor?.items?.map(item => (
                <CartItemCard
                  key={item?.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  onSaveForLater={handleSaveForLater}
                />
              ))}
            </VendorSection>
          ))}

          {/* Coupon Section */}
          <CouponInput onApplyCoupon={handleApplyCoupon} appliedCoupon={appliedCoupon} />
        </div>

        {/* Summary Section - Desktop */}
        <div className="hidden lg:block">
          <CartSummary summary={summary} />
        </div>
      </div>
      {/* Mobile Summary Footer */}
      <MobileSummaryFooter total={summary?.total} itemCount={summary?.itemCount} />
      {/* Mobile Spacing */}
      <div className="h-24 lg:hidden" />
    </>
  );
}

ShoppingCartInteractive.propTypes = {
  initialCartData: PropTypes?.shape({
    vendors: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        name: PropTypes?.string?.isRequired,
        rating: PropTypes?.number?.isRequired,
        reviews: PropTypes?.number?.isRequired,
        location: PropTypes?.string?.isRequired,
        shippingRegion: PropTypes?.string?.isRequired,
        deliveryTime: PropTypes?.string?.isRequired,
        shippingCost: PropTypes?.number?.isRequired,
        items: PropTypes?.arrayOf(
          PropTypes?.shape({
            id: PropTypes?.string?.isRequired,
            name: PropTypes?.string?.isRequired,
            image: PropTypes?.string?.isRequired,
            alt: PropTypes?.string?.isRequired,
            price: PropTypes?.number?.isRequired,
            quantity: PropTypes?.number?.isRequired,
            stock: PropTypes?.number?.isRequired,
            variant: PropTypes?.string,
          })
        )?.isRequired,
      })
    )?.isRequired,
  })?.isRequired,
};