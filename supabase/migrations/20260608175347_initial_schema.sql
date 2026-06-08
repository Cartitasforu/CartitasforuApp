-- =============================================================
--  CARTITAS FOR U — Script de base de datos v2.0.0
--  PostgreSQL 15+ / Supabase compatible
--  Cambios vs v1: USER_CONSENT, SPECIAL_DATE, GOAL, NOTIFICATION,
--  PUSH_TOKEN, REACTION, COMMENT, CONTENT_REPORT, AUDIT_LOG,
--  campos de privacidad en USER, storage quota en SPACE,
--  soft-delete con papelera en PHOTO, sexual_pref eliminado.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- TIPOS ENUMERADOS
-- =============================================================

CREATE TYPE gender_type AS ENUM (
    'male', 'female', 'non_binary', 'other', 'prefer_not_to_say'
);

CREATE TYPE letter_status AS ENUM (
    'draft',       -- en edición manual post-OCR
    'published',   -- visible para ambos miembros
    'archived'     -- oculta pero no eliminada
);

CREATE TYPE invitation_status AS ENUM (
    'pending', 'accepted', 'expired', 'cancelled'
);

CREATE TYPE subscription_plan AS ENUM (
    'free', 'premium', 'premium_plus'
);

CREATE TYPE subscription_status AS ENUM (
    'active', 'cancelled', 'expired', 'trial'
);

CREATE TYPE space_member_role AS ENUM (
    'owner', 'member'
);

CREATE TYPE goal_status AS ENUM (
    'pending',    -- sin iniciar
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE notification_type AS ENUM (
    'new_letter',        -- pareja dejó una carta
    'new_photo',         -- pareja subió una foto
    'new_post_it',       -- pareja agregó nota al tablero
    'new_comment',       -- comentario en foto o carta
    'new_reaction',      -- reacción en foto o carta
    'goal_completed',    -- meta marcada como cumplida
    'special_date',      -- recordatorio de fecha especial
    'partner_joined',    -- pareja se unió al espacio
    'partner_location',  -- pareja compartió ubicación
    'system'             -- mensaje del sistema / mantenimiento
);

CREATE TYPE report_status AS ENUM (
    'pending', 'reviewed', 'dismissed', 'action_taken'
);

CREATE TYPE consent_document AS ENUM (
    'terms_of_service', 'privacy_policy', 'location_consent'
);

CREATE TYPE platform_type AS ENUM (
    'ios', 'android'
);

CREATE TYPE audit_action AS ENUM (
    'create', 'update', 'delete', 'soft_delete',
    'restore', 'login', 'logout', 'export_data', 'delete_account'
);

-- =============================================================
-- FUNCIÓN REUTILIZABLE: updated_at automático
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- TABLA: USER
-- Cambios v2:
--   - Eliminado sexual_pref (dato sensible, riesgo legal)
--   - Agregado locale para i18n (ES / EN)
--   - Agregado location_sharing (opt-in explícito para el mapa)
--   - Agregado deleted_at para eliminación de cuenta (GDPR)
--   - Agregado storage_used_bytes movido a SPACE
-- =============================================================

CREATE TABLE IF NOT EXISTS "user" (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255)  NOT NULL UNIQUE,
    full_name           VARCHAR(150)  NOT NULL,
    nickname            VARCHAR(80),
    birth_date          DATE,
    gender              gender_type,
    -- sexual_pref ELIMINADO: dato sensible bajo GDPR / Ley 1581.
    -- Si se requiere en el futuro, implementar con cifrado en reposo
    -- y consentimiento explícito separado en USER_CONSENT.
    interests           JSONB         NOT NULL DEFAULT '[]'::jsonb,
    -- [{"category": "music", "label": "Música"}]
    profile_photo_url   TEXT,
    locale              VARCHAR(5)    NOT NULL DEFAULT 'es',
    -- ISO 639-1: 'es' | 'en'. Base para i18n en notificaciones.
    location_sharing    BOOLEAN       NOT NULL DEFAULT FALSE,
    -- FALSE por defecto. El usuario activa explícitamente en config.
    -- Requerido por Apple App Store Review Guidelines §5.1.1
    deleted_at          TIMESTAMPTZ,
    -- Soft delete para cumplir derecho al olvido (GDPR art. 17).
    -- Hard delete programado 30 días después de deleted_at.
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_full_name_length  CHECK (char_length(full_name) >= 2),
    CONSTRAINT chk_birth_date        CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE - INTERVAL '13 years'),
    CONSTRAINT chk_locale            CHECK (locale IN ('es', 'en'))
);

COMMENT ON TABLE "user" IS 'Perfil público. id == auth.users.id de Supabase.';
COMMENT ON COLUMN "user".location_sharing IS 'Opt-in explícito para compartir ubicación. Requerido por stores.';
COMMENT ON COLUMN "user".deleted_at IS 'Soft delete GDPR. Hard delete programado 30 días después.';
COMMENT ON COLUMN "user".locale IS 'Idioma preferido del usuario para notificaciones y UI.';

CREATE INDEX IF NOT EXISTS idx_user_email      ON "user"(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_active     ON "user"(id)    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- TABLA: USER_CONSENT
-- NUEVO v2. Registra aceptación de ToS, política de privacidad
-- y consentimiento de ubicación. Requerido por Apple, Google
-- y legislación de protección de datos.
-- =============================================================

CREATE TABLE IF NOT EXISTS user_consent (
    id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID              NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    document_type   consent_document  NOT NULL,
    version         VARCHAR(20)       NOT NULL,
    -- Versión semántica del documento: '1.0.0', '1.1.0', etc.
    ip_address      INET,
    -- IP al momento de aceptar. Útil en disputas legales.
    accepted_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_consent UNIQUE (user_id, document_type, version)
    -- No duplicar el mismo consentimiento
);

COMMENT ON TABLE user_consent IS 'Registro inmutable de aceptación de documentos legales. No borrar ni actualizar registros.';
COMMENT ON COLUMN user_consent.version IS 'Versión del documento aceptado. Permite detectar si el usuario debe aceptar una versión nueva.';

CREATE INDEX IF NOT EXISTS idx_consent_user ON user_consent(user_id);

-- =============================================================
-- TABLA: SPACE
-- Cambios v2:
--   - Eliminado days_dating (campo calculado — ver vista space_stats)
--   - Agregado storage_used_bytes para control de cuota
-- =============================================================

CREATE TABLE IF NOT EXISTS space (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL DEFAULT 'Nuestro espacio',
    known_date          DATE,
    official_date       DATE,
    storage_used_bytes  BIGINT  NOT NULL DEFAULT 0,
    -- Actualizado por trigger en INSERT/DELETE de PHOTO y LETTER (image_url).
    -- Comparar contra límite del plan en SUBSCRIPTION para bloquear uploads.
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_dates_coherence CHECK (
        known_date IS NULL OR official_date IS NULL OR known_date <= official_date
    ),
    CONSTRAINT chk_storage_non_negative CHECK (storage_used_bytes >= 0)
);

COMMENT ON TABLE space IS 'Espacio compartido de pareja. days_together se calcula: CURRENT_DATE - official_date.';
COMMENT ON COLUMN space.storage_used_bytes IS 'Bytes totales usados por fotos y cartas del espacio. Actualizado por trigger.';

CREATE TRIGGER trg_space_updated_at
    BEFORE UPDATE ON space
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();



-- =============================================================
-- TABLA: SPACE_MEMBER
-- Sin cambios vs v1
-- =============================================================

CREATE TABLE IF NOT EXISTS space_member (
    id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID              NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    space_id    UUID              NOT NULL REFERENCES space(id)  ON DELETE CASCADE,
    role        space_member_role NOT NULL DEFAULT 'member',
    joined_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_space_member UNIQUE (user_id, space_id)
);

CREATE INDEX IF NOT EXISTS idx_space_member_user  ON space_member(user_id);
CREATE INDEX IF NOT EXISTS idx_space_member_space ON space_member(space_id);

-- =============================================================
-- TABLA: INVITATION
-- Sin cambios vs v1
-- =============================================================

CREATE TABLE IF NOT EXISTS invitation (
    id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id    UUID              NOT NULL REFERENCES space(id) ON DELETE CASCADE,
    invited_by  UUID              NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    code        VARCHAR(10)       NOT NULL UNIQUE,
    status      invitation_status NOT NULL DEFAULT 'pending',
    expires_at  TIMESTAMPTZ       NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    accepted_by UUID              REFERENCES "user"(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_expires_future CHECK (expires_at > created_at),
    CONSTRAINT chk_accepted_coherence CHECK (
        (status = 'accepted' AND accepted_by IS NOT NULL AND accepted_at IS NOT NULL)
        OR (status != 'accepted')
    )
);

CREATE INDEX IF NOT EXISTS idx_invitation_code  ON invitation(code)     WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invitation_space ON invitation(space_id);

-- =============================================================
-- TABLA: SPECIAL_DATE
-- NUEVO v2. Fechas especiales con recordatorio push.
-- Ejemplos: aniversario, cumpleaños de la pareja, primera cita.
-- =============================================================

CREATE TABLE IF NOT EXISTS special_date (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id            UUID        NOT NULL REFERENCES space(id) ON DELETE CASCADE,
    created_by          UUID        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title               VARCHAR(150) NOT NULL,
    type                VARCHAR(50) NOT NULL DEFAULT 'anniversary',
    -- Valores sugeridos: 'anniversary', 'birthday', 'first_date',
    -- 'first_kiss', 'trip', 'custom'
    date                DATE        NOT NULL,
    repeat_yearly       BOOLEAN     NOT NULL DEFAULT TRUE,
    -- TRUE: se recuerda cada año (aniversarios, cumpleaños)
    -- FALSE: fecha única (primer viaje juntos)
    notify_day_before   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_title_length CHECK (char_length(title) >= 1)
);

COMMENT ON TABLE special_date IS 'Fechas especiales con notificación push. repeat_yearly=TRUE para aniversarios y cumpleaños.';

CREATE INDEX IF NOT EXISTS idx_special_date_space ON special_date(space_id);
CREATE INDEX IF NOT EXISTS idx_special_date_date  ON special_date(date);
-- El job de notificaciones consulta este índice diariamente

-- =============================================================
-- TABLA: LETTER
-- Cambios v2:
--   - Agregado thumbnail_url para vista previa en lista
-- =============================================================

CREATE TABLE IF NOT EXISTS letter (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id        UUID          NOT NULL REFERENCES space(id) ON DELETE CASCADE,
    created_by      UUID          NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    directed_to     UUID          REFERENCES "user"(id) ON DELETE SET NULL,
    title           VARCHAR(200)  NOT NULL,
    paragraphs      JSONB         NOT NULL DEFAULT '[]'::jsonb,
    -- [{"order": 1, "content": "texto del párrafo"}]
    image_url       TEXT,
    -- Imagen original escaneada en Supabase Storage
    thumbnail_url   TEXT,
    -- Thumbnail generado en Edge Function (200x200 WebP)
    status          letter_status NOT NULL DEFAULT 'draft',
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_letter_title CHECK (char_length(title) >= 1),
    CONSTRAINT chk_directed_different CHECK (directed_to IS NULL OR directed_to != created_by)
);

CREATE INDEX IF NOT EXISTS idx_letter_space    ON letter(space_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_letter_author   ON letter(created_by);
CREATE INDEX IF NOT EXISTS idx_letter_status   ON letter(status)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_letter_gin      ON letter USING GIN (paragraphs jsonb_path_ops);

CREATE TRIGGER trg_letter_updated_at
    BEFORE UPDATE ON letter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- TABLA: PHOTO
-- Cambios v2:
--   - Agregado thumbnail_url (generado en Edge Function)
--   - Agregado file_size_bytes (para control de cuota)
--   - Agregado purge_after (papelera 30 días antes de borrar en Storage)
--   - deleted_at ahora activa la papelera, no borra de Storage
-- =============================================================

CREATE TABLE IF NOT EXISTS photo (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id            UUID        NOT NULL REFERENCES space(id) ON DELETE CASCADE,
    uploaded_by         UUID        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    url                 TEXT        NOT NULL,
    thumbnail_url       TEXT,
    -- WebP 200x200 generado en Edge Function al subir
    description         TEXT,
    mime_type           VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    file_size_bytes     BIGINT      NOT NULL DEFAULT 0,
    taken_at            DATE,
    deleted_at          TIMESTAMPTZ,
    -- Papelera: la foto sigue en Storage pero oculta en UI
    purge_after         TIMESTAMPTZ,
    -- Se calcula por trigger: deleted_at + 30 días
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_mime_type CHECK (
        mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
    ),
    CONSTRAINT chk_file_size CHECK (file_size_bytes >= 0)
);

COMMENT ON TABLE photo IS 'Fotos de la galería. deleted_at activa papelera. purge_after controla cuándo limpiar Storage.';
COMMENT ON COLUMN photo.purge_after IS 'Se calcula por trigger: deleted_at + 30 días. Job nocturno purga Storage cuando NOW() > purge_after.';

CREATE OR REPLACE FUNCTION set_photo_purge_after()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deleted_at IS NULL THEN
        NEW.purge_after := NULL;
    ELSE
        NEW.purge_after := NEW.deleted_at + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_photo_set_purge_after
    BEFORE INSERT OR UPDATE OF deleted_at ON photo
    FOR EACH ROW EXECUTE FUNCTION set_photo_purge_after();

CREATE INDEX IF NOT EXISTS idx_photo_space    ON photo(space_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_photo_timeline ON photo(space_id, taken_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_photo_trash    ON photo(purge_after) WHERE deleted_at IS NOT NULL;
-- El job de limpieza usa este índice: WHERE NOW() > purge_after

-- Trigger: actualizar storage_used_bytes en SPACE
CREATE OR REPLACE FUNCTION sync_space_storage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE space SET storage_used_bytes = storage_used_bytes + NEW.file_size_bytes
        WHERE id = NEW.space_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        -- La foto entró a papelera: no liberar cuota aún (sigue en Storage)
        NULL;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE space SET storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.file_size_bytes)
        WHERE id = OLD.space_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_photo_storage
    AFTER INSERT OR UPDATE OR DELETE ON photo
    FOR EACH ROW EXECUTE FUNCTION sync_space_storage();

-- =============================================================
-- TABLA: REACTION
-- NUEVO v2. Reacciones en fotos y cartas.
-- Usa patrón polymorphic: target_type + target_id en lugar de
-- dos FKs separadas, para no crear tabla por cada entidad.
-- Riesgo: no hay FK referencial en target_id. Validar en app.
-- =============================================================

CREATE TABLE IF NOT EXISTS reaction (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    -- 'photo' | 'letter'
    target_id   UUID        NOT NULL,
    emoji       VARCHAR(10) NOT NULL DEFAULT '❤️',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_reaction UNIQUE (user_id, target_type, target_id),
    -- Un usuario solo puede reaccionar una vez por contenido
    CONSTRAINT chk_target_type CHECK (target_type IN ('photo', 'letter'))
);

COMMENT ON TABLE reaction IS 'Reacciones emoji en fotos y cartas. Un usuario = una reacción por contenido. Cambia haciendo UPDATE en emoji.';

CREATE INDEX IF NOT EXISTS idx_reaction_target ON reaction(target_type, target_id);

-- =============================================================
-- TABLA: COMMENT
-- NUEVO v2. Comentarios en fotos y cartas.
-- Mismo patrón polymorphic que REACTION.
-- =============================================================

CREATE TABLE IF NOT EXISTS comment (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    -- 'photo' | 'letter'
    target_id   UUID        NOT NULL,
    content     TEXT        NOT NULL,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_comment_target CHECK (target_type IN ('photo', 'letter')),
    CONSTRAINT chk_comment_length CHECK (char_length(content) BETWEEN 1 AND 1000)
);

CREATE INDEX IF NOT EXISTS idx_comment_target ON comment(target_type, target_id) WHERE deleted_at IS NULL;

-- =============================================================
-- TABLA: BOARD y POST_IT
-- Sin cambios estructurales vs v1
-- =============================================================

CREATE TABLE IF NOT EXISTS board (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id    UUID        NOT NULL UNIQUE REFERENCES space(id) ON DELETE CASCADE,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION create_board_for_space()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO board (space_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_board_on_space
    AFTER INSERT ON space
    FOR EACH ROW EXECUTE FUNCTION create_board_for_space();

CREATE TABLE IF NOT EXISTS post_it (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id    UUID        NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    created_by  UUID        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    note        TEXT        NOT NULL,
    color       VARCHAR(20) NOT NULL DEFAULT '#FFE4CC',
    pos_x       FLOAT       NOT NULL DEFAULT 0.1 CHECK (pos_x BETWEEN 0.0 AND 1.0),
    pos_y       FLOAT       NOT NULL DEFAULT 0.1 CHECK (pos_y BETWEEN 0.0 AND 1.0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_post_it_length CHECK (char_length(note) BETWEEN 1 AND 500)
);

CREATE INDEX IF NOT EXISTS idx_post_it_board ON post_it(board_id);

CREATE TRIGGER trg_post_it_updated_at
    BEFORE UPDATE ON post_it
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_board_on_post_it()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE board SET updated_at = NOW() WHERE id = COALESCE(NEW.board_id, OLD.board_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_board_updated_on_postit
    AFTER INSERT OR UPDATE OR DELETE ON post_it
    FOR EACH ROW EXECUTE FUNCTION update_board_on_post_it();

-- =============================================================
-- TABLA: GOAL
-- NUEVO v2. Metas / wishlist de pareja.
-- Directamente relacionada con el contador "Metas cumplidas"
-- del dashboard que aparece en los mockups.
-- =============================================================

CREATE TABLE IF NOT EXISTS goal (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id        UUID          NOT NULL REFERENCES space(id) ON DELETE CASCADE,
    created_by      UUID          NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title           VARCHAR(200)  NOT NULL,
    description     TEXT,
    status          goal_status   NOT NULL DEFAULT 'pending',
    target_date     DATE,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_goal_title CHECK (char_length(title) >= 1),
    CONSTRAINT chk_completed_coherence CHECK (
        (status = 'completed' AND completed_at IS NOT NULL)
        OR (status != 'completed')
    )
);

COMMENT ON TABLE goal IS 'Metas de pareja. El contador del dashboard usa COUNT(*) WHERE status=completed.';

CREATE INDEX IF NOT EXISTS idx_goal_space  ON goal(space_id);
CREATE INDEX IF NOT EXISTS idx_goal_status ON goal(space_id, status);

CREATE TRIGGER trg_goal_updated_at
    BEFORE UPDATE ON goal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- TABLA: MEMBER_LOCATION
-- Cambios v2: sin cambios estructurales.
-- Nota de privacidad: solo insertar si user.location_sharing = TRUE
-- =============================================================

CREATE TABLE IF NOT EXISTS member_location (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID    NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    space_id    UUID    NOT NULL REFERENCES space(id)  ON DELETE CASCADE,
    latitude    FLOAT   NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
    longitude   FLOAT   NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    accuracy    FLOAT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_member_location UNIQUE (user_id, space_id)
);

COMMENT ON TABLE member_location IS 'Última ubicación. Actualizar con UPSERT. Solo si user.location_sharing = TRUE.';

CREATE INDEX IF NOT EXISTS idx_member_location_space ON member_location(space_id);

-- =============================================================
-- TABLA: NOTIFICATION
-- NUEVO v2. Notificaciones in-app + push (FCM/APNs).
-- payload guarda contexto variable según type.
-- =============================================================

CREATE TABLE IF NOT EXISTS notification (
    id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID              NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(150)      NOT NULL,
    body        TEXT              NOT NULL,
    payload     JSONB             NOT NULL DEFAULT '{}'::jsonb,
    -- Contexto: {"letter_id": "uuid"} | {"photo_id": "uuid"} | etc.
    read        BOOLEAN           NOT NULL DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_read_coherence CHECK (
        (read = TRUE AND read_at IS NOT NULL) OR (read = FALSE)
    )
);

COMMENT ON TABLE notification IS 'Notificaciones in-app. Para push usar PUSH_TOKEN + FCM/APNs desde Edge Function.';

CREATE INDEX IF NOT EXISTS idx_notification_user_unread
    ON notification(user_id, created_at DESC) WHERE read = FALSE;
-- Índice parcial optimizado para la campana de notificaciones

-- =============================================================
-- TABLA: PUSH_TOKEN
-- NUEVO v2. Tokens FCM (Android) y APNs (iOS) por dispositivo.
-- Un usuario puede tener múltiples tokens (varios dispositivos).
-- =============================================================

CREATE TABLE IF NOT EXISTS push_token (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token       TEXT          NOT NULL UNIQUE,
    platform    platform_type NOT NULL,
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE push_token IS 'Tokens de push por dispositivo. Desactivar (active=FALSE) en lugar de borrar al recibir error 404 de FCM/APNs.';

CREATE INDEX IF NOT EXISTS idx_push_token_user ON push_token(user_id) WHERE active = TRUE;

CREATE TRIGGER trg_push_token_updated_at
    BEFORE UPDATE ON push_token
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- TABLA: SUBSCRIPTION
-- Sin cambios vs v1
-- =============================================================

CREATE TABLE IF NOT EXISTS subscription (
    id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID                NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    plan        subscription_plan   NOT NULL DEFAULT 'free',
    status      subscription_status NOT NULL DEFAULT 'active',
    start_date  DATE                NOT NULL DEFAULT CURRENT_DATE,
    end_date    DATE,
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_sub_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_subscription_user ON subscription(user_id) WHERE status = 'active';

CREATE TRIGGER trg_subscription_updated_at
    BEFORE UPDATE ON subscription
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- TABLA: CONTENT_REPORT
-- NUEVO v2. Reporte de contenido inapropiado.
-- Requerido por Apple App Store Review Guidelines §1.2
-- para apps con contenido generado por usuarios (UGC).
-- =============================================================

CREATE TABLE IF NOT EXISTS content_report (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID          NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    target_type VARCHAR(20)   NOT NULL,
    -- 'photo' | 'letter' | 'post_it' | 'comment'
    target_id   UUID          NOT NULL,
    reason      VARCHAR(100)  NOT NULL,
    status      report_status NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_report_target CHECK (
        target_type IN ('photo', 'letter', 'post_it', 'comment')
    ),
    CONSTRAINT uq_report UNIQUE (reported_by, target_type, target_id)
    -- Un usuario solo puede reportar el mismo contenido una vez
);

CREATE INDEX IF NOT EXISTS idx_report_status ON content_report(status) WHERE status = 'pending';

-- =============================================================
-- TABLA: AUDIT_LOG
-- NUEVO v2. Registro append-only de acciones sensibles.
-- NUNCA hacer UPDATE ni DELETE en esta tabla.
-- before_state y after_state guardan snapshots JSON de la entidad.
-- =============================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id     UUID          REFERENCES "user"(id) ON DELETE SET NULL,
    -- NULL si fue una acción del sistema
    action       audit_action  NOT NULL,
    entity_type  VARCHAR(50)   NOT NULL,
    entity_id    UUID,
    before_state JSONB,
    after_state  JSONB,
    ip_address   INET,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    -- Sin updated_at: esta tabla es append-only por diseño
);

COMMENT ON TABLE audit_log IS 'Log inmutable de acciones sensibles. NUNCA hacer UPDATE ni DELETE aquí. Retención mínima: 1 año.';

CREATE INDEX IF NOT EXISTS idx_audit_actor  ON audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

-- Función helper para registrar auditoría desde triggers o app
CREATE OR REPLACE FUNCTION log_audit(
    p_actor_id    UUID,
    p_action      audit_action,
    p_entity_type VARCHAR,
    p_entity_id   UUID,
    p_before      JSONB DEFAULT NULL,
    p_after       JSONB DEFAULT NULL,
    p_ip          INET  DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, before_state, after_state, ip_address)
    VALUES (p_actor_id, p_action, p_entity_type, p_entity_id, p_before, p_after, p_ip);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vista calculada — NUNCA persistir days_together
CREATE OR REPLACE VIEW space_stats AS
SELECT
    s.id,
    s.name,
    s.known_date,
    s.official_date,
    CASE
        WHEN s.official_date IS NOT NULL
        THEN (CURRENT_DATE - s.official_date)::INT
        ELSE NULL
    END                         AS days_together,
    s.storage_used_bytes,
    COUNT(DISTINCT sm.user_id)  AS member_count,
    -- Cuota según plan activo del owner del espacio
    CASE sub.plan
        WHEN 'free'         THEN 524288000    -- 500 MB
        WHEN 'premium'      THEN 10737418240  -- 10 GB
        WHEN 'premium_plus' THEN 53687091200  -- 50 GB
        ELSE 524288000
    END                         AS storage_quota_bytes
FROM space s
LEFT JOIN space_member sm  ON sm.space_id = s.id
LEFT JOIN space_member own ON own.space_id = s.id AND own.role = 'owner'
LEFT JOIN subscription sub ON sub.user_id = own.user_id AND sub.status = 'active'
GROUP BY s.id, sub.plan;

COMMENT ON VIEW space_stats IS 'Expone days_together calculado y cuota de storage según plan. Usar siempre desde la app.';

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

ALTER TABLE "user"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent    ENABLE ROW LEVEL SECURITY;
ALTER TABLE space           ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_member    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation      ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_date    ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter          ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reaction        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment         ENABLE ROW LEVEL SECURITY;
ALTER TABLE board           ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_it         ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal            ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification    ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_token      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription    ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_report  ENABLE ROW LEVEL SECURITY;
-- audit_log: sin RLS. Solo accesible por service_role (backend).

-- Helper: space_id del usuario autenticado
CREATE OR REPLACE FUNCTION auth_user_space_id()
RETURNS UUID AS $$
    SELECT space_id FROM space_member
    WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- USER
CREATE POLICY "user_select_own"         ON "user" FOR SELECT USING (id = auth.uid() AND deleted_at IS NULL);
CREATE POLICY "user_update_own"         ON "user" FOR UPDATE USING (id = auth.uid());
CREATE POLICY "user_select_partner"     ON "user" FOR SELECT USING (
    deleted_at IS NULL AND id IN (
        SELECT user_id FROM space_member WHERE space_id = auth_user_space_id()
    )
);

-- USER_CONSENT
CREATE POLICY "consent_select_own" ON user_consent FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "consent_insert_own" ON user_consent FOR INSERT WITH CHECK (user_id = auth.uid());

-- SPACE
CREATE POLICY "space_select_member" ON space FOR SELECT   USING (id = auth_user_space_id());
CREATE POLICY "space_update_owner"  ON space FOR UPDATE   USING (id IN (
    SELECT space_id FROM space_member WHERE user_id = auth.uid() AND role = 'owner'
));

-- SPACE_MEMBER
CREATE POLICY "space_member_select" ON space_member FOR SELECT USING (space_id = auth_user_space_id());

-- INVITATION
CREATE POLICY "invitation_select"   ON invitation FOR SELECT USING (space_id = auth_user_space_id() OR invited_by = auth.uid());
CREATE POLICY "invitation_insert"   ON invitation FOR INSERT WITH CHECK (invited_by = auth.uid());

-- SPECIAL_DATE
CREATE POLICY "special_date_select" ON special_date FOR SELECT USING (space_id = auth_user_space_id());
CREATE POLICY "special_date_insert" ON special_date FOR INSERT WITH CHECK (space_id = auth_user_space_id() AND created_by = auth.uid());
CREATE POLICY "special_date_update" ON special_date FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "special_date_delete" ON special_date FOR DELETE USING (created_by = auth.uid());

-- LETTER
CREATE POLICY "letter_select"       ON letter FOR SELECT USING (space_id = auth_user_space_id() AND deleted_at IS NULL);
CREATE POLICY "letter_insert"       ON letter FOR INSERT WITH CHECK (space_id = auth_user_space_id() AND created_by = auth.uid());
CREATE POLICY "letter_update"       ON letter FOR UPDATE USING (created_by = auth.uid() AND deleted_at IS NULL);
CREATE POLICY "letter_soft_delete"  ON letter FOR UPDATE USING (space_id = auth_user_space_id());

-- PHOTO
CREATE POLICY "photo_select"        ON photo FOR SELECT USING (space_id = auth_user_space_id() AND deleted_at IS NULL);
CREATE POLICY "photo_insert"        ON photo FOR INSERT WITH CHECK (space_id = auth_user_space_id() AND uploaded_by = auth.uid());
CREATE POLICY "photo_soft_delete"   ON photo FOR UPDATE USING (uploaded_by = auth.uid());

-- REACTION
CREATE POLICY "reaction_select"     ON reaction FOR SELECT USING (
    target_id IN (
        SELECT id FROM photo  WHERE space_id = auth_user_space_id() UNION ALL
        SELECT id FROM letter WHERE space_id = auth_user_space_id()
    )
);
CREATE POLICY "reaction_insert"     ON reaction FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reaction_delete"     ON reaction FOR DELETE USING (user_id = auth.uid());

-- COMMENT
CREATE POLICY "comment_select"      ON comment FOR SELECT USING (
    deleted_at IS NULL AND target_id IN (
        SELECT id FROM photo  WHERE space_id = auth_user_space_id() UNION ALL
        SELECT id FROM letter WHERE space_id = auth_user_space_id()
    )
);
CREATE POLICY "comment_insert"      ON comment FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "comment_soft_delete" ON comment FOR UPDATE  USING (user_id = auth.uid());

-- BOARD / POST_IT
CREATE POLICY "board_select"        ON board   FOR SELECT USING (space_id = auth_user_space_id());
CREATE POLICY "postit_select"       ON post_it FOR SELECT USING (board_id IN (SELECT id FROM board WHERE space_id = auth_user_space_id()));
CREATE POLICY "postit_insert"       ON post_it FOR INSERT WITH CHECK (board_id IN (SELECT id FROM board WHERE space_id = auth_user_space_id()) AND created_by = auth.uid());
CREATE POLICY "postit_update"       ON post_it FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "postit_delete"       ON post_it FOR DELETE USING (created_by = auth.uid());

-- GOAL
CREATE POLICY "goal_select"         ON goal FOR SELECT USING (space_id = auth_user_space_id());
CREATE POLICY "goal_insert"         ON goal FOR INSERT WITH CHECK (space_id = auth_user_space_id() AND created_by = auth.uid());
CREATE POLICY "goal_update"         ON goal FOR UPDATE USING (space_id = auth_user_space_id());
CREATE POLICY "goal_delete"         ON goal FOR DELETE USING (created_by = auth.uid());

-- MEMBER_LOCATION
CREATE POLICY "location_select"     ON member_location FOR SELECT USING (space_id = auth_user_space_id());
CREATE POLICY "location_upsert"     ON member_location FOR INSERT WITH CHECK (user_id = auth.uid() AND space_id = auth_user_space_id());
CREATE POLICY "location_update"     ON member_location FOR UPDATE USING (user_id = auth.uid());

-- NOTIFICATION
CREATE POLICY "notif_select_own"    ON notification FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_update_own"    ON notification FOR UPDATE USING (user_id = auth.uid());

-- PUSH_TOKEN
CREATE POLICY "token_select_own"    ON push_token FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "token_insert_own"    ON push_token FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "token_update_own"    ON push_token FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "token_delete_own"    ON push_token FOR DELETE USING (user_id = auth.uid());

-- SUBSCRIPTION
CREATE POLICY "sub_select_own"      ON subscription FOR SELECT USING (user_id = auth.uid());

-- CONTENT_REPORT
CREATE POLICY "report_insert"       ON content_report FOR INSERT WITH CHECK (reported_by = auth.uid());
CREATE POLICY "report_select_own"   ON content_report FOR SELECT USING (reported_by = auth.uid());

-- =============================================================
-- TRIGGER: auto-crear perfil + suscripción al registrarse
-- Registrar en Supabase Dashboard > SQL Editor con permisos superuser
-- =============================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "user" (id, email, full_name, locale)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'locale', 'es')
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO subscription (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar en Supabase Dashboard (requiere permisos en schema auth):
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- =============================================================
-- JOBS PROGRAMADOS (pg_cron o Supabase Edge Function con cron)
-- =============================================================
-- 1. Expirar invitaciones (cada hora):
--    UPDATE invitation SET status = 'expired'
--    WHERE status = 'pending' AND expires_at < NOW();
--
-- 2. Purgar fotos de Storage (diario, 02:00 UTC):
--    SELECT url, thumbnail_url FROM photo
--    WHERE deleted_at IS NOT NULL AND NOW() > purge_after;
--    → Borrar archivos en Supabase Storage → DELETE FROM photo WHERE ...
--
-- 3. Notificaciones de fechas especiales (diario, 08:00 local):
--    SELECT sd.*, sm.user_id FROM special_date sd
--    JOIN space_member sm ON sm.space_id = sd.space_id
--    WHERE (notify_day_before AND date = CURRENT_DATE + 1)
--       OR date = CURRENT_DATE;
--
-- 4. Hard delete de cuentas (diario):
--    DELETE FROM "user"
--    WHERE deleted_at IS NOT NULL
--    AND deleted_at < NOW() - INTERVAL '30 days';

-- =============================================================
-- RESUMEN DE CAMBIOS V1 → V2
-- =============================================================
-- ELIMINADO:   user.sexual_pref (riesgo GDPR / Ley 1581)
-- ELIMINADO:   space.days_dating (campo calculado → vista space_stats)
-- MODIFICADO:  user → +locale, +location_sharing (opt-in), +deleted_at
-- MODIFICADO:  space → +storage_used_bytes
-- MODIFICADO:  photo → +thumbnail_url, +file_size_bytes, +purge_after
-- MODIFICADO:  letter → +thumbnail_url
-- NUEVO:       user_consent (aceptación legal de ToS / privacidad)
-- NUEVO:       special_date (fechas con recordatorio push)
-- NUEVO:       goal (metas de pareja — "Metas cumplidas" del dashboard)
-- NUEVO:       reaction (reacciones en fotos y cartas)
-- NUEVO:       comment (comentarios en fotos y cartas)
-- NUEVO:       notification (notificaciones in-app)
-- NUEVO:       push_token (tokens FCM/APNs por dispositivo)
-- NUEVO:       content_report (obligatorio por App Store §1.2)
-- NUEVO:       audit_log (log inmutable de acciones sensibles)
-- =============================================================