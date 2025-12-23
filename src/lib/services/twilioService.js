import { supabase } from '../supabase';

/**
 * Twilio SMS Service
 * Sends SMS notifications via Supabase Edge Function
 */
export const twilioService = {
  /**
   * Send SMS via Edge Function
   */
  async sendSMS(to, message, type = 'general') {
    try {
      // Format phone number for Tanzania
      let phoneNumber = to;
      if (to?.startsWith('0')) {
        phoneNumber = '+255' + to.substring(1);
      } else if (to && !to.startsWith('+')) {
        phoneNumber = '+' + to;
      }

      if (!phoneNumber) {
        console.warn('No phone number provided for SMS');
        return { success: false, error: 'No phone number provided' };
      }

      // Get session for auth
      const { data: { session } } = await supabase?.auth?.getSession();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: phoneNumber,
            message: message,
            type: type,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'SMS sending failed');
      }

      return {
        success: true,
        messageId: result?.messageId,
        status: result?.status,
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send order status update SMS
   */
  async sendOrderStatusSMS(order, newStatus) {
    const statusMessages = {
      confirmed: `Blinno: Your order ${order?.orderNumber} has been confirmed! We're preparing it for shipment.`,
      processing: `Blinno: Your order ${order?.orderNumber} is being processed. We'll notify you when it ships.`,
      shipped: `Blinno: Great news! Your order ${order?.orderNumber} has been shipped. ${order?.trackingNumber ? `Track: ${order?.trackingNumber}` : 'Track at blinno.co.tz/track'}`,
      delivered: `Blinno: Your order ${order?.orderNumber} has been delivered! Thank you for shopping with us. Leave a review at blinno.co.tz`,
      cancelled: `Blinno: Your order ${order?.orderNumber} has been cancelled. If you didn't request this, please contact support.`,
    };

    const message = statusMessages[newStatus];
    if (!message) {
      console.warn(`No SMS template for status: ${newStatus}`);
      return { success: false, error: 'No template for status' };
    }

    const phone = order?.user?.phone || order?.shippingAddress?.phone;
    if (!phone) {
      console.warn('No phone number found for order status SMS');
      return { success: false, error: 'No phone number' };
    }

    return await this.sendSMS(phone, message, 'order_update');
  },

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmationSMS(payment, order) {
    const message = `Blinno: Payment confirmed! TZS ${payment?.amount?.toLocaleString()} received for order ${order?.orderNumber}. Your order is being processed.`;
    
    const phone = order?.user?.phone || payment?.phoneNumber;
    if (!phone) {
      console.warn('No phone number found for payment SMS');
      return { success: false, error: 'No phone number' };
    }

    return await this.sendSMS(phone, message, 'payment_confirmation');
  },

  /**
   * Send OTP verification SMS
   */
  async sendOTP(phone, otp, expiryMinutes = 10) {
    const message = `Blinno: Your verification code is ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;
    return await this.sendSMS(phone, message, 'otp');
  },

  /**
   * Send return status SMS
   */
  async sendReturnStatusSMS(returnData, status) {
    const statusMessages = {
      approved: `Blinno: Your return request ${returnData?.rmaNumber} has been approved! Please ship the item back within 7 days.`,
      rejected: `Blinno: Your return request ${returnData?.rmaNumber} was not approved. Reason: ${returnData?.rejectionReason || 'See details in app'}`,
      refund_processed: `Blinno: Refund of TZS ${returnData?.refundAmount?.toLocaleString()} for ${returnData?.rmaNumber} has been processed. Allow 3-5 business days.`,
    };

    const message = statusMessages[status];
    if (!message) {
      return { success: false, error: 'No template for status' };
    }

    return await this.sendSMS(returnData?.buyerPhone, message, 'return_update');
  },

  /**
   * Send vendor new order notification SMS
   */
  async sendVendorNewOrderSMS(vendor, order) {
    const message = `Blinno Seller: New order ${order?.orderNumber} received! Amount: TZS ${order?.totalAmount?.toLocaleString()}. Log in to process: blinno.co.tz/vendor`;
    
    const phone = vendor?.businessPhone || vendor?.user?.phone;
    if (!phone) {
      console.warn('No phone number found for vendor');
      return { success: false, error: 'No phone number' };
    }

    return await this.sendSMS(phone, message, 'order_update');
  },

  /**
   * Send low stock alert SMS to vendor
   */
  async sendLowStockAlertSMS(vendor, product) {
    const message = `Blinno Seller Alert: "${product?.name}" is low on stock (${product?.stockQuantity} left). Restock soon to avoid missing sales.`;
    
    const phone = vendor?.businessPhone || vendor?.user?.phone;
    if (!phone) {
      return { success: false, error: 'No phone number' };
    }

    return await this.sendSMS(phone, message, 'general');
  },

  /**
   * Send promotional SMS (for marketing campaigns)
   */
  async sendPromotionalSMS(phone, message) {
    // Add unsubscribe info for promotional messages
    const fullMessage = `${message}\n\nReply STOP to unsubscribe.`;
    return await this.sendSMS(phone, fullMessage, 'general');
  },
};
