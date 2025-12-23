import { supabase } from '../supabase';
import { loggerService } from './loggerService';
import { paymentValidator } from './paymentValidator';

/**
 * Escrow Service - Handles all escrow-related operations
 * Includes comprehensive validation to prevent financial errors
 */

/**
 * Validate escrow account data
 * @throws {Error} If validation fails
 */
function validateEscrowData(orderData) {
  if (!orderData) {
    throw new Error('Order data is required');
  }

  const errors = [];
  
  if (!orderData.orderId) errors.push('Order ID is required');
  if (!orderData.buyerId) errors.push('Buyer ID is required');
  if (!orderData.vendorId) errors.push('Vendor ID is required');
  
  // Validate amount
  try {
    paymentValidator.validatePaymentAmount(orderData.amount);
  } catch (error) {
    errors.push(`Invalid amount: ${error.message}`);
  }

  if (errors.length > 0) {
    throw new Error(`Escrow validation failed: ${errors.join('; ')}`);
  }

  return true;
}

/**
 * Create an escrow account for an order
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Escrow account details
 */
export async function createEscrowAccount(orderData) {
  try {
    // Validate input
    validateEscrowData(orderData);

    // Check if escrow account already exists for this order
    const { data: existing } = await supabase
      .from('escrow_accounts')
      .select('id')
      .eq('order_id', orderData.orderId)
      .single();

    if (existing) {
      loggerService.warn('Escrow account already exists for order', {
        operation: 'create_escrow_account',
        orderId: orderData.orderId,
        escrowId: existing.id
      });
      return formatEscrowAccount(existing);
    }

    const { data, error } = await supabase
      .from('escrow_accounts')
      .insert({
        order_id: orderData.orderId,
        buyer_id: orderData.buyerId,
        vendor_id: orderData.vendorId,
        amount: orderData.amount,
        currency: paymentValidator.validateCurrency(orderData.currency || 'TZS')
      })
      .select()
      .single();

    if (error) throw error;

    loggerService.logTransaction('escrow_account_created', {
      orderId: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency || 'TZS',
      userId: orderData.buyerId,
      paymentMethod: 'escrow',
      status: 'created'
    });

    return formatEscrowAccount(data);
  } catch (error) {
    loggerService.error('Error creating escrow account', error, {
      operation: 'create_escrow_account',
      userMessage: 'Failed to create escrow account. Please try again.',
      orderId: orderData?.orderId
    });
    throw error;
  }
}

/**
 * Get escrow account by order ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object|null>} Escrow account details
 */
export async function getEscrowAccountByOrderId(orderId) {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const { data, error } = await supabase
      .from('escrow_accounts')
      .select(`
        *,
        order:orders(
          id,
          order_number,
          status,
          total_amount,
          buyer:user_profiles!orders_buyer_id_fkey(
            id,
            full_name,
            email
          ),
          vendor:vendor_profiles(
            id,
            business_name,
            user:user_profiles(
              id,
              full_name,
              email
            )
          )
        ),
        transactions:escrow_transactions(
          id,
          transaction_type,
          amount,
          currency,
          notes,
          created_at
        ),
        releases:escrow_releases(
          id,
          requester_id,
          approver_id,
          amount,
          status,
          reason,
          notes,
          requested_at,
          approved_at,
          rejected_at
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return formatEscrowAccount(data);
  } catch (error) {
    console.error('Error fetching escrow account:', error);
    throw error;
  }
}

/**
 * Get escrow account by ID
 * @param {string} escrowId - Escrow account ID
 * @returns {Promise<Object|null>} Escrow account details
 */
export async function getEscrowAccountById(escrowId) {
  try {
    const { data, error } = await supabase
      .from('escrow_accounts')
      .select(`
        *,
        order:orders(
          id,
          order_number,
          status,
          total_amount,
          buyer:user_profiles!orders_buyer_id_fkey(
            id,
            full_name,
            email
          ),
          vendor:vendor_profiles(
            id,
            business_name,
            user:user_profiles(
              id,
              full_name,
              email
            )
          )
        ),
        transactions:escrow_transactions(
          id,
          transaction_type,
          amount,
          currency,
          notes,
          created_at
        ),
        releases:escrow_releases(
          id,
          requester_id,
          approver_id,
          amount,
          status,
          reason,
          notes,
          requested_at,
          approved_at,
          rejected_at
        )
      `)
      .eq('id', escrowId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return formatEscrowAccount(data);
  } catch (error) {
    console.error('Error fetching escrow account:', error);
    throw error;
  }
}

/**
 * Fund escrow account (deposit payment) with validation
 * @param {string} escrowId - Escrow account ID
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Updated escrow account
 */
export async function fundEscrowAccount(escrowId, paymentData) {
  try {
    if (!escrowId) {
      throw new Error('Escrow account ID is required');
    }

    if (!paymentData || !paymentData.paymentId) {
      throw new Error('Payment information is required');
    }

    // Fetch current escrow state
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .select('id, status, amount, currency')
      .eq('id', escrowId)
      .single();

    if (escrowError) throw escrowError;
    if (!escrow) throw new Error('Escrow account not found');

    // Prevent funding if already funded or released
    if (['funded', 'released', 'refunded', 'disputed'].includes(escrow.status)) {
      loggerService.warn('Attempting to fund escrow with invalid status', {
        operation: 'fund_escrow_account',
        escrowId,
        currentStatus: escrow.status
      });
      throw new Error(`Cannot fund escrow account with status: ${escrow.status}`);
    }

    // Validate amount matches
    if (paymentData.amount && paymentData.amount !== escrow.amount) {
      loggerService.error('Payment amount mismatch with escrow', new Error('Amount mismatch'), {
        operation: 'fund_escrow_account',
        escrowId,
        escrowAmount: escrow.amount,
        paymentAmount: paymentData.amount,
        userMessage: 'Payment amount does not match order amount'
      });
      throw new Error('Payment amount does not match order amount');
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('escrow_transactions')
      .insert({
        escrow_account_id: escrowId,
        transaction_type: 'deposit',
        amount: escrow.amount,
        currency: escrow.currency,
        payment_id: paymentData.paymentId,
        notes: `Payment received from buyer`
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Update escrow account status
    const { data: updatedEscrow, error: updateError } = await supabase
      .from('escrow_accounts')
      .update({
        status: 'funded',
        funded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (updateError) throw updateError;

    loggerService.logTransaction('escrow_funded', {
      orderId: escrow.orderId,
      amount: escrow.amount,
      currency: escrow.currency,
      userId: paymentData.buyerId,
      paymentMethod: 'escrow_deposit',
      status: 'funded'
    });

    return formatEscrowAccount(updatedEscrow);
  } catch (error) {
    loggerService.error('Error funding escrow account', error, {
      operation: 'fund_escrow_account',
      userMessage: 'Failed to deposit funds into escrow. Please try again.',
      escrowId
    });
    throw error;
  }

}

/**
 * Release funds from escrow to vendor
 * @param {string} escrowId - Escrow account ID
 * @param {string} requesterId - User ID requesting release
 * @param {Object} releaseData - Release information
 * @returns {Promise<Object>} Release request details
 */
export async function requestEscrowRelease(escrowId, requesterId, releaseData) {
  try {
    // Create release request
    const { data: releaseRequest, error: releaseError } = await supabase
      .from('escrow_releases')
      .insert({
        escrow_account_id: escrowId,
        requester_id: requesterId,
        amount: releaseData.amount,
        currency: releaseData.currency || 'TZS',
        reason: releaseData.reason,
        notes: releaseData.notes
      })
      .select()
      .single();

    if (releaseError) throw releaseError;

    // If auto-approval is enabled (for system/admin), approve immediately
    if (releaseData.autoApprove) {
      return await approveEscrowRelease(releaseRequest.id, requesterId);
    }

    return releaseRequest;
  } catch (error) {
    console.error('Error requesting escrow release:', error);
    throw error;
  }
}

/**
 * Approve escrow release (admin/system action)
 * @param {string} releaseId - Release request ID
 * @param {string} approverId - User ID approving release
 * @returns {Promise<Object>} Updated escrow account
 */
export async function approveEscrowRelease(releaseId, approverId) {
  try {
    // Get release request details
    const { data: release, error: releaseError } = await supabase
      .from('escrow_releases')
      .select(`
        id,
        escrow_account_id,
        amount,
        status
      `)
      .eq('id', releaseId)
      .single();

    if (releaseError) throw releaseError;
    if (!release) throw new Error('Release request not found');

    // Verify status is 'pending'
    if (release.status !== 'pending') {
      throw new Error(`Cannot approve release with status: ${release.status}`);
    }

    // Update release request
    const { error: updateReleaseError } = await supabase
      .from('escrow_releases')
      .update({
        status: 'approved',
        approver_id: approverId,
        approved_at: new Date().toISOString()
      })
      .eq('id', releaseId);

    if (updateReleaseError) throw updateReleaseError;

    // Update escrow account status to 'released'
    const { data: updatedEscrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', release.escrow_account_id)
      .select()
      .single();

    if (escrowError) throw escrowError;

    // Create escrow transaction record
    const { error: transactionError } = await supabase
      .from('escrow_transactions')
      .insert({
        escrow_account_id: release.escrow_account_id,
        transaction_type: 'release',
        amount: release.amount,
        currency: 'TZS',
        notes: 'Funds released to vendor'
      });

    if (transactionError) throw transactionError;

    return formatEscrowAccount(updatedEscrow);
  } catch (error) {
    console.error('Error approving escrow release:', error);
    throw error;
  }
}

/**
 * Refund funds from escrow to buyer
 * @param {string} escrowId - Escrow account ID
 * @param {Object} refundData - Refund information
 * @returns {Promise<Object>} Updated escrow account
 */
export async function refundEscrowFunds(escrowId, refundData) {
  try {
    // Update escrow account status to 'refunded'
    const { data: updatedEscrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (escrowError) throw escrowError;

    // Create escrow transaction record
    const { error: transactionError } = await supabase
      .from('escrow_transactions')
      .insert({
        escrow_account_id: escrowId,
        transaction_type: 'refund',
        amount: refundData.amount,
        currency: refundData.currency || 'TZS',
        notes: refundData.reason || 'Funds refunded to buyer'
      });

    if (transactionError) throw transactionError;

    return formatEscrowAccount(updatedEscrow);
  } catch (error) {
    console.error('Error refunding escrow funds:', error);
    throw error;
  }
}

/**
 * Initiate dispute on escrow account
 * @param {string} escrowId - Escrow account ID
 * @param {string} userId - User initiating dispute
 * @param {Object} disputeData - Dispute information
 * @returns {Promise<Object>} Updated escrow account
 */
export async function initiateEscrowDispute(escrowId, userId, disputeData) {
  try {
    // Update escrow account status to 'disputed'
    const { data: updatedEscrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .update({
        status: 'disputed',
        updated_at: new Date().toISOString()
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (escrowError) throw escrowError;

    // Create escrow transaction record for dispute hold
    const { error: transactionError } = await supabase
      .from('escrow_transactions')
      .insert({
        escrow_account_id: escrowId,
        transaction_type: 'dispute_hold',
        amount: disputeData.amount,
        currency: disputeData.currency || 'TZS',
        notes: disputeData.reason || 'Funds frozen due to dispute'
      });

    if (transactionError) throw transactionError;

    // Create dispute record in disputes table (assuming it exists)
    const { error: disputeError } = await supabase
      .from('disputes')
      .insert({
        order_id: updatedEscrow.order_id,
        buyer_id: updatedEscrow.buyer_id,
        vendor_id: updatedEscrow.vendor_id,
        dispute_number: `DISPUTE-${Date.now()}`,
        issue_type: disputeData.issueType || 'other',
        description: disputeData.description,
        status: 'reported'
      });

    if (disputeError) {
      console.warn('Could not create dispute record:', disputeError);
    }

    return formatEscrowAccount(updatedEscrow);
  } catch (error) {
    console.error('Error initiating escrow dispute:', error);
    throw error;
  }
}

/**
 * Resolve escrow dispute
 * @param {string} escrowId - Escrow account ID
 * @param {Object} resolutionData - Resolution information
 * @returns {Promise<Object>} Updated escrow account
 */
export async function resolveEscrowDispute(escrowId, resolutionData) {
  try {
    // Update escrow account status to 'resolved'
    const { data: updatedEscrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .update({
        status: 'resolved',
        updated_at: new Date().toISOString()
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (escrowError) throw escrowError;

    // Handle resolution based on type
    if (resolutionData.resolutionType === 'release') {
      // Release funds to vendor
      await releaseEscrowFunds(escrowId, {
        amount: resolutionData.amount,
        reason: 'Dispute resolved - funds released to vendor'
      });
    } else if (resolutionData.resolutionType === 'refund') {
      // Refund funds to buyer
      await refundEscrowFunds(escrowId, {
        amount: resolutionData.amount,
        reason: 'Dispute resolved - funds refunded to buyer'
      });
    }

    // Update dispute record if exists
    const { error: disputeError } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution_type: resolutionData.resolutionType,
        compensation_amount: resolutionData.amount,
        resolved_at: new Date().toISOString()
      })
      .eq('order_id', updatedEscrow.order_id);

    if (disputeError) {
      console.warn('Could not update dispute record:', disputeError);
    }

    return formatEscrowAccount(updatedEscrow);
  } catch (error) {
    console.error('Error resolving escrow dispute:', error);
    throw error;
  }
}

/**
 * Get escrow accounts for a user (buyer or vendor)
 * @param {string} userId - User ID
 * @param {string} userType - 'buyer' or 'vendor'
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of escrow accounts
 */
export async function getUserEscrowAccounts(userId, userType, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status = null
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('escrow_accounts')
      .select(`
        *,
        order:orders(
          id,
          order_number,
          status,
          total_amount,
          created_at,
          buyer:user_profiles!orders_buyer_id_fkey(
            id,
            full_name
          ),
          vendor:vendor_profiles(
            id,
            business_name
          )
        )
      `);

    // Filter by user type
    if (userType === 'buyer') {
      query = query.eq('buyer_id', userId);
    } else if (userType === 'vendor') {
      query = query.eq('vendor_id', userId);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    return data?.map(formatEscrowAccount) || [];
  } catch (error) {
    console.error('Error fetching user escrow accounts:', error);
    throw error;
  }
}

/**
 * Format escrow account data for consistent API response
 * @param {Object} data - Raw escrow account data
 * @returns {Object} Formatted escrow account data
 */
function formatEscrowAccount(data) {
  if (!data) return null;

  return {
    id: data.id,
    orderId: data.order_id,
    buyerId: data.buyer_id,
    vendorId: data.vendor_id,
    amount: parseFloat(data.amount || 0),
    currency: data.currency,
    status: data.status,
    createdAt: data.created_at,
    fundedAt: data.funded_at,
    releasedAt: data.released_at,
    refundedAt: data.refunded_at,
    updatedAt: data.updated_at,
    order: data.order ? {
      id: data.order.id,
      orderNumber: data.order.order_number,
      status: data.order.status,
      totalAmount: parseFloat(data.order.total_amount || 0),
      createdAt: data.order.created_at,
      buyer: data.order.buyer ? {
        id: data.order.buyer.id,
        fullName: data.order.buyer.full_name
      } : null,
      vendor: data.order.vendor ? {
        id: data.order.vendor.id,
        businessName: data.order.vendor.business_name,
        user: data.order.vendor.user ? {
          id: data.order.vendor.user.id,
          fullName: data.order.vendor.user.full_name
        } : null
      } : null
    } : null,
    transactions: data.transactions?.map(t => ({
      id: t.id,
      transactionType: t.transaction_type,
      amount: parseFloat(t.amount || 0),
      currency: t.currency,
      notes: t.notes,
      createdAt: t.created_at
    })) || [],
    releases: data.releases?.map(r => ({
      id: r.id,
      requesterId: r.requester_id,
      approverId: r.approver_id,
      amount: parseFloat(r.amount || 0),
      status: r.status,
      reason: r.reason,
      notes: r.notes,
      requestedAt: r.requested_at,
      approvedAt: r.approved_at,
      rejectedAt: r.rejected_at
    })) || []
  };
}