# Blinno Marketplace - Configuration Guide

## ⚠️ SECURITY WARNINGS - READ FIRST

### Critical Security Issues
1. **NEVER commit real credentials to git repository**
   - The example credentials shown below are INVALIDATED
   - IMMEDIATELY rotate these keys if they were ever active
   - Use environment variables and `.env.local` for all sensitive data

2. **Environment Variables Protection**
   - `.env.local` files should be added to `.gitignore`
   - Never commit `.env.local` or any files containing secrets
   - Use GitHub Secrets for CI/CD deployments
   - Rotate keys regularly (at least quarterly)

3. **API Key Security**
   - Store all API keys in Supabase vault or GitHub Secrets
   - Use separate keys for development and production
   - Monitor API key usage for suspicious activity
   - Implement rate limiting on sensitive endpoints

4. **Payment Processing**
   - All payment operations logged with transaction IDs
   - Webhook signatures verified before processing
   - Idempotency keys prevent duplicate charges
   - Failed payments are not silently ignored

5. **Row-Level Security (RLS)**
   - All financial data protected by RLS policies
   - Users can only access their own data
   - Admins have special elevated permissions
   - Policies enforced at database level

## Environment Variables Setup

Create a `.env.local` file in the project root with the following variables:

```env
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
# ⚠️ IMPORTANT: Get these from Supabase dashboard, NOT from code
# Project Settings → API → Project URL and Anon Key
# https://app.supabase.com/project/[your-project]/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-key

# ===========================================
# CLICKPESA PAYMENT GATEWAY (Tanzania)
# ===========================================
# ⚠️ PRODUCTION: Use real credentials
# ⚠️ SANDBOX: Use test credentials for development
# Sign up at https://clickpesa.com to get your API credentials
CLICKPESA_API_KEY=your-actual-clickpesa-api-key
CLICKPESA_API_SECRET=your-actual-clickpesa-api-secret
CLICKPESA_MERCHANT_ID=your-actual-merchant-id
CLICKPESA_ENVIRONMENT=sandbox  # Use 'production' only in production
CLICKPESA_WEBHOOK_SECRET=your-webhook-secret-for-verification

# ===========================================
# TWILIO SMS CONFIGURATION
# ===========================================
# ⚠️ Get credentials from https://www.twilio.com/console
# Account Info → Account SID and Auth Token
TWILIO_ACCOUNT_SID=your-actual-twilio-account-sid
TWILIO_AUTH_TOKEN=your-actual-twilio-auth-token
TWILIO_PHONE_NUMBER=+255XXXXXXXXX

# ===========================================
# RESEND EMAIL CONFIGURATION
# ===========================================
# ⚠️ Get API key from https://resend.com/api-keys
# Must be a production key for email verification
RESEND_API_KEY=re_your-actual-resend-api-key

# ===========================================
# APPLICATION SETTINGS
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:4028
NEXT_PUBLIC_APP_NAME=Blinno Marketplace
```

## Best Practices for Secret Management

### Local Development
```bash
# 1. Create .env.local (never commit this!)
cp .env.example .env.local

# 2. Edit with your development credentials
nano .env.local

# 3. Ensure .gitignore includes:
.env.local
.env.*.local
```

### Environment Validation
The application validates all required environment variables on startup:
- Missing credentials are logged as CRITICAL errors
- Production mode will fail startup if credentials are missing
- Development mode shows warnings but allows testing

### Monitoring & Rotation
```javascript
// All API calls are logged with:
- Timestamp
- Operation type
- Request/response summary (no sensitive data)
- Error details if failure occurs
- Transaction IDs for audit trail

// Failed operations trigger:
- Automatic logging to monitoring service
- Admin notifications for critical errors
- Detailed error responses to client (safe messages)
```

## Supabase Edge Function Secrets

Set these secrets in your Supabase project dashboard under Edge Functions → Secrets:

| Secret Name | Description |
|-------------|-------------|
| `RESEND_API_KEY` | API key from Resend.com for email sending |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number (e.g., +255...) |
| `CLICKPESA_API_KEY` | ClickPesa API key |
| `CLICKPESA_API_SECRET` | ClickPesa API secret |
| `CLICKPESA_MERCHANT_ID` | Your ClickPesa merchant ID |
| `CLICKPESA_WEBHOOK_SECRET` | Secret for verifying webhook signatures |

## Setting Up Third-Party Services

### 1. ClickPesa (Payment Gateway)

1. Go to [ClickPesa](https://clickpesa.com) and create a merchant account
2. Get your API credentials from the dashboard
3. Configure webhook URL: `https://jlaojzmalvkqvzademrf.supabase.co/functions/v1/clickpesa-webhook`
4. Supported payment methods:
   - M-Pesa (Vodacom Tanzania)
   - Tigo Pesa
   - Visa/Mastercard
   - Bank Transfer

### 2. Twilio (SMS Notifications)

1. Sign up at [Twilio](https://www.twilio.com)
2. Get a phone number with Tanzania (+255) capability
3. Copy Account SID and Auth Token from dashboard
4. Add the secrets to Supabase Edge Functions

### 3. Resend (Email Service)

1. Sign up at [Resend](https://resend.com)
2. Verify your domain for production emails
3. Copy API key from dashboard
4. Add the `RESEND_API_KEY` secret to Supabase Edge Functions

## Edge Functions

The following edge functions are deployed and active:

| Function | Purpose | URL |
|----------|---------|-----|
| `send-email` | Send transactional emails via Resend | `https://jlaojzmalvkqvzademrf.supabase.co/functions/v1/send-email` |
| `send-sms` | Send SMS notifications via Twilio | `https://jlaojzmalvkqvzademrf.supabase.co/functions/v1/send-sms` |
| `clickpesa-webhook` | Handle ClickPesa payment callbacks | `https://jlaojzmalvkqvzademrf.supabase.co/functions/v1/clickpesa-webhook` |

### ClickPesa Webhook Configuration

Configure this URL in your ClickPesa dashboard as the callback/webhook URL:
```
https://jlaojzmalvkqvzademrf.supabase.co/functions/v1/clickpesa-webhook
```

This webhook handles:
- Payment success notifications
- Payment failure notifications  
- Auto-updates order status on successful payment
- Creates in-app notifications for buyers
- Sends SMS confirmations

## Test Accounts

Default test accounts (password format: `{Role}@123`):

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@blinno.com | Buyer@123 |
| Vendor | vendor@blinno.com | Vendor@123 |
| Admin | admin@blinno.com | Admin@123 |

