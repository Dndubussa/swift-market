'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import {
  getVendorTierStatus,
  getTierComparison,
  getTierHistory,
  getTopSellers,
  formatTierCurrency
} from '@/lib/services/sellerTierService';
import Icon from '@/components/ui/AppIcon';

export default function SellerTierInteractive() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [tierStatus, setTierStatus] = useState(null);
  const [tierComparison, setTierComparison] = useState([]);
  const [tierHistory, setTierHistory] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/user-login');
        return;
      }
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    
    // Use user ID as vendor ID for demo
    const vendorId = user.id;
    
    const [status, history, leaders] = await Promise.all([
      getVendorTierStatus(vendorId),
      getTierHistory(vendorId),
      getTopSellers(10)
    ]);
    
    setTierStatus(status);
    setTierComparison(getTierComparison(status.currentTier));
    setTierHistory(history);
    setTopSellers(leaders);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const currentTier = tierStatus?.currentTierData;
  const nextTier = tierStatus?.nextTierData;
  const progress = tierStatus?.progress;
  const metrics = tierStatus?.metrics;

  return (
    <DashboardLayout
      role="vendor"
      title="Seller Tier"
      subtitle={currentTier ? `Current tier: ${currentTier.name}` : 'Loading...'}
    >
      {(authLoading || loading) ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
      <>
      {/* Tier Hero Banner */}
      <div className={`-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6 bg-gradient-to-r ${currentTier?.color || 'from-amber-600 to-amber-700'} text-white`}>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Current Tier Display */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center text-6xl backdrop-blur-sm">
              {currentTier?.icon}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{currentTier?.name}</h2>
              <p className="text-white/80 text-lg mb-4">{currentTier?.requirements}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white/70 text-sm">Commission Rate</span>
                  <p className="font-bold text-xl">{currentTier?.commissionRate}%</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white/70 text-sm">Tier Level</span>
                  <p className="font-bold text-xl">{tierStatus?.tierIndex + 1} of {tierStatus?.totalTiers}</p>
                </div>
                {tierStatus?.isGrandfathered && (
                  <div className="bg-yellow-500/30 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-white/70 text-sm">Status</span>
                    <p className="font-bold text-sm">Grandfathered</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: 'ChartBarIcon' },
              { id: 'benefits', label: 'Benefits', icon: 'GiftIcon' },
              { id: 'progress', label: 'Progress', icon: 'ArrowTrendingUpIcon' },
              { id: 'tiers', label: 'All Tiers', icon: 'TableCellsIcon' },
              { id: 'leaderboard', label: 'Leaderboard', icon: 'TrophyIcon' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Icon name="BanknotesIcon" size={20} className="text-success" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Sales</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatTierCurrency(metrics?.totalSales || 0)}
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon name="ShoppingBagIcon" size={20} className="text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Orders</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{metrics?.totalOrders || 0}</p>
              </div>
              
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Icon name="StarIcon" size={20} className="text-warning" />
                  </div>
                  <span className="text-sm text-muted-foreground">Rating</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics?.averageRating || 0}
                  <span className="text-sm text-muted-foreground ml-1">/ 5</span>
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-info" />
                  </div>
                  <span className="text-sm text-muted-foreground">Response</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{metrics?.responseRate || 0}%</p>
              </div>
            </div>

            {/* Next Tier Preview */}
            {nextTier && (
              <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className={`bg-gradient-to-r ${nextTier.color} p-4`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{nextTier.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">Next: {nextTier.name}</h3>
                      <p className="text-white/80 text-sm">{nextTier.requirements}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium text-foreground">{progress?.overall || 0}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${nextTier.color} transition-all duration-500`}
                        style={{ width: `${progress?.overall || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {progress && Object.entries({
                      sales: { icon: 'BanknotesIcon', label: 'Sales', format: formatTierCurrency },
                      orders: { icon: 'ShoppingBagIcon', label: 'Orders', format: (v) => v.toString() },
                      rating: { icon: 'StarIcon', label: 'Rating', format: (v) => v.toFixed(1) },
                      response: { icon: 'ChatBubbleLeftRightIcon', label: 'Response', format: (v) => `${v}%` }
                    }).map(([key, config]) => (
                      <div key={key} className="text-center">
                        <Icon name={config.icon} size={20} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mb-1">{config.label}</p>
                        <p className="font-medium text-foreground text-sm">
                          {config.format(progress[key]?.current || 0)} / {config.format(progress[key]?.required || 0)}
                        </p>
                        <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress[key]?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Performance */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="CalendarIcon" size={20} />
                This Month's Performance
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly Sales</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatTierCurrency(metrics?.monthlySales || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly Orders</p>
                  <p className="text-2xl font-bold text-foreground">{metrics?.monthlyOrders || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{currentTier?.icon}</span>
                <div>
                  <h3 className="font-bold text-xl text-foreground">{currentTier?.name} Benefits</h3>
                  <p className="text-muted-foreground">Your current tier benefits</p>
                </div>
              </div>
              
              <div className="grid gap-3">
                {currentTier?.benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-success/5 rounded-lg">
                    <div className="p-1 bg-success rounded-full">
                      <Icon name="CheckIcon" size={14} className="text-white" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {nextTier && (
              <div className="bg-card rounded-xl p-6 border border-border shadow-card opacity-75">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">{nextTier?.icon}</span>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">{nextTier?.name} Benefits</h3>
                    <p className="text-muted-foreground">Unlock these with your next tier</p>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {nextTier?.benefits?.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="p-1 bg-muted rounded-full">
                        <Icon name="LockClosedIcon" size={14} className="text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {nextTier ? (
              <>
                <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                  <h3 className="font-semibold text-foreground mb-6">Progress to {nextTier.name}</h3>
                  
                  <div className="space-y-6">
                    {/* Sales Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon name="BanknotesIcon" size={18} className="text-success" />
                          <span className="font-medium text-foreground">Total Sales</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          progress?.sales?.progress >= 100 ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {progress?.sales?.progress}%
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-success transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, progress?.sales?.progress || 0)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatTierCurrency(progress?.sales?.current || 0)}</span>
                        <span>
                          {progress?.sales?.remaining > 0 
                            ? `${formatTierCurrency(progress?.sales?.remaining)} remaining`
                            : '✓ Complete'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Orders Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon name="ShoppingBagIcon" size={18} className="text-primary" />
                          <span className="font-medium text-foreground">Total Orders</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          progress?.orders?.progress >= 100 ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {progress?.orders?.progress}%
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-primary transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, progress?.orders?.progress || 0)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{progress?.orders?.current || 0} orders</span>
                        <span>
                          {progress?.orders?.remaining > 0 
                            ? `${progress?.orders?.remaining} more needed`
                            : '✓ Complete'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Rating Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon name="StarIcon" size={18} className="text-warning" />
                          <span className="font-medium text-foreground">Average Rating</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          progress?.rating?.progress >= 100 ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {progress?.rating?.progress}%
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-warning transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, progress?.rating?.progress || 0)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{progress?.rating?.current || 0} / 5 stars</span>
                        <span>
                          {progress?.rating?.remaining > 0 
                            ? `Need ${progress?.rating?.remaining?.toFixed(1)} more`
                            : '✓ Complete'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Response Rate Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon name="ChatBubbleLeftRightIcon" size={18} className="text-info" />
                          <span className="font-medium text-foreground">Response Rate</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          progress?.response?.progress >= 100 ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {progress?.response?.progress}%
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-info transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, progress?.response?.progress || 0)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{progress?.response?.current || 0}%</span>
                        <span>
                          {progress?.response?.remaining > 0 
                            ? `Need ${progress?.response?.remaining}% more`
                            : '✓ Complete'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="LightBulbIcon" size={20} className="text-primary" />
                    Tips to Reach {nextTier.name}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Icon name="ArrowRightIcon" size={16} className="text-primary mt-1" />
                      <span className="text-muted-foreground">List more products to increase visibility and sales</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="ArrowRightIcon" size={16} className="text-primary mt-1" />
                      <span className="text-muted-foreground">Respond quickly to customer inquiries to boost response rate</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="ArrowRightIcon" size={16} className="text-primary mt-1" />
                      <span className="text-muted-foreground">Provide excellent service to earn 5-star reviews</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="ArrowRightIcon" size={16} className="text-primary mt-1" />
                      <span className="text-muted-foreground">Run promotions to attract more customers</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">{currentTier?.icon}</span>
                <h3 className="text-2xl font-bold text-foreground mb-2">You've Reached the Top!</h3>
                <p className="text-muted-foreground">
                  Congratulations! You're a {currentTier?.name} - the highest tier available.
                </p>
              </div>
            )}
          </div>
        )}

        {/* All Tiers Tab */}
        {activeTab === 'tiers' && (
          <div className="grid gap-4">
            {tierComparison.map((tier) => (
              <div 
                key={tier.id}
                className={`bg-card rounded-xl border shadow-card overflow-hidden ${
                  tier.isCurrent 
                    ? 'border-2 border-primary' 
                    : tier.isAchieved 
                    ? 'border-success/50' 
                    : 'border-border opacity-75'
                }`}
              >
                <div className={`p-4 flex items-center justify-between ${
                  tier.isCurrent ? `bg-gradient-to-r ${tier.color} text-white` : 'bg-muted/30'
                }`}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{tier.icon}</span>
                    <div>
                      <h3 className={`font-bold text-lg ${tier.isCurrent ? 'text-white' : 'text-foreground'}`}>
                        {tier.name}
                      </h3>
                      <p className={`text-sm ${tier.isCurrent ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {tier.requirements}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${tier.isCurrent ? 'text-white' : 'text-foreground'}`}>
                      {tier.commissionRate}%
                    </p>
                    <p className={`text-xs ${tier.isCurrent ? 'text-white/70' : 'text-muted-foreground'}`}>
                      Commission
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-center text-sm">
                    <div>
                      <p className="text-muted-foreground">Min Sales</p>
                      <p className="font-medium text-foreground">{formatTierCurrency(tier.minSales)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Orders</p>
                      <p className="font-medium text-foreground">{tier.minOrders}+</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Rating</p>
                      <p className="font-medium text-foreground">{tier.minRating}+ ⭐</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response Rate</p>
                      <p className="font-medium text-foreground">{tier.minResponseRate}%+</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tier.benefits?.slice(0, 4).map((benefit, i) => (
                      <span key={i} className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                        {benefit}
                      </span>
                    ))}
                    {tier.benefits?.length > 4 && (
                      <span className="px-2 py-1 bg-muted rounded text-xs text-primary">
                        +{tier.benefits.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                {tier.isCurrent && (
                  <div className="bg-primary/10 px-4 py-2 text-center">
                    <span className="text-primary font-medium text-sm">✓ Your Current Tier</span>
                  </div>
                )}
                {tier.isNext && (
                  <div className="bg-warning/10 px-4 py-2 text-center">
                    <span className="text-warning font-medium text-sm">🎯 Next Tier Goal</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Icon name="TrophyIcon" size={20} className="text-warning" />
                Top Sellers Leaderboard
              </h3>
            </div>
            
            {topSellers.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="UsersIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sellers ranked yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {topSellers.map((seller) => (
                  <div key={seller.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      seller.rank === 1 ? 'bg-yellow-500' :
                      seller.rank === 2 ? 'bg-gray-400' :
                      seller.rank === 3 ? 'bg-amber-600' :
                      'bg-muted text-foreground'
                    }`}>
                      {seller.rank <= 3 ? ['🥇', '🥈', '🥉'][seller.rank - 1] : seller.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {seller.business_name || 'Unnamed Store'}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{seller.tierData?.icon}</span>
                        <span>{seller.tierData?.name}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatTierCurrency(seller.total_sales || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {seller.total_orders || 0} orders • {seller.average_rating || 0}⭐
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tier History */}
        {tierHistory.length > 0 && activeTab === 'overview' && (
          <div className="bg-card rounded-xl p-6 border border-border shadow-card mt-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="ClockIcon" size={20} />
              Tier History
            </h3>
            <div className="space-y-3">
              {tierHistory.map((history, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-2xl">{history.tierData?.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{history.tierData?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Achieved on {formatDate(history.achieved_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </DashboardLayout>
  );
}

