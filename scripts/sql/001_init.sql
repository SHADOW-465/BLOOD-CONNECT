-- Profiles - donor profile tied to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  blood_type text check (blood_type in ('O','A','B','AB')) default null,
  rh text check (rh in ('+','-')) default null,
  last_donation_date date,
  location_lat double precision,
  location_lng double precision,
  radius_km integer default 10,
  availability_status text check (availability_status in ('available','unavailable')) default 'available',
  availability_reason text,
  medical_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Own profile read" on public.profiles for select using (auth.uid() = id);
create policy "Own profile upsert" on public.profiles for insert with check (auth.uid() = id);
create policy "Own profile update" on public.profiles for update using (auth.uid() = id);

-- Emergency Requests
create table if not exists public.emergency_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users(id) on delete set null,
  blood_type text check (blood_type in ('O','A','B','AB')) not null,
  rh text check (rh in ('+','-')) not null,
  urgency text check (urgency in ('low','medium','high','critical')) default 'high',
  units_needed int default 1,
  location_lat double precision,
  location_lng double precision,
  radius_km int default 10,
  status text check (status in ('open','matched','fulfilled','canceled')) default 'open',
  patient_name text,
  patient_age int,
  hospital text,
  contact text,
  created_at timestamptz default now(),
  expires_at timestamptz
);

alter table public.emergency_requests enable row level security;
create policy "Read open requests" on public.emergency_requests for select using (true);
create policy "Create own requests" on public.emergency_requests for insert with check (auth.uid() = requester_id);
create policy "Update own requests" on public.emergency_requests for update using (auth.uid() = requester_id);

-- Request Matches
create table if not exists public.request_matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.emergency_requests(id) on delete cascade,
  donor_id uuid references auth.users(id) on delete cascade,
  distance_km double precision,
  score double precision,
  status text check (status in ('notified','accepted','declined','en_route','arrived')) default 'notified',
  response_time_seconds integer,
  created_at timestamptz default now()
);

alter table public.request_matches enable row level security;
create policy "Read own matches" on public.request_matches for select using (auth.uid() = donor_id);
create policy "Insert system" on public.request_matches for insert with check (true);
create policy "Donor update" on public.request_matches for update using (auth.uid() = donor_id);

-- Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  location text,
  status text check (status in ('pending','confirmed','completed','canceled')) default 'pending',
  created_at timestamptz default now()
);

alter table public.appointments enable row level security;
create policy "Read own appointments" on public.appointments for select using (auth.uid() = donor_id);
create policy "Insert own appointment" on public.appointments for insert with check (auth.uid() = donor_id);
create policy "Update own appointment" on public.appointments for update using (auth.uid() = donor_id);

-- Donations
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references auth.users(id) on delete set null,
  request_id uuid references public.emergency_requests(id) on delete set null,
  volume_ml int,
  donated_at timestamptz default now(),
  status text check (status in ('recorded','verified')) default 'recorded'
);

alter table public.donations enable row level security;
create policy "Read own donations" on public.donations for select using (auth.uid() = donor_id);
create policy "Insert own donation" on public.donations for insert with check (auth.uid() = donor_id);

-- Hospitals (basic)
create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_lat double precision,
  location_lng double precision,
  contact_phone text,
  created_at timestamptz default now()
);

alter table public.hospitals enable row level security;
create policy "Read hospitals" on public.hospitals for select using (true);

-- Inventory per hospital
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references public.hospitals(id) on delete cascade,
  blood_type text check (blood_type in ('O','A','B','AB')) not null,
  rh text check (rh in ('+','-')) not null,
  units int default 0,
  expires_at date,
  updated_at timestamptz default now()
);

alter table public.inventory enable row level security;
create policy "Read inventory" on public.inventory for select using (true);

-- Medical History
create table if not exists public.medical_history (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references auth.users(id) on delete cascade,
  record_type text check (record_type in ('donation','health_check','vaccination','medication','allergy')) not null,
  title text not null,
  description text,
  date_recorded date not null,
  doctor_name text,
  clinic_name text,
  file_url text,
  created_at timestamptz default now()
);

alter table public.medical_history enable row level security;
create policy "Read own medical history" on public.medical_history for select using (auth.uid() = donor_id);
create policy "Insert own medical history" on public.medical_history for insert with check (auth.uid() = donor_id);
create policy "Update own medical history" on public.medical_history for update using (auth.uid() = donor_id);
create policy "Delete own medical history" on public.medical_history for delete using (auth.uid() = donor_id);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('emergency_request','appointment_reminder','donation_reminder','system_update')) not null,
  title text not null,
  message text not null,
  data jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Insert own notifications" on public.notifications for insert with check (auth.uid() = user_id);
create policy "Update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Donation Calendar
create table if not exists public.donation_calendar (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references auth.users(id) on delete cascade,
  scheduled_date date not null,
  location text,
  status text check (status in ('scheduled','confirmed','completed','cancelled')) default 'scheduled',
  reminder_sent boolean default false,
  notes text,
  created_at timestamptz default now()
);

alter table public.donation_calendar enable row level security;
create policy "Read own calendar" on public.donation_calendar for select using (auth.uid() = donor_id);
create policy "Insert own calendar" on public.donation_calendar for insert with check (auth.uid() = donor_id);
create policy "Update own calendar" on public.donation_calendar for update using (auth.uid() = donor_id);
create policy "Delete own calendar" on public.donation_calendar for delete using (auth.uid() = donor_id);

-- Weather Integration
create table if not exists public.weather_alerts (
  id uuid primary key default gen_random_uuid(),
  location_lat double precision not null,
  location_lng double precision not null,
  alert_type text check (alert_type in ('severe_weather','extreme_heat','extreme_cold','storm')) not null,
  severity text check (severity in ('low','medium','high','extreme')) not null,
  message text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz default now()
);

alter table public.weather_alerts enable row level security;
create policy "Read weather alerts" on public.weather_alerts for select using (true);

-- Queue Management
create table if not exists public.donation_queues (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.hospitals(id) on delete cascade,
  donor_id uuid references auth.users(id) on delete cascade,
  check_in_time timestamptz default now(),
  estimated_wait_minutes integer,
  position integer,
  status text check (status in ('waiting','in_progress','completed','cancelled')) default 'waiting',
  completed_at timestamptz
);

alter table public.donation_queues enable row level security;
create policy "Read own queue entries" on public.donation_queues for select using (auth.uid() = donor_id);
create policy "Insert own queue entry" on public.donation_queues for insert with check (auth.uid() = donor_id);
create policy "Update own queue entry" on public.donation_queues for update using (auth.uid() = donor_id);

-- From 002_qr_confirmation.sql
-- Add QR code confirmation columns to donations table
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS confirmation_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
ADD COLUMN IF NOT EXISTS confirmed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS qr_code_url text,
ADD COLUMN IF NOT EXISTS token_expires_at timestamptz DEFAULT (now() + interval '7 days');

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

-- Function and Trigger to create a profile for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to handle accepting a request
create or replace function public.accept_request(request_id_input uuid, donor_id_input uuid)
returns void as $$
begin
  -- Update the request status to 'matched'
  update public.emergency_requests
  set status = 'matched'
  where id = request_id_input;

  -- Create the match record
  insert into public.request_matches(request_id, donor_id, status)
  values(request_id_input, donor_id_input, 'accepted');
end;
$$ language plpgsql;
