-- Humyn — Supabase schema
-- Apply once via the Supabase SQL editor. Idempotent: safe to run again.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'energy_key') then
    create type energy_key as enum ('red', 'yellow', 'green', 'blue');
  end if;
  if not exists (select 1 from pg_type where typname = 'avail_key') then
    create type avail_key as enum ('now', 'soon', 'allocated');
  end if;
  if not exists (select 1 from pg_type where typname = 'risk_level') then
    create type risk_level as enum ('high', 'medium', 'watch', 'low');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- people
-- ---------------------------------------------------------------------------

create table if not exists people (
  id                bigserial primary key,
  name              text        not null,
  initials          text        not null,
  role              text        not null,
  location          text        not null,
  primary_energy    energy_key  not null,
  secondary_energy  energy_key  not null,
  score_red         int         not null default 0,
  score_yellow      int         not null default 0,
  score_green       int         not null default 0,
  score_blue        int         not null default 0,
  utilisation       int         not null default 0,
  available         avail_key   not null default 'soon',
  clients           int         not null default 0,
  revenue           text        not null default '€0',
  bio               text        not null default '',
  capabilities      text[]      not null default '{}',
  achievements      text[]      not null default '{}',
  best_trait        text        not null default '',
  vice              text        not null default '',
  wheel_position    text        not null default '',
  drivers           text[]      not null default '{}',
  detractors        text[]      not null default '{}',
  how_to_speak      text        not null default '',
  how_to_email      text        not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- capacity_data — one row per person
-- ---------------------------------------------------------------------------

create table if not exists capacity_data (
  person_id              bigint      primary key references people(id) on delete cascade,
  bench_days             int         not null default 0,
  loyalty_score          int         not null default 80,
  risk_level             risk_level  not null default 'low',
  risk_reasons           text[]      not null default '{}',
  recommended_action     text        not null default '',
  replacement_cost       int         not null default 0,
  lost_revenue_3_months  int         not null default 0,
  onboarding_cost        int         not null default 0,
  key_client_at_risk     text,
  current_project        text,
  burnout_risk           boolean     not null default false,
  updated_at             timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- teams — composed sets of people for projects, pitches, brief responses
-- ---------------------------------------------------------------------------

create table if not exists teams (
  id            bigserial   primary key,
  name          text        not null,
  description   text        not null default '',
  client        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists team_members (
  team_id     bigint references teams(id) on delete cascade,
  person_id   bigint references people(id) on delete cascade,
  role        text not null default '',
  primary key (team_id, person_id)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists people_set_updated_at on people;
create trigger people_set_updated_at
before update on people
for each row execute function set_updated_at();

drop trigger if exists capacity_data_set_updated_at on capacity_data;
create trigger capacity_data_set_updated_at
before update on capacity_data
for each row execute function set_updated_at();

drop trigger if exists teams_set_updated_at on teams;
create trigger teams_set_updated_at
before update on teams
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security
-- All access is via the service role from Next.js server code, so we keep RLS
-- disabled until we add user auth. When auth lands, enable RLS here and add
-- per-role policies.
-- ---------------------------------------------------------------------------

alter table people         disable row level security;
alter table capacity_data  disable row level security;
alter table teams          disable row level security;
alter table team_members   disable row level security;
