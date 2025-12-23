/**
 * Logger Service - Structured logging for production monitoring
 * Provides consistent error logging with context
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

/**
 * Format log message with context
 */
function formatLogMessage(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    message,
    context,
    environment: process.env.NODE_ENV || 'development'
  };
}

/**
 * Send log to monitoring service (e.g., Sentry, LogRocket, Datadog)
 * Replace with actual integration
 */
function sendToMonitoring(logData) {
  // In production, integrate with:
  // - Sentry: captureException/captureMessage
  // - LogRocket: logEvent
  // - Datadog: logger.log
  
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with monitoring service
    // For now, just log to console with formatting
    console.log(JSON.stringify(logData));
  }
}

export const loggerService = {
  /**
   * Log debug messages (development only)
   */
  debug(message, context = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const logData = formatLogMessage(LOG_LEVELS.DEBUG, message, context);
      console.debug(logData);
    }
  },

  /**
   * Log info messages
   */
  info(message, context = {}) {
    const logData = formatLogMessage(LOG_LEVELS.INFO, message, context);
    console.log(logData);
    if (process.env.NODE_ENV === 'production') {
      sendToMonitoring(logData);
    }
  },

  /**
   * Log warnings
   */
  warn(message, context = {}) {
    const logData = formatLogMessage(LOG_LEVELS.WARN, message, context);
    console.warn(logData);
    sendToMonitoring(logData);
  },

  /**
   * Log errors with full context
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   * @param {string} context.operation - What operation was being performed
   * @param {string} context.userId - User ID if applicable
   * @param {Object} context.data - Relevant data (sanitized)
   */
  error(message, error, context = {}) {
    const errorDetails = {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      status: error?.status
    };

    const logData = formatLogMessage(LOG_LEVELS.ERROR, message, {
      ...context,
      error: errorDetails
    });

    console.error(logData);
    sendToMonitoring(logData);

    // Return sanitized error for client
    return {
      success: false,
      error: {
        message: context.userMessage || 'An error occurred',
        code: error?.code || 'UNKNOWN_ERROR'
      }
    };
  },

  /**
   * Log critical errors that need immediate attention
   */
  critical(message, error, context = {}) {
    const errorDetails = {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    };

    const logData = formatLogMessage(LOG_LEVELS.CRITICAL, message, {
      ...context,
      error: errorDetails,
      requiresImmediateAction: true
    });

    console.error('🚨 CRITICAL ERROR:', logData);
    sendToMonitoring(logData);

    // Alert system admins - integrate with Slack, PagerDuty, etc.
    this.alertAdmins(message, context);
  },

  /**
   * Log financial transactions for audit trail
   */
  logTransaction(action, details) {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'TRANSACTION',
      action,
      details: {
        orderId: details.orderId,
        amount: details.amount,
        currency: details.currency,
        userId: details.userId,
        paymentMethod: details.paymentMethod,
        status: details.status
      },
      environment: process.env.NODE_ENV
    };

    console.log('💰 TRANSACTION:', JSON.stringify(logData));
    sendToMonitoring(logData);
  },

  /**
   * Log payment events
   */
  logPaymentEvent(event, details) {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'PAYMENT_EVENT',
      event,
      details: {
        paymentId: details.paymentId,
        orderId: details.orderId,
        amount: details.amount,
        provider: details.provider,
        status: details.status,
        externalReference: details.externalReference
      }
    };

    console.log('💳 PAYMENT EVENT:', JSON.stringify(logData));
    sendToMonitoring(logData);
  },

  /**
   * Send alerts to admins
   */
  alertAdmins(message, context = {}) {
    // TODO: Integrate with Slack, email, or PagerDuty
    console.error('🚨 ADMIN ALERT NEEDED:', message, context);
  },

  /**
   * Create error response for API
   */
  createErrorResponse(message, code = 'INTERNAL_ERROR', status = 500) {
    return {
      success: false,
      error: {
        message,
        code,
        status,
        timestamp: new Date().toISOString()
      }
    };
  }
};

export default loggerService;
