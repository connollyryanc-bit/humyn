-- 0002 — add day_rate_eur to people.
-- Apply once via the Supabase SQL editor. Idempotent.

alter table people
  add column if not exists day_rate_eur integer not null default 0;

-- Optional: backfill sensible defaults by role band for any existing rows
-- that still sit at 0. Re-running this snippet is safe — the COALESCE only
-- overwrites zeros.
update people
set day_rate_eur = case
  when day_rate_eur > 0 then day_rate_eur
  when role ilike '%director%'        then 3500
  when role ilike '%client partner%'  then 3500
  when role ilike '%partner%'         then 3500
  when role ilike '%principal%'       then 2800
  when role ilike '%lead%'            then 2800
  when role ilike '%manager%'         then 2800
  when role ilike '%senior%'          then 2000
  else 1500
end
where day_rate_eur = 0;
