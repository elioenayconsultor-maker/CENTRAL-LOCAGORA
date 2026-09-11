-- V9.3.7 • miniaturas administráveis do portfólio público
alter table public.commercial_public_product_catalog
  add column if not exists thumbnail_url text,
  add column if not exists thumbnail_path text,
  add column if not exists thumbnail_position_x smallint not null default 50,
  add column if not exists thumbnail_position_y smallint not null default 50,
  add column if not exists display_order integer not null default 100;

alter table public.commercial_public_product_catalog
  drop constraint if exists commercial_public_product_catalog_thumbnail_x_check;
alter table public.commercial_public_product_catalog
  add constraint commercial_public_product_catalog_thumbnail_x_check check (thumbnail_position_x between 0 and 100);
alter table public.commercial_public_product_catalog
  drop constraint if exists commercial_public_product_catalog_thumbnail_y_check;
alter table public.commercial_public_product_catalog
  add constraint commercial_public_product_catalog_thumbnail_y_check check (thumbnail_position_y between 0 and 100);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('commercial-portfolio-thumbnails','commercial-portfolio-thumbnails',true,5242880,array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "portfolio thumbnails admin insert" on storage.objects;
create policy "portfolio thumbnails admin insert"
on storage.objects for insert to authenticated
with check (bucket_id='commercial-portfolio-thumbnails' and current_app_role() = any(array['ADMIN'::user_role,'GESTOR'::user_role]));

drop policy if exists "portfolio thumbnails admin update" on storage.objects;
create policy "portfolio thumbnails admin update"
on storage.objects for update to authenticated
using (bucket_id='commercial-portfolio-thumbnails' and current_app_role() = any(array['ADMIN'::user_role,'GESTOR'::user_role]))
with check (bucket_id='commercial-portfolio-thumbnails' and current_app_role() = any(array['ADMIN'::user_role,'GESTOR'::user_role]));

drop policy if exists "portfolio thumbnails admin delete" on storage.objects;
create policy "portfolio thumbnails admin delete"
on storage.objects for delete to authenticated
using (bucket_id='commercial-portfolio-thumbnails' and current_app_role() = any(array['ADMIN'::user_role,'GESTOR'::user_role]));

create index if not exists commercial_public_product_catalog_display_order_idx
on public.commercial_public_product_catalog(display_order, name);
