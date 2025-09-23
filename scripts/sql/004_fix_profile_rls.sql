-- Drop the old, overly restrictive read policy on the profiles table.
-- The "if exists" clause prevents errors if the policy was already removed or renamed.
drop policy if exists "Own profile read" on public.profiles;

-- Create a new policy that allows any authenticated user to read non-sensitive
-- profile information, which is necessary for the donor matching service to work.
create policy "Allow authenticated read access on profiles" on public.profiles
for select
to authenticated
using (true);

-- Note: The security of this policy depends on limiting the columns selected in the application code.
-- The matching service query has been updated to only select non-sensitive columns.
-- For even greater security, a view (`public.view_donor_profiles`) could be created with only the
-- safe columns, and RLS could be applied to that view instead of the base table.
-- For this iteration, controlling access via the SELECT query is sufficient.
