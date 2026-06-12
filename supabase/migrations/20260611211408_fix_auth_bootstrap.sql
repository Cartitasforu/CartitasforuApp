-- =============================================================
-- CARTITAS FOR U
-- Migración correctiva: bootstrap definitivo de usuario/auth
-- Fecha sugerida: 2026-06-11
--
-- Objetivos:
-- 1) Corregir handle_new_auth_user() con schema explícito
-- 2) Crear automáticamente user + subscription + space + space_member
-- 3) Alinear user.id con auth.users.id mediante FK
-- 4) Garantizar una única suscripción activa por usuario
-- 5) Hacer la migración idempotente y segura para ambientes ya usados
-- =============================================================

begin;

-- -------------------------------------------------------------
-- 1. Higiene previa de datos para poder endurecer restricciones
-- -------------------------------------------------------------

-- Asegurar que todo usuario tenga full_name válido
update public."user"
set full_name = 'Usuario'
where full_name is null
   or btrim(full_name) = ''
   or char_length(btrim(full_name)) < 2;

-- Asegurar locale válido
update public."user"
set locale = 'es'
where locale is null
   or locale not in ('es', 'en');

-- Crear perfil faltante para auth.users que no exista en public.user
insert into public."user" (id, email, full_name, locale)
select
  au.id,
  au.email,
  coalesce(nullif(trim(au.raw_user_meta_data->>'full_name'), ''), 'Usuario'),
  case
    when au.raw_user_meta_data->>'locale' in ('es', 'en')
      then au.raw_user_meta_data->>'locale'
    else 'es'
  end
from auth.users au
left join public."user" u on u.id = au.id
where u.id is null;

-- Resolver duplicados de suscripción activa por usuario, si existieran.
-- Conserva la más antigua activa y desactiva el resto.
with ranked as (
  select
    id,
    user_id,
    status,
    created_at,
    row_number() over (
      partition by user_id
      order by created_at asc, id asc
    ) as rn
  from public.subscription
  where status = 'active'
)
update public.subscription s
set status = 'cancelled',
    updated_at = now()
from ranked r
where s.id = r.id
  and r.rn > 1;

-- Crear suscripción free activa faltante para usuarios sin ninguna activa
insert into public.subscription (user_id, plan, status)
select u.id, 'free'::subscription_plan, 'active'::subscription_status
from public."user" u
where not exists (
  select 1
  from public.subscription s
  where s.user_id = u.id
    and s.status = 'active'
);

-- Crear espacio faltante para usuarios sin pertenencia a ningún espacio
-- Uno por usuario "huérfano" del onboarding.
with users_without_space as (
  select u.id
  from public."user" u
  where not exists (
    select 1
    from public.space_member sm
    where sm.user_id = u.id
  )
),
created_spaces as (
  insert into public.space (name)
  select 'Nuestro espacio'
  from users_without_space
  returning id
),
numbered_users as (
  select
    id as user_id,
    row_number() over (order by id) as rn
  from users_without_space
),
numbered_spaces as (
  select
    id as space_id,
    row_number() over (order by id) as rn
  from created_spaces
)
insert into public.space_member (user_id, space_id, role)
select
  nu.user_id,
  ns.space_id,
  'owner'::space_member_role
from numbered_users nu
join numbered_spaces ns on ns.rn = nu.rn
on conflict (user_id, space_id) do nothing;

-- -------------------------------------------------------------
-- 2. Constraint/FK correctas
-- -------------------------------------------------------------

-- Eliminar FK previa sobre public.user(id) si existiera con otro nombre.
do $$
declare
  v_constraint_name text;
begin
  select tc.constraint_name
  into v_constraint_name
  from information_schema.table_constraints tc
  join information_schema.constraint_column_usage ccu
    on tc.constraint_name = ccu.constraint_name
   and tc.table_schema = ccu.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'user'
    and tc.constraint_type = 'FOREIGN KEY'
    and ccu.table_schema = 'auth'
    and ccu.table_name = 'users'
  limit 1;

  if v_constraint_name is not null then
    execute format('alter table public."user" drop constraint %I', v_constraint_name);
  end if;
end $$;

-- Crear FK explícita user.id -> auth.users.id
alter table public."user"
  add constraint user_id_fkey_auth
  foreign key (id)
  references auth.users(id)
  on delete cascade;

-- Un solo registro de membresía owner por usuario/espacio ya lo cubre uq_space_member.
-- Garantizar como mínimo una sola suscripción activa por usuario.
create unique index if not exists uq_subscription_active_per_user
  on public.subscription(user_id)
  where status = 'active';

-- Opcionalmente, evitar múltiples filas idénticas free/active repetidas en futuros errores.
-- No lo hacemos como constraint global para no bloquear historial legítimo.

-- -------------------------------------------------------------
-- 3. Reemplazar trigger de auth.users de forma segura
-- -------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_auth_user();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_space_id uuid;
  v_full_name text;
  v_locale text;
begin
  v_full_name := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'Usuario');
  v_locale := case
    when new.raw_user_meta_data->>'locale' in ('es', 'en')
      then new.raw_user_meta_data->>'locale'
    else 'es'
  end;

  insert into public."user" (id, email, full_name, locale)
  values (new.id, new.email, v_full_name, v_locale)
  on conflict (id) do update
    set email = excluded.email,
        full_name = case
          when public."user".full_name is null
            or btrim(public."user".full_name) = ''
            or char_length(btrim(public."user".full_name)) < 2
          then excluded.full_name
          else public."user".full_name
        end,
        locale = case
          when public."user".locale not in ('es', 'en') or public."user".locale is null
          then excluded.locale
          else public."user".locale
        end;

  insert into public.subscription (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict do nothing;

  if not exists (
    select 1
    from public.space_member sm
    where sm.user_id = new.id
  ) then
    insert into public.space (name)
    values ('Nuestro espacio')
    returning id into v_space_id;

    insert into public.space_member (user_id, space_id, role)
    values (new.id, v_space_id, 'owner')
    on conflict (user_id, space_id) do nothing;
  end if;

  return new;
exception
  when others then
    raise log 'handle_new_auth_user failed. auth_user_id=%, email=%, error=%',
      new.id, new.email, sqlerrm;
    raise;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- -------------------------------------------------------------
-- 4. Permisos mínimos de ejecución sobre la función
-- -------------------------------------------------------------

revoke all on function public.handle_new_auth_user() from public;
grant execute on function public.handle_new_auth_user() to postgres, service_role, supabase_auth_admin;

-- -------------------------------------------------------------
-- 5. Comentarios de trazabilidad
-- -------------------------------------------------------------

comment on function public.handle_new_auth_user() is
'Bootstrap definitivo de registro: crea perfil, suscripción free, espacio inicial y membership owner desde auth.users.';

commit;