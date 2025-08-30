CREATE TABLE IF NOT EXISTS app.team_membership
(
  team_membership_id            UUID PRIMARY KEY         DEFAULT uuidv7(),
  fk_team_team_id               UUID                                               NOT NULL REFERENCES app.team (team_id),
  fk_member_role_member_role_id UUID                                               NOT NULL REFERENCES app.member_role (member_role_id),
  member_user_id                UUID                                               NOT NULL,
  created_at                    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at                    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);