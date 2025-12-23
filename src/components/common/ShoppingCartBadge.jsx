'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function ShoppingCartBadge({ itemCount = 0, className = '' }) {
  return (
    <Link
      href="/shopping-cart"
      className={`relative p-2 rounded-md hover:bg-muted transition-colors duration-200 group ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <Icon 
        name="ShoppingCartIcon" 
        size={24} 
        className="text-foreground group-hover:text-primary transition-colors duration-200" 
      />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-card animate-fade-in">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}