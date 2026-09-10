-- Locagora Central V13 - administração de parâmetros e materiais públicos
create table if not exists public.commercial_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.commercial_admins enable row level security;

create or replace function public.is_commercial_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(select 1 from public.commercial_admins a where a.user_id=auth.uid());
$$;

grant execute on function public.is_commercial_admin() to authenticated;

create or replace function public.claim_commercial_admin()
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
  if auth.uid() is null or v_email not like '%@locgrupo.com.br' then
    return false;
  end if;
  if exists(select 1 from public.commercial_admins) then
    return public.is_commercial_admin();
  end if;
  insert into public.commercial_admins(user_id,email) values(auth.uid(),v_email) on conflict do nothing;
  return public.is_commercial_admin();
end;
$$;

grant execute on function public.claim_commercial_admin() to authenticated;

create or replace function public.can_claim_commercial_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select not exists(select 1 from public.commercial_admins);
$$;

grant execute on function public.can_claim_commercial_admin() to authenticated;

create policy "admin can read own admin status" on public.commercial_admins
for select to authenticated using (user_id=auth.uid() or public.is_commercial_admin());

create table if not exists public.commercial_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.commercial_settings enable row level security;
create policy "published settings public read" on public.commercial_settings for select to anon,authenticated using (published or public.is_commercial_admin());
create policy "admins manage settings" on public.commercial_settings for all to authenticated using (public.is_commercial_admin()) with check (public.is_commercial_admin());

create table if not exists public.commercial_settings_audit (
  id bigint generated always as identity primary key,
  key text not null,
  old_value jsonb,
  new_value jsonb,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
alter table public.commercial_settings_audit enable row level security;
create policy "admins read settings audit" on public.commercial_settings_audit for select to authenticated using (public.is_commercial_admin());

create or replace function public.audit_commercial_settings()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='UPDATE' and old.value is distinct from new.value then
    insert into public.commercial_settings_audit(key,old_value,new_value,changed_by)
    values(new.key,old.value,new.value,auth.uid());
  end if;
  return new;
end;
$$;
drop trigger if exists commercial_settings_audit_trg on public.commercial_settings;
create trigger commercial_settings_audit_trg after update on public.commercial_settings
for each row execute function public.audit_commercial_settings();

insert into public.commercial_settings(key,value,published)
values('pricing',jsonb_build_object(
  'locinvest',jsonb_build_object(
    'start',jsonb_build_object('bike',21999,'fee',8599,'income',410,'appropriation',1000),
    'premium',jsonb_build_object('bike',20999,'fee',11299,'income',430,'appropriation',0),
    'exclusive',jsonb_build_object('bike',19999,'fee',17600,'income',470,'appropriation',0)
  ),
  'locmillion',jsonb_build_object('total',1000000,'adm',50000,'activation',50000,'assetBase',900000,'bikes',45,'monthly',25000,'unitValue',20000),
  'franchiseNational',jsonb_build_object('feeOptions',jsonb_build_array(79990,74990,69999),'bikeValue',16990,'intermediationPerBike',4000,'workingPerBike',600,'rentalPerBike',1890,'royaltyPct',6),
  'franchiseInternational',jsonb_build_object('feeOptions',jsonb_build_array(119990,104990,97000),'fx',6.20),
  'miniMaster',jsonb_build_object('fee',300000,'structure',80000,'capacity',300),
  'masterRegional',jsonb_build_object('referenceInvestment',928000)
),true)
on conflict (key) do nothing;

create table if not exists public.commercial_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  storage_path text not null,
  public_url text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
create index if not exists commercial_documents_slug_idx on public.commercial_documents(slug,active);
alter table public.commercial_documents enable row level security;
create policy "active documents public read" on public.commercial_documents for select to anon,authenticated using (active or public.is_commercial_admin());
create policy "admins manage documents" on public.commercial_documents for all to authenticated using (public.is_commercial_admin()) with check (public.is_commercial_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('commercial-public-docs','commercial-public-docs',true,52428800,array['application/pdf'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "public can read commercial docs" on storage.objects for select to anon,authenticated using (bucket_id='commercial-public-docs');
create policy "admins upload commercial docs" on storage.objects for insert to authenticated with check (bucket_id='commercial-public-docs' and public.is_commercial_admin());
create policy "admins update commercial docs" on storage.objects for update to authenticated using (bucket_id='commercial-public-docs' and public.is_commercial_admin()) with check (bucket_id='commercial-public-docs' and public.is_commercial_admin());
create policy "admins delete commercial docs" on storage.objects for delete to authenticated using (bucket_id='commercial-public-docs' and public.is_commercial_admin());
