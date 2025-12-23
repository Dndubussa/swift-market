import { supabase } from '../supabase';

/**
 * Payout Service - Handles vendor earnings and payout operations
 */

/**
 * Get vendor balance and earnings summary
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object | null>}
 */
export async function getVendorBalance(vendorId) {
  try {
    // Get vendor wallet/balance
    const { data: wallet, error: walletError } = await supabase
      .from('vendor_wallets')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('Error fetching vendor wallet:', walletError);
    }

    // If no wallet exists, create one
    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('vendor_wallets')
        .insert({
          vendor_id: vendorId,
          available_balance: 0,
          pending_balance: 0,
          total_earned: 0,
          total_withdrawn: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating vendor wallet:', createError);
        return null;
      }
      return newWallet;
    }

    return wallet;
  } catch (error) {
    console.error('Error in getVendorBalance:', error);
    return null;
  }
}

/**
 * Get earnings breakdown by period
 * @param {string} vendorId - The vendor profile ID
 * @param {string} period - 'week' | 'month' | 'year'
 * @returns {Promise<Object>}
 */
export async function getEarningsBreakdown(vendorId, period = 'month') {
  try {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'month':
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get completed orders in period
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_amount, subtotal, shipping_cost, created_at, status')
      .eq('vendor_id', vendorId)
      .eq('status', 'delivered')
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Error fetching earnings:', error);
      return { totalSales: 0, platformFees: 0, netEarnings: 0, orderCount: 0 };
    }

    const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

    const totalSales = orders?.reduce((sum, o) => sum + parseFloat(o.subtotal || 0), 0) || 0;
    const platformFees = totalSales * (PLATFORM_FEE_PERCENT / 100);
    const netEarnings = totalSales - platformFees;

    return {
      totalSales,
      platformFees,
      netEarnings,
      orderCount: orders?.length || 0,
      period
    };
  } catch (error) {
    console.error('Error in getEarningsBreakdown:', error);
    return { totalSales: 0, platformFees: 0, netEarnings: 0, orderCount: 0 };
  }
}

/**
 * Get payout methods for a vendor
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object[]>}
 */
export async function getPayoutMethods(vendorId) {
  try {
    const { data, error } = await supabase
      .from('vendor_payout_methods')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching payout methods:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPayoutMethods:', error);
    return [];
  }
}

/**
 * Add a new payout method
 * @param {string} vendorId - The vendor profile ID
 * @param {Object} methodData - Payout method details
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function addPayoutMethod(vendorId, methodData) {
  try {
    const {
      method_type, // 'bank_transfer' | 'mobile_money' | 'paypal'
      bank_name,
      account_number,
      account_name,
      mobile_network,
      mobile_number,
      paypal_email,
      is_default = false
    } = methodData;

    // If setting as default, unset other defaults first
    if (is_default) {
      await supabase
        .from('vendor_payout_methods')
        .update({ is_default: false })
        .eq('vendor_id', vendorId);
    }

    const { data, error } = await supabase
      .from('vendor_payout_methods')
      .insert({
        vendor_id: vendorId,
        method_type,
        bank_name,
        account_number,
        account_name,
        mobile_network,
        mobile_number,
        paypal_email,
        is_default,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in addPayoutMethod:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a payout method
 * @param {string} methodId - The payout method ID
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deletePayoutMethod(methodId, vendorId) {
  try {
    const { error } = await supabase
      .from('vendor_payout_methods')
      .update({ is_active: false })
      .eq('id', methodId)
      .eq('vendor_id', vendorId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deletePayoutMethod:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set a payout method as default
 * @param {string} methodId - The payout method ID
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function setDefaultPayoutMethod(methodId, vendorId) {
  try {
    // Unset all defaults
    await supabase
      .from('vendor_payout_methods')
      .update({ is_default: false })
      .eq('vendor_id', vendorId);

    // Set new default
    const { error } = await supabase
      .from('vendor_payout_methods')
      .update({ is_default: true })
      .eq('id', methodId)
      .eq('vendor_id', vendorId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in setDefaultPayoutMethod:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Request a payout
 * @param {string} vendorId - The vendor profile ID
 * @param {number} amount - Payout amount
 * @param {string} payoutMethodId - The payout method to use
 * @param {string} notes - Optional notes
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function requestPayout(vendorId, amount, payoutMethodId, notes = '') {
  try {
    // Verify balance
    const wallet = await getVendorBalance(vendorId);
    if (!wallet || wallet.available_balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Minimum payout check
    const MIN_PAYOUT = 10000; // TZS 10,000 minimum
    if (amount < MIN_PAYOUT) {
      return { success: false, error: `Minimum payout is TZS ${MIN_PAYOUT.toLocaleString()}` };
    }

    // Get payout method details
    const { data: payoutMethod, error: methodError } = await supabase
      .from('vendor_payout_methods')
      .select('*')
      .eq('id', payoutMethodId)
      .eq('vendor_id', vendorId)
      .single();

    if (methodError || !payoutMethod) {
      return { success: false, error: 'Invalid payout method' };
    }

    // Generate payout reference
    const payoutRef = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create payout request
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        vendor_id: vendorId,
        payout_method_id: payoutMethodId,
        payout_reference: payoutRef,
        amount,
        currency: 'TZS',
        status: 'pending',
        method_type: payoutMethod.method_type,
        payout_details: {
          bank_name: payoutMethod.bank_name,
          account_number: payoutMethod.account_number,
          account_name: payoutMethod.account_name,
          mobile_network: payoutMethod.mobile_network,
          mobile_number: payoutMethod.mobile_number,
          paypal_email: payoutMethod.paypal_email
        },
        notes
      })
      .select()
      .single();

    if (payoutError) {
      return { success: false, error: payoutError.message };
    }

    // Update wallet balance (move from available to pending)
    const { error: walletError } = await supabase
      .from('vendor_wallets')
      .update({
        available_balance: wallet.available_balance - amount,
        pending_balance: wallet.pending_balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('vendor_id', vendorId);

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      // Rollback payout request
      await supabase.from('payouts').delete().eq('id', payout.id);
      return { success: false, error: 'Failed to update balance' };
    }

    return { success: true, data: payout };
  } catch (error) {
    console.error('Error in requestPayout:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get payout history for a vendor
 * @param {string} vendorId - The vendor profile ID
 * @param {Object} options - Query options
 * @returns {Promise<{payouts: Object[], count: number}>}
 */
export async function getPayoutHistory(vendorId, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('payouts')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching payout history:', error);
      return { payouts: [], count: 0 };
    }

    return { payouts: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error in getPayoutHistory:', error);
    return { payouts: [], count: 0 };
  }
}

/**
 * Get a single payout by ID
 * @param {string} payoutId - The payout ID
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object | null>}
 */
export async function getPayoutById(payoutId, vendorId) {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      console.error('Error fetching payout:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getPayoutById:', error);
    return null;
  }
}

/**
 * Cancel a pending payout request
 * @param {string} payoutId - The payout ID
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function cancelPayout(payoutId, vendorId) {
  try {
    // Get the payout
    const { data: payout, error: fetchError } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .eq('vendor_id', vendorId)
      .single();

    if (fetchError || !payout) {
      return { success: false, error: 'Payout not found' };
    }

    if (payout.status !== 'pending') {
      return { success: false, error: 'Can only cancel pending payouts' };
    }

    // Update payout status
    const { error: updateError } = await supabase
      .from('payouts')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payoutId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Restore balance
    const wallet = await getVendorBalance(vendorId);
    if (wallet) {
      await supabase
        .from('vendor_wallets')
        .update({
          available_balance: wallet.available_balance + payout.amount,
          pending_balance: wallet.pending_balance - payout.amount,
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', vendorId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in cancelPayout:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get payout statistics for vendor
 * @param {string} vendorId - The vendor profile ID
 * @returns {Promise<Object>}
 */
export async function getPayoutStats(vendorId) {
  try {
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select('status, amount')
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error fetching payout stats:', error);
      return null;
    }

    const stats = {
      total: payouts?.length || 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      totalPending: 0,
      totalCompleted: 0
    };

    payouts?.forEach(p => {
      if (stats.hasOwnProperty(p.status)) {
        stats[p.status]++;
      }
      if (p.status === 'pending' || p.status === 'processing') {
        stats.totalPending += parseFloat(p.amount || 0);
      }
      if (p.status === 'completed') {
        stats.totalCompleted += parseFloat(p.amount || 0);
      }
    });

    return stats;
  } catch (error) {
    console.error('Error in getPayoutStats:', error);
    return null;
  }
}

/**
 * ADMIN: Get all pending payouts across vendors
 * @returns {Promise<Object[]>}
 */
export async function getPendingPayouts() {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*, vendor:vendor_profiles(id, business_name, user_id)')
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending payouts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPendingPayouts:', error);
    return [];
  }
}


/**
 * ADMIN: Process a payout (mark processing, complete, or fail)
 * @param {string} payoutId
 * @param {string} action - 'processing' | 'complete' | 'fail'
 * @param {string} adminId
 */
export async function processPayout(payoutId, action = 'processing', adminId = null) {
  try {
    const { data: payout, error: fetchError } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .single();

    if (fetchError || !payout) {
      return { success: false, error: 'Payout not found' };
    }

    if (action === 'processing') {
      const { error } = await supabase
        .from('payouts')
        .update({ status: 'processing', processing_by: adminId, processing_at: new Date().toISOString() })
        .eq('id', payoutId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    if (action === 'complete') {
      const { error: updateError } = await supabase
        .from('payouts')
        .update({ status: 'completed', completed_at: new Date().toISOString(), processed_by: adminId })
        .eq('id', payoutId);

      if (updateError) return { success: false, error: updateError.message };

      // Deduct pending balance and increase total_withdrawn
      const { data: wallet } = await supabase
        .from('vendor_wallets')
        .select('*')
        .eq('vendor_id', payout.vendor_id)
        .single();

      if (wallet) {
        await supabase
          .from('vendor_wallets')
          .update({
            pending_balance: Math.max(0, (wallet.pending_balance || 0) - parseFloat(payout.amount || 0)),
            total_withdrawn: (wallet.total_withdrawn || 0) + parseFloat(payout.amount || 0),
            updated_at: new Date().toISOString()
          })
          .eq('vendor_id', payout.vendor_id);
      }

      return { success: true };
    }

    if (action === 'fail') {
      const { error: failError } = await supabase
        .from('payouts')
        .update({ status: 'failed', failed_at: new Date().toISOString(), processed_by: adminId })
        .eq('id', payoutId);

      if (failError) return { success: false, error: failError.message };

      // Refund amount back to vendor available balance
      const { data: wallet } = await supabase
        .from('vendor_wallets')
        .select('*')
        .eq('vendor_id', payout.vendor_id)
        .single();

      if (wallet) {
        await supabase
          .from('vendor_wallets')
          .update({
            available_balance: (wallet.available_balance || 0) + parseFloat(payout.amount || 0),
            pending_balance: Math.max(0, (wallet.pending_balance || 0) - parseFloat(payout.amount || 0)),
            updated_at: new Date().toISOString()
          })
          .eq('vendor_id', payout.vendor_id);
      }

      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  } catch (error) {
    console.error('Error in processPayout:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get transaction history (earnings, payouts, refunds)
 * @param {string} vendorId - The vendor profile ID
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>}
 */
export async function getTransactionHistory(vendorId, options = {}) {
  try {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Get earnings from delivered orders
    const { data: earnings } = await supabase
      .from('orders')
      .select('id, order_number, subtotal, created_at')
      .eq('vendor_id', vendorId)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get payouts
    const { data: payouts } = await supabase
      .from('payouts')
      .select('id, payout_reference, amount, status, created_at')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get refunds
    const { data: refunds } = await supabase
      .from('returns')
      .select('id, rma_number, refund_amount, completed_at')
      .eq('vendor_id', vendorId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Combine and sort
    const transactions = [
      ...(earnings || []).map(e => ({
        id: e.id,
        type: 'earning',
        reference: e.order_number,
        amount: parseFloat(e.subtotal || 0),
        date: e.created_at,
        description: 'Order completed'
      })),
      ...(payouts || []).map(p => ({
        id: p.id,
        type: 'payout',
        reference: p.payout_reference,
        amount: -parseFloat(p.amount || 0),
        date: p.created_at,
        status: p.status,
        description: `Payout - ${p.status}`
      })),
      ...(refunds || []).map(r => ({
        id: r.id,
        type: 'refund',
        reference: r.rma_number,
        amount: -parseFloat(r.refund_amount || 0),
        date: r.completed_at,
        description: 'Refund processed'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return transactions.slice(0, limit);
  } catch (error) {
    console.error('Error in getTransactionHistory:', error);
    return [];
  }
}

