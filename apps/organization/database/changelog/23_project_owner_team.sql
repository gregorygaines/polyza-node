CREATE TABLE IF NOT EXISTS app.project_owner_team
(
  project_owner_team_id UUID PRIMARY KEY         DEFAULT uuidv7(),
  fk_project_project_id UUID                                               NOT NULL REFERENCES app.project (project_id),
  fk_team_team_id       UUID                                               NOT NULL REFERENCES app.team (team_id),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);