-- V9.3.6 • access, SDR membership and public feedback hardening

-- Public feedback can be managed only by authenticated ADMIN/GESTOR users.
drop policy if exists commercial_public_feedback_admin_update on public.commercial_public_feedback;
create policy commercial_public_feedback_admin_update
on public.commercial_public_feedback
for update
to authenticated
using (current_app_role() = any (array['ADMIN'::user_role,'GESTOR'::user_role]))
with check (current_app_role() = any (array['ADMIN'::user_role,'GESTOR'::user_role]));

-- commercial_memberships stores lowercase text roles. Include SDR explicitly.
alter table public.commercial_memberships
  drop constraint if exists commercial_memberships_role_check;
alter table public.commercial_memberships
  add constraint commercial_memberships_role_check
  check (role = any (array['admin'::text,'gestor'::text,'sdr'::text,'closer'::text,'visualizacao'::text]));

-- First auth access inherits pre-registration role/team/profile link.
create or replace function public.commercial_assign_default_closer()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  p_profile_id uuid;
  p_role text;
  p_team text;
begin
  select u.id, lower(u.role::text), u.team_name
    into p_profile_id, p_role, p_team
    from public.users u
   where lower(u.email)=lower(new.email)
     and u.active=true
   order by u.updated_at desc nulls last
   limit 1;

  insert into public.commercial_memberships(
    auth_user_id, app_user_id, role, team_name, active, created_at, updated_at
  ) values (
    new.id,
    p_profile_id,
    coalesce(p_role,'closer'),
    p_team,
    true,
    now(),
    now()
  )
  on conflict (auth_user_id) do update
    set app_user_id=coalesce(excluded.app_user_id,commercial_memberships.app_user_id),
        role=excluded.role,
        team_name=coalesce(excluded.team_name,commercial_memberships.team_name),
        active=true,
        updated_at=now();
  return new;
end;
$function$;

-- Repair members that were set as SDR in the profile while the old constraint
-- prevented the membership from being updated. Never downgrade an admin.
update public.commercial_memberships m
set role='sdr',
    team_name=coalesce(u.team_name,m.team_name),
    app_user_id=coalesce(m.app_user_id,u.id),
    updated_at=now()
from public.users u
where u.auth_user_id=m.auth_user_id
  and u.active=true
  and u.role='SDR'::user_role
  and m.role<>'admin';
