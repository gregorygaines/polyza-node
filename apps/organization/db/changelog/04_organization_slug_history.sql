CREATE TABLE IF NOT EXISTS app.organization_slug_history
(
  organization_slug_history_id    UUID PRIMARY KEY         DEFAULT uuidv7(),
  fk_organization_organization_id UUID                                               NOT NULL REFERENCES app.organization (organization_id),
  initiator_user_id               UUID                                               NOT NULL,
  slug                            TEXT                                               NOT NULL CHECK (char_length(slug) <= 45),
  created_at                      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);