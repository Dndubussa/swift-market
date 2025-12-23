import { supabase } from '../supabase';

/**
 * Return Service - Handles all return-related operations for vendors
 */

const RETURN_REASONS = {
  defective: 'Product is defective',
  wrong_item: 'Wrong item received',
  not_as_described: 'Item not as described',
  damaged: 'Item arrived damaged',
  size_issue: 'Size/fit issue',
  changed_mind: 'Changed my mind',
  quality_issue: 'Quality not as expected',
  other: 'Other reason'
};

/**
 * Get all returns for a vendor with filtering and pagination
 * @param {string} vendorId - The vendor profile ID
 * @param {Object} options - Query options
 * @returns {Promise<{returns: Object[], count: number}>}
 */
export async function getVendorReturns(vendorId, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status = null,
      search = '',
      sortBy = 'requested_at',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('returns')
      .select(`
        *,
        buyer:user_profiles!returns_buyer_id_fkey(id, full_name, email, phone, avatar_url),
        order:orders!returns_order_id_fkey(
          id,
          order_number,
          total_amount,
          created_at
        ),
        return_items(
          id,
          quantity,
          refund_amount,
          order_item:order_items(
            id,
            product_name,
            product_image,
            unit_price,
            quantity
          )
        )
      `, { count: 'exact' })
      .eq('vendor_id', vendorId);

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter (RMA number or customer name)
    if (search) {
      query = query.or(`rma_number.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor returns:', error);
      return { returns: [], count: 0 };
    }

    // Add readable reason
    const returnsWithReason = (data || []).map(r => ({
      ...r,
      reason_label: RETURN_REASONS[r.return_reason] || r.return_reason
    }));

    return { returns: returnsWithReason, count: count || 0 };
  } catch (error) {
    console.error('Error in getVendorReturns:', error);
    return { returns: [], count: 0 };
  }
}

/**
 * Get a single return by ID with full details
 * @param {string} returnId - The return ID
 * @param {string} vendorId - The vendor profile ID (for authorization)
 * @returns {Promise<Object | null>}
 */
export async function getReturnById(returnId, vendorId) {
  try {
    const { data, error } = await supabase
      .from('returns')
      .select(`
        *,
        buyer:user_profiles!returns_buyer_id_fkey(
          id, 
          full_name, 
          email, 
          phone, 
          avatar_url
        ),
        order:orders!returns_order_id_fkey(
          id,
          order_number,
          status,
          total_amount,
          subtotal,
          shipping_cost,
          shipping_address,
          created_at,
          payments(
            id,
            payment_method,
            payment_status,
            amount,
            transaction_id
          )
        ),
        return_items(
          id,
          quantity,
          refund_amount,
          order_item:order_items(
            id,
            product_id,
            product_name,
            product_image,
            unit_price,
            quantity,
            total_price
          )
        )
      `)
      .eq('id', returnId)
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      console.error('Error fetching return:', error);
      return null;
    }

    // Add readable reason
    if (data) {
      data.reason_label = RETURN_REASONS[data.return_reason] || data.return_reason;
    }

    return data;
  } catch (error) {
    console.error('Error in getReturnById:', error);
    return null;
  }
}

/**
 * Approve a return request
 * @param {string} returnId - The return ID
 * @param {string} vendorId - The vendor profile ID
 * @param {string} vendorNotes - Optional notes from vendor
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function approveReturn(returnId, vendorId, vendorNotes = '') {
  try {
    // Verify the return belongs to the vendor
    const { data: returnData, error: checkError } = await supabase
      .from('returns')
      .select('id, status, buyer_id, order_id')
      .eq('id', returnId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !returnData) {
      return { success: false, error: 'Return not found or unauthorized' };
    }

    if (returnData.status !== 'pending') {
      return { success: false, error: 'Return has already been processed' };
    }

    // Update return status
    const { error: updateError } = await supabase
      .from('returns')
      .update({
        status: 'approved',
        vendor_notes: vendorNotes,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', returnId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Notify buyer
    await createReturnNotification(returnData.buyer_id, returnId, 'approved');

    return { success: true };
  } catch (error) {
    console.error('Error in approveReturn:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reject a return request
 * @param {string} returnId - The return ID
 * @param {string} vendorId - The vendor profile ID
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function rejectReturn(returnId, vendorId, rejectionReason) {
  try {
    if (!rejectionReason?.trim()) {
      return { success: false, error: 'Rejection reason is required' };
    }

    // Verify the return belongs to the vendor
    const { data: returnData, error: checkError } = await supabase
      .from('returns')
      .select('id, status, buyer_id')
      .eq('id', returnId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !returnData) {
      return { success: false, error: 'Return not found or unauthorized' };
    }

    if (returnData.status !== 'pending') {
      return { success: false, error: 'Return has already been processed' };
    }

    // Update return status
    const { error: updateError } = await supabase
      .from('returns')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', returnId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Notify buyer
    await createReturnNotification(returnData.buyer_id, returnId, 'rejected', { reason: rejectionReason });

    return { success: true };
  } catch (error) {
    console.error('Error in rejectReturn:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark a return as processing (items received)
 * @param {string} returnId - The return ID
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function markReturnProcessing(returnId, vendorId) {
  try {
    const { data: returnData, error: checkError } = await supabase
      .from('returns')
      .select('id, status, buyer_id')
      .eq('id', returnId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !returnData) {
      return { success: false, error: 'Return not found or unauthorized' };
    }

    if (returnData.status !== 'approved') {
      return { success: false, error: 'Return must be approved first' };
    }

    const { error: updateError } = await supabase
      .from('returns')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', returnId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in markReturnProcessing:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Complete a return and process refund
 * @param {string} returnId - The return ID
 * @param {string} vendorId - The vendor profile ID
 * @param {number} refundAmount - Amount to refund
 * @param {string} refundMethod - Refund method
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function completeReturn(returnId, vendorId, refundAmount, refundMethod = 'original_payment') {
  try {
    const { data: returnData, error: checkError } = await supabase
      .from('returns')
      .select('id, status, buyer_id, order_id')
      .eq('id', returnId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !returnData) {
      return { success: false, error: 'Return not found or unauthorized' };
    }

    if (!['approved', 'processing'].includes(returnData.status)) {
      return { success: false, error: 'Return must be approved or processing' };
    }

    // Update return status
    const { error: updateError } = await supabase
      .from('returns')
      .update({
        status: 'completed',
        refund_status: 'completed',
        refund_amount: refundAmount,
        refund_method: refundMethod,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', returnId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Update order status to refunded if full refund
    const { data: orderData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', returnData.order_id)
      .single();

    if (orderData && refundAmount >= parseFloat(orderData.total_amount)) {
      await supabase
        .from('orders')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', returnData.order_id);
    }

    // Notify buyer
    await createReturnNotification(returnData.buyer_id, returnId, 'completed', { 
      refundAmount,
      refundMethod 
    });

    return { success: true };
  } catch (error) {
    console.error('Error in completeReturn:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get return statistics for vendor dashboard
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object>}
 */
export async function getReturnStats(vendorId) {
  try {
    const { data: statusCounts, error } = await supabase
      .from('returns')
      .select('status')
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error fetching return stats:', error);
      return null;
    }

    const stats = {
      total: statusCounts?.length || 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    };

    statusCounts?.forEach(r => {
      if (stats.hasOwnProperty(r.status)) {
        stats[r.status]++;
      }
    });

    // Calculate refund total
    const { data: refunds } = await supabase
      .from('returns')
      .select('refund_amount')
      .eq('vendor_id', vendorId)
      .eq('refund_status', 'completed');

    stats.totalRefunded = refunds?.reduce((sum, r) => sum + parseFloat(r.refund_amount || 0), 0) || 0;

    return stats;
  } catch (error) {
    console.error('Error in getReturnStats:', error);
    return null;
  }
}

/**
 * Create a notification for return status change
 */
async function createReturnNotification(userId, returnId, status, extraData = {}) {
  try {
    const titles = {
      'approved': 'Return Request Approved',
      'rejected': 'Return Request Rejected',
      'completed': 'Refund Processed'
    };

    const messages = {
      'approved': 'Your return request has been approved. Please ship the item back.',
      'rejected': `Your return request has been rejected. Reason: ${extraData.reason || 'Contact support for details.'}`,
      'completed': `Your refund of TZS ${parseFloat(extraData.refundAmount || 0).toLocaleString()} has been processed.`
    };

    const type = status === 'approved' ? 'return_approved' : 
                 status === 'rejected' ? 'return_rejected' : 
                 'refund_processed';

    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title: titles[status],
      message: messages[status],
      data: { return_id: returnId, ...extraData },
      link: `/buyer-dashboard/returns/${returnId}`
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Get return reasons for display
 */
export function getReturnReasons() {
  return RETURN_REASONS;
}


/**
 * ADMIN: Get all returns across platform (for admin dashboard)
 * @param {Object} options
 * @returns {Promise<{returns: Object[], count: number}>}
 */
export async function getAllReturns(options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status = null,
      search = '',
      sortBy = 'requested_at',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('returns')
      .select(`*, buyer:user_profiles!returns_buyer_id_fkey(id, full_name, email), vendor:vendor_profiles(id, business_name), order:orders(id, order_number, total_amount)`, { count: 'exact' });

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(`rma_number.ilike.%${search}%`);

    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error('Error fetching all returns:', error);
      return { returns: [], count: 0 };
    }

    const returnsWithReason = (data || []).map(r => ({ ...r, reason_label: RETURN_REASONS[r.return_reason] || r.return_reason }));
    return { returns: returnsWithReason, count: count || 0 };
  } catch (error) {
    console.error('Error in getAllReturns:', error);
    return { returns: [], count: 0 };
  }
}


/**
 * ADMIN: Update return status as admin (approve/reject/complete)
 * @param {string} returnId
 * @param {string} status
 * @param {string} adminNotes
 */
export async function adminUpdateReturnStatus(returnId, status, adminNotes = '') {
  try {
    const allowed = ['approved','rejected','processing','completed','cancelled'];
    if (!allowed.includes(status)) return { success: false, error: 'Invalid status' };

    const { error } = await supabase
      .from('returns')
      .update({ status, admin_notes: adminNotes, updated_at: new Date().toISOString() })
      .eq('id', returnId);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (error) {
    console.error('Error in adminUpdateReturnStatus:', error);
    return { success: false, error: error.message };
  }
}
