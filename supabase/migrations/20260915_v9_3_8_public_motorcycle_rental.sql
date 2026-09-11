create table if not exists public.commercial_rental_banners (
  id uuid primary key default gen_random_uuid(), title text not null, subtitle text not null default '', city text not null,
  state text, country text not null default 'Brasil', image_url text not null, storage_path text, target_url text,
  display_order integer not null default 0, active boolean not null default true, created_by uuid, updated_by uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.commercial_rental_leads (
  id uuid primary key default gen_random_uuid(), name text not null, mobile text not null, email text, city text not null,
  state text, has_cnh_a boolean, works_with_delivery boolean, preferred_contact text not null default 'whatsapp', message text,
  source text not null default 'public_rental_page', status text not null default 'new' check (status in ('new','contacted','qualified','converted','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.commercial_rental_banners enable row level security;
alter table public.commercial_rental_leads enable row level security;
drop policy if exists commercial_rental_banners_public_read on public.commercial_rental_banners;
create policy commercial_rental_banners_public_read on public.commercial_rental_banners for select to public using (active=true or is_commercial_admin());
drop policy if exists commercial_rental_banners_admin_manage on public.commercial_rental_banners;
create policy commercial_rental_banners_admin_manage on public.commercial_rental_banners for all to authenticated using (is_commercial_admin()) with check (is_commercial_admin());
drop policy if exists commercial_rental_leads_admin_read on public.commercial_rental_leads;
create policy commercial_rental_leads_admin_read on public.commercial_rental_leads for select to authenticated using (is_commercial_admin());
drop policy if exists commercial_rental_leads_admin_update on public.commercial_rental_leads;
create policy commercial_rental_leads_admin_update on public.commercial_rental_leads for update to authenticated using (is_commercial_admin()) with check (is_commercial_admin());
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('commercial-rental-banners','commercial-rental-banners',true,8388608,array['image/jpeg','image/png','image/webp']) on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists commercial_rental_banners_storage_read on storage.objects;
create policy commercial_rental_banners_storage_read on storage.objects for select to public using (bucket_id='commercial-rental-banners');
drop policy if exists commercial_rental_banners_storage_insert on storage.objects;
create policy commercial_rental_banners_storage_insert on storage.objects for insert to authenticated with check (bucket_id='commercial-rental-banners' and is_commercial_admin());
drop policy if exists commercial_rental_banners_storage_update on storage.objects;
create policy commercial_rental_banners_storage_update on storage.objects for update to authenticated using (bucket_id='commercial-rental-banners' and is_commercial_admin()) with check (bucket_id='commercial-rental-banners' and is_commercial_admin());
drop policy if exists commercial_rental_banners_storage_delete on storage.objects;
create policy commercial_rental_banners_storage_delete on storage.objects for delete to authenticated using (bucket_id='commercial-rental-banners' and is_commercial_admin());
create index if not exists commercial_rental_banners_active_order_idx on public.commercial_rental_banners(active,display_order,created_at);
create index if not exists commercial_rental_leads_status_created_idx on public.commercial_rental_leads(status,created_at desc);
