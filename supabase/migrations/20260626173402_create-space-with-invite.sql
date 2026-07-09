create or replace function public.create_space_with_invite()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id   uuid;
  v_space_id  uuid;
  v_role      space_member_role;
  v_inv_id    uuid;
  v_code      varchar;
  v_attempts  int := 0;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select sm.space_id, sm.role
    into v_space_id, v_role
  from public.space_member sm
  where sm.user_id = v_user_id
  limit 1;

  if v_space_id is not null then
    if v_role <> 'owner' then
      raise exception 'User already belongs to a space';
    end if;

    select id, code
      into v_inv_id, v_code
    from public.invitation
    where space_id = v_space_id
      and invited_by = v_user_id
      and status = 'pending'
      and expires_at > now()
    limit 1;

    if v_inv_id is not null then
      return jsonb_build_object(
        'space_id', v_space_id,
        'invitation_code', v_code,
        'already_exists', true
      );
    end if;

    loop
      v_code := upper(substring(md5(random()::text) from 1 for 4));
      exit when not exists (
        select 1
        from public.invitation
        where code = v_code
      );

      v_attempts := v_attempts + 1;

      if v_attempts > 10 then
        raise exception 'Could not generate unique code';
      end if;
    end loop;

    insert into public.invitation (space_id, invited_by, code, status, expires_at)
    values (v_space_id, v_user_id, v_code, 'pending', now() + interval '48 hours')
    returning id into v_inv_id;

    return jsonb_build_object(
      'space_id', v_space_id,
      'invitation_code', v_code,
      'already_exists', true
    );
  end if;

  insert into public.space (name)
  values ('Nuestro espacio')
  returning id into v_space_id;

  insert into public.space_member (user_id, space_id, role)
  values (v_user_id, v_space_id, 'owner');

  loop
    v_code := upper(substring(md5(random()::text) from 1 for 4));
    exit when not exists (
      select 1
      from public.invitation
      where code = v_code
    );

    v_attempts := v_attempts + 1;

    if v_attempts > 10 then
      raise exception 'Could not generate unique code';
    end if;
  end loop;

  insert into public.invitation (space_id, invited_by, code, status, expires_at)
  values (v_space_id, v_user_id, v_code, 'pending', now() + interval '48 hours')
  returning id into v_inv_id;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, after_state)
  values (
    v_user_id,
    'create',
    'space',
    v_space_id,
    jsonb_build_object(
      'space_id', v_space_id,
      'invitation_id', v_inv_id,
      'invitation_code', v_code
    )
  );

  return jsonb_build_object(
    'space_id', v_space_id,
    'invitation_code', v_code,
    'already_exists', false
  );
end;
$$;