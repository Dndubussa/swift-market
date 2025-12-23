/**
 * Webhook Verification Service
 * Verifies signatures and prevents tampering with webhooks
 */

import crypto from 'crypto';
import { loggerService } from './loggerService';

/**
 * Verify ClickPesa webhook signature
 * @param {Object} body - Request body
 * @param {string} signature - X-Signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} Whether signature is valid
 */
export function verifyClickPesaSignature(body, signature, secret) {
  try {
    if (!signature || !secret) {
      loggerService.warn('ClickPesa webhook verification failed: missing signature or secret', {
        operation: 'verify_clickpesa_signature'
      });
      return false;
    }

    // Create HMAC SHA256 hash of body
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');

    // Compare signatures (constant-time comparison)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      loggerService.error('ClickPesa webhook signature verification failed', new Error('Invalid signature'), {
        operation: 'verify_clickpesa_signature',
        provided: signature.substring(0, 8) + '...',
        expected: expectedSignature.substring(0, 8) + '...'
      });
    }

    return isValid;
  } catch (error) {
    loggerService.error('Error verifying ClickPesa webhook signature', error, {
      operation: 'verify_clickpesa_signature'
    });
    return false;
  }
}

/**
 * Verify Twilio webhook signature
 * @param {string} twilioAuthToken - Twilio auth token
 * @param {string} url - Full request URL
 * @param {Object} body - Request body parameters
 * @param {string} signature - X-Twilio-Signature header
 * @returns {boolean} Whether signature is valid
 */
export function verifyTwilioSignature(twilioAuthToken, url, body, signature) {
  try {
    if (!signature || !twilioAuthToken) {
      loggerService.warn('Twilio webhook verification failed: missing signature or auth token', {
        operation: 'verify_twilio_signature'
      });
      return false;
    }

    // Sort parameters and create concatenated string
    const data = url + Object.keys(body)
      .sort()
      .reduce((acc, key) => acc + key + body[key], '');

    // Create HMAC SHA1 hash
    const expectedSignature = crypto
      .createHmac('sha1', twilioAuthToken)
      .update(data)
      .digest('base64');

    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      loggerService.error('Twilio webhook signature verification failed', new Error('Invalid signature'), {
        operation: 'verify_twilio_signature'
      });
    }

    return isValid;
  } catch (error) {
    loggerService.error('Error verifying Twilio webhook signature', error, {
      operation: 'verify_twilio_signature'
    });
    return false;
  }
}

/**
 * Verify webhook timestamp to prevent replay attacks
 * @param {number|string} timestamp - Timestamp from webhook
 * @param {number} tolerance - Max age in seconds (default: 5 minutes)
 * @returns {boolean} Whether timestamp is within tolerance
 */
export function verifyWebhookTimestamp(timestamp, tolerance = 300) {
  try {
    const webhookTime = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - webhookTime);

    if (timeDiff > tolerance) {
      loggerService.warn('Webhook timestamp verification failed: too old', {
        operation: 'verify_webhook_timestamp',
        timeDiff,
        tolerance,
        webhookTime,
        currentTime
      });
      return false;
    }

    return true;
  } catch (error) {
    loggerService.error('Error verifying webhook timestamp', error, {
      operation: 'verify_webhook_timestamp'
    });
    return false;
  }
}

/**
 * Log webhook receipt for audit trail
 */
export function logWebhookReceipt(provider, data) {
  const sanitized = {
    provider,
    timestamp: new Date().toISOString(),
    eventType: data?.event || data?.type || 'unknown',
    reference: data?.reference || data?.transaction_id || 'unknown',
    status: data?.status || data?.payment_status || 'unknown'
  };

  loggerService.info('Webhook received', {
    operation: 'webhook_receipt',
    provider,
    ...sanitized
  });
}

/**
 * Create secure webhook signature for outgoing requests
 */
export function createWebhookSignature(payload, secret) {
  try {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  } catch (error) {
    loggerService.error('Error creating webhook signature', error, {
      operation: 'create_webhook_signature'
    });
    throw error;
  }
}

export const webhookVerificationService = {
  verifyClickPesaSignature,
  verifyTwilioSignature,
  verifyWebhookTimestamp,
  logWebhookReceipt,
  createWebhookSignature
};

export default webhookVerificationService;
