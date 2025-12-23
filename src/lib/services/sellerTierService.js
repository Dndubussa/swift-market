import { supabase } from '../supabase';

/**
 * Seller Tier Service - Handles vendor tier/level system
 */

// Tier definitions with requirements and benefits
const SELLER_TIERS = {
  bronze: {
    id: 'bronze',
    name: 'Bronze Seller',
    icon: '🥉',
    color: 'from-amber-600 to-amber-700',
    bgColor: 'bg-amber-600',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-600',
    minSales: 0,
    minOrders: 0,
    minRating: 0,
    minResponseRate: 0,
    commissionRate: 12, // Platform fee percentage
    benefits: [
      'Access to marketplace',
      'Basic analytics dashboard',
      'Standard support',
      'Up to 50 product listings'
    ],
    requirements: 'Starting tier for all new sellers'
  },
  silver: {
    id: 'silver',
    name: 'Silver Seller',
    icon: '🥈',
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-400',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-400',
    minSales: 500000, // TZS 500,000
    minOrders: 20,
    minRating: 3.5,
    minResponseRate: 70,
    commissionRate: 10,
    benefits: [
      'All Bronze benefits',
      '10% commission rate (vs 12%)',
      'Priority listing placement',
      'Up to 200 product listings',
      'Weekly payouts available',
      'Email marketing tools'
    ],
    requirements: 'TZS 500K+ sales, 20+ orders, 3.5+ rating, 70%+ response rate'
  },
  gold: {
    id: 'gold',
    name: 'Gold Seller',
    icon: '🥇',
    color: 'from-yellow-400 to-yellow-500',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    borderColor: 'border-yellow-500',
    minSales: 2000000, // TZS 2,000,000
    minOrders: 100,
    minRating: 4.0,
    minResponseRate: 80,
    commissionRate: 8,
    benefits: [
      'All Silver benefits',
      '8% commission rate (vs 10%)',
      'Featured seller badge',
      'Up to 500 product listings',
      'Daily payouts available',
      'Dedicated account manager',
      'Advanced analytics',
      'Promotional banner slots'
    ],
    requirements: 'TZS 2M+ sales, 100+ orders, 4.0+ rating, 80%+ response rate'
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum Seller',
    icon: '💎',
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-cyan-500',
    textColor: 'text-cyan-500',
    borderColor: 'border-cyan-500',
    minSales: 10000000, // TZS 10,000,000
    minOrders: 500,
    minRating: 4.5,
    minResponseRate: 90,
    commissionRate: 6,
    benefits: [
      'All Gold benefits',
      '6% commission rate (vs 8%)',
      'Premium seller badge',
      'Unlimited product listings',
      'Instant payouts',
      'Priority support (24/7)',
      'Custom storefront design',
      'Featured in homepage carousel',
      'Early access to new features',
      'Exclusive seller events'
    ],
    requirements: 'TZS 10M+ sales, 500+ orders, 4.5+ rating, 90%+ response rate'
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond Seller',
    icon: '💠',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500',
    minSales: 50000000, // TZS 50,000,000
    minOrders: 2000,
    minRating: 4.8,
    minResponseRate: 95,
    commissionRate: 4,
    benefits: [
      'All Platinum benefits',
      '4% commission rate (lowest)',
      'Diamond elite badge',
      'Zero listing fees',
      'VIP support line',
      'Co-marketing opportunities',
      'Annual seller awards eligibility',
      'Exclusive partnership programs',
      'Revenue share on referrals',
      'Custom API access'
    ],
    requirements: 'TZS 50M+ sales, 2000+ orders, 4.8+ rating, 95%+ response rate'
  }
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

/**
 * Get all tier definitions
 * @returns {Object}
 */
export function getAllTiers() {
  return SELLER_TIERS;
}

/**
 * Get tier by ID
 * @param {string} tierId - The tier ID
 * @returns {Object | null}
 */
export function getTierById(tierId) {
  return SELLER_TIERS[tierId] || null;
}

/**
 * Get tier order
 * @returns {string[]}
 */
export function getTierOrder() {
  return TIER_ORDER;
}

/**
 * Get vendor's current tier status
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object>}
 */
export async function getVendorTierStatus(vendorId) {
  try {
    // Get vendor's performance metrics
    const metrics = await calculateVendorMetrics(vendorId);
    
    // Determine current tier based on metrics
    const currentTier = determineTier(metrics);
    const currentTierData = SELLER_TIERS[currentTier];
    
    // Get next tier (if any)
    const currentIndex = TIER_ORDER.indexOf(currentTier);
    const nextTier = currentIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentIndex + 1] : null;
    const nextTierData = nextTier ? SELLER_TIERS[nextTier] : null;
    
    // Calculate progress to next tier
    const progress = nextTierData ? calculateProgress(metrics, nextTierData) : null;
    
    // Check tier from database (might be manually set or locked)
    const { data: vendorData } = await supabase
      .from('vendor_profiles')
      .select('seller_tier, tier_locked_at')
      .eq('id', vendorId)
      .single();

    // Use database tier if it exists and is higher (grandfathered)
    const effectiveTier = vendorData?.seller_tier && 
      TIER_ORDER.indexOf(vendorData.seller_tier) > currentIndex 
        ? vendorData.seller_tier 
        : currentTier;

    return {
      currentTier: effectiveTier,
      currentTierData: SELLER_TIERS[effectiveTier],
      calculatedTier: currentTier,
      nextTier,
      nextTierData,
      progress,
      metrics,
      isGrandfathered: effectiveTier !== currentTier,
      tierIndex: TIER_ORDER.indexOf(effectiveTier),
      totalTiers: TIER_ORDER.length
    };
  } catch (error) {
    console.error('Error getting vendor tier status:', error);
    return {
      currentTier: 'bronze',
      currentTierData: SELLER_TIERS.bronze,
      calculatedTier: 'bronze',
      nextTier: 'silver',
      nextTierData: SELLER_TIERS.silver,
      progress: null,
      metrics: null,
      isGrandfathered: false,
      tierIndex: 0,
      totalTiers: TIER_ORDER.length
    };
  }
}

/**
 * Calculate vendor's performance metrics
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object>}
 */
async function calculateVendorMetrics(vendorId) {
  try {
    // Get total sales and order count
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('vendor_id', vendorId)
      .eq('status', 'delivered');

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    const totalSales = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    // Get average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from('product_reviews')
      .select('rating, products!inner(vendor_id)')
      .eq('products.vendor_id', vendorId);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    // Calculate response rate (disputes/messages responded to)
    const { data: disputes } = await supabase
      .from('disputes')
      .select('id, vendor_responded_at')
      .eq('vendor_id', vendorId);

    const totalDisputes = disputes?.length || 0;
    const respondedDisputes = disputes?.filter(d => d.vendor_responded_at)?.length || 0;
    const responseRate = totalDisputes > 0 
      ? (respondedDisputes / totalDisputes) * 100 
      : 100; // 100% if no disputes

    // Get this month's performance
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = orders?.filter(o => new Date(o.created_at) >= startOfMonth) || [];
    const monthlySales = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    // Get return rate
    const { count: returnCount } = await supabase
      .from('returns')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);

    const returnRate = totalOrders > 0 
      ? ((returnCount || 0) / totalOrders) * 100 
      : 0;

    return {
      totalSales,
      totalOrders,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      responseRate: Math.round(responseRate),
      monthlySales,
      monthlyOrders: monthlyOrders.length,
      returnRate: Math.round(returnRate * 10) / 10
    };
  } catch (error) {
    console.error('Error calculating vendor metrics:', error);
    return {
      totalSales: 0,
      totalOrders: 0,
      averageRating: 0,
      totalReviews: 0,
      responseRate: 100,
      monthlySales: 0,
      monthlyOrders: 0,
      returnRate: 0
    };
  }
}

/**
 * Determine tier based on metrics
 * @param {Object} metrics - Vendor metrics
 * @returns {string} Tier ID
 */
function determineTier(metrics) {
  // Check tiers from highest to lowest
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    const tierId = TIER_ORDER[i];
    const tier = SELLER_TIERS[tierId];
    
    if (
      metrics.totalSales >= tier.minSales &&
      metrics.totalOrders >= tier.minOrders &&
      metrics.averageRating >= tier.minRating &&
      metrics.responseRate >= tier.minResponseRate
    ) {
      return tierId;
    }
  }
  
  return 'bronze'; // Default tier
}

/**
 * Calculate progress to next tier
 * @param {Object} metrics - Current metrics
 * @param {Object} nextTier - Next tier requirements
 * @returns {Object}
 */
function calculateProgress(metrics, nextTier) {
  const salesProgress = Math.min(100, (metrics.totalSales / nextTier.minSales) * 100);
  const ordersProgress = Math.min(100, (metrics.totalOrders / nextTier.minOrders) * 100);
  const ratingProgress = Math.min(100, (metrics.averageRating / nextTier.minRating) * 100);
  const responseProgress = Math.min(100, (metrics.responseRate / nextTier.minResponseRate) * 100);
  
  const overallProgress = (salesProgress + ordersProgress + ratingProgress + responseProgress) / 4;

  return {
    overall: Math.round(overallProgress),
    sales: {
      current: metrics.totalSales,
      required: nextTier.minSales,
      progress: Math.round(salesProgress),
      remaining: Math.max(0, nextTier.minSales - metrics.totalSales)
    },
    orders: {
      current: metrics.totalOrders,
      required: nextTier.minOrders,
      progress: Math.round(ordersProgress),
      remaining: Math.max(0, nextTier.minOrders - metrics.totalOrders)
    },
    rating: {
      current: metrics.averageRating,
      required: nextTier.minRating,
      progress: Math.round(ratingProgress),
      remaining: Math.max(0, nextTier.minRating - metrics.averageRating)
    },
    response: {
      current: metrics.responseRate,
      required: nextTier.minResponseRate,
      progress: Math.round(responseProgress),
      remaining: Math.max(0, nextTier.minResponseRate - metrics.responseRate)
    }
  };
}

/**
 * Get tier comparison (current vs all tiers)
 * @param {string} currentTier - Current tier ID
 * @returns {Object[]}
 */
export function getTierComparison(currentTier) {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  
  return TIER_ORDER.map((tierId, index) => ({
    ...SELLER_TIERS[tierId],
    isCurrent: tierId === currentTier,
    isAchieved: index <= currentIndex,
    isNext: index === currentIndex + 1,
    tierNumber: index + 1
  }));
}

/**
 * Get tier history for a vendor
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object[]>}
 */
export async function getTierHistory(vendorId) {
  try {
    const { data, error } = await supabase
      .from('vendor_tier_history')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('achieved_at', { ascending: false });

    if (error) {
      console.error('Error fetching tier history:', error);
      return [];
    }

    return (data || []).map(h => ({
      ...h,
      tierData: SELLER_TIERS[h.tier_id]
    }));
  } catch (error) {
    console.error('Error in getTierHistory:', error);
    return [];
  }
}

/**
 * Get leaderboard of top sellers
 * @param {number} limit - Number of sellers to fetch
 * @returns {Promise<Object[]>}
 */
export async function getTopSellers(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select(`
        id,
        business_name,
        logo_url,
        seller_tier,
        total_sales,
        total_orders,
        average_rating
      `)
      .not('seller_tier', 'is', null)
      .order('total_sales', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top sellers:', error);
      return [];
    }

    return (data || []).map((seller, index) => ({
      ...seller,
      rank: index + 1,
      tierData: SELLER_TIERS[seller.seller_tier] || SELLER_TIERS.bronze
    }));
  } catch (error) {
    console.error('Error in getTopSellers:', error);
    return [];
  }
}

/**
 * Update vendor tier in database
 * @param {string} vendorId - The vendor profile ID
 * @param {string} newTier - The new tier ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateVendorTier(vendorId, newTier) {
  try {
    if (!SELLER_TIERS[newTier]) {
      return { success: false, error: 'Invalid tier' };
    }

    const { error } = await supabase
      .from('vendor_profiles')
      .update({
        seller_tier: newTier,
        tier_updated_at: new Date().toISOString()
      })
      .eq('id', vendorId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log tier change in history
    await supabase
      .from('vendor_tier_history')
      .insert({
        vendor_id: vendorId,
        tier_id: newTier,
        achieved_at: new Date().toISOString()
      });

    return { success: true };
  } catch (error) {
    console.error('Error in updateVendorTier:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format currency for display
 * @param {number} amount - Amount in TZS
 * @returns {string}
 */
export function formatTierCurrency(amount) {
  if (amount >= 1000000) {
    return `TZS ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `TZS ${(amount / 1000).toFixed(0)}K`;
  }
  return `TZS ${amount.toLocaleString()}`;
}

