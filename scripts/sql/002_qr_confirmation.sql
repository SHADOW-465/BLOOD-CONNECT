-- Add QR code confirmation columns to donations table
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS confirmation_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
ADD COLUMN IF NOT EXISTS confirmed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS qr_code_url text,
ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '7 days');

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_donations_confirmation_token ON public.donations(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_donations_confirmed_at ON public.donations(confirmed_at);

-- Add share tracking table for requests
CREATE TABLE IF NOT EXISTS public.request_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  shared_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text, -- 'native', 'clipboard', 'whatsapp', etc.
  created_at timestamptz DEFAULT now()
);

-- RLS policies for request_shares
ALTER TABLE public.request_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own shares" ON public.request_shares FOR SELECT USING (auth.uid() = shared_by);
CREATE POLICY "Insert own shares" ON public.request_shares FOR INSERT WITH CHECK (auth.uid() = shared_by);