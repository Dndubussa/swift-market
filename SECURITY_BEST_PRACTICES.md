# Security Best Practices - Implementation Guide

## Overview
This guide helps you maximize the security improvements made to the Blinno Marketplace.

---

## 1. Environment Variable Management

### ✅ DO

```bash
# ✅ Store secrets in .env.local (not committed)
CLICKPESA_API_KEY=actual-key-value

# ✅ Use strong, unique keys for each environment
# Development key: one sandbox key
# Staging key: different sandbox key  
# Production key: production key (rotate regularly)

# ✅ Rotate keys quarterly
# Keep rotation log:
# 2025-12-21: Initial deployment
# 2026-03-21: Q1 rotation
# 2026-06-21: Q2 rotation

# ✅ Store backup keys securely
# Use password manager or vault
```

### ❌ DON'T

```bash
# ❌ Never commit .env.local
git add .env.local  # WRONG!

# ❌ Never hardcode credentials
const API_KEY = "abc123def456";  // WRONG!

# ❌ Never share production keys
# Don't send via Slack, email, etc.

# ❌ Never reuse keys across environments
# Each environment needs unique keys

# ❌ Don't forget to rotate
# "We'll do it next year" = Security risk
```

### Setup Guide

```bash
# 1. Create .env.local (ignored by git)
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
CLICKPESA_API_KEY=your-actual-key
CLICKPESA_WEBHOOK_SECRET=your-webhook-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
RESEND_API_KEY=re_your-resend-key
EOF

# 2. Verify .gitignore includes .env.local
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# 3. Start development server
npm run dev

# 4. Check startup logs for validation
# Should see: "Supabase configured successfully" (development)
# Or: "🚨 CRITICAL ERROR" if config missing (production)
```

---

## 2. Payment Processing Security

### ✅ Idempotency

```javascript
// ✅ Always use idempotency for financial operations
import { generateIdempotencyKey, checkIdempotencyKey } from '@/lib/services/idempotencyService';

async function processPayment(orderId, amount) {
  // Generate unique key
  const idempotencyKey = generateIdempotencyKey('payment', orderId, 'mobile_money');
  
  // Check for duplicates (prevents double-charging)
  const cached = await checkIdempotencyKey(idempotencyKey);
  if (cached) return cached;
  
  // Process payment
  const result = await paymentService.initializeMobileMoneyPayment({
    orderId,
    amount,
    // ... other data
  });
  
  // Store result for future retries
  await storeIdempotencyKey(idempotencyKey, result);
  
  return result;
}
```

### ✅ Validation

```javascript
// ✅ Always validate payment data before processing
import { paymentValidator } from '@/lib/services/paymentValidator';

async function validatePayment(paymentData) {
  try {
    // Validates all critical fields
    paymentValidator.validatePaymentData(paymentData);
    
    // Validates amount specifically
    paymentValidator.validatePaymentAmount(paymentData.amount);
    
    // Validates phone format
    paymentValidator.validatePhoneNumber(paymentData.phoneNumber);
    
    // Validates currency
    paymentValidator.validateCurrency(paymentData.currency);
    
    // All validations passed
    return true;
  } catch (error) {
    loggerService.error('Payment validation failed', error, {
      operation: 'validate_payment',
      userMessage: 'Please check your payment details and try again'
    });
    throw error;
  }
}
```

### ✅ Logging

```javascript
// ✅ Log all financial transactions
import { loggerService } from '@/lib/services/loggerService';

loggerService.logTransaction('payment_received', {
  orderId: '12345',
  amount: 50000,
  currency: 'TZS',
  userId: 'user-id',
  paymentMethod: 'mpesa',
  status: 'completed'
});

// ✅ Log all payment events
loggerService.logPaymentEvent('payment_initiated', {
  paymentId: 'pay-123',
  orderId: 'order-456',
  amount: 50000,
  provider: 'clickpesa',
  status: 'processing',
  externalReference: 'CLICK-REF-789'
});
```

### ❌ Don't

```javascript
// ❌ Don't skip validation
const payment = await processPayment(data); // No validation!

// ❌ Don't log sensitive information
loggerService.error('Payment failed', error, {
  creditCard: '4111111111111111', // WRONG!
  fullPhoneNumber: '+255754123456', // Should be sanitized
});

// ❌ Don't ignore idempotency
// Retry without checking for duplicates = double charge

// ❌ Don't process payments without logging
// No audit trail = compliance risk
```

---

## 3. Webhook Security

### ✅ Verify Signatures

```javascript
// ✅ Always verify webhook signatures
import { verifyClickPesaSignature, logWebhookReceipt } from '@/lib/services/webhookVerificationService';

export async function handleClickPesaWebhook(request) {
  // 1. Log receipt (for audit trail)
  const body = await request.json();
  logWebhookReceipt('clickpesa', body);
  
  // 2. Verify signature
  const signature = request.headers.get('x-signature');
  const secret = process.env.CLICKPESA_WEBHOOK_SECRET;
  
  const isValid = verifyClickPesaSignature(body, signature, secret);
  
  if (!isValid) {
    console.error('Invalid webhook signature - rejecting');
    return new Response('Invalid signature', { status: 403 });
  }
  
  // 3. Verify timestamp (prevent replay attacks)
  if (!verifyWebhookTimestamp(body.timestamp)) {
    console.error('Webhook too old - rejecting');
    return new Response('Webhook expired', { status: 403 });
  }
  
  // 4. Process webhook
  await processWebhook(body);
  
  // 5. Return success
  return new Response(JSON.stringify({ status: 'received' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}
```

### ✅ Verify Timestamps

```javascript
// ✅ Reject old webhooks (prevent replay attacks)
function verifyWebhookTimestamp(timestamp, tolerance = 300) {
  const webhookTime = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTime - webhookTime);
  
  if (timeDiff > tolerance) {
    return false; // Too old, reject
  }
  
  return true;
}
```

### ❌ Don't

```javascript
// ❌ Don't process webhooks without verifying signature
if (event.type === 'payment') {
  await processPayment(event); // NO VERIFICATION!
}

// ❌ Don't accept old webhooks
// Replay attacks: attacker resends old payment confirmation

// ❌ Don't use timing-unsafe comparison
if (signature === expectedSignature) { // Timing attack!
  // Use crypto.timingSafeEqual instead
}
```

---

## 4. Error Handling & Logging

### ✅ Use Structured Logging

```javascript
// ✅ Always include context with errors
import { loggerService } from '@/lib/services/loggerService';

try {
  const result = await paymentService.create(paymentData);
} catch (error) {
  // Log with context - helps debugging in production
  loggerService.error('Payment creation failed', error, {
    operation: 'create_payment',
    orderId: paymentData.orderId,
    userId: paymentData.buyerId,
    userMessage: 'Failed to initiate payment. Please try again.',
    // Don't include: credit card, full phone, API keys
  });
}

// ✅ For critical issues, alert admins
loggerService.critical('Payment processing down', error, {
  operation: 'payment_service',
  requiresImmediateAction: true
});

// ✅ Log transactions for audit trail
loggerService.logTransaction('refund_processed', {
  orderId: '123',
  amount: 50000,
  currency: 'TZS',
  userId: 'user-456',
  status: 'completed'
});
```

### ✅ Sanitize Logs

```javascript
// ✅ Use sanitizePaymentForLogging
import { paymentValidator } from '@/lib/services/paymentValidator';

const sanitized = paymentValidator.sanitizePaymentForLogging(paymentData);
// Result: { orderId, amount, currency, paymentMethod, phoneNumber: '***6789' }

loggerService.info('Processing payment', sanitized);
```

### ❌ Don't

```javascript
// ❌ Don't log sensitive information
console.error('Payment error:', {
  creditCard: request.body.cardNumber,
  fullPhone: '+255754123456',
  apiKey: process.env.CLICKPESA_API_KEY,
  userPassword: userData.password,
});

// ❌ Don't use console directly
console.error('Something failed'); // No context!

// ❌ Don't ignore errors
try {
  await processPayment();
} catch (error) {
  // Silently failing!
}
```

---

## 5. Database Security

### ✅ RLS Policies

```sql
-- ✅ Always use Row Level Security
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;

-- ✅ Users can only see their own data
CREATE POLICY "users_read_own_escrow"
ON public.escrow_accounts
FOR SELECT
TO authenticated
USING (
  buyer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM vendor_profiles vp
    WHERE vp.id = escrow_accounts.vendor_id
    AND vp.user_id = auth.uid()
  )
);

-- ✅ Admins can see all data
CREATE POLICY "admins_manage_escrow"
ON public.escrow_accounts
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());
```

### ✅ Idempotency Cleanup

```javascript
// ✅ Cleanup expired idempotency keys
import { cleanupExpiredKeys } from '@/lib/services/idempotencyService';

// Schedule daily cleanup (or run manually)
setInterval(() => {
  cleanupExpiredKeys().then(count => {
    console.log(`Cleaned up ${count} expired idempotency keys`);
  });
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

---

## 6. Monitoring & Alerting

### ✅ Setup Error Monitoring

```javascript
// ✅ Integrate with monitoring service
// In loggerService.js, implement sendToMonitoring():

// Option 1: Sentry
import * as Sentry from "@sentry/nextjs";

function sendToMonitoring(logData) {
  if (logData.level === 'ERROR' || logData.level === 'CRITICAL') {
    Sentry.captureException(new Error(logData.message), {
      extra: logData.context
    });
  }
}

// Option 2: LogRocket
import LogRocket from 'logrocket';

function sendToMonitoring(logData) {
  LogRocket.log(logData.message, logData.context);
  if (logData.level === 'CRITICAL') {
    LogRocket.identify(logData.context.userId);
  }
}

// Option 3: Datadog
function sendToMonitoring(logData) {
  window.DD_RUM?.log(logData.message, {
    ...logData.context,
    level: logData.level
  });
}
```

### ✅ Setup Admin Alerts

```javascript
// ✅ Alert admins of critical issues
function alertAdmins(message, context) {
  // Option 1: Slack
  fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
    method: 'POST',
    body: JSON.stringify({
      text: `⚠️ CRITICAL: ${message}`,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*${message}*` },
          fields: [
            { type: 'mrkdwn', text: `*Time:*\n${new Date().toISOString()}` },
            { type: 'mrkdwn', text: `*Environment:*\n${process.env.NODE_ENV}` }
          ]
        }
      ]
    })
  });

  // Option 2: Email
  // send to admin@marketplace.com

  // Option 3: PagerDuty
  // Trigger incident
}
```

---

## 7. Compliance & Audit

### ✅ Maintain Audit Trail

```javascript
// ✅ Log all financial operations
loggerService.logTransaction('payment_received', {
  orderId: 'ORD-2025-00123',
  amount: 50000,
  currency: 'TZS',
  userId: 'USER-456',
  paymentMethod: 'mpesa',
  status: 'completed',
  timestamp: new Date().toISOString()
});

// ✅ Export audit logs regularly
// SELECT * FROM audit_logs WHERE created_at > NOW() - INTERVAL '1 month';

// ✅ Store backups
// Monthly backup of all transactions
```

### ✅ Document Security Practices

```markdown
# Security Documentation Template

## Payment Processing
- [x] Idempotency implemented
- [x] Input validation on all amounts
- [x] Signatures verified
- [x] Transactions logged
- [x] Failed payments tracked
- [x] Refunds audited

## Webhook Security
- [x] Signatures verified
- [x] Timestamps validated
- [x] Replay attacks prevented
- [x] All events logged
- [x] Error handling documented

## Error Handling
- [x] All errors logged with context
- [x] Sensitive data sanitized
- [x] Admin alerts enabled
- [x] Error recovery documented
- [x] Monitoring integrated
```

---

## 8. Production Deployment Checklist

### Pre-Deployment
- [ ] All new service files imported correctly
- [ ] No TypeScript errors: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Security check: `npm audit`
- [ ] Environment variables validated
- [ ] Database migration prepared
- [ ] Rollback plan documented

### Deployment
- [ ] Apply database migration
- [ ] Update environment variables (no hardcoding!)
- [ ] Deploy code
- [ ] Test payment flow in production
- [ ] Verify logging works
- [ ] Confirm monitoring alerts
- [ ] Check webhook processing

### Post-Deployment
- [ ] Monitor error logs
- [ ] Verify transactions logged
- [ ] Check idempotency working
- [ ] Confirm webhook processing
- [ ] Test payment recovery
- [ ] Review admin alerts

---

## 9. Regular Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check for failed payments
- [ ] Monitor API response times
- [ ] Verify webhook delivery

### Monthly
- [ ] Analyze payment patterns
- [ ] Review security logs
- [ ] Test disaster recovery
- [ ] Check backup completeness

### Quarterly
- [ ] Rotate API keys
- [ ] Security audit
- [ ] Update dependencies
- [ ] Review access logs

### Annually
- [ ] Full security assessment
- [ ] Penetration testing
- [ ] Compliance review
- [ ] Architecture review

---

## 10. Quick Reference

### Critical Commands

```bash
# Validate environment
npm run validate:config

# Check logs
grep "🚨 CRITICAL" logs/

# Export audit trail
psql -c "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;"

# Check idempotency keys
psql -c "SELECT COUNT(*) FROM idempotency_keys WHERE expires_at > NOW();"

# Rotate secrets
# 1. Generate new key
# 2. Set in production
# 3. Keep old key as backup for 24h
# 4. Remove old key
```

### Emergency Contacts

```
Payment Issues: payments@marketplace.com
Security Issues: security@marketplace.com
Infrastructure: ops@marketplace.com
```

---

## Conclusion

Following these practices ensures:
- ✅ Secure payment processing
- ✅ Compliance with standards
- ✅ Quick issue detection
- ✅ Fast incident response
- ✅ Full audit trail

**Security is not a one-time fix - it requires ongoing attention!** 🔒
