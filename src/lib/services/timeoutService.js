/**
 * Timeout Utilities
 * Provides timeout handling for async operations
 */

import { loggerService } from './loggerService';

/**
 * Create a promise that rejects after specified timeout
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Timeout error message
 * @returns {Promise} Promise that rejects on timeout
 */
function createTimeoutPromise(ms, message = 'Operation timeout') {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });
}

/**
 * Execute async operation with timeout
 * @param {Promise} promise - Promise to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operation - Operation name for logging
 * @returns {Promise} Result or timeout error
 */
export async function withTimeout(promise, timeoutMs, operation = 'operation') {
  try {
    return await Promise.race([
      promise,
      createTimeoutPromise(timeoutMs, `${operation} exceeded ${timeoutMs}ms timeout`)
    ]);
  } catch (error) {
    if (error.message.includes('timeout')) {
      loggerService.warn(`Operation timeout: ${operation}`, {
        operation,
        timeoutMs
      });
    }
    throw error;
  }
}

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30s)
 * @param {string} operation - Operation name for logging
 * @returns {Promise<Response>} Fetch response
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 30000, operation = 'fetch') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const message = `${operation} exceeded ${timeoutMs}ms timeout`;
        loggerService.warn(message, {
          operation,
          url,
          timeoutMs
        });
        throw new Error(message);
      }
      throw error;
    }
  } catch (error) {
    loggerService.error(`Error in ${operation}`, error, {
      operation,
      url,
      timeoutMs
    });
    throw error;
  }
}

/**
 * Supabase query with timeout
 * @param {Promise} query - Supabase query promise
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10s)
 * @param {string} operation - Operation name for logging
 * @returns {Promise} Query result
 */
export async function supabaseQueryWithTimeout(query, timeoutMs = 10000, operation = 'supabase_query') {
  try {
    return await withTimeout(query, timeoutMs, operation);
  } catch (error) {
    loggerService.error(`Supabase query timeout: ${operation}`, error, {
      operation,
      timeoutMs
    });
    throw error;
  }
}

/**
 * Retry with timeout and exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.initialDelayMs - Initial delay (default: 1000)
 * @param {number} options.maxDelayMs - Maximum delay (default: 30000)
 * @param {number} options.timeoutMs - Timeout per attempt (default: 30000)
 * @param {string} options.operation - Operation name for logging
 * @returns {Promise} Result from successful attempt
 */
export async function retryWithTimeout(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    timeoutMs = 30000,
    operation = 'operation'
  } = options;

  let lastError;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      loggerService.debug(`Attempt ${attempt}/${maxRetries}: ${operation}`, { operation, attempt });
      
      return await withTimeout(fn(), timeoutMs, `${operation} (attempt ${attempt})`);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        loggerService.warn(`${operation} failed, retrying in ${delay}ms`, {
          operation,
          attempt,
          maxRetries,
          error: error.message
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Exponential backoff with jitter
        delay = Math.min(
          maxDelayMs,
          delay * 2 + Math.random() * 1000
        );
      }
    }
  }

  loggerService.error(`${operation} failed after ${maxRetries} attempts`, lastError, {
    operation,
    maxRetries
  });
  
  throw lastError;
}

export const timeoutService = {
  withTimeout,
  fetchWithTimeout,
  supabaseQueryWithTimeout,
  retryWithTimeout,
  createTimeoutPromise
};

export default timeoutService;
