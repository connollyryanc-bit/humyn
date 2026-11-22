-- 0004 — deep-dive insights on people, plus a fix for the people id counter.
-- Apply once via the Supabase SQL editor. Idempotent.

-- 1. Deep-dive insights (traits, strengths, blind spots, coaching) stored as JSON.
alter table people
  add column if not exists insights jsonb;

-- 2. The seeded people were inserted with fixed ids, which leaves the id counter
--    behind and makes new saves fail with "people_pkey" duplicate errors.
--    Move the counter past the highest existing id.
select setval(
  pg_get_serial_sequence('people', 'id'),
  (select coalesce(max(id), 1) from people)
);
