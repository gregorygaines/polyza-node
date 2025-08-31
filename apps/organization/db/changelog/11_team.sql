CREATE TABLE IF NOT EXISTS app.team
(
  team_id         UUID PRIMARY KEY         DEFAULT uuidv7(),
  creator_user_id UUID                                               NOT NULL,
  name            TEXT                                               NOT NULL CHECK (char_length(name) <= 50),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at      TIMESTAMP WITH TIME ZONE
)
