-- Intranet: conteúdo interno, acesso por setor e diretório profissional.
begin;
alter table public.users add column if not exists department text default 'COMERCIAL';
alter table public.users add column if not exists job_title text;
alter table public.users add column if not exists access_profile text default 'COLABORADOR';
alter table public.users add column if not exists module_permissions text[] default '{}';

create or replace function public.intranet_member()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.users u join public.commercial_memberships m
 on m.auth_user_id=u.auth_user_id where u.auth_user_id=auth.uid()
 and u.active=true and m.active=true
 and lower(u.email)=lower(auth.jwt()->>'email')
 and lower(u.email) like '%@locgrupo.com.br');
$$;
create or replace function public.intranet_admin()
returns boolean language sql stable security definer set search_path = '' as $$
 select public.intranet_member() and exists(select 1 from public.commercial_memberships
 where auth_user_id=auth.uid() and role='admin' and active=true);
$$;
create or replace function public.intranet_audience(p_department text)
returns boolean language sql stable security definer set search_path = '' as $$
 select public.intranet_member() and (p_department is null or public.intranet_admin()
 or exists(select 1 from public.users where auth_user_id=auth.uid() and active=true
 and department=p_department));
$$;
revoke all on function public.intranet_member(), public.intranet_admin(), public.intranet_audience(text) from public, anon;
grant execute on function public.intranet_member(), public.intranet_admin(), public.intranet_audience(text) to authenticated;

create table if not exists public.intranet_announcements (
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 3 and 160),
 body text not null check(char_length(body) between 3 and 10000),
 department text check(department in ('COMERCIAL','DIRETORIA','FINANCEIRO','RH','MARKETING','OPERACOES','CS','TI_SUPORTE','JURIDICO')),
 published boolean not null default false,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.intranet_documents (
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 3 and 160),
 description text not null default '' check(char_length(description)<=2000),
 url text not null check(url ~ '^https://[^[:space:]]+$'),
 department text check(department in ('COMERCIAL','DIRETORIA','FINANCEIRO','RH','MARKETING','OPERACOES','CS','TI_SUPORTE','JURIDICO')),
 published boolean not null default false,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.intranet_announcements enable row level security;
alter table public.intranet_documents enable row level security;
revoke all on public.intranet_announcements,public.intranet_documents from anon,authenticated;
grant select,insert,update on public.intranet_announcements,public.intranet_documents to authenticated;
create policy intranet_announcements_read on public.intranet_announcements for select to authenticated
 using(public.intranet_admin() or (published and public.intranet_audience(department)));
create policy intranet_announcements_insert on public.intranet_announcements for insert to authenticated
 with check(public.intranet_admin() and created_by=auth.uid());
create policy intranet_announcements_update on public.intranet_announcements for update to authenticated
 using(public.intranet_admin()) with check(public.intranet_admin());
create policy intranet_documents_read on public.intranet_documents for select to authenticated
 using(public.intranet_admin() or (published and public.intranet_audience(department)));
create policy intranet_documents_insert on public.intranet_documents for insert to authenticated
 with check(public.intranet_admin() and created_by=auth.uid());
create policy intranet_documents_update on public.intranet_documents for update to authenticated
 using(public.intranet_admin()) with check(public.intranet_admin());
create index if not exists intranet_announcements_date on public.intranet_announcements(created_at desc);
create index if not exists intranet_documents_date on public.intranet_documents(created_at desc);

-- Somente dados profissionais; não expõe permissões ou credenciais.
create or replace function public.intranet_directory()
returns table(id uuid,name text,email text,department text,job_title text)
language sql stable security definer set search_path = '' as $$
 select u.id,u.name::text,u.email::text,u.department::text,u.job_title::text
 from public.users u join public.commercial_memberships m on m.auth_user_id=u.auth_user_id
 where public.intranet_member() and u.active=true and m.active=true
 and lower(u.email) like '%@locgrupo.com.br' order by u.name;
$$;
revoke all on function public.intranet_directory() from public, anon;
grant execute on function public.intranet_directory() to authenticated;

-- Evita criar automaticamente um Closer para contas sem pré-cadastro aprovado.
create or replace function public.commercial_assign_default_closer()
returns trigger language plpgsql security definer set search_path = '' as $$
declare p_profile_id uuid; p_role text; p_team text;
begin
 select u.id,lower(u.role::text),u.team_name into p_profile_id,p_role,p_team
 from public.users u where lower(u.email)=lower(new.email) and u.active=true
 order by u.updated_at desc nulls last limit 1;
 if p_profile_id is null then return new; end if;
 insert into public.commercial_memberships(auth_user_id,app_user_id,role,team_name,active,created_at,updated_at)
 values(new.id,p_profile_id,case when p_role in ('admin','gestor','sdr','closer','visualizacao') then p_role else 'visualizacao' end,p_team,true,now(),now())
 on conflict(auth_user_id) do nothing;
 return new;
end;
$$;
revoke all on function public.commercial_assign_default_closer() from public,anon,authenticated;

-- Perfis e setores não podem ser promovidos pelo próprio colaborador.
create or replace function public.intranet_protect_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if coalesce(auth.jwt()->>'role','')='authenticated' and not public.intranet_admin() then
  if tg_op='INSERT' then raise exception 'Cadastro exige aprovação administrativa' using errcode='42501'; end if;
  if new.role is distinct from old.role or new.active is distinct from old.active
   or new.department is distinct from old.department or new.access_profile is distinct from old.access_profile
   or new.module_permissions is distinct from old.module_permissions
   or new.auth_user_id is distinct from old.auth_user_id or new.email is distinct from old.email
   or new.team_name is distinct from old.team_name then
   raise exception 'Permissões e setor exigem aprovação administrativa' using errcode='42501';
  end if;
 end if;
 return new;
end;
$$;
revoke all on function public.intranet_protect_profile() from public,anon,authenticated;
create trigger intranet_profile_governance before insert or update on public.users
for each row execute function public.intranet_protect_profile();
commit;
