-- Create idempotency_keys table for preventing duplicate processing
-- This table tracks API requests to prevent double-charging and duplicate operations

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Index for faster lookups and cleanup
  CONSTRAINT key_not_empty CHECK (key != '')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON public.idempotency_keys(key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON public.idempotency_keys(expires_at);

-- Create cleanup trigger to auto-delete expired keys (runs daily)
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM public.idempotency_keys
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (note: requires pg_cron extension)
-- SELECT cron.schedule('cleanup-idempotency-keys', '0 2 * * *', 'SELECT cleanup_expired_idempotency_keys()');
