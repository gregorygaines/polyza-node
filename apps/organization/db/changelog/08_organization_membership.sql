CREATE TABLE IF NOT EXISTS app.organization_membership
(
  organization_membership_id                              UUID PRIMARY KEY         DEFAULT uuidv7(),
  fk_organization_organization_id                         UUID                                               NOT NULL REFERENCES app.organization (organization_id),
  fk_organization_member_role_organization_member_role_id UUID                                               NOT NULL REFERENCES app.organization_member_role (organization_member_role_id),
  member_user_id                                          UUID                                               NOT NULL,
  created_at                                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at                                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- Ensures that a user can only have one role per organization.
  CONSTRAINT unique_organization_member UNIQUE (fk_organization_organization_id, member_user_id)
);
