-- Blood Connect Database Setup Script
-- This script sets up the complete database schema for the Blood Connect application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.request_shares CASCADE;
DROP TABLE IF EXISTS public.donation_queues CASCADE;
DROP TABLE IF EXISTS public.weather_alerts CASCADE;
DROP TABLE IF EXISTS public.donation_calendar CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.medical_history CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.hospitals CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.request_matches CASCADE;
DROP TABLE IF EXISTS public.emergency_requests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles - donor profile tied to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  phone text,
  blood_type text CHECK (blood_type IN ('O','A','B','AB')) DEFAULT NULL,
  rh text CHECK (rh IN ('+','-')) DEFAULT NULL,
  last_donation_date date,
  location_lat double precision,
  location_lng double precision,
  radius_km integer DEFAULT 10,
  availability_status text CHECK (availability_status IN ('available','unavailable')) DEFAULT 'available',
  availability_reason text,
  medical_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Emergency Requests
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  blood_type text CHECK (blood_type IN ('O','A','B','AB')) NOT NULL,
  rh text CHECK (rh IN ('+','-')) NOT NULL,
  urgency text CHECK (urgency IN ('low','medium','high','critical')) DEFAULT 'high',
  units_needed int DEFAULT 1,
  location_lat double precision,
  location_lng double precision,
  radius_km int DEFAULT 10,
  status text CHECK (status IN ('open','matched','fulfilled','canceled')) DEFAULT 'open',
  patient_name text,
  patient_age int,
  hospital text,
  contact text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Request Matches
CREATE TABLE IF NOT EXISTS public.request_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  distance_km double precision,
  score double precision,
  status text CHECK (status IN ('notified','accepted','declined','en_route','arrived')) DEFAULT 'notified',
  response_time_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  location text,
  status text CHECK (status IN ('pending','confirmed','completed','canceled')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Donations
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id uuid REFERENCES public.emergency_requests(id) ON DELETE SET NULL,
  volume_ml int,
  donated_at timestamptz DEFAULT now(),
  status text CHECK (status IN ('recorded','verified')) DEFAULT 'recorded',
  confirmation_token uuid DEFAULT gen_random_uuid(),
  confirmed_at timestamptz,
  confirmed_by uuid REFERENCES auth.users(id),
  qr_code_url text,
  token_expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Hospitals (basic)
CREATE TABLE IF NOT EXISTS public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_lat double precision,
  location_lng double precision,
  contact_phone text,
  created_at timestamptz DEFAULT now()
);

-- Inventory per hospital
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
  blood_type text CHECK (blood_type IN ('O','A','B','AB')) NOT NULL,
  rh text CHECK (rh IN ('+','-')) NOT NULL,
  units int DEFAULT 0,
  expires_at date,
  updated_at timestamptz DEFAULT now()
);

-- Medical History
CREATE TABLE IF NOT EXISTS public.medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type text CHECK (record_type IN ('donation','health_check','vaccination','medication','allergy')) NOT NULL,
  title text NOT NULL,
  description text,
  date_recorded date NOT NULL,
  doctor_name text,
  clinic_name text,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('emergency_request','appointment_reminder','donation_reminder','system_update')) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Donation Calendar
CREATE TABLE IF NOT EXISTS public.donation_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  location text,
  status text CHECK (status IN ('scheduled','confirmed','completed','cancelled')) DEFAULT 'scheduled',
  reminder_sent boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Weather Integration
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_lat double precision NOT NULL,
  location_lng double precision NOT NULL,
  alert_type text CHECK (alert_type IN ('severe_weather','extreme_heat','extreme_cold','storm')) NOT NULL,
  severity text CHECK (severity IN ('low','medium','high','extreme')) NOT NULL,
  message text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Queue Management
CREATE TABLE IF NOT EXISTS public.donation_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_time timestamptz DEFAULT now(),
  estimated_wait_minutes integer,
  position integer,
  status text CHECK (status IN ('waiting','in_progress','completed','cancelled')) DEFAULT 'waiting',
  completed_at timestamptz
);

-- Share tracking table for requests
CREATE TABLE IF NOT EXISTS public.request_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  shared_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text, -- 'native', 'clipboard', 'whatsapp', etc.
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_location ON public.emergency_requests(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_blood_type ON public.emergency_requests(blood_type, rh);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_created_at ON public.emergency_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_confirmation_token ON public.donations(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_donations_confirmed_at ON public.donations(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_type ON public.profiles(blood_type, rh);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile upsert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Emergency requests policies
CREATE POLICY "Read open requests" ON public.emergency_requests FOR SELECT USING (true);
CREATE POLICY "Create own requests" ON public.emergency_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Update own requests" ON public.emergency_requests FOR UPDATE USING (auth.uid() = requester_id);

-- Request matches policies
CREATE POLICY "Read own matches" ON public.request_matches FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Insert system" ON public.request_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Donor update" ON public.request_matches FOR UPDATE USING (auth.uid() = donor_id);

-- Appointments policies
CREATE POLICY "Read own appointments" ON public.appointments FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Insert own appointment" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Update own appointment" ON public.appointments FOR UPDATE USING (auth.uid() = donor_id);

-- Donations policies
CREATE POLICY "Read own donations" ON public.donations FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Insert own donation" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- Hospitals policies
CREATE POLICY "Read hospitals" ON public.hospitals FOR SELECT USING (true);

-- Inventory policies
CREATE POLICY "Read inventory" ON public.inventory FOR SELECT USING (true);

-- Medical history policies
CREATE POLICY "Read own medical history" ON public.medical_history FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Insert own medical history" ON public.medical_history FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Update own medical history" ON public.medical_history FOR UPDATE USING (auth.uid() = donor_id);
CREATE POLICY "Delete own medical history" ON public.medical_history FOR DELETE USING (auth.uid() = donor_id);

-- Notifications policies
CREATE POLICY "Read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Donation calendar policies
CREATE POLICY "Read own calendar" ON public.donation_calendar FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Insert own calendar" ON public.donation_calendar FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Update own calendar" ON public.donation_calendar FOR UPDATE USING (auth.uid() = donor_id);
CREATE POLICY "Delete own calendar" ON public.donation_calendar FOR DELETE USING (auth.uid() = donor_id);

-- Weather alerts policies
CREATE POLICY "Read weather alerts" ON public.weather_alerts FOR SELECT USING (true);

-- Queue policies
CREATE POLICY "Read own queue entries" ON public.donation_queues FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Insert own queue entry" ON public.donation_queues FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Update own queue entry" ON public.donation_queues FOR UPDATE USING (auth.uid() = donor_id);

-- Request shares policies
CREATE POLICY "Read own shares" ON public.request_shares FOR SELECT USING (auth.uid() = shared_by);
CREATE POLICY "Insert own shares" ON public.request_shares FOR INSERT WITH CHECK (auth.uid() = shared_by);

-- Function and Trigger to create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to handle accepting a request
CREATE OR REPLACE FUNCTION public.accept_request(request_id_input uuid, donor_id_input uuid)
RETURNS void AS $$
BEGIN
  -- Update the request status to 'matched'
  UPDATE public.emergency_requests
  SET status = 'matched'
  WHERE id = request_id_input;

  -- Create the match record
  INSERT INTO public.request_matches(request_id, donor_id, status)
  VALUES(request_id_input, donor_id_input, 'accepted');
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO public.hospitals (id, name, location_lat, location_lng, contact_phone) VALUES
  (gen_random_uuid(), 'City General Hospital', 40.7128, -74.0060, '+1-555-0101'),
  (gen_random_uuid(), 'Regional Medical Center', 40.7589, -73.9851, '+1-555-0102'),
  (gen_random_uuid(), 'Community Health Center', 40.7505, -73.9934, '+1-555-0103')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
