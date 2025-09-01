CREATE TABLE IF NOT EXISTS app.team
(
  team_id               UUID PRIMARY KEY         DEFAULT uuidv7(),
  owner_organization_organization_id UUID                                               NOT NULL REFERENCES app.organization (organization_id),
  creator_user_id       UUID                                               NOT NULL,
  name                  TEXT                                               NOT NULL CHECK (char_length(name) <= 50),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at            TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_team_name_per_organization UNIQUE (owner_organization_organization_id, name)
)
