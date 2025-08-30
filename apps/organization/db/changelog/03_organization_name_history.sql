CREATE TABLE IF NOT EXISTS app.organization_name_history
(
  organization_name_history_id    UUID PRIMARY KEY         DEFAULT uuidv7(),
  fk_organization_organization_id UUID                                               NOT NULL REFERENCES app.organization (organization_id),
  initiator_user_id               UUID                                               NOT NULL,
  name                            TEXT                                               NOT NULL CHECK (char_length(name) <= 50),
  created_at                      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);