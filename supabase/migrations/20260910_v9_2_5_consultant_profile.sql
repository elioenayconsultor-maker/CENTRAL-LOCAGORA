-- Central LOC V9.2.5 - perfil do consultor vinculado ao acesso corporativo
-- Aplicar manualmente no SQL Editor. Não usar db push/reset/repair.

alter table public.users add column if not exists phone text;
alter table public.users add column if not exists avatar_path text;
alter table public.users add column if not exists profile_completed_at timestamptz;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'commercial-user-avatars',
  'commercial-user-avatars',
  false,
  2000000,
  array['image/png','image/jpeg','image/webp']
)
on conflict (id) do update set
  public=false,
  file_size_limit=2000000,
  allowed_mime_types=array['image/png','image/jpeg','image/webp'];

drop policy if exists "consultant avatar read own" on storage.objects;
create policy "consultant avatar read own" on storage.objects
for select to authenticated
using (bucket_id='commercial-user-avatars' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "consultant avatar upload own" on storage.objects;
create policy "consultant avatar upload own" on storage.objects
for insert to authenticated
with check (bucket_id='commercial-user-avatars' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "consultant avatar delete own" on storage.objects;
create policy "consultant avatar delete own" on storage.objects
for delete to authenticated
using (bucket_id='commercial-user-avatars' and (storage.foldername(name))[1]=auth.uid()::text);

create or replace function public.get_my_commercial_profile()
returns table(
  id uuid,
  name text,
  email text,
  phone text,
  avatar_path text,
  profile_completed boolean
)
language sql
security definer
set search_path=public
stable
as $$
  select
    u.id,
    coalesce(u.name,''),
    coalesce(u.email, lower(auth.jwt()->>'email')),
    coalesce(u.phone,''),
    u.avatar_path,
    (u.profile_completed_at is not null and length(trim(coalesce(u.name,'')))>=3 and length(regexp_replace(coalesce(u.phone,''),'[^0-9]','','g'))>=10)
  from public.users u
  where u.auth_user_id=auth.uid()
  limit 1;
$$;

revoke all on function public.get_my_commercial_profile() from public, anon;
grant execute on function public.get_my_commercial_profile() to authenticated;

create or replace function public.complete_my_commercial_profile(
  p_name text,
  p_phone text,
  p_avatar_path text default null
)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  v_email text:=lower(coalesce(auth.jwt()->>'email',''));
  v_digits text:=regexp_replace(coalesce(p_phone,''),'[^0-9]','','g');
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if length(trim(coalesce(p_name,'')))<3 then raise exception 'invalid_name'; end if;
  if length(v_digits)<10 or length(v_digits)>13 then raise exception 'invalid_phone'; end if;
  if p_avatar_path is not null and split_part(p_avatar_path,'/',1)<>auth.uid()::text then
    raise exception 'invalid_avatar_path';
  end if;

  update public.users
  set
    name=trim(p_name),
    email=case when v_email<>'' then v_email else email end,
    phone=trim(p_phone),
    avatar_path=coalesce(p_avatar_path,avatar_path),
    profile_completed_at=now(),
    updated_at=now()
  where auth_user_id=auth.uid() and active=true;

  if not found then raise exception 'commercial_profile_not_found_or_inactive'; end if;
  return true;
end;
$$;

revoke all on function public.complete_my_commercial_profile(text,text,text) from public, anon;
grant execute on function public.complete_my_commercial_profile(text,text,text) to authenticated;
