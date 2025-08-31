CREATE TABLE IF NOT EXISTS app.organization
(
  organization_id           UUID PRIMARY KEY         DEFAULT uuidv7(),
  creator_user_id           UUID                                               NOT NULL,
  name                      TEXT                                               NOT NULL CHECK (char_length(name) <= 50),
  slug                      TEXT UNIQUE                                        NOT NULL CHECK (char_length(slug) <= 45),
  default_user_organization BOOLEAN                                            NOT NULL,
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at                TIMESTAMP WITH TIME ZONE
);
