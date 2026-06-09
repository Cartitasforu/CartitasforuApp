-- =============================================================
-- Cartitas for U — seed.sql
-- Development local only
-- Login real + RLS + datos de dominio
-- Password para todos los usuarios: Cartitas123*
-- =============================================================

begin;

-- =============================================================
-- 0. Limpieza dominio
-- =============================================================

truncate table
  content_report,
  push_token,
  notification,
  member_location,
  goal,
  post_it,
  board,
  comment,
  reaction,
  photo,
  letter,
  special_date,
  invitation,
  space_member,
  space,
  user_consent,
  subscription,
  "user"
restart identity cascade;

-- =============================================================
-- 1. Limpieza auth
-- =============================================================

delete from auth.identities
where user_id in (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid
);

delete from auth.users
where id in (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid
);

-- =============================================================
-- 2. Usuarios reales de Auth
-- El trigger handle_new_auth_user() crea "user" + subscription
-- =============================================================

do $$
declare
  v_password text := crypt('Cartitas123*', gen_salt('bf'));
begin
  -- Ana
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'ana@cartitas.local',
    v_password,
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ana Martínez","locale":"es"}'::jsonb,
    false,
    now() - interval '20 days',
    now() - interval '20 days',
    now() - interval '1 day'
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    jsonb_build_object(
      'sub', '11111111-1111-1111-1111-111111111111',
      'email', 'ana@cartitas.local',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '1 day',
    now() - interval '20 days',
    now() - interval '20 days'
  );

  -- Luis
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'luis@cartitas.local',
    v_password,
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Luis Gómez","locale":"es"}'::jsonb,
    false,
    now() - interval '20 days',
    now() - interval '20 days',
    now() - interval '2 days'
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    jsonb_build_object(
      'sub', '22222222-2222-2222-2222-222222222222',
      'email', 'luis@cartitas.local',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '2 days',
    now() - interval '20 days',
    now() - interval '20 days'
  );

  -- Sofía
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'sofia@cartitas.local',
    v_password,
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sofía Ramírez","locale":"es"}'::jsonb,
    false,
    now() - interval '10 days',
    now() - interval '10 days',
    now() - interval '1 day'
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    jsonb_build_object(
      'sub', '33333333-3333-3333-3333-333333333333',
      'email', 'sofia@cartitas.local',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '1 day',
    now() - interval '10 days',
    now() - interval '10 days'
  );

  -- Carlos
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'carlos@cartitas.local',
    v_password,
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Carlos Rivera","locale":"en"}'::jsonb,
    false,
    now() - interval '10 days',
    now() - interval '10 days',
    now() - interval '3 days'
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    jsonb_build_object(
      'sub', '44444444-4444-4444-4444-444444444444',
      'email', 'carlos@cartitas.local',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    '44444444-4444-4444-4444-444444444444',
    now() - interval '3 days',
    now() - interval '10 days',
    now() - interval '10 days'
  );
end $$;

-- =============================================================
-- 3. Completar perfil creado por trigger
-- =============================================================

update "user"
set
  nickname = 'Anita',
  birth_date = '2000-05-12',
  gender = 'female',
  interests = '[{"category":"music","label":"Música"},{"category":"travel","label":"Viajes"},{"category":"letters","label":"Cartas"}]'::jsonb,
  locale = 'es',
  location_sharing = true,
  updated_at = now()
where id = '11111111-1111-1111-1111-111111111111';

update "user"
set
  nickname = 'Lu',
  birth_date = '1999-11-03',
  gender = 'male',
  interests = '[{"category":"cinema","label":"Cine"},{"category":"coffee","label":"Cafés"},{"category":"photos","label":"Fotografía"}]'::jsonb,
  locale = 'es',
  location_sharing = false,
  updated_at = now()
where id = '22222222-2222-2222-2222-222222222222';

update "user"
set
  nickname = 'Sofi',
  birth_date = '2001-02-20',
  gender = 'female',
  interests = '[{"category":"books","label":"Lectura"},{"category":"art","label":"Arte"}]'::jsonb,
  locale = 'es',
  location_sharing = false,
  updated_at = now()
where id = '33333333-3333-3333-3333-333333333333';

update "user"
set
  nickname = 'Caro',
  birth_date = '1998-08-14',
  gender = 'male',
  interests = '[{"category":"gaming","label":"Gaming"},{"category":"travel","label":"Viajes"}]'::jsonb,
  locale = 'en',
  location_sharing = false,
  updated_at = now()
where id = '44444444-4444-4444-4444-444444444444';

-- =============================================================
-- 4. Ajustar suscripciones creadas por trigger
-- =============================================================

update subscription
set
  plan = 'premium',
  status = 'active',
  start_date = current_date - 20,
  updated_at = now()
where user_id = '11111111-1111-1111-1111-111111111111';

update subscription
set
  plan = 'free',
  status = 'active',
  start_date = current_date - 20,
  updated_at = now()
where user_id = '22222222-2222-2222-2222-222222222222';

update subscription
set
  plan = 'free',
  status = 'active',
  start_date = current_date - 10,
  updated_at = now()
where user_id = '33333333-3333-3333-3333-333333333333';

update subscription
set
  plan = 'free',
  status = 'active',
  start_date = current_date - 10,
  updated_at = now()
where user_id = '44444444-4444-4444-4444-444444444444';

-- =============================================================
-- 5. Consentimientos
-- =============================================================

insert into user_consent (
  user_id,
  document_type,
  version,
  ip_address,
  accepted_at
) values
('11111111-1111-1111-1111-111111111111', 'terms_of_service', '1.0.0', '127.0.0.1', now() - interval '20 days'),
('11111111-1111-1111-1111-111111111111', 'privacy_policy', '1.0.0', '127.0.0.1', now() - interval '20 days'),
('11111111-1111-1111-1111-111111111111', 'location_consent', '1.0.0', '127.0.0.1', now() - interval '19 days'),

('22222222-2222-2222-2222-222222222222', 'terms_of_service', '1.0.0', '127.0.0.1', now() - interval '20 days'),
('22222222-2222-2222-2222-222222222222', 'privacy_policy', '1.0.0', '127.0.0.1', now() - interval '20 days'),

('33333333-3333-3333-3333-333333333333', 'terms_of_service', '1.0.0', '127.0.0.1', now() - interval '10 days'),
('33333333-3333-3333-3333-333333333333', 'privacy_policy', '1.0.0', '127.0.0.1', now() - interval '10 days'),

('44444444-4444-4444-4444-444444444444', 'terms_of_service', '1.0.0', '127.0.0.1', now() - interval '10 days'),
('44444444-4444-4444-4444-444444444444', 'privacy_policy', '1.0.0', '127.0.0.1', now() - interval '10 days');

-- =============================================================
-- 6. Espacios
-- =============================================================

insert into space (
  id,
  name,
  known_date,
  official_date,
  created_at,
  updated_at
) values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Ana & Luis',
  '2024-01-14',
  '2024-02-14',
  now() - interval '18 days',
  now() - interval '18 days'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Sofi & Carlos',
  '2024-09-01',
  '2024-10-01',
  now() - interval '9 days',
  now() - interval '9 days'
);

-- =============================================================
-- 7. Miembros de espacio
-- =============================================================

insert into space_member (
  id,
  user_id,
  space_id,
  role,
  joined_at
) values
(
  '1111aaaa-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'owner',
  now() - interval '18 days'
),
(
  '2222bbbb-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'member',
  now() - interval '17 days'
),
(
  '3333cccc-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'owner',
  now() - interval '9 days'
),
(
  '4444dddd-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'member',
  now() - interval '8 days'
);

-- =============================================================
-- 8. Invitaciones
-- =============================================================

insert into invitation (
  id,
  space_id,
  invited_by,
  code,
  status,
  expires_at,
  accepted_by,
  accepted_at,
  created_at
) values
(
  '5555eeee-5555-5555-5555-555555555555',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'ABX4921',
  'accepted',
  now() - interval '16 days',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '17 days',
  now() - interval '18 days'
),
(
  '6666ffff-6666-6666-6666-666666666666',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'XYZ7788',
  'accepted',
  now() - interval '7 days',
  '44444444-4444-4444-4444-444444444444',
  now() - interval '8 days',
  now() - interval '9 days'
),
(
  '7777aaaa-7777-7777-7777-777777777777',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'TMP0001',
  'expired',
  now() - interval '1 day',
  null,
  null,
  now() - interval '3 days'
);

-- =============================================================
-- 9. Fechas especiales
-- =============================================================

insert into special_date (
  id,
  space_id,
  created_by,
  title,
  type,
  date,
  repeat_yearly,
  notify_day_before,
  created_at
) values
(
  '8888bbbb-8888-8888-8888-888888888888',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Aniversario oficial',
  'anniversary',
  '2024-02-14',
  true,
  true,
  now() - interval '17 days'
),
(
  '9999cccc-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222',
  'Primera cita',
  'first_date',
  '2024-01-20',
  true,
  true,
  now() - interval '16 days'
),
(
  'aaaa1111-aaaa-1111-aaaa-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'Viaje a Villa de Leyva',
  'trip',
  '2025-03-10',
  false,
  false,
  now() - interval '8 days'
);

-- =============================================================
-- 10. Cartas
-- =============================================================

insert into letter (
  id,
  space_id,
  created_by,
  directed_to,
  title,
  paragraphs,
  image_url,
  thumbnail_url,
  status,
  deleted_at,
  created_at,
  updated_at
) values
(
  'bbbb1111-bbbb-1111-bbbb-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Para ti, en un día cualquiera',
  '[
    {"order": 1, "content": "Hoy pensé en ti desde temprano."},
    {"order": 2, "content": "A veces lo cotidiano se vuelve bonito solo porque estás."}
  ]'::jsonb,
  'https://example.com/storage/letters/carta-1.jpg',
  'https://example.com/storage/letters/thumb-carta-1.webp',
  'published',
  null,
  now() - interval '8 days',
  now() - interval '8 days'
),
(
  'bbbb2222-bbbb-2222-bbbb-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Borrador después del OCR',
  '[
    {"order": 1, "content": "Todavía estoy corrigiendo algunas palabras..."}
  ]'::jsonb,
  'https://example.com/storage/letters/carta-2.jpg',
  'https://example.com/storage/letters/thumb-carta-2.webp',
  'draft',
  null,
  now() - interval '2 days',
  now() - interval '2 days'
),
(
  'bbbb3333-bbbb-3333-bbbb-333333333333',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Carta archivada',
  '[
    {"order": 1, "content": "Esta carta me gusta guardarla aparte."}
  ]'::jsonb,
  null,
  null,
  'archived',
  null,
  now() - interval '30 days',
  now() - interval '30 days'
),
(
  'bbbb4444-bbbb-4444-bbbb-444444444444',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  'Hola desde otro espacio',
  '[
    {"order": 1, "content": "Esta carta sirve para probar aislamiento RLS."}
  ]'::jsonb,
  null,
  null,
  'published',
  null,
  now() - interval '4 days',
  now() - interval '4 days'
);

-- =============================================================
-- 11. Fotos
-- sync_space_storage() actualizará storage_used_bytes
-- =============================================================

insert into photo (
  id,
  space_id,
  uploaded_by,
  url,
  thumbnail_url,
  description,
  mime_type,
  file_size_bytes,
  taken_at,
  deleted_at,
  created_at
) values
(
  'cccc1111-cccc-1111-cccc-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'https://example.com/storage/photos/photo-1.webp',
  'https://example.com/storage/photos/thumb-photo-1.webp',
  'Nuestra primera salida al café',
  'image/webp',
  245000,
  current_date - 40,
  null,
  now() - interval '39 days'
),
(
  'cccc2222-cccc-2222-cccc-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222',
  'https://example.com/storage/photos/photo-2.webp',
  'https://example.com/storage/photos/thumb-photo-2.webp',
  'Ese atardecer en Monserrate',
  'image/webp',
  198000,
  current_date - 25,
  null,
  now() - interval '24 days'
),
(
  'cccc3333-cccc-3333-cccc-333333333333',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'https://example.com/storage/photos/photo-trash.webp',
  'https://example.com/storage/photos/thumb-photo-trash.webp',
  'Foto movida a papelera para probar restore/purge',
  'image/webp',
  210000,
  current_date - 5,
  now() - interval '1 day',
  now() - interval '5 days'
),
(
  'cccc4444-cccc-4444-cccc-444444444444',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'https://example.com/storage/photos/photo-other-space.webp',
  'https://example.com/storage/photos/thumb-photo-other-space.webp',
  'Foto del otro espacio',
  'image/webp',
  180000,
  current_date - 7,
  null,
  now() - interval '7 days'
);

-- =============================================================
-- 12. Reacciones
-- =============================================================

insert into reaction (
  id,
  user_id,
  target_type,
  target_id,
  emoji,
  created_at
) values
(
  'dddd1111-dddd-1111-dddd-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'photo',
  'cccc1111-cccc-1111-cccc-111111111111',
  '❤️',
  now() - interval '38 days'
),
(
  'dddd2222-dddd-2222-dddd-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'letter',
  'bbbb1111-bbbb-1111-bbbb-111111111111',
  '🥹',
  now() - interval '7 days'
),
(
  'dddd3333-dddd-3333-dddd-333333333333',
  '44444444-4444-4444-4444-444444444444',
  'letter',
  'bbbb4444-bbbb-4444-bbbb-444444444444',
  '🔥',
  now() - interval '3 days'
);

-- =============================================================
-- 13. Comentarios
-- =============================================================

insert into comment (
  id,
  user_id,
  target_type,
  target_id,
  content,
  deleted_at,
  created_at
) values
(
  'eeee1111-eeee-1111-eeee-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'photo',
  'cccc1111-cccc-1111-cccc-111111111111',
  'Ese día estuvo precioso, deberíamos volver.',
  null,
  now() - interval '38 days'
),
(
  'eeee2222-eeee-2222-eeee-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'letter',
  'bbbb1111-bbbb-1111-bbbb-111111111111',
  'La voy a releer muchas veces.',
  null,
  now() - interval '7 days'
),
(
  'eeee3333-eeee-3333-eeee-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'letter',
  'bbbb2222-bbbb-2222-bbbb-222222222222',
  'Te quedó lindo, solo corrige un par de palabras.',
  now() - interval '1 day',
  now() - interval '2 days'
);

-- =============================================================
-- 14. Post-its
-- board se crea solo por trigger al insertar space
-- =============================================================

insert into post_it (
  id,
  board_id,
  created_by,
  note,
  color,
  pos_x,
  pos_y,
  created_at,
  updated_at
)
select
  'ffff1111-ffff-1111-ffff-111111111111',
  b.id,
  '11111111-1111-1111-1111-111111111111',
  'No olvidar nuestra salida del viernes 💕',
  '#FF6B8B',
  0.15,
  0.20,
  now() - interval '4 days',
  now() - interval '4 days'
from board b
where b.space_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

insert into post_it (
  id,
  board_id,
  created_by,
  note,
  color,
  pos_x,
  pos_y,
  created_at,
  updated_at
)
select
  'ffff2222-ffff-2222-ffff-222222222222',
  b.id,
  '22222222-2222-2222-2222-222222222222',
  'Comprarte tu chocolate favorito',
  '#E8D5F5',
  0.48,
  0.35,
  now() - interval '3 days',
  now() - interval '3 days'
from board b
where b.space_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

insert into post_it (
  id,
  board_id,
  created_by,
  note,
  color,
  pos_x,
  pos_y,
  created_at,
  updated_at
)
select
  'ffff3333-ffff-3333-ffff-333333333333',
  b.id,
  '33333333-3333-3333-3333-333333333333',
  'Planear escapada del puente',
  '#FFF3DC',
  0.22,
  0.40,
  now() - interval '2 days',
  now() - interval '2 days'
from board b
where b.space_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- =============================================================
-- 15. Metas
-- =============================================================

insert into goal (
  id,
  space_id,
  created_by,
  title,
  description,
  status,
  target_date,
  completed_at,
  created_at,
  updated_at
) values
(
  'aaaa2222-aaaa-2222-aaaa-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Viajar juntos a la costa',
  'Ahorrar y planear el viaje para fin de año.',
  'in_progress',
  current_date + 120,
  null,
  now() - interval '12 days',
  now() - interval '2 days'
),
(
  'aaaa3333-aaaa-3333-aaaa-333333333333',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222',
  'Ver 12 películas románticas',
  'Una por fin de semana.',
  'completed',
  current_date - 10,
  now() - interval '5 days',
  now() - interval '15 days',
  now() - interval '5 days'
),
(
  'aaaa4444-aaaa-4444-aaaa-444444444444',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'Crear álbum del viaje',
  null,
  'pending',
  current_date + 30,
  null,
  now() - interval '7 days',
  now() - interval '7 days'
);

-- =============================================================
-- 16. Ubicación
-- =============================================================

insert into member_location (
  id,
  user_id,
  space_id,
  latitude,
  longitude,
  accuracy,
  recorded_at
) values
(
  'bbbb5555-bbbb-5555-bbbb-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  4.7110,
  -74.0721,
  15.5,
  now() - interval '10 minutes'
);

-- =============================================================
-- 17. Notificaciones
-- =============================================================

insert into notification (
  id,
  user_id,
  type,
  title,
  body,
  payload,
  read,
  read_at,
  created_at
) values
(
  'cccc5555-cccc-5555-cccc-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'new_letter',
  'Tienes una nueva carta',
  'Ana te dejó una carta para leer.',
  '{"letter_id":"bbbb1111-bbbb-1111-bbbb-111111111111"}'::jsonb,
  false,
  null,
  now() - interval '8 days'
),
(
  'cccc6666-cccc-6666-cccc-666666666666',
  '11111111-1111-1111-1111-111111111111',
  'goal_completed',
  'Meta completada',
  'Luis marcó una meta como cumplida.',
  '{"goal_id":"aaaa3333-aaaa-3333-aaaa-333333333333"}'::jsonb,
  true,
  now() - interval '5 days',
  now() - interval '5 days'
),
(
  'cccc7777-cccc-7777-cccc-777777777777',
  '22222222-2222-2222-2222-222222222222',
  'new_reaction',
  'Nueva reacción',
  'Ana reaccionó a tu carta.',
  '{"letter_id":"bbbb1111-bbbb-1111-bbbb-111111111111","emoji":"🥹"}'::jsonb,
  false,
  null,
  now() - interval '7 days'
);

-- =============================================================
-- 18. Push tokens
-- =============================================================

insert into push_token (
  id,
  user_id,
  token,
  platform,
  active,
  created_at,
  updated_at
) values
(
  'dddd5555-dddd-5555-dddd-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'ExponentPushToken[AnaMockToken123]',
  'android',
  true,
  now() - interval '15 days',
  now() - interval '15 days'
),
(
  'dddd6666-dddd-6666-dddd-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'ExponentPushToken[LuisMockToken456]',
  'ios',
  true,
  now() - interval '15 days',
  now() - interval '15 days'
);

-- =============================================================
-- 19. Reportes
-- =============================================================

insert into content_report (
  id,
  reported_by,
  target_type,
  target_id,
  reason,
  status,
  created_at
) values
(
  'eeee5555-eeee-5555-eeee-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'comment',
  'eeee3333-eeee-3333-eeee-333333333333',
  'Comentario de prueba para flujo de moderación',
  'pending',
  now() - interval '12 hours'
);

-- =============================================================
-- 20. Auditoría
-- =============================================================

select log_audit(
  '11111111-1111-1111-1111-111111111111',
  'export_data',
  'user',
  '11111111-1111-1111-1111-111111111111',
  null,
  '{"source":"seed"}'::jsonb,
  '127.0.0.1'
);

select log_audit(
  '22222222-2222-2222-2222-222222222222',
  'soft_delete',
  'comment',
  'eeee3333-eeee-3333-eeee-333333333333',
  '{"content":"Te quedó lindo, solo corrige un par de palabras."}'::jsonb,
  '{"deleted_at":"seed"}'::jsonb,
  '127.0.0.1'
);

commit;