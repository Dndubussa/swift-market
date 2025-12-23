'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import RecentOrderCard from './RecentOrderCard';
import ProductCard from './ProductCard';
import OrderTrackingSummary from './OrderTrackingSummary';
import WishlistPreview from './WishlistPreview';
import LoyaltyRewards from './LoyaltyRewards';
import RecentActivity from './RecentActivity';
import Icon from '@/components/ui/AppIcon';

export default function BuyerDashboardInteractive({ initialData }) {
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    try {
      const storedCart = localStorage.getItem('shoppingCart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItemCount(parsedCart?.length || 0);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Mock badges - in production these would come from real data
  const badges = {
    notifications: 3
  };

  return (
    <DashboardLayout
      role="buyer"
      title={`Welcome back, ${userName}!`}
      subtitle={`Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      badges={badges}
      actions={
        <div className="flex items-center gap-3">
          <Link
            href="/shopping-cart"
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="ShoppingCartIcon" size={22} className="text-foreground" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </Link>
          <Link
            href="/product-catalog"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Icon name="MagnifyingGlassIcon" size={18} />
            Browse Products
          </Link>
        </div>
      }
    >
      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
          <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto mb-2">
            <Icon name="ShoppingBagIcon" size={24} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{initialData?.stats?.orders || 0}</p>
          <p className="text-sm text-muted-foreground">Orders</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
          <div className="p-2 bg-error/10 rounded-lg w-fit mx-auto mb-2">
            <Icon name="HeartIcon" size={24} className="text-error" />
          </div>
          <p className="text-2xl font-bold text-foreground">{initialData?.stats?.wishlistItems || 0}</p>
          <p className="text-sm text-muted-foreground">Wishlist</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
          <div className="p-2 bg-warning/10 rounded-lg w-fit mx-auto mb-2">
            <Icon name="GiftIcon" size={24} className="text-warning" />
          </div>
          <p className="text-2xl font-bold text-foreground">{initialData?.stats?.rewardsPoints || 0}</p>
          <p className="text-sm text-muted-foreground">Points</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-foreground">
                Recent Orders
              </h2>
              <Link href="/buyer-dashboard/orders" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialData?.recentOrders?.map((order) => (
                <RecentOrderCard key={order?.id} order={order} />
              ))}
            </div>
          </section>
          
          {/* Recommended Products */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-foreground">
                Recommended for You
              </h2>
              <Link href="/product-catalog" className="text-sm text-primary hover:underline">
                Browse More
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {initialData?.recommendedProducts?.map((product) => (
                <ProductCard key={product?.id} product={product} />
              ))}
            </div>
          </section>
          
          {/* Trending Items */}
          <section>
            <h2 className="text-xl font-heading font-bold text-foreground mb-4">
              Trending Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {initialData?.trendingProducts?.map((product) => (
                <ProductCard key={product?.id} product={product} />
              ))}
            </div>
          </section>
          
          <RecentActivity activities={initialData?.recentActivities} />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <OrderTrackingSummary trackingData={initialData?.orderTracking} />
          <WishlistPreview wishlistItems={initialData?.wishlistItems} />
          <LoyaltyRewards rewardsData={initialData?.loyaltyRewards} />
        </div>
      </div>
    </DashboardLayout>
  );
}

BuyerDashboardInteractive.propTypes = {
  initialData: PropTypes?.shape({
    stats: PropTypes?.shape({
      orders: PropTypes?.number?.isRequired,
      wishlistItems: PropTypes?.number?.isRequired,
      rewardsPoints: PropTypes?.number?.isRequired
    })?.isRequired,
    recentOrders: PropTypes?.array?.isRequired,
    recommendedProducts: PropTypes?.array?.isRequired,
    trendingProducts: PropTypes?.array?.isRequired,
    orderTracking: PropTypes?.array?.isRequired,
    wishlistItems: PropTypes?.array?.isRequired,
    loyaltyRewards: PropTypes?.object?.isRequired,
    recentActivities: PropTypes?.array?.isRequired
  })?.isRequired
};
