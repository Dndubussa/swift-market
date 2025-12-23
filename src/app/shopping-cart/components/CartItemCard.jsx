'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function CartItemCard({ item, onQuantityChange, onRemove, onSaveForLater }) {
  const [quantity, setQuantity] = useState(item?.quantity);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleIncrement = () => {
    if (quantity < item?.stock) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange(item?.id, newQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(item?.id, newQuantity);
    }
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e?.target?.value) || 1;
    const newQuantity = Math.min(Math.max(1, value), item?.stock);
    setQuantity(newQuantity);
    onQuantityChange(item?.id, newQuantity);
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item?.id);
    }, 300);
  };

  const subtotal = item?.price * quantity;

  return (
    <div className={`bg-card border border-border rounded-lg p-4 transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <Link href={`/product-details?id=${item?.id}`} className="flex-shrink-0">
          <div className="w-full sm:w-24 h-32 sm:h-24 overflow-hidden rounded-md bg-muted">
            <AppImage
              src={item?.image}
              alt={item?.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/product-details?id=${item?.id}`}>
                <h3 className="text-base font-semibold text-foreground hover:text-primary transition-colors duration-200 line-clamp-2">
                  {item?.name}
                </h3>
              </Link>
              {item?.variant && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item?.variant}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Stock: {item?.stock} available
              </p>
            </div>

            {/* Remove Button - Desktop */}
            <button
              onClick={handleRemove}
              className="hidden sm:block p-2 hover:bg-error/10 rounded-md transition-colors duration-200 group"
              aria-label="Remove item"
            >
              <Icon name="TrashIcon" size={20} className="text-muted-foreground group-hover:text-error transition-colors duration-200" />
            </button>
          </div>

          {/* Price and Quantity Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Qty:</span>
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="px-3 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label="Decrease quantity"
                >
                  <Icon name="MinusIcon" size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityInput}
                  min="1"
                  max={item?.stock}
                  className="w-16 text-center border-x border-border py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= item?.stock}
                  className="px-3 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label="Increase quantity"
                >
                  <Icon name="PlusIcon" size={16} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-lg font-bold text-foreground">
                  TZS {item?.price?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-lg font-bold text-primary">
                  TZS {subtotal?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={() => onSaveForLater(item?.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors duration-200"
            >
              <Icon name="HeartIcon" size={16} />
              <span className="text-sm">Save for Later</span>
            </button>
            <button
              onClick={handleRemove}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-error text-error rounded-md hover:bg-error/10 transition-colors duration-200"
            >
              <Icon name="TrashIcon" size={16} />
              <span className="text-sm">Remove</span>
            </button>
          </div>
        </div>
      </div>
      {/* Desktop Save for Later */}
      <div className="hidden sm:block mt-3 pt-3 border-t border-border">
        <button
          onClick={() => onSaveForLater(item?.id)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200"
        >
          <Icon name="HeartIcon" size={16} />
          <span>Save for Later</span>
        </button>
      </div>
    </div>
  );
}

CartItemCard.propTypes = {
  item: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    image: PropTypes?.string?.isRequired,
    alt: PropTypes?.string?.isRequired,
    price: PropTypes?.number?.isRequired,
    quantity: PropTypes?.number?.isRequired,
    stock: PropTypes?.number?.isRequired,
    variant: PropTypes?.string,
  })?.isRequired,
  onQuantityChange: PropTypes?.func?.isRequired,
  onRemove: PropTypes?.func?.isRequired,
  onSaveForLater: PropTypes?.func?.isRequired,
};