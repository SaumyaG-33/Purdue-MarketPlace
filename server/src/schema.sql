-- Purdue MarketPlace schema. Run via `npm run db:init`.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  cognito_sub TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client', -- client | admin
  strikes INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active | warned | blocked
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  service_id TEXT,
  category_id TEXT,
  owner_name TEXT,
  email TEXT UNIQUE,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  area TEXT,
  joined TEXT,
  bio TEXT,
  portfolio_count INT NOT NULL DEFAULT 0,
  venmo TEXT,
  zelle TEXT,
  application_status TEXT NOT NULL DEFAULT 'pending', -- pending | needs_info | approved | rejected
  strikes INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active | paused | removed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_services (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  deposit NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id),
  client_name TEXT,
  client_email TEXT,
  provider_id TEXT REFERENCES providers(id),
  provider_name TEXT,
  service_id TEXT,
  service_name TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  deposit NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_paid BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'requested', -- requested | confirmed | declined | cancelled | completed
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_messages (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  owner_name TEXT,
  email TEXT NOT NULL,
  category TEXT,
  phone TEXT,
  price_range TEXT,
  services_text TEXT,
  description TEXT,
  docs JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | needs_info | approved | rejected
  internal_note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  provider_id TEXT REFERENCES providers(id),
  provider_name TEXT,
  reporter_name TEXT,
  booking_ref TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open | strike | dismissed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  booking_id TEXT REFERENCES bookings(id),
  author TEXT,
  rating INT NOT NULL,
  body TEXT,
  flagged BOOLEAN NOT NULL DEFAULT false,
  flag_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reports_provider ON reports(provider_id);
