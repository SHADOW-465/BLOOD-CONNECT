-- First, drop the overly permissive policy from the previous attempt to ensure a clean state.
drop policy if exists "Allow authenticated read access on profiles" on public.profiles;

-- Restore the original, secure policy that only allows a user to read their own profile.
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
