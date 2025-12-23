import { supabase } from '../supabase';

/**
 * Dispute Service - Handles dispute/ticket management for vendors
 */

const DISPUTE_TYPES = {
  product_issue: 'Product Issue',
  shipping_issue: 'Shipping Problem',
  payment_issue: 'Payment Issue',
  communication: 'Communication Problem',
  fraud: 'Suspected Fraud',
  return_issue: 'Return/Refund Issue',
  quality: 'Quality Complaint',
  other: 'Other'
};

const DISPUTE_PRIORITIES = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-warning' },
  high: { label: 'High', color: 'text-error' },
  urgent: { label: 'Urgent', color: 'text-error' }
};

/**
 * Get all disputes for a vendor with filtering and pagination
 * @param {string} vendorId - The vendor profile ID
 * @param {Object} options - Query options
 * @returns {Promise<{disputes: Object[], count: number}>}
 */
export async function getVendorDisputes(vendorId, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status = null,
      priority = null,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('disputes')
      .select(`
        *,
        buyer:user_profiles!disputes_buyer_id_fkey(id, full_name, email, avatar_url),
        order:orders!disputes_order_id_fkey(
          id,
          order_number,
          total_amount,
          status
        ),
        dispute_messages(
          id,
          message,
          sender_type,
          created_at
        )
      `, { count: 'exact' })
      .eq('vendor_id', vendorId);

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply priority filter
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    // Apply search filter (ticket number or subject)
    if (search) {
      query = query.or(`ticket_number.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor disputes:', error);
      return { disputes: [], count: 0 };
    }

    // Add readable type
    const disputesWithType = (data || []).map(d => ({
      ...d,
      type_label: DISPUTE_TYPES[d.dispute_type] || d.dispute_type,
      message_count: d.dispute_messages?.length || 0,
      last_message: d.dispute_messages?.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0]
    }));

    return { disputes: disputesWithType, count: count || 0 };
  } catch (error) {
    console.error('Error in getVendorDisputes:', error);
    return { disputes: [], count: 0 };
  }
}

/**
 * Get a single dispute by ID with full details
 * @param {string} disputeId - The dispute ID
 * @param {string} vendorId - The vendor profile ID (for authorization)
 * @returns {Promise<Object | null>}
 */
export async function getDisputeById(disputeId, vendorId) {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        buyer:user_profiles!disputes_buyer_id_fkey(
          id, 
          full_name, 
          email, 
          phone,
          avatar_url
        ),
        order:orders!disputes_order_id_fkey(
          id,
          order_number,
          status,
          total_amount,
          subtotal,
          shipping_cost,
          created_at,
          shipping_address,
          order_items(
            id,
            product_name,
            product_image,
            quantity,
            unit_price,
            total_price
          )
        ),
        dispute_messages(
          id,
          message,
          sender_type,
          sender_id,
          attachments,
          created_at
        )
      `)
      .eq('id', disputeId)
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      console.error('Error fetching dispute:', error);
      return null;
    }

    // Add readable type and sort messages
    if (data) {
      data.type_label = DISPUTE_TYPES[data.dispute_type] || data.dispute_type;
      data.dispute_messages = data.dispute_messages?.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      ) || [];
    }

    return data;
  } catch (error) {
    console.error('Error in getDisputeById:', error);
    return null;
  }
}

/**
 * Add a response to a dispute
 * @param {string} disputeId - The dispute ID
 * @param {string} vendorId - The vendor profile ID
 * @param {string} message - The response message
 * @param {string[]} attachments - Optional attachment URLs
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function addDisputeResponse(disputeId, vendorId, message, attachments = []) {
  try {
    if (!message?.trim()) {
      return { success: false, error: 'Message is required' };
    }

    // Verify the dispute belongs to the vendor
    const { data: dispute, error: checkError } = await supabase
      .from('disputes')
      .select('id, status, buyer_id')
      .eq('id', disputeId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !dispute) {
      return { success: false, error: 'Dispute not found or unauthorized' };
    }

    if (dispute.status === 'closed' || dispute.status === 'resolved') {
      return { success: false, error: 'Cannot respond to a closed dispute' };
    }

    // Add the message
    const { error: messageError } = await supabase
      .from('dispute_messages')
      .insert({
        dispute_id: disputeId,
        sender_type: 'vendor',
        sender_id: vendorId,
        message: message.trim(),
        attachments: attachments.length > 0 ? attachments : null
      });

    if (messageError) {
      return { success: false, error: messageError.message };
    }

    // Update dispute status if it was awaiting vendor response
    if (dispute.status === 'awaiting_vendor') {
      await supabase
        .from('disputes')
        .update({
          status: 'in_progress',
          vendor_responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);
    } else {
      await supabase
        .from('disputes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', disputeId);
    }

    // Notify buyer
    await createDisputeNotification(dispute.buyer_id, disputeId, 'vendor_response');

    return { success: true };
  } catch (error) {
    console.error('Error in addDisputeResponse:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Propose a resolution for a dispute
 * @param {string} disputeId - The dispute ID
 * @param {string} vendorId - The vendor profile ID
 * @param {string} resolution - Resolution proposal
 * @param {string} resolutionType - Type of resolution (refund, replacement, etc.)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function proposeResolution(disputeId, vendorId, resolution, resolutionType) {
  try {
    const { data: dispute, error: checkError } = await supabase
      .from('disputes')
      .select('id, status, buyer_id')
      .eq('id', disputeId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !dispute) {
      return { success: false, error: 'Dispute not found or unauthorized' };
    }

    if (['closed', 'resolved'].includes(dispute.status)) {
      return { success: false, error: 'Dispute is already closed' };
    }

    // Update dispute with proposed resolution
    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'resolution_proposed',
        proposed_resolution: resolution,
        resolution_type: resolutionType,
        resolution_proposed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', disputeId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Add message about resolution
    await supabase
      .from('dispute_messages')
      .insert({
        dispute_id: disputeId,
        sender_type: 'system',
        message: `Vendor proposed a resolution: ${resolutionType?.replace('_', ' ')} - ${resolution}`
      });

    // Notify buyer
    await createDisputeNotification(dispute.buyer_id, disputeId, 'resolution_proposed', {
      resolutionType,
      resolution
    });

    return { success: true };
  } catch (error) {
    console.error('Error in proposeResolution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Escalate a dispute to admin
 * @param {string} disputeId - The dispute ID
 * @param {string} vendorId - The vendor profile ID
 * @param {string} reason - Reason for escalation
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function escalateDispute(disputeId, vendorId, reason) {
  try {
    const { data: dispute, error: checkError } = await supabase
      .from('disputes')
      .select('id, status, buyer_id')
      .eq('id', disputeId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !dispute) {
      return { success: false, error: 'Dispute not found or unauthorized' };
    }

    if (['closed', 'resolved', 'escalated'].includes(dispute.status)) {
      return { success: false, error: 'Cannot escalate this dispute' };
    }

    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'escalated',
        escalated_at: new Date().toISOString(),
        escalation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', disputeId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Add system message
    await supabase
      .from('dispute_messages')
      .insert({
        dispute_id: disputeId,
        sender_type: 'system',
        message: `Dispute escalated to admin review. Reason: ${reason}`
      });

    // Notify buyer
    await createDisputeNotification(dispute.buyer_id, disputeId, 'escalated');

    return { success: true };
  } catch (error) {
    console.error('Error in escalateDispute:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Close a dispute (mark as resolved by vendor)
 * @param {string} disputeId - The dispute ID
 * @param {string} vendorId - The vendor profile ID
 * @param {string} closureNotes - Notes about the resolution
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function closeDispute(disputeId, vendorId, closureNotes = '') {
  try {
    const { data: dispute, error: checkError } = await supabase
      .from('disputes')
      .select('id, status, buyer_id')
      .eq('id', disputeId)
      .eq('vendor_id', vendorId)
      .single();

    if (checkError || !dispute) {
      return { success: false, error: 'Dispute not found or unauthorized' };
    }

    if (['closed', 'resolved'].includes(dispute.status)) {
      return { success: false, error: 'Dispute is already closed' };
    }

    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        closure_notes: closureNotes,
        resolved_by: 'vendor',
        updated_at: new Date().toISOString()
      })
      .eq('id', disputeId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Add system message
    await supabase
      .from('dispute_messages')
      .insert({
        dispute_id: disputeId,
        sender_type: 'system',
        message: `Dispute marked as resolved by vendor. ${closureNotes ? `Notes: ${closureNotes}` : ''}`
      });

    // Notify buyer
    await createDisputeNotification(dispute.buyer_id, disputeId, 'resolved');

    return { success: true };
  } catch (error) {
    console.error('Error in closeDispute:', error);
    return { success: false, error: error.message };
  }
}


/**
 * ADMIN: Escalate a dispute without vendor-scoped check
 * @param {string} disputeId
 * @param {string} reason
 */
export async function adminEscalateDispute(disputeId, reason = 'Escalated by admin') {
  try {
    const { data: dispute, error: checkError } = await supabase
      .from('disputes')
      .select('id, status, buyer_id')
      .eq('id', disputeId)
      .single();

    if (checkError || !dispute) {
      return { success: false, error: 'Dispute not found' };
    }

    if (['closed', 'resolved', 'escalated'].includes(dispute.status)) {
      return { success: false, error: 'Cannot escalate this dispute' };
    }

    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'escalated',
        escalated_at: new Date().toISOString(),
        escalation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', disputeId);

    if (updateError) return { success: false, error: updateError.message };

    await supabase.from('dispute_messages').insert({ dispute_id: disputeId, sender_type: 'system', message: `Dispute escalated by admin. Reason: ${reason}` });
    await createDisputeNotification(dispute.buyer_id, disputeId, 'escalated');

    return { success: true };
  } catch (error) {
    console.error('Error in adminEscalateDispute:', error);
    return { success: false, error: error.message };
  }
}


/**
 * ADMIN: Close a dispute as admin
 * @param {string} disputeId
 * @param {string} closureNotes
 */
export async function adminCloseDispute(disputeId, closureNotes = '') {
  try {
    const { data: dispute, error: checkError } = await supabase
      .from('disputes')
      .select('id, status, buyer_id')
      .eq('id', disputeId)
      .single();

    if (checkError || !dispute) {
      return { success: false, error: 'Dispute not found' };
    }

    if (['closed', 'resolved'].includes(dispute.status)) {
      return { success: false, error: 'Dispute is already closed' };
    }

    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        closure_notes: closureNotes,
        resolved_by: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', disputeId);

    if (updateError) return { success: false, error: updateError.message };

    await supabase.from('dispute_messages').insert({ dispute_id: disputeId, sender_type: 'system', message: `Dispute resolved by admin. Notes: ${closureNotes}` });
    await createDisputeNotification(dispute.buyer_id, disputeId, 'resolved');

    return { success: true };
  } catch (error) {
    console.error('Error in adminCloseDispute:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get dispute statistics for vendor dashboard
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object>}
 */
export async function getDisputeStats(vendorId) {
  try {
    const { data: disputes, error } = await supabase
      .from('disputes')
      .select('status, priority')
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error fetching dispute stats:', error);
      return null;
    }

    const stats = {
      total: disputes?.length || 0,
      open: 0,
      awaiting_vendor: 0,
      in_progress: 0,
      resolution_proposed: 0,
      escalated: 0,
      resolved: 0,
      closed: 0,
      high_priority: 0,
      urgent: 0
    };

    disputes?.forEach(d => {
      if (stats.hasOwnProperty(d.status)) {
        stats[d.status]++;
      }
      // Count open (not resolved/closed)
      if (!['resolved', 'closed'].includes(d.status)) {
        stats.open++;
      }
      if (d.priority === 'high') stats.high_priority++;
      if (d.priority === 'urgent') stats.urgent++;
    });

    return stats;
  } catch (error) {
    console.error('Error in getDisputeStats:', error);
    return null;
  }
}

/**
 * Create a notification for dispute updates
 */
async function createDisputeNotification(userId, disputeId, type, extraData = {}) {
  try {
    const titles = {
      'vendor_response': 'New Response on Your Dispute',
      'resolution_proposed': 'Resolution Proposed',
      'escalated': 'Dispute Escalated',
      'resolved': 'Dispute Resolved'
    };

    const messages = {
      'vendor_response': 'The vendor has responded to your dispute.',
      'resolution_proposed': `A resolution has been proposed: ${extraData.resolutionType?.replace('_', ' ')}`,
      'escalated': 'Your dispute has been escalated to admin review.',
      'resolved': 'Your dispute has been marked as resolved.'
    };

    await supabase.from('notifications').insert({
      user_id: userId,
      type: `dispute_${type}`,
      title: titles[type],
      message: messages[type],
      data: { dispute_id: disputeId, ...extraData },
      link: `/buyer-dashboard/disputes/${disputeId}`
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Get dispute types for display
 */
export function getDisputeTypes() {
  return DISPUTE_TYPES;
}

/**
 * Get dispute priorities for display
 */
export function getDisputePriorities() {
  return DISPUTE_PRIORITIES;
}
