CREATE TABLE IF NOT EXISTS app.team_lifecycle_event_history
(
  team_lifecycle_event_history_id UUID PRIMARY KEY,
  fk_team_team_id                 UUID NOT NULL REFERENCES app.team (team_id),
  entity_lifecycle_event_id       UUID NOT NULL REFERENCES app.entity_lifecycle_event (entity_lifecycle_event_id),
  initiator_user_id               UUID NOT NULL,
  created_at                      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
