CREATE TABLE IF NOT EXISTS app.organization_member_role
(
  organization_member_role_id UUID PRIMARY KEY         DEFAULT uuidv7(),
  role                        TEXT UNIQUE                                        NOT NULL,
  created_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO app.organization_member_role (role)
VALUES ('OWNER'),
       ('ADMIN'),
       ('DEVELOPER'),
       ('TRANSLATOR'),
       ('REVIEWER'),
       ('VIEWER'),
       ('REVOKED');
