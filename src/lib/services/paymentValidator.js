/**
 * Payment Validation Service
 * Validates payment data and ensures data integrity
 */

import { loggerService } from './loggerService';

/**
 * Validate payment amount
 * @throws {Error} If amount is invalid
 */
export function validatePaymentAmount(amount) {
  if (amount === null || amount === undefined) {
    throw new Error('Payment amount is required');
  }

  const parsedAmount = parseFloat(amount);
  
  if (isNaN(parsedAmount)) {
    throw new Error('Payment amount must be a valid number');
  }

  if (parsedAmount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  if (parsedAmount > 99999999.99) {
    throw new Error('Payment amount exceeds maximum limit');
  }

  // Check for excessive decimal places (more than 2)
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    throw new Error('Payment amount can only have up to 2 decimal places');
  }

  return parsedAmount;
}

/**
 * Validate phone number format
 * @throws {Error} If phone number is invalid
 */
export function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error('Phone number is required');
  }

  // Remove spaces and dashes
  const cleaned = phoneNumber.replace(/[\s\-]/g, '');

  // Should be 10-15 digits, possibly with + prefix
  if (!/^\+?\d{10,15}$/.test(cleaned)) {
    throw new Error('Invalid phone number format');
  }

  return cleaned;
}

/**
 * Validate currency code
 */
export function validateCurrency(currency) {
  const validCurrencies = ['TZS', 'USD', 'EUR', 'GBP'];
  
  if (!currency) {
    return 'TZS'; // Default
  }

  const upper = currency.toUpperCase();
  if (!validCurrencies.includes(upper)) {
    throw new Error(`Invalid currency code: ${currency}. Supported: ${validCurrencies.join(', ')}`);
  }

  return upper;
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(method) {
  const validMethods = ['mpesa', 'tigopesa', 'card', 'bank_transfer'];
  
  if (!method || typeof method !== 'string') {
    throw new Error('Payment method is required');
  }

  const lower = method.toLowerCase();
  if (!validMethods.includes(lower)) {
    throw new Error(`Invalid payment method: ${method}. Supported: ${validMethods.join(', ')}`);
  }

  return lower;
}

/**
 * Validate complete payment data
 * @throws {Error} If any validation fails
 */
export function validatePaymentData(paymentData) {
  if (!paymentData) {
    throw new Error('Payment data is required');
  }

  const errors = [];

  // Validate required fields
  if (!paymentData.orderId) errors.push('Order ID is required');
  if (!paymentData.buyerId) errors.push('Buyer ID is required');
  if (!paymentData.amount) errors.push('Payment amount is required');

  if (errors.length > 0) {
    throw new Error(`Payment validation failed: ${errors.join('; ')}`);
  }

  // Validate amount
  try {
    validatePaymentAmount(paymentData.amount);
  } catch (error) {
    errors.push(error.message);
  }

  // Validate currency if provided
  if (paymentData.currency) {
    try {
      validateCurrency(paymentData.currency);
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validate phone number if payment method requires it
  if (['mpesa', 'tigopesa'].includes(paymentData.paymentMethod?.toLowerCase())) {
    if (!paymentData.phoneNumber) {
      errors.push('Phone number is required for mobile money payments');
    } else {
      try {
        validatePhoneNumber(paymentData.phoneNumber);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Payment validation failed: ${errors.join('; ')}`);
  }

  return true;
}

/**
 * Validate ClickPesa configuration
 * @throws {Error} If credentials are missing
 */
export function validateClickPesaConfig() {
  const errors = [];

  if (!process.env.CLICKPESA_API_KEY) {
    errors.push('CLICKPESA_API_KEY is not configured');
  }

  if (!process.env.CLICKPESA_MERCHANT_ID) {
    errors.push('CLICKPESA_MERCHANT_ID is not configured');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not configured (needed for callbacks)');
  }

  if (errors.length > 0) {
    const message = `ClickPesa configuration incomplete:\n- ${errors.join('\n- ')}`;
    loggerService.critical('ClickPesa configuration validation failed', new Error(message), {
      operation: 'validate_clickpesa_config'
    });
    throw new Error(message);
  }

  return true;
}

/**
 * Sanitize payment data for logging (remove sensitive info)
 */
export function sanitizePaymentForLogging(paymentData) {
  return {
    orderId: paymentData?.orderId,
    amount: paymentData?.amount,
    currency: paymentData?.currency,
    paymentMethod: paymentData?.paymentMethod,
    phoneNumber: paymentData?.phoneNumber ? '***' + paymentData.phoneNumber.slice(-4) : undefined
  };
}

export const paymentValidator = {
  validatePaymentAmount,
  validatePhoneNumber,
  validateCurrency,
  validatePaymentMethod,
  validatePaymentData,
  validateClickPesaConfig,
  sanitizePaymentForLogging
};

export default paymentValidator;
