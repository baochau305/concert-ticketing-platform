CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id SMALLSERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permissions (
  id SMALLSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id SMALLINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_role ON role_permissions(permission_id, role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_user ON user_roles(role_id, user_id);

INSERT INTO roles(name)
VALUES
  ('CUSTOMER'),
  ('STAFF'),
  ('ORGANIZER'),
  ('ADMIN'),
  ('SUPER_ADMIN')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions(name)
VALUES
  ('event:create'),
  ('event:update'),
  ('ticket:scan'),
  ('user:create')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (r.name = 'ORGANIZER' AND p.name IN ('event:create', 'event:update')) OR
  (r.name = 'STAFF' AND p.name IN ('ticket:scan')) OR
  (r.name = 'ADMIN' AND p.name IN ('user:create')) OR
  (r.name = 'SUPER_ADMIN' AND p.name IN ('event:create', 'event:update', 'ticket:scan', 'user:create'))
)
ON CONFLICT DO NOTHING;

INSERT INTO users(email, password, name)
VALUES
  ('admin@concert.local', '$2b$10$3S6cL4es5Qx3QJ5kGzZ0QOMs5WJTWnTsm0B4vDuo5v2dTLfhlkW7W', 'System Admin'),
  ('organizer@concert.local', '$2b$10$3S6cL4es5Qx3QJ5kGzZ0QOMs5WJTWnTsm0B4vDuo5v2dTLfhlkW7W', 'Event Organizer'),
  ('staff@concert.local', '$2b$10$3S6cL4es5Qx3QJ5kGzZ0QOMs5WJTWnTsm0B4vDuo5v2dTLfhlkW7W', 'Scan Staff'),
  ('customer@concert.local', '$2b$10$3S6cL4es5Qx3QJ5kGzZ0QOMs5WJTWnTsm0B4vDuo5v2dTLfhlkW7W', 'Ticket Customer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON (
  (u.email = 'admin@concert.local' AND r.name = 'ADMIN') OR
  (u.email = 'organizer@concert.local' AND r.name = 'ORGANIZER') OR
  (u.email = 'staff@concert.local' AND r.name = 'STAFF') OR
  (u.email = 'customer@concert.local' AND r.name = 'CUSTOMER')
)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  organizer_id BIGINT NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  customer_id BIGINT NOT NULL REFERENCES users(id),
  status VARCHAR(40) NOT NULL DEFAULT 'ISSUED'
);

CREATE TABLE IF NOT EXISTS event_staff_assignments (
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_assignments_user_event ON event_staff_assignments(user_id, event_id);
