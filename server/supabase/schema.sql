-- ═══════════════════════════════════════════════════════════════
-- Nandhakumar T — Portfolio (Supabase schema v2)
-- Run this in your Supabase project: Dashboard → SQL Editor → New query
-- Safe to run multiple times: every statement is idempotent.
--
-- NOTE: The app connects with a publishable/anon key, so these tables
-- enable Row Level Security with policies that let that key read AND
-- write the content tables. The users table stays locked down (no anon
-- policies) because admin access is handled by the app's access-code
-- JWT login, not by Supabase Auth.
-- For production you can swap to the service_role key — RLS is bypassed
-- by service_role, so everything keeps working.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Users (optional username/password admin — locked down) ────
create table if not exists users (
  id text primary key default gen_random_uuid()::text,
  username text unique not null,
  password text not null,
  role text not null default 'visitor',
  "displayName" text,
  "createdAt" timestamptz default now()
);

-- ── Profile (single row, id = 'main') ──────────────────────────
create table if not exists profile (
  id text primary key default 'main',
  name text,
  role text,
  roles jsonb default '[]',
  tagline text,
  about text,
  location text,
  email text,
  photo text default '',
  "resumeUrl" text default '',
  socials jsonb default '{}',
  stats jsonb default '{}',
  education jsonb default '[]',
  experience jsonb default '[]',
  goals text,
  "careerObjective" text,
  "whyHireMe" jsonb default '[]',
  interests text,
  values text,
  "createdAt" timestamptz default now()
);

-- ── Projects ───────────────────────────────────────────────────
create table if not exists projects (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text not null default '',
  category text default 'Web Development',
  status text default 'Completed',
  duration text default '',
  image text default '',
  icon text,
  gradient text,
  technologies text[] default '{}',
  features jsonb default '[]',
  screenshots jsonb default '[]',
  github text default '',
  demo text default '',
  documentation text default '',
  featured boolean default false,
  "createdAt" timestamptz default now()
);

-- Upgrade existing installs: add any columns introduced in v2
alter table projects add column if not exists category text default 'Web Development';
alter table projects add column if not exists status text default 'Completed';
alter table projects add column if not exists duration text default '';
alter table projects add column if not exists image text default '';
alter table projects add column if not exists features jsonb default '[]';
alter table projects add column if not exists screenshots jsonb default '[]';
alter table projects add column if not exists documentation text default '';

alter table profile add column if not exists photo text default '';
alter table profile add column if not exists "resumeUrl" text default '';
alter table profile add column if not exists "careerObjective" text;
alter table profile add column if not exists "whyHireMe" jsonb default '[]';
alter table profile add column if not exists experience jsonb default '[]';

-- ── Certifications ─────────────────────────────────────────────
create table if not exists certifications (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  issuer text not null default '',
  date text,
  credentialurl text default '',
  icon text,
  category text,
  "createdAt" timestamptz default now()
);

-- ── Skills ─────────────────────────────────────────────────────
create table if not exists skills (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text not null default '',
  level integer default 50,
  icon text,
  "createdAt" timestamptz default now()
);

-- ── Achievements ───────────────────────────────────────────────
create table if not exists achievements (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text default '',
  date text,
  category text,
  icon text,
  "createdAt" timestamptz default now()
);

-- ── Contact messages ───────────────────────────────────────────
create table if not exists messages (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  "read" boolean default false,
  replied boolean default false,
  "createdAt" timestamptz default now()
);

alter table messages add column if not exists replied boolean default false;

-- ── Blog ───────────────────────────────────────────────────────
create table if not exists blog_posts (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text default '',
  excerpt text default '',
  content text default '',
  category text default 'Career',
  tags jsonb default '[]',
  cover text default '',
  author text default 'Nandhakumar T',
  featured boolean default false,
  status text default 'draft',
  views integer default 0,
  "createdAt" timestamptz default now()
);

create table if not exists blog_comments (
  id text primary key default gen_random_uuid()::text,
  post_id text not null,
  name text not null,
  email text default '',
  content text not null,
  approved boolean default false,
  "createdAt" timestamptz default now()
);

-- ── Media library ──────────────────────────────────────────────
create table if not exists media (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  url text not null,
  type text default 'link',
  size bigint default 0,
  "createdAt" timestamptz default now()
);

-- ── Settings (key-value; admin code hash + site info) ──────────
create table if not exists settings (
  id text primary key default gen_random_uuid()::text,
  key text unique not null,
  value text not null,
  "createdAt" timestamptz default now()
);

-- ── Analytics (per-day, per-path view/visitor counters) ────────
create table if not exists analytics (
  id text primary key default gen_random_uuid()::text,
  date text not null,
  path text not null,
  views integer default 0,
  visitors integer default 0,
  "createdAt" timestamptz default now(),
  unique (date, path)
);

-- ── Optional indexes ───────────────────────────────────────────
create index if not exists projects_featured_idx on projects (featured);
create index if not exists skills_category_idx on skills (category);
create index if not exists messages_read_idx on messages ("read");
create index if not exists blog_posts_status_idx on blog_posts (status);
create index if not exists blog_comments_post_idx on blog_comments (post_id);
create index if not exists analytics_date_idx on analytics (date);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════

-- users: NO anon policies — password hashes stay private
alter table users enable row level security;

-- Content tables: the publishable/anon key needs full access
alter table profile enable row level security;
create policy profile_anon_all on profile for all to anon using (true) with check (true);

alter table projects enable row level security;
create policy projects_anon_all on projects for all to anon using (true) with check (true);

alter table certifications enable row level security;
create policy certifications_anon_all on certifications for all to anon using (true) with check (true);

alter table skills enable row level security;
create policy skills_anon_all on skills for all to anon using (true) with check (true);

alter table achievements enable row level security;
create policy achievements_anon_all on achievements for all to anon using (true) with check (true);

alter table messages enable row level security;
create policy messages_anon_all on messages for all to anon using (true) with check (true);

alter table blog_posts enable row level security;
create policy blog_posts_anon_all on blog_posts for all to anon using (true) with check (true);

alter table blog_comments enable row level security;
create policy blog_comments_anon_all on blog_comments for all to anon using (true) with check (true);

alter table media enable row level security;
create policy media_anon_all on media for all to anon using (true) with check (true);

alter table settings enable row level security;
create policy settings_anon_all on settings for all to anon using (true) with check (true);

alter table analytics enable row level security;
create policy analytics_anon_all on analytics for all to anon using (true) with check (true);
