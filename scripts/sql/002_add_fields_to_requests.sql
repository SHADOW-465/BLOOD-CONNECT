-- Add new fields to emergency_requests table
ALTER TABLE public.emergency_requests
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS age int,
ADD COLUMN IF NOT EXISTS patient_status text,
ADD COLUMN IF NOT EXISTS hospital text,
ADD COLUMN IF NOT EXISTS contact_number text;
