CREATE TABLE IF NOT EXISTS app.entity_lifecycle_event
(
  entity_lifecycle_event_id UUID PRIMARY KEY         DEFAULT uuidv7(),
  event                     TEXT CHECK ( char_length(event) <= 20 ) UNIQUE     NOT NULL,
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO app.entity_lifecycle_event (event)
VALUES ('DELETED'),
       ('RESTORED');