create or replace function public.join_space_by_code(p_code text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id   uuid;
  v_inv       record;
  v_previous_space_id uuid;
  v_previous_member_count int := 0;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_inv
  from public.invitation
  where upper(code) = upper(trim(p_code))
    and status = 'pending'
    and expires_at > now()
  limit 1;

  if not found then
    raise exception 'INVALID_CODE';
  end if;

  if v_inv.invited_by = v_user_id then
    raise exception 'SELF_JOIN';
  end if;

  select sm.space_id
    into v_previous_space_id
  from public.space_member sm
  where sm.user_id = v_user_id
    and sm.space_id <> v_inv.space_id
  order by sm.joined_at asc
  limit 1;

  if exists (
    select 1 from public.space_member
    where user_id = v_user_id and space_id = v_inv.space_id
  ) then
    raise exception 'ALREADY_MEMBER';
  end if;

  if (
    select count(*) from public.space_member where space_id = v_inv.space_id
  ) >= 2 then
    raise exception 'SPACE_FULL';
  end if;

  insert into public.space_member (user_id, space_id, role)
  values (v_user_id, v_inv.space_id, 'member');

  update public.invitation
  set status = 'accepted',
      accepted_by = v_user_id,
      accepted_at = now()
  where id = v_inv.id;

  if v_previous_space_id is not null then
    select count(*)
      into v_previous_member_count
    from public.space_member
    where space_id = v_previous_space_id;

    if v_previous_member_count = 1
       and not exists (select 1 from public.special_date where space_id = v_previous_space_id)
       and not exists (select 1 from public.letter where space_id = v_previous_space_id and deleted_at is null)
       and not exists (select 1 from public.photo where space_id = v_previous_space_id and deleted_at is null)
       and not exists (select 1 from public.goal where space_id = v_previous_space_id)
       and not exists (select 1 from public.member_location where space_id = v_previous_space_id)
       and not exists (
         select 1
         from public.post_it p
         join public.board b on b.id = p.board_id
         where b.space_id = v_previous_space_id
       ) then
      delete from public.space
      where id = v_previous_space_id;
    end if;
  end if;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, after_state)
  values (
    v_user_id, 'space_joined', 'space', v_inv.space_id,
    jsonb_build_object('space_id', v_inv.space_id, 'code', p_code)
  );

  return jsonb_build_object(
    'space_id', v_inv.space_id,
    'joined', true
  );
end;
$$;