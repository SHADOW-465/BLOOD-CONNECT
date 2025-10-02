-- Seed data for Uyir Thuli Application

-- Note: This script assumes that the users have already been created
-- through Supabase authentication. The user IDs here are placeholders.
-- You should replace 'user_id_1', 'user_id_2', etc., with actual UUIDs
-- from your `auth.users` table after creating test users.

-- Seed Hospitals
INSERT INTO public.hospitals (name, location_lat, location_lng, contact_phone) VALUES
('City General Hospital', 40.7128, -74.0060, '123-456-7890'),
('Community Medical Center', 34.0522, -118.2437, '987-654-3210'),
('Sunrise Health Clinic', 41.8781, -87.6298, '555-123-4567');

-- Seed User Profiles
-- Replace the `id` with actual UUIDs from your `auth.users` table.
-- To get the UUIDs, you can run `select id, email from auth.users;` in your Supabase SQL Editor.
-- Example: INSERT INTO public.profiles (id, name, phone, blood_type, rh, last_donation_date) VALUES ('your-auth-user-uuid', ...);

-- INSERT INTO public.profiles (id, name, phone, blood_type, rh, last_donation_date) VALUES
-- ('user_id_1', 'John Doe', '111-222-3333', 'A', '+', '2023-01-15'),
-- ('user_id_2', 'Jane Smith', '444-555-6666', 'O', '-', NULL);


-- Seed an Emergency Request
-- This assumes 'user_id_2' exists in your auth.users and profiles table.
-- INSERT INTO public.emergency_requests (requester_id, blood_type, rh, urgency, units_needed, patient_name, patient_age, hospital, contact, expires_at) VALUES
-- ('user_id_2', 'A', '+', 'urgent', 2, 'Alice Johnson', 45, 'City General Hospital', '123-123-1234', NOW() + interval '24 hours');


-- Seed Inventory for a hospital
-- This assumes a hospital has been created and you have its ID.
-- INSERT INTO public.inventory (hospital_id, blood_type, rh, units) VALUES
-- ((SELECT id from public.hospitals WHERE name = 'City General Hospital'), 'A', '+', 15),
-- ((SELECT id from public.hospitals WHERE name = 'City General Hospital'), 'O', '-', 8);

-- Note on usage:
-- 1. Create test users in your Supabase Authentication dashboard.
-- 2. Get their UUIDs from the `auth.users` table.
-- 3. Uncomment and replace the placeholder UUIDs in this script.
-- 4. Run this script in your Supabase SQL Editor to seed the database.