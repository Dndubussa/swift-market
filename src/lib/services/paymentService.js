import { supabase } from '../supabase';
import { getEscrowAccountByOrderId, fundEscrowAccount } from './escrowService';
import { loggerService } from './loggerService';
import { paymentValidator } from './paymentValidator';
import { fetchWithTimeout } from './timeoutService';
import { checkIdempotencyKey, storeIdempotencyKey, generateIdempotencyKey } from './idempotencyService';

/**
 * Validate ClickPesa configuration on load
 */
function initializeClickPesaConfig() {
  const config = {
    baseUrl: process.env.CLICKPESA_ENVIRONMENT === 'production' 
      ? 'https://api.clickpesa.com/v1' 
      : 'https://sandbox.clickpesa.com/v1',
    apiKey: process.env.CLICKPESA_API_KEY,
    merchantId: process.env.CLICKPESA_MERCHANT_ID,
  };

  // Validate in production only
  if (process.env.NODE_ENV === 'production') {
    try {
      paymentValidator.validateClickPesaConfig();
    } catch (error) {
      loggerService.critical('ClickPesa configuration validation failed', error, {
        operation: 'initialize_clickpesa'
      });
    }
  }

  return config;
}

const CLICKPESA_CONFIG = initializeClickPesaConfig();

export const paymentService = {
  /**
   * Create a payment record in the database with validation
   */
  async create(paymentData) {
    try {
      // Validate payment data
      paymentValidator.validatePaymentData(paymentData);

      const sanitized = paymentValidator.sanitizePaymentForLogging(paymentData);
      loggerService.debug('Creating payment record', { operation: 'create_payment', ...sanitized });

      const { data, error } = await supabase?.from('payments')?.insert({
        order_id: paymentData?.orderId,
        payment_method: paymentData?.paymentMethod,
        payment_status: 'pending',
        amount: paymentData?.amount,
        currency: paymentData?.currency || 'TZS',
        phone_number: paymentData?.phoneNumber,
        payment_details: paymentData?.paymentDetails
      })?.select()?.single();

      if (error) {
        throw error;
      }

      loggerService.logTransaction('payment_created', {
        orderId: paymentData?.orderId,
        amount: paymentData?.amount,
        currency: paymentData?.currency || 'TZS',
        userId: paymentData?.buyerId,
        paymentMethod: paymentData?.paymentMethod,
        status: 'pending'
      });

      return this.formatPayment(data);
    } catch (error) {
      loggerService.error('Error creating payment record', error, {
        operation: 'create_payment',
        userMessage: 'Failed to initiate payment. Please try again.',
        data: paymentValidator.sanitizePaymentForLogging(paymentData)
      });
      throw error;
    }
  },

  /**
   * Initialize ClickPesa mobile money payment with improved error handling
   */
  async initializeMobileMoneyPayment(paymentData) {
    let payment = null;
    
    try {
      // Validate input
      paymentValidator.validatePaymentData(paymentData);
      paymentValidator.validatePhoneNumber(paymentData.phoneNumber);

      // Create idempotency key to prevent duplicate charges
      const idempotencyKey = generateIdempotencyKey(
        'payment',
        paymentData.orderId,
        'mobilemoney'
      );

      // Check if this payment was already initiated
      const previousResult = await checkIdempotencyKey(idempotencyKey);
      if (previousResult) {
        loggerService.info('Payment request replayed - returning cached result', {
          operation: 'initialize_mobile_money',
          orderId: paymentData.orderId,
          idempotencyKey
        });
        return JSON.parse(previousResult);
      }

      // Create payment record first
      payment = await this.create(paymentData);

      // Format phone number for Tanzania
      let phoneNumber = paymentValidator.validatePhoneNumber(paymentData.phoneNumber);
      
      // Ensure proper Tanzania format
      if (!phoneNumber.startsWith('+255')) {
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '+255' + phoneNumber.substring(1);
        } else if (phoneNumber.startsWith('255')) {
          phoneNumber = '+' + phoneNumber;
        } else {
          throw new Error('Invalid Tanzania phone number format');
        }
      }

      // Determine payment provider
      const provider = this.detectMobileProvider(phoneNumber);

      // Check if ClickPesa is configured
      if (!CLICKPESA_CONFIG.apiKey || !CLICKPESA_CONFIG.merchantId) {
        loggerService.warn('ClickPesa not configured - using development mode', {
          operation: 'initialize_mobile_money',
          orderId: paymentData.orderId
        });

        const devResult = {
          paymentId: payment?.id,
          clickpesaReference: `CLICK-DEV-${Date.now()}`,
          status: 'pending',
          provider: provider,
          message: 'Development mode: Payment initialized. In production, you would receive a payment prompt on your phone.',
          isDevelopment: true,
        };

        // Store in idempotency cache
        await storeIdempotencyKey(idempotencyKey, devResult);
        return devResult;
      }

      // ClickPesa API request payload
      const clickPesaPayload = {
        merchant_id: CLICKPESA_CONFIG.merchantId,
        amount: paymentData?.amount,
        currency: paymentData?.currency || 'TZS',
        payment_method: provider,
        phone_number: phoneNumber,
        reference: payment?.id,
        callback_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clickpesa-webhook`,
        description: `Payment for order ${paymentData?.orderNumber || ''}`,
        metadata: {
          order_id: paymentData?.orderId,
          order_number: paymentData?.orderNumber,
          buyer_id: paymentData?.buyerId,
        }
      };

      // Make ClickPesa API call with timeout
      const response = await fetchWithTimeout(
        `${CLICKPESA_CONFIG.baseUrl}/payments/mobile-money`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CLICKPESA_CONFIG.apiKey}`,
            'X-Merchant-ID': CLICKPESA_CONFIG.merchantId,
          },
          body: JSON.stringify(clickPesaPayload)
        },
        30000,
        'clickpesa_mobile_money_payment'
      );

      const responseData = await response.json();

      if (!response.ok) {
        // Update payment with error status
        await this.updateStatus(payment?.id, {
          paymentStatus: 'failed',
          errorMessage: responseData?.message || 'Payment initialization failed',
        });

        const error = new Error(responseData?.message || 'ClickPesa API error');
        error.status = response.status;
        error.code = responseData?.code || 'CLICKPESA_ERROR';
        
        throw error;
      }

      // Update payment with ClickPesa reference
      await supabase?.from('payments')?.update({
        clickpesa_reference: responseData?.transaction_id,
        payment_status: 'processing',
        payment_details: {
          ...paymentData?.paymentDetails,
          clickpesa_response: responseData,
        }
      })?.eq('id', payment?.id);

      const result = {
        paymentId: payment?.id,
        clickpesaReference: responseData?.transaction_id,
        status: 'processing',
        provider: provider,
        message: `Please check your ${provider === 'mpesa' ? 'M-Pesa' : 'Tigo Pesa'} phone for payment prompt.`,
        expiresIn: responseData?.expires_in || 300,
      };

      // Store in idempotency cache
      await storeIdempotencyKey(idempotencyKey, result);

      loggerService.logPaymentEvent('mobile_money_initiated', {
        paymentId: payment?.id,
        orderId: paymentData?.orderId,
        amount: paymentData?.amount,
        provider: provider,
        status: 'processing',
        externalReference: responseData?.transaction_id
      });

      return result;
    } catch (error) {
      // Update payment status if record was created
      if (payment?.id) {
        try {
          await this.updateStatus(payment.id, {
            paymentStatus: 'failed',
            errorMessage: error.message,
          });
        } catch (updateError) {
          loggerService.error('Failed to update payment status on error', updateError, {
            operation: 'initialize_mobile_money',
            paymentId: payment.id
          });
        }
      }

      loggerService.error('Error initializing mobile money payment', error, {
        operation: 'initialize_mobile_money',
        userMessage: 'Failed to initialize mobile money payment. Please check your phone number and try again.',
        orderId: paymentData?.orderId,
        provider: error.code === 'CLICKPESA_ERROR' ? 'ClickPesa API' : 'Network'
      });

      throw error;
    }
  },

  /**
   * Initialize card payment via ClickPesa
   */
  async initializeCardPayment(paymentData) {
    try {
      // Create payment record
      const payment = await this.create({
        ...paymentData,
        paymentMethod: 'card',
      });

      const clickPesaPayload = {
        merchant_id: CLICKPESA_CONFIG.merchantId,
        amount: paymentData?.amount,
        currency: paymentData?.currency || 'TZS',
        payment_method: 'card',
        reference: payment?.id,
        callback_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clickpesa-webhook`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-tracking?orderId=${paymentData?.orderId}&status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout-process?orderId=${paymentData?.orderId}&status=cancelled`,
        description: `Payment for order ${paymentData?.orderNumber || ''}`,
        customer: {
          email: paymentData?.customerEmail,
          name: paymentData?.customerName,
          phone: paymentData?.phoneNumber,
        },
        metadata: {
          order_id: paymentData?.orderId,
          order_number: paymentData?.orderNumber,
        }
      };

      if (CLICKPESA_CONFIG.apiKey) {
        try {
          const response = await fetch(`${CLICKPESA_CONFIG.baseUrl}/payments/card`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${CLICKPESA_CONFIG.apiKey}`,
              'X-Merchant-ID': CLICKPESA_CONFIG.merchantId,
            },
            body: JSON.stringify(clickPesaPayload)
          });

          const responseData = await response.json();

          if (!response.ok) {
            await this.updateStatus(payment?.id, {
              paymentStatus: 'failed',
              errorMessage: responseData?.message || 'Card payment initialization failed',
            });
            throw new Error(responseData?.message || 'ClickPesa API error');
          }

          // Update payment with ClickPesa reference
          await supabase?.from('payments')?.update({
            clickpesa_reference: responseData?.transaction_id,
            payment_status: 'processing',
          })?.eq('id', payment?.id);

          return {
            paymentId: payment?.id,
            clickpesaReference: responseData?.transaction_id,
            paymentUrl: responseData?.payment_url, // Redirect URL for card payment
            status: 'processing',
            message: 'Redirecting to secure payment page...',
          };
        } catch (apiError) {
          console.error('ClickPesa card API error:', apiError);
          throw apiError;
        }
      }

      // Development fallback
      return {
        paymentId: payment?.id,
        clickpesaReference: `CLICK-CARD-DEV-${Date.now()}`,
        paymentUrl: null,
        status: 'pending',
        message: 'Development mode: Card payment URL would be provided here.',
        isDevelopment: true,
      };
    } catch (error) {
      console.error('Error initializing card payment:', error);
      throw error;
    }
  },

  /**
   * Detect mobile money provider based on phone number
   */
  detectMobileProvider(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Tanzania M-Pesa (Vodacom): starts with 25574, 25575, 25576
    if (/^255(74|75|76)/.test(cleanNumber)) {
      return 'mpesa';
    }
    
    // Tanzania Tigo Pesa: starts with 25571, 25565, 25567
    if (/^255(71|65|67)/.test(cleanNumber)) {
      return 'tigo_pesa';
    }
    
    // Default to M-Pesa
    return 'mpesa';
  },

  /**
   * Update payment status (called by webhook or manually)
   */
  async updateStatus(paymentId, updateData) {
    try {
      const { data, error } = await supabase?.from('payments')?.update({
        payment_status: updateData?.paymentStatus,
        transaction_id: updateData?.transactionId,
        clickpesa_reference: updateData?.clickpesaReference,
        error_message: updateData?.errorMessage,
        paid_at: updateData?.paidAt || (updateData?.paymentStatus === 'completed' ? new Date()?.toISOString() : null)
      })?.eq('id', paymentId)?.select()?.single();

      if (error) throw error;

      // If payment completed and order uses escrow, fund the escrow account
      if (updateData?.paymentStatus === 'completed' && data?.order_id) {
        // Check if order uses escrow
        const escrowAccount = await getEscrowAccountByOrderId(data?.order_id);
        
        if (escrowAccount) {
          // Fund the escrow account
          await fundEscrowAccount(escrowAccount?.id, { paymentId: data?.id });
          // Order status will be updated by the escrow system trigger
        } else {
          // If no escrow, update order status directly
          await supabase?.from('orders')?.update({ status: 'confirmed' })?.eq('id', data?.order_id);
        }
      }

      return this.formatPayment(data);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Get payment by ID
   */
  async getById(paymentId) {
    try {
      const { data, error } = await supabase?.from('payments')
        ?.select(`
          *,
          order:orders(id, order_number, status, total_amount)
        `)
        ?.eq('id', paymentId)
        ?.single();

      if (error) throw error;
      if (!data) return null;

      return this.formatPayment(data);
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  /**
   * Get payment by order ID
   */
  async getByOrderId(orderId) {
    try {
      const { data, error } = await supabase?.from('payments')?.select('*')?.eq('order_id', orderId)?.single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return this.formatPayment(data);
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  /**
   * Check payment status (poll ClickPesa API)
   */
  async checkStatus(paymentId) {
    try {
      const payment = await this.getById(paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      // If already completed or failed, return current status
      if (['completed', 'failed', 'cancelled', 'refunded'].includes(payment?.paymentStatus)) {
        return payment;
      }

      // Check with ClickPesa API if we have a reference
      if (CLICKPESA_CONFIG.apiKey && payment?.clickpesaReference) {
        try {
          const response = await fetch(
            `${CLICKPESA_CONFIG.baseUrl}/payments/${payment?.clickpesaReference}/status`,
            {
              headers: {
                'Authorization': `Bearer ${CLICKPESA_CONFIG.apiKey}`,
                'X-Merchant-ID': CLICKPESA_CONFIG.merchantId,
              },
            }
          );

          const statusData = await response.json();

          if (response.ok && statusData?.status !== payment?.paymentStatus) {
            // Update our records with new status
            return await this.updateStatus(paymentId, {
              paymentStatus: statusData?.status === 'success' ? 'completed' : statusData?.status,
              transactionId: statusData?.transaction_id,
              paidAt: statusData?.paid_at,
            });
          }
        } catch (apiError) {
          console.error('Error checking payment status with ClickPesa:', apiError);
        }
      }

      return payment;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  },

  /**
   * Subscribe to payment status changes
   */
  subscribeToPaymentUpdates(paymentId, callback) {
    const channel = supabase?.channel(`payment-${paymentId}`)?.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
        filter: `id=eq.${paymentId}`
      },
      (payload) => {
        if (payload?.new) {
          callback?.(this.formatPayment(payload?.new));
        }
      }
    )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  },

  /**
   * Request refund for a payment
   */
  async requestRefund(paymentId, amount, reason) {
    try {
      const payment = await this.getById(paymentId);
      
      if (!payment || payment?.paymentStatus !== 'completed') {
        throw new Error('Payment not eligible for refund');
      }

      const refundAmount = amount || payment?.amount;

      if (CLICKPESA_CONFIG.apiKey && payment?.clickpesaReference) {
        try {
          const response = await fetch(`${CLICKPESA_CONFIG.baseUrl}/refunds`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${CLICKPESA_CONFIG.apiKey}`,
              'X-Merchant-ID': CLICKPESA_CONFIG.merchantId,
            },
            body: JSON.stringify({
              payment_reference: payment?.clickpesaReference,
              amount: refundAmount,
              reason: reason,
            })
          });

          const refundData = await response.json();

          if (!response.ok) {
            throw new Error(refundData?.message || 'Refund request failed');
          }

          // Update payment status
          await this.updateStatus(paymentId, {
            paymentStatus: 'refunded',
          });

          return {
            success: true,
            refundId: refundData?.refund_id,
            amount: refundAmount,
            status: 'processing',
          };
        } catch (apiError) {
          console.error('ClickPesa refund error:', apiError);
          throw apiError;
        }
      }

      // Development fallback
      await this.updateStatus(paymentId, { paymentStatus: 'refunded' });
      return {
        success: true,
        refundId: `REFUND-DEV-${Date.now()}`,
        amount: refundAmount,
        status: 'completed',
        isDevelopment: true,
      };
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  },

  /**
   * Format payment data for consistent API response
   */
  formatPayment(data) {
    if (!data) return null;
    return {
      id: data?.id,
      orderId: data?.order_id,
      paymentMethod: data?.payment_method,
      paymentStatus: data?.payment_status,
      amount: parseFloat(data?.amount || 0),
      currency: data?.currency,
      transactionId: data?.transaction_id,
      clickpesaReference: data?.clickpesa_reference,
      phoneNumber: data?.phone_number,
      paymentDetails: data?.payment_details,
      errorMessage: data?.error_message,
      paidAt: data?.paid_at,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at,
      order: data?.order ? {
        id: data?.order?.id,
        orderNumber: data?.order?.order_number,
        status: data?.order?.status,
        totalAmount: parseFloat(data?.order?.total_amount || 0),
      } : null,
    };
  },
};
