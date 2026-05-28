-- 0003 — rate cards
-- A central per-role × seniority × market day-rate table. Person.day_rate_eur
-- stays as the explicit override; when it's 0 we look up the rate card.
-- Apply once via the Supabase SQL editor. Idempotent.

create table if not exists rate_cards (
  id            bigserial primary key,
  role_band     text        not null,
  seniority     text        not null,
  market        text        not null,
  day_rate_eur  integer     not null default 0,
  notes         text        not null default '',
  updated_at    timestamptz not null default now(),
  unique (role_band, seniority, market)
);

drop trigger if exists rate_cards_set_updated_at on rate_cards;
create trigger rate_cards_set_updated_at
before update on rate_cards
for each row execute function set_updated_at();

alter table rate_cards disable row level security;

-- Seed with the same defaults the people table used so behaviour is
-- unchanged on day one. Edit these any time via /settings/rate-card.
insert into rate_cards (role_band, seniority, market, day_rate_eur) values
  ('Engagement / Account', 'Director',  'Stockholm',  3500),
  ('Engagement / Account', 'Director',  'Oslo',       3500),
  ('Engagement / Account', 'Director',  'Copenhagen', 3500),
  ('Engagement / Account', 'Director',  'Helsinki',   3500),
  ('Engagement / Account', 'Principal', 'Stockholm',  2800),
  ('Engagement / Account', 'Principal', 'Oslo',       2800),
  ('Engagement / Account', 'Principal', 'Copenhagen', 2800),
  ('Engagement / Account', 'Principal', 'Helsinki',   2800),
  ('Engagement / Account', 'Senior',    'Stockholm',  2000),
  ('Engagement / Account', 'Senior',    'Oslo',       2000),
  ('Engagement / Account', 'Senior',    'Copenhagen', 2000),
  ('Engagement / Account', 'Senior',    'Helsinki',   2000),
  ('Engagement / Account', 'Mid',       'Stockholm',  1500),
  ('Engagement / Account', 'Mid',       'Oslo',       1500),
  ('Engagement / Account', 'Mid',       'Copenhagen', 1500),
  ('Engagement / Account', 'Mid',       'Helsinki',   1500),
  ('Engineering',          'Director',  'Stockholm',  3500),
  ('Engineering',          'Director',  'Oslo',       3500),
  ('Engineering',          'Director',  'Copenhagen', 3500),
  ('Engineering',          'Director',  'Helsinki',   3500),
  ('Engineering',          'Principal', 'Stockholm',  2800),
  ('Engineering',          'Principal', 'Oslo',       2800),
  ('Engineering',          'Principal', 'Copenhagen', 2800),
  ('Engineering',          'Principal', 'Helsinki',   2800),
  ('Engineering',          'Senior',    'Stockholm',  2000),
  ('Engineering',          'Senior',    'Oslo',       2000),
  ('Engineering',          'Senior',    'Copenhagen', 2000),
  ('Engineering',          'Senior',    'Helsinki',   2000),
  ('Engineering',          'Mid',       'Stockholm',  1500),
  ('Engineering',          'Mid',       'Oslo',       1500),
  ('Engineering',          'Mid',       'Copenhagen', 1500),
  ('Engineering',          'Mid',       'Helsinki',   1500),
  ('Design / UX',          'Director',  'Stockholm',  3500),
  ('Design / UX',          'Director',  'Oslo',       3500),
  ('Design / UX',          'Director',  'Copenhagen', 3500),
  ('Design / UX',          'Director',  'Helsinki',   3500),
  ('Design / UX',          'Senior',    'Stockholm',  2000),
  ('Design / UX',          'Senior',    'Oslo',       2000),
  ('Design / UX',          'Senior',    'Copenhagen', 2000),
  ('Design / UX',          'Senior',    'Helsinki',   2000),
  ('Design / UX',          'Mid',       'Stockholm',  1500),
  ('Design / UX',          'Mid',       'Oslo',       1500),
  ('Design / UX',          'Mid',       'Copenhagen', 1500),
  ('Design / UX',          'Mid',       'Helsinki',   1500),
  ('Strategy / Data',      'Principal', 'Stockholm',  2800),
  ('Strategy / Data',      'Principal', 'Oslo',       2800),
  ('Strategy / Data',      'Principal', 'Copenhagen', 2800),
  ('Strategy / Data',      'Principal', 'Helsinki',   2800),
  ('Strategy / Data',      'Senior',    'Stockholm',  2000),
  ('Strategy / Data',      'Senior',    'Oslo',       2000),
  ('Strategy / Data',      'Senior',    'Copenhagen', 2000),
  ('Strategy / Data',      'Senior',    'Helsinki',   2000),
  ('Delivery / PM',        'Director',  'Stockholm',  3500),
  ('Delivery / PM',        'Director',  'Oslo',       3500),
  ('Delivery / PM',        'Director',  'Copenhagen', 3500),
  ('Delivery / PM',        'Director',  'Helsinki',   3500),
  ('Delivery / PM',        'Senior',    'Stockholm',  2000),
  ('Delivery / PM',        'Senior',    'Oslo',       2000),
  ('Delivery / PM',        'Senior',    'Copenhagen', 2000),
  ('Delivery / PM',        'Senior',    'Helsinki',   2000)
on conflict (role_band, seniority, market) do nothing;
