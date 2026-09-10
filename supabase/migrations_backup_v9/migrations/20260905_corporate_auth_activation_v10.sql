create or replace function public.activate_corporate_access()
returns table(status text, app_user_id uuid, app_role text, app_name text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_id uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
  v_user public.users%rowtype;
begin
  if v_auth_id is null then return query select 'not_authenticated'::text, null::uuid, null::text, null::text; return; end if;
  if v_email = '' or right(v_email, length('@locgrupo.com.br')) <> '@locgrupo.com.br' then return query select 'invalid_domain'::text, null::uuid, null::text, null::text; return; end if;
  select * into v_user from public.users where lower(email)=v_email limit 1;
  if not found then return query select 'profile_missing'::text, null::uuid, null::text, null::text; return; end if;
  if coalesce(v_user.active,false) is not true then return query select 'inactive'::text, v_user.id, v_user.role::text, v_user.name; return; end if;
  if v_user.auth_user_id is not null and v_user.auth_user_id <> v_auth_id then return query select 'already_linked'::text, v_user.id, v_user.role::text, v_user.name; return; end if;
  update public.users set auth_user_id=v_auth_id, updated_at=now() where id=v_user.id and auth_user_id is distinct from v_auth_id;
  return query select 'active'::text, v_user.id, v_user.role::text, v_user.name;
end;
$$;
revoke all on function public.activate_corporate_access() from public;
grant execute on function public.activate_corporate_access() to authenticated;
