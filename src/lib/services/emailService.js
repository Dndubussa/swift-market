import { supabase } from '../supabase';

/**
 * Email Service
 * Sends emails via Supabase Edge Function (Resend)
 */
export const emailService = {
  /**
   * Send email via Edge Function
   */
  async sendEmail(emailType, data) {
    try {
      // Get session for auth
      const { data: { session } } = await supabase?.auth?.getSession();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            emailType,
            data,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Email sending failed');
      }

      return {
        success: true,
        messageId: result?.messageId,
        message: result?.message,
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order, customer) {
    return await this.sendEmail('order_confirmation', {
      recipientEmail: customer?.email,
      customerName: customer?.fullName || customer?.full_name,
      orderNumber: order?.orderNumber || order?.order_number,
      totalAmount: order?.totalAmount || order?.total_amount,
      orderDate: order?.createdAt || order?.created_at || new Date().toISOString(),
      items: order?.items?.map(item => ({
        productName: item?.productName || item?.product_name,
        quantity: item?.quantity,
        price: item?.unitPrice || item?.unit_price,
      })) || [],
    });
  },

  /**
   * Send shipping update email
   */
  async sendShippingUpdate(order, customer) {
    return await this.sendEmail('shipping_update', {
      recipientEmail: customer?.email,
      customerName: customer?.fullName || customer?.full_name,
      orderNumber: order?.orderNumber || order?.order_number,
      trackingNumber: order?.trackingNumber || order?.tracking_number,
      estimatedDelivery: order?.estimatedDelivery || '3-5 business days',
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order-tracking?orderId=${order?.id}`,
    });
  },

  /**
   * Send return confirmation email
   */
  async sendReturnConfirmation(returnData, customer) {
    return await this.sendEmail('return_confirmation', {
      recipientEmail: customer?.email,
      customerName: customer?.fullName || customer?.full_name,
      rmaNumber: returnData?.rmaNumber || returnData?.rma_number,
      orderNumber: returnData?.orderNumber || returnData?.order_number,
      returnReason: returnData?.returnReason || returnData?.return_reason,
    });
  },

  /**
   * Send return approved email
   */
  async sendReturnApproved(returnData, customer) {
    return await this.sendEmail('return_approved', {
      recipientEmail: customer?.email,
      customerName: customer?.fullName || customer?.full_name,
      rmaNumber: returnData?.rmaNumber || returnData?.rma_number,
      refundAmount: returnData?.refundAmount || returnData?.refund_amount,
      refundMethod: returnData?.refundMethod || returnData?.refund_method || 'Original payment method',
    });
  },

  /**
   * Send return rejected email
   */
  async sendReturnRejected(returnData, customer) {
    return await this.sendEmail('return_rejected', {
      recipientEmail: customer?.email,
      customerName: customer?.fullName || customer?.full_name,
      rmaNumber: returnData?.rmaNumber || returnData?.rma_number,
      rejectionReason: returnData?.rejectionReason || returnData?.rejection_reason || 'Does not meet return policy criteria',
    });
  },

  /**
   * Send refund processed email
   */
  async sendRefundProcessed(returnData, customer) {
    return await this.sendEmail('refund_processed', {
      recipientEmail: customer?.email,
      customerName: customer?.fullName || customer?.full_name,
      rmaNumber: returnData?.rmaNumber || returnData?.rma_number,
      refundAmount: returnData?.refundAmount || returnData?.refund_amount,
    });
  },

  /**
   * Send vendor new return notification
   */
  async sendVendorNewReturn(returnData, vendor) {
    return await this.sendEmail('vendor_new_return', {
      recipientEmail: vendor?.businessEmail || vendor?.business_email || vendor?.email,
      rmaNumber: returnData?.rmaNumber || returnData?.rma_number,
      orderNumber: returnData?.orderNumber || returnData?.order_number,
      customerName: returnData?.customerName || returnData?.customer_name,
      returnReason: returnData?.returnReason || returnData?.return_reason,
      reasonDetails: returnData?.reasonDetails || returnData?.reason_details,
    });
  },

  /**
   * Send review request email
   */
  async sendReviewRequest(order, customer) {
    return await this.sendEmail('review_request', {
      recipientEmail: customer?.email,
      customerName: customer?.fullName || customer?.full_name,
      orderNumber: order?.orderNumber || order?.order_number,
      reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order-tracking?orderId=${order?.id}&review=true`,
    });
  },

  /**
   * Send abandoned cart reminder email
   */
  async sendAbandonedCartReminder(customer, cartItems, cartTotal) {
    return await this.sendEmail('abandoned_cart', {
      recipientEmail: customer?.email,
      customerName: customer?.fullName || customer?.full_name,
      cartItems: cartItems?.map(item => ({
        productName: item?.name || item?.productName,
        price: item?.price,
      })) || [],
      cartTotal: cartTotal,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/shopping-cart`,
    });
  },

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user) {
    // Custom welcome email - you may want to add this template to the edge function
    return await this.sendEmail('order_confirmation', { // Reusing a template as placeholder
      recipientEmail: user?.email,
      customerName: user?.fullName || user?.full_name || user?.email?.split('@')[0],
      orderNumber: 'Welcome',
      totalAmount: 0,
      orderDate: new Date().toISOString(),
      items: [],
    });
  },

  /**
   * Send password reset email
   * Note: Supabase Auth handles this automatically, but you can customize
   */
  async sendPasswordReset(email, resetLink) {
    // Supabase Auth handles password reset emails
    // This is here for custom implementations
    console.log('Password reset emails are handled by Supabase Auth');
    return { success: true, message: 'Handled by Supabase Auth' };
  },
};
