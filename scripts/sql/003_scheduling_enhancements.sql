-- Add scheduling-related columns to the hospitals table
alter table public.hospitals
add column if not exists operating_hours jsonb,
add column if not exists appointment_duration_minutes integer default 30;

-- Add sample data for testing purposes
-- This assumes some hospitals were already inserted in 001_init.sql or manually.
-- We use insert with on conflict to be safe.
insert into public.hospitals (id, name, location_lat, location_lng, contact_phone, operating_hours, appointment_duration_minutes)
values
  (
    '8c6c8f4e-3e4b-4c5a-9b0a-2b0a3a7b1e9f', -- A specific UUID for consistency
    'City General Hospital',
    12.9716, -- Bangalore lat
    77.5946, -- Bangalore lng
    '9876543210',
    '{
      "monday": {"open": "09:00", "close": "17:00"},
      "tuesday": {"open": "09:00", "close": "17:00"},
      "wednesday": {"open": "09:00", "close": "17:00"},
      "thursday": {"open": "09:00", "close": "17:00"},
      "friday": {"open": "09:00", "close": "17:00"}
    }',
    30
  ),
  (
    'f0b9b5a7-5b6a-4b0c-8c1a-3a0b9b5a7b0c',
    'Community Blood Center',
    19.0760, -- Mumbai lat
    72.8777, -- Mumbai lng
    '8765432109',
    '{
      "monday": {"open": "10:00", "close": "18:00"},
      "tuesday": {"open": "10:00", "close": "18:00"},
      "wednesday": {"open": "10:00", "close": "18:00"},
      "thursday": {"open": "10:00", "close": "18:00"},
      "friday": {"open": "10:00", "close": "18:00"},
      "saturday": {"open": "10:00", "close": "14:00"}
    }',
    20
  )
on conflict (id) do update
set
  name = excluded.name,
  location_lat = excluded.location_lat,
  location_lng = excluded.location_lng,
  contact_phone = excluded.contact_phone,
  operating_hours = excluded.operating_hours,
  appointment_duration_minutes = excluded.appointment_duration_minutes;
