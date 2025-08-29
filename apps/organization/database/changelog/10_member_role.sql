CREATE TABLE IF NOT EXISTS app.member_role
(
  member_role_id UUID PRIMARY KEY         DEFAULT uuidv7(),
  role           TEXT                                               NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO app.member_role (role)
VALUES ('ADMIN'),
       ('DEVELOPER'),
       ('TRANSLATOR'),
       ('REVIEWER'),
       ('REVOKED');