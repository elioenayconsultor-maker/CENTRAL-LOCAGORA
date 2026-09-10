-- V14 V8.5 — apresentações públicas administráveis
create table if not exists public.commercial_public_presentations (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft','published','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.commercial_public_presentation_pages (
  id uuid primary key default gen_random_uuid(),
  presentation_id uuid not null references public.commercial_public_presentations(id) on delete cascade,
  position integer not null check (position > 0),
  role text not null default 'page' check (role in ('cover','page','back_cover')),
  storage_path text,
  public_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  unique (presentation_id, position)
);

create index if not exists commercial_public_presentation_pages_order_idx
  on public.commercial_public_presentation_pages(presentation_id, position);

alter table public.commercial_public_presentations enable row level security;
alter table public.commercial_public_presentation_pages enable row level security;

drop policy if exists "presentation metadata public read" on public.commercial_public_presentations;
create policy "presentation metadata public read" on public.commercial_public_presentations
  for select to anon, authenticated using (true);

drop policy if exists "admins manage public presentations" on public.commercial_public_presentations;
create policy "admins manage public presentations" on public.commercial_public_presentations
  for all to authenticated using (public.is_commercial_admin()) with check (public.is_commercial_admin());

drop policy if exists "published presentation pages public read" on public.commercial_public_presentation_pages;
create policy "published presentation pages public read" on public.commercial_public_presentation_pages
  for select to anon, authenticated using (
    exists (
      select 1 from public.commercial_public_presentations p
      where p.id = presentation_id
        and (p.status = 'published' or public.is_commercial_admin())
    )
  );

drop policy if exists "admins manage public presentation pages" on public.commercial_public_presentation_pages;
create policy "admins manage public presentation pages" on public.commercial_public_presentation_pages
  for all to authenticated using (public.is_commercial_admin()) with check (public.is_commercial_admin());

insert into storage.buckets (id, name, public)
values ('commercial-public-presentations','commercial-public-presentations',true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read commercial presentation media" on storage.objects;
create policy "public read commercial presentation media" on storage.objects
  for select to public using (bucket_id = 'commercial-public-presentations');

drop policy if exists "admins upload commercial presentation media" on storage.objects;
create policy "admins upload commercial presentation media" on storage.objects
  for insert to authenticated with check (bucket_id = 'commercial-public-presentations' and public.is_commercial_admin());

drop policy if exists "admins update commercial presentation media" on storage.objects;
create policy "admins update commercial presentation media" on storage.objects
  for update to authenticated using (bucket_id = 'commercial-public-presentations' and public.is_commercial_admin())
  with check (bucket_id = 'commercial-public-presentations' and public.is_commercial_admin());

drop policy if exists "admins delete commercial presentation media" on storage.objects;
create policy "admins delete commercial presentation media" on storage.objects
  for delete to authenticated using (bucket_id = 'commercial-public-presentations' and public.is_commercial_admin());

-- Estrutura inicial: 10 slots por produto (capa + 8 páginas + contracapa).
-- URLs existentes são reaproveitadas; slots sem arte ficam prontos para substituição no Admin.
with products(slug,title,folder,files) as (
  values
    ('franquias','Franquias Locagora 2026','franquias',array[1,4,5,6]::int[]),
    ('exclusive','Franquia Nacional Exclusive','exclusive',array[1,2,3,4,6,8,10]::int[]),
    ('franquia-internacional','Franquia Internacional','internacional',array[1,2,7]::int[]),
    ('franquia-2x1','Franquia 2x1 — Brasil x Europa','internacional',array[1,8,9]::int[]),
    ('master','Master','franquias',array[1,5,6]::int[]),
    ('mini-master','Mini-Master','franquias',array[1,4,5]::int[]),
    ('locinvest','LocInvest','locinvest',array[1,2,3,4,5,6]::int[]),
    ('locmillion','LocMillion','locinvest',array[1,4,6]::int[]),
    ('euroloc','EUROLOC — LocInvest Espanha','internacional',array[1,7,8]::int[]),
    ('internacional','Locagora Internacional','internacional',array[1,2,7,8,9]::int[]),
    ('cotas','Cotas Locagora','cotas',array[1,2,3,4,5]::int[])
)
insert into public.commercial_public_presentations(product_slug,title,status)
select slug,title,'published' from products
on conflict (product_slug) do nothing;

with products(slug,folder,files) as (
  values
    ('franquias','franquias',array[1,4,5,6]::int[]),
    ('exclusive','exclusive',array[1,2,3,4,6,8,10]::int[]),
    ('franquia-internacional','internacional',array[1,2,7]::int[]),
    ('franquia-2x1','internacional',array[1,8,9]::int[]),
    ('master','franquias',array[1,5,6]::int[]),
    ('mini-master','franquias',array[1,4,5]::int[]),
    ('locinvest','locinvest',array[1,2,3,4,5,6]::int[]),
    ('locmillion','locinvest',array[1,4,6]::int[]),
    ('euroloc','internacional',array[1,7,8]::int[]),
    ('internacional','internacional',array[1,2,7,8,9]::int[]),
    ('cotas','cotas',array[1,2,3,4,5]::int[])
), expanded as (
  select p.id as presentation_id, x.slug, x.folder, x.files, gs as position
  from products x
  join public.commercial_public_presentations p on p.product_slug=x.slug
  cross join generate_series(1,10) gs
), resolved as (
  select presentation_id, position,
    case when position=1 then 'cover' when position=10 then 'back_cover' else 'page' end as role,
    case
      when position <= cardinality(files) then '/public-materials/'||folder||'/page-'||files[position]||'.webp'
      else null
    end as public_url
  from expanded
)
insert into public.commercial_public_presentation_pages(presentation_id,position,role,public_url)
select presentation_id,position,role,public_url from resolved
on conflict (presentation_id,position) do nothing;
