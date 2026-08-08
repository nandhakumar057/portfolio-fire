-- ═══════════════════════════════════════════════════════════════
-- Portfolio schema v2 — INCREMENTAL upgrade
-- Only adds what v1 is missing. Safe to run multiple times.
-- Run in: Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- New columns on existing tables
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

alter table messages add column if not exists replied boolean default false;

-- Blog
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

-- Media library
create table if not exists media (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  url text not null,
  type text default 'link',
  size bigint default 0,
  "createdAt" timestamptz default now()
);

-- Settings (site info + admin code hash)
create table if not exists settings (
  id text primary key default gen_random_uuid()::text,
  key text unique not null,
  value text not null,
  "createdAt" timestamptz default now()
);

-- Analytics (per-day, per-path counters)
create table if not exists analytics (
  id text primary key default gen_random_uuid()::text,
  date text not null,
  path text not null,
  views integer default 0,
  visitors integer default 0,
  "createdAt" timestamptz default now(),
  unique (date, path)
);

-- Indexes
create index if not exists blog_posts_status_idx on blog_posts (status);
create index if not exists blog_comments_post_idx on blog_comments (post_id);
create index if not exists analytics_date_idx on analytics (date);

-- RLS for the new tables (publishable/anon key needs full access)
alter table blog_posts enable row level security;
drop policy if exists blog_posts_anon_all on blog_posts;
create policy blog_posts_anon_all on blog_posts for all to anon using (true) with check (true);

alter table blog_comments enable row level security;
drop policy if exists blog_comments_anon_all on blog_comments;
create policy blog_comments_anon_all on blog_comments for all to anon using (true) with check (true);

alter table media enable row level security;
drop policy if exists media_anon_all on media;
create policy media_anon_all on media for all to anon using (true) with check (true);

alter table settings enable row level security;
drop policy if exists settings_anon_all on settings;
create policy settings_anon_all on settings for all to anon using (true) with check (true);

alter table analytics enable row level security;
drop policy if exists analytics_anon_all on analytics;
create policy analytics_anon_all on analytics for all to anon using (true) with check (true);
