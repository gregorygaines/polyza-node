CREATE TABLE IF NOT EXISTS app.team_description_history
(
  team_description_history_id UUID PRIMARY KEY         DEFAULT uuidv7(),
  initiator_user_id           UUID                                               NOT NULL,
  description                 TEXT                                               NOT NULL CHECK (char_length(description) <= 255),
  created_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);