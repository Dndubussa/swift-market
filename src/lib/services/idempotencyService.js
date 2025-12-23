/**
 * Idempotency Service - Prevents duplicate processing of requests
 * Critical for payment and financial operations
 */

import { supabase } from '../supabase';
import { loggerService } from './loggerService';

const IDEMPOTENCY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate idempotency key
 * @param {string} resourceType - Type of resource (payment, order, etc.)
 * @param {string} resourceId - Unique identifier for the resource
 * @param {string} operation - Operation name (create, refund, release, etc.)
 * @returns {string} Idempotency key
 */
export function generateIdempotencyKey(resourceType, resourceId, operation) {
  return `${resourceType}:${resourceId}:${operation}`;
}

/**
 * Check if request with this idempotency key has been processed
 * @param {string} idempotencyKey - The idempotency key
 * @returns {Promise<Object|null>} Previous response if exists, null otherwise
 */
export async function checkIdempotencyKey(idempotencyKey) {
  try {
    const { data, error } = await supabase
      .from('idempotency_keys')
      .select('id, response, created_at')
      .eq('key', idempotencyKey)
      .single();

    if (error && error.code !== 'PGRST116') {
      loggerService.error('Idempotency key check failed', error, {
        operation: 'check_idempotency_key',
        idempotencyKey
      });
      return null;
    }

    if (data) {
      // Check if key has expired
      const createdAt = new Date(data.created_at);
      const now = new Date();
      if (now - createdAt > IDEMPOTENCY_CACHE_TTL) {
        // Key expired, treat as new request
        return null;
      }

      loggerService.debug('Idempotency key cache hit', {
        idempotencyKey,
        processedAt: data.created_at
      });

      return data.response;
    }

    return null;
  } catch (error) {
    loggerService.error('Error checking idempotency key', error, {
      operation: 'check_idempotency_key',
      idempotencyKey
    });
    return null;
  }
}

/**
 * Store idempotency key and response
 * @param {string} idempotencyKey - The idempotency key
 * @param {Object} response - Response to cache
 * @returns {Promise<boolean>} Success status
 */
export async function storeIdempotencyKey(idempotencyKey, response) {
  try {
    const { error } = await supabase
      .from('idempotency_keys')
      .insert({
        key: idempotencyKey,
        response: JSON.stringify(response),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + IDEMPOTENCY_CACHE_TTL).toISOString()
      });

    if (error) {
      loggerService.warn('Failed to store idempotency key', {
        idempotencyKey,
        error: error.message
      });
      return false;
    }

    return true;
  } catch (error) {
    loggerService.error('Error storing idempotency key', error, {
      operation: 'store_idempotency_key',
      idempotencyKey
    });
    return false;
  }
}

/**
 * Clean up expired idempotency keys (run periodically)
 * @returns {Promise<number>} Number of keys deleted
 */
export async function cleanupExpiredKeys() {
  try {
    const { error, count } = await supabase
      .from('idempotency_keys')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      loggerService.error('Error cleaning up expired idempotency keys', error, {
        operation: 'cleanup_idempotency_keys'
      });
      return 0;
    }

    if (count > 0) {
      loggerService.info(`Cleaned up ${count} expired idempotency keys`, {
        operation: 'cleanup_idempotency_keys'
      });
    }

    return count || 0;
  } catch (error) {
    loggerService.error('Error in cleanup operation', error, {
      operation: 'cleanup_idempotency_keys'
    });
    return 0;
  }
}

export const idempotencyService = {
  generateIdempotencyKey,
  checkIdempotencyKey,
  storeIdempotencyKey,
  cleanupExpiredKeys
};

export default idempotencyService;
