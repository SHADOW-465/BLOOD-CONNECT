-- In the base schema, the policy for reading profiles should be restrictive.
-- A user should only be able to read their own profile.
-- This is secure by default. The `001_init.sql` already sets this up.
-- This file ensures that policy is in place and creates a secure way for the
-- application to read a limited subset of data for matching purposes.

-- Drop any potentially lingering permissive policies from old attempts.
drop policy if exists "Allow authenticated read access on profiles" on public.profiles;

-- Ensure the restrictive "read own profile" policy exists.
-- The "if not exists" is not supported on `create policy`, so we drop and create.
drop policy if exists "Own profile read" on public.profiles;
create policy "Own profile read" on public.profiles
for select
using (auth.uid() = id);

-- Create a new, secure view that exposes only the non-sensitive data required for matching.
create or replace view public.donor_profiles_for_matching as
select
  id,
  name,
  blood_type,
  rh,
  last_donation_date,
  location_lat,
  location_lng,
  availability_status
from
  public.profiles;

-- Grant select access on this new view to all authenticated users.
-- The matching service will query this view instead of the base table.
grant select on public.donor_profiles_for_matching to authenticated;
