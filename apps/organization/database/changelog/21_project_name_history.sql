CREATE TABLE IF NOT EXISTS app.team_name_history
(
  team_name_history_id UUID PRIMARY KEY         DEFAULT uuidv7(),
  initiator_user_id    UUID                                               NOT NULL,
  name                 TEXT                                               NOT NULL CHECK (char_length(name) <= 50),
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);