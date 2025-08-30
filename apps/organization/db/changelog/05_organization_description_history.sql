CREATE TABLE IF NOT EXISTS app.organization_description_history
(
  organization_description_history_id UUID PRIMARY KEY         DEFAULT uuidv7(),
  fk_organization_organization_id     UUID                                               NOT NULL REFERENCES app.organization (organization_id),
  initiator_user_id                   UUID                                               NOT NULL,
  description                         TEXT CHECK (char_length(description) <= 255),
  created_at                          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);