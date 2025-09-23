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
