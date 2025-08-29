CREATE TABLE IF NOT EXISTS app.project_lifecycle_event_history
(
  project_lifecycle_event_history_id UUID PRIMARY KEY,
  fk_project_project_id              UUID NOT NULL REFERENCES app.project (project_id),
  entity_lifecycle_event_id          UUID NOT NULL REFERENCES app.entity_lifecycle_event (entity_lifecycle_event_id),
  initiator_user_id                  UUID NOT NULL,
  created_at                         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
