import { supabase } from '../supabase';
import { getEscrowAccountByOrderId, requestEscrowRelease, refundEscrowFunds } from './escrowService';

/**
 * Order Service - Handles all order-related operations for vendors
 */

/**
 * Get all orders for a vendor with filtering and pagination
 * @param {string} vendorId - The vendor profile ID
 * @param {Object} options - Query options
 * @returns {Promise<{orders: Object[], count: number}>}
 */
export async function getVendorOrders(vendorId, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status = null,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      dateFrom = null,
      dateTo = null
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select(`
        *,
        buyer:user_profiles!orders_buyer_id_fkey(id, full_name, email, phone, avatar_url),
        order_items(
          id,
          product_id,
          product_name,
          product_image,
          quantity,
          unit_price,
          total_price
        ),
        payments(
          id,
          payment_method,
          payment_status,
          amount,
          transaction_id,
          paid_at
        )
      `, { count: 'exact' })
      .eq('vendor_id', vendorId);

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter (order number or customer name)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,buyer.full_name.ilike.%${search}%`);
    }

    // Apply date range filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor orders:', error);
      return { orders: [], count: 0 };
    }

    return { orders: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error in getVendorOrders:', error);
    return { orders: [], count: 0 };
  }
}

/**
 * Get a single order by ID with full details
 * @param {string} orderId - The order ID
 * @param {string} vendorId - The vendor profile ID (for authorization)
 * @returns {Promise<Object | null>}
 */
export async function getOrderById(orderId, vendorId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_profiles!orders_buyer_id_fkey(
          id, 
          full_name, 
          email, 
          phone, 
          avatar_url
        ),
        order_items(
          id,
          product_id,
          product_name,
          product_image,
          quantity,
          unit_price,
          total_price,
          product:products(
            id,
            name,
            slug,
            is_digital
          )
        ),
        payments(
          id,
          payment_method,
          payment_status,
          amount,
          currency,
          transaction_id,
          clickpesa_reference,
          phone_number,
          paid_at,
          created_at
        )
      `)
      .eq('id', orderId)
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
}

/**
 * Update order status
 * @param {string} orderId - The order ID
 * @param {string} vendorId - The vendor profile ID (for authorization)
 * @param {string} newStatus - The new status
 * @param {string} notes - Optional notes for the status change
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateOrderStatus(orderId, vendorId, newStatus, notes = '') {
  try {
    // Verify the order belongs to the vendor
    const { data: order, error: checkError } = await supabase
      .from('orders')
      .select('id, status, buyer_id')
      .eq('id', orderId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !order) {
      return { success: false, error: 'Order not found or unauthorized' };
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': ['refunded'],
      'cancelled': [],
      'refunded': []
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      return { 
        success: false, 
        error: `Cannot change status from ${order.status} to ${newStatus}` 
      };
    }

    // Update the order
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Create notification for buyer
    await createOrderNotification(order.buyer_id, orderId, newStatus);

    return { success: true };
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add tracking information to an order
 * @param {string} orderId - The order ID
 * @param {string} vendorId - The vendor profile ID
 * @param {string} trackingNumber - The tracking number
 * @param {string} shippingMethod - The shipping carrier/method
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function addTrackingInfo(orderId, vendorId, trackingNumber, shippingMethod = '') {
  try {
    // Verify the order belongs to the vendor
    const { data: order, error: checkError } = await supabase
      .from('orders')
      .select('id, status, buyer_id')
      .eq('id', orderId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !order) {
      return { success: false, error: 'Order not found or unauthorized' };
    }

    // Update the order with tracking info
    const updateData = {
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString()
    };

    if (shippingMethod) {
      updateData.shipping_method = shippingMethod;
    }

    // Auto-update status to shipped if currently processing
    if (order.status === 'processing' || order.status === 'confirmed') {
      updateData.status = 'shipped';
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Notify buyer about shipping
    if (updateData.status === 'shipped') {
      await createOrderNotification(order.buyer_id, orderId, 'shipped', { trackingNumber });
    }

    return { success: true };
  } catch (error) {
    console.error('Error in addTrackingInfo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get order statistics for vendor dashboard
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object>}
 */
export async function getOrderStats(vendorId) {
  try {
    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('orders')
      .select('status')
      .eq('vendor_id', vendorId);

    if (statusError) {
      console.error('Error fetching order stats:', statusError);
      return null;
    }

    const stats = {
      total: statusCounts?.length || 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };

    statusCounts?.forEach(order => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status]++;
      }
    });

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .gte('created_at', today.toISOString());

    stats.today = todayCount || 0;

    // Get this week's revenue
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: weekOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('vendor_id', vendorId)
      .eq('status', 'delivered')
      .gte('created_at', weekAgo.toISOString());

    stats.weekRevenue = weekOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;

    return stats;
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    return null;
  }
}

/**
 * Create a notification for order status change
 * @param {string} userId - The user to notify
 * @param {string} orderId - The order ID
 * @param {string} status - The new status
 * @param {Object} extraData - Additional data for the notification
 */
async function createOrderNotification(userId, orderId, status, extraData = {}) {
  try {
    const notificationTypes = {
      'confirmed': 'order_confirmed',
      'processing': 'order_confirmed',
      'shipped': 'order_shipped',
      'delivered': 'order_delivered',
      'cancelled': 'order_cancelled'
    };

    const titles = {
      'confirmed': 'Order Confirmed',
      'processing': 'Order Being Processed',
      'shipped': 'Order Shipped',
      'delivered': 'Order Delivered',
      'cancelled': 'Order Cancelled'
    };

    const messages = {
      'confirmed': 'Your order has been confirmed and is being prepared.',
      'processing': 'Your order is being processed by the seller.',
      'shipped': extraData.trackingNumber 
        ? `Your order has been shipped! Tracking: ${extraData.trackingNumber}`
        : 'Your order has been shipped!',
      'delivered': 'Your order has been delivered. Enjoy!',
      'cancelled': 'Your order has been cancelled.'
    };

    const type = notificationTypes[status];
    if (!type) return;

    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title: titles[status],
      message: messages[status],
      data: { order_id: orderId, ...extraData },
      link: `/order-tracking?id=${orderId}`
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Bulk update order statuses
 * @param {string[]} orderIds - Array of order IDs
 * @param {string} vendorId - The vendor profile ID
 * @param {string} newStatus - The new status
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function bulkUpdateOrderStatus(orderIds, vendorId, newStatus) {
  let success = 0;
  let failed = 0;

  for (const orderId of orderIds) {
    const result = await updateOrderStatus(orderId, vendorId, newStatus);
    if (result.success) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Get recent orders for dashboard widget
 * @param {string} vendorId - The vendor profile ID
 * @param {number} limit - Number of orders to fetch
 * @returns {Promise<Object[]>}
 */
export async function getRecentOrders(vendorId, limit = 5) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        buyer:user_profiles!orders_buyer_id_fkey(full_name, email),
        order_items(product_name)
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecentOrders:', error);
    return [];
  }
}

/**
 * Export orders to CSV format
 * @param {string} vendorId - The vendor profile ID
 * @param {Object} filters - Export filters
 * @returns {Promise<string>} CSV string
 */
export async function exportOrdersToCSV(vendorId, filters = {}) {
  try {
    const { orders } = await getVendorOrders(vendorId, { ...filters, limit: 1000 });
    
    if (!orders.length) {
      return '';
    }

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Items',
      'Subtotal',
      'Shipping',
      'Tax',
      'Total',
      'Status',
      'Payment Status',
      'Tracking Number'
    ];

    const rows = orders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString(),
      order.buyer?.full_name || 'N/A',
      order.buyer?.email || 'N/A',
      order.order_items?.map(i => `${i.product_name} x${i.quantity}`).join('; ') || '',
      order.subtotal,
      order.shipping_cost,
      order.tax_amount,
      order.total_amount,
      order.status,
      order.payments?.[0]?.payment_status || 'N/A',
      order.tracking_number || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error exporting orders:', error);
    return '';
  }
}

/**
 * Request escrow release for an order
 * @param {string} orderId - The order ID
 * @param {string} userId - The user requesting release
 * @param {Object} releaseData - Release information
 * @returns {Promise<Object>} Release request details
 */
export async function requestOrderEscrowRelease(orderId, userId, releaseData) {
  try {
    // Get escrow account for the order
    const escrowAccount = await getEscrowAccountByOrderId(orderId);
    
    if (!escrowAccount) {
      return { success: false, error: 'No escrow account found for this order' };
    }
    
    // Request escrow release
    const releaseRequest = await requestEscrowRelease(escrowAccount.id, userId, releaseData);
    
    return { success: true, releaseRequest };
  } catch (error) {
    console.error('Error requesting escrow release:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Refund order through escrow
 * @param {string} orderId - The order ID
 * @param {Object} refundData - Refund information
 * @returns {Promise<Object>} Refund details
 */
export async function refundOrderThroughEscrow(orderId, refundData) {
  try {
    // Get escrow account for the order
    const escrowAccount = await getEscrowAccountByOrderId(orderId);
    
    if (!escrowAccount) {
      return { success: false, error: 'No escrow account found for this order' };
    }
    
    // Refund through escrow
    const updatedEscrow = await refundEscrowFunds(escrowAccount.id, refundData);
    
    return { success: true, escrowAccount: updatedEscrow };
  } catch (error) {
    console.error('Error refunding through escrow:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get escrow information for an order
 * @param {string} orderId - The order ID
 * @returns {Promise<Object|null>} Escrow account details
 */
export async function getOrderEscrowInfo(orderId) {
  try {
    return await getEscrowAccountByOrderId(orderId);
  } catch (error) {
    console.error('Error fetching escrow info:', error);
    return null;
  }
}
