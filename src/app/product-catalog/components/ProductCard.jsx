'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onAddToCart(product?.id);
  };

  const handleToggleWishlist = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onToggleWishlist(product?.id);
  };

  return (
    <Link href={`/product-details?id=${product?.id}`} className="group block">
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-dropdown transition-all duration-300 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-muted">
          <AppImage
            src={product?.image}
            alt={product?.imageAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 p-2 bg-card/90 backdrop-blur-sm rounded-full hover:bg-card transition-colors duration-200 z-10"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Icon
              name="HeartIcon"
              size={20}
              variant={isInWishlist ? 'solid' : 'outline'}
              className={isInWishlist ? 'text-error' : 'text-muted-foreground'}
            />
          </button>

          {/* Vendor Badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 backdrop-blur-sm rounded-md flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-card">
              <AppImage
                src={product?.vendor?.logo}
                alt={product?.vendor?.logoAlt}
                width={20}
                height={20}
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium text-primary-foreground">{product?.vendor?.name}</span>
          </div>

          {/* Stock Badge */}
          {product?.stock < 10 && product?.stock > 0 && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-warning/90 backdrop-blur-sm rounded-md">
              <span className="text-xs font-medium text-warning-foreground">Only {product?.stock} left</span>
            </div>
          )}

          {product?.stock === 0 && (
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center">
              <span className="px-4 py-2 bg-error text-error-foreground rounded-md font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base font-semibold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors duration-200">
              {product?.name}
            </h3>
          </div>

          {/* Vendor Location */}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
            <Icon name="MapPinIcon" size={14} />
            <span>{product?.vendor?.location}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)]?.map((_, index) => (
                <Icon
                  key={index}
                  name="StarIcon"
                  size={16}
                  variant={index < Math.floor(product?.rating) ? 'solid' : 'outline'}
                  className={index < Math.floor(product?.rating) ? 'text-accent' : 'text-muted'}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({product?.reviewCount})</span>
          </div>

          {/* Price and Add to Cart */}
          <div className="mt-auto flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-primary">TZS {product?.price?.toLocaleString()}</p>
              {product?.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">TZS {product?.originalPrice?.toLocaleString()}</p>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product?.stock === 0}
              className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add to cart"
            >
              <Icon name="ShoppingCartIcon" size={20} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

ProductCard.propTypes = {
  product: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    image: PropTypes?.string?.isRequired,
    imageAlt: PropTypes?.string?.isRequired,
    price: PropTypes?.number?.isRequired,
    originalPrice: PropTypes?.number,
    rating: PropTypes?.number?.isRequired,
    reviewCount: PropTypes?.number?.isRequired,
    stock: PropTypes?.number?.isRequired,
    vendor: PropTypes?.shape({
      name: PropTypes?.string?.isRequired,
      logo: PropTypes?.string?.isRequired,
      logoAlt: PropTypes?.string?.isRequired,
      location: PropTypes?.string?.isRequired,
    })?.isRequired,
  })?.isRequired,
  onAddToCart: PropTypes?.func?.isRequired,
  onToggleWishlist: PropTypes?.func?.isRequired,
  isInWishlist: PropTypes?.bool?.isRequired,
};