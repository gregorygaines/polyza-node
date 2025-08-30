CREATE TABLE IF NOT EXISTS app.project_description_history
(
  project_description_history UUID PRIMARY KEY         DEFAULT uuidv7(),
  initiator_user_id           UUID                                               NOT NULL,
  description                 TEXT                                               NOT NULL CHECK (char_length(description) <= 255),
  created_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);