-- V8.7 - depoimentos administráveis e status de e-mail do cliente
create table if not exists public.commercial_public_testimonials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  franchisee_name text,
  location text,
  youtube_url text not null,
  youtube_video_id text not null,
  placement text[] not null default array['history']::text[],
  sort_order integer not null default 100,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.commercial_public_testimonials enable row level security;

drop policy if exists "public testimonials readable" on public.commercial_public_testimonials;
create policy "public testimonials readable" on public.commercial_public_testimonials
for select using (active = true or public.is_commercial_admin());

drop policy if exists "admins manage testimonials" on public.commercial_public_testimonials;
create policy "admins manage testimonials" on public.commercial_public_testimonials
for all using (public.is_commercial_admin()) with check (public.is_commercial_admin());

alter table if exists public.commercial_public_leads
  add column if not exists customer_notification_status text,
  add column if not exists customer_notification_error text,
  add column if not exists customer_notified_at timestamptz;

create table if not exists public.commercial_public_product_catalog (
  slug text primary key,
  name text not null,
  eyebrow text not null default 'NEGÓCIO LOCAGORA',
  category text not null default 'Produto',
  description text not null default '',
  audience text not null default '',
  scope text not null default '',
  structure text not null default '',
  profiles text[] not null default array['network']::text[],
  tags text[] not null default array[]::text[],
  status text not null default 'active' check (status in ('active','paused','discontinued')),
  is_custom boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.commercial_public_product_catalog enable row level security;
drop policy if exists "public active product catalog readable" on public.commercial_public_product_catalog;
create policy "public active product catalog readable" on public.commercial_public_product_catalog for select using (true);
drop policy if exists "admins manage product catalog" on public.commercial_public_product_catalog;
create policy "admins manage product catalog" on public.commercial_public_product_catalog for all using (public.is_commercial_admin()) with check (public.is_commercial_admin());
