'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function PurchasePanel({ product, variants }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedShipping, setSelectedShipping] = useState('standard');

  const shippingOptions = [
    { id: 'standard', name: 'Standard Delivery', cost: 5000, duration: '3-5 days' },
    { id: 'express', name: 'Express Delivery', cost: 15000, duration: '1-2 days' },
    { id: 'pickup', name: 'Store Pickup', cost: 0, duration: 'Same day' },
  ];

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product?.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantChange = (variantType, value) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantType]: value,
    }));
  };

  const handleAddToCart = () => {
    console.log('Added to cart:', { product, quantity, selectedVariants });
  };

  const handleAddToWishlist = () => {
    console.log('Added to wishlist:', product?.id);
  };

  const handleAddToComparison = () => {
    console.log('Added to comparison:', product?.id);
  };

  const selectedShippingOption = shippingOptions?.find((opt) => opt?.id === selectedShipping);
  const totalPrice = product?.price * quantity + (selectedShippingOption?.cost || 0);

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card sticky top-20">
      <div className="space-y-6">
        {/* Variants Selection */}
        {variants && variants?.length > 0 && (
          <div className="space-y-4">
            {variants?.map((variant) => (
              <div key={variant?.type}>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {variant?.type}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant?.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleVariantChange(variant?.type, option)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedVariants?.[variant?.type] === option
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-muted-foreground/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Selector */}
        {!product?.isDigital && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Quantity</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="MinusIcon" size={20} />
              </button>
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-16 h-10 text-center border border-border rounded-md font-medium text-foreground"
              />
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product?.stockQuantity}
                className="w-10 h-10 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="PlusIcon" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Shipping Options */}
        {!product?.isDigital && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Shipping Method
            </label>
            <div className="space-y-2">
              {shippingOptions?.map((option) => (
                <button
                  key={option?.id}
                  onClick={() => setSelectedShipping(option?.id)}
                  className={`w-full p-3 rounded-md border transition-all duration-200 text-left ${
                    selectedShipping === option?.id
                      ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{option?.name}</p>
                      <p className="text-xs text-muted-foreground">{option?.duration}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {option?.cost === 0 ? 'Free' : `TZS ${option?.cost?.toLocaleString()}`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total Price */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-sm font-medium text-foreground">
              TZS {(product?.price * quantity)?.toLocaleString()}
            </span>
          </div>
          {!product?.isDigital && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Shipping</span>
              <span className="text-sm font-medium text-foreground">
                {selectedShippingOption?.cost === 0
                  ? 'Free'
                  : `TZS ${selectedShippingOption?.cost?.toLocaleString()}`}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">
              TZS {totalPrice?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/checkout-process"
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="ShoppingBagIcon" size={20} />
            <span>Buy Now</span>
          </Link>
          <button
            onClick={handleAddToCart}
            className="w-full px-6 py-3 border-2 border-primary text-primary rounded-md font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="ShoppingCartIcon" size={20} />
            <span>Add to Cart</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddToWishlist}
            className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="HeartIcon" size={18} />
            <span>Wishlist</span>
          </button>
          <button
            onClick={handleAddToComparison}
            className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="ArrowsRightLeftIcon" size={18} />
            <span>Compare</span>
          </button>
        </div>
      </div>
    </div>
  );
}

PurchasePanel.propTypes = {
  product: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    price: PropTypes?.number?.isRequired,
    stockQuantity: PropTypes?.number,
    isDigital: PropTypes?.bool,
  })?.isRequired,
  variants: PropTypes?.arrayOf(
    PropTypes?.shape({
      type: PropTypes?.string?.isRequired,
      options: PropTypes?.arrayOf(PropTypes?.string)?.isRequired,
    })
  ),
};