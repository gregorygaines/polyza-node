CREATE TABLE IF NOT EXISTS app.team_owner_organization
(
  team_owner_organization_id      UUID PRIMARY KEY         DEFAULT uuidv7(),
  fk_team_team_id                 UUID                                               NOT NULL REFERENCES app.team (team_id),
  fk_organization_organization_id UUID                                               NOT NULL REFERENCES app.organization (organization_id),
  initiator_user_id               UUID                                               NOT NULL,
  created_at                      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);