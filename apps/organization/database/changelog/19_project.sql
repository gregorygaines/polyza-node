CREATE TABLE IF NOT EXISTS app.project
(
  project_id      UUID PRIMARY KEY         DEFAULT uuidv7(),
  fk_team_team_id UUID                                               NOT NULL REFERENCES app.team (team_id),
  creator_user_id UUID                                               NOT NULL,
  name            TEXT                                               NOT NULL CHECK (char_length(name) <= 50),
  description     TEXT                                               NOT NULL CHECK (char_length(description) <= 255),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at      TIMESTAMP WITH TIME ZONE
);