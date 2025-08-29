CREATE TABLE IF NOT EXISTS app.organization_lifecycle_event_history
(
  organization_lifecycle_event_history_id UUID PRIMARY KEY,
  fk_organization_organization_id         UUID NOT NULL REFERENCES app.organization (organization_id),
  entity_lifecycle_event_id               UUID NOT NULL REFERENCES app.entity_lifecycle_event (entity_lifecycle_event_id),
  initiator_user_id                       UUID NOT NULL,
  created_at                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
