-- Script de creación de la base de datos AutoPremium

CREATE DATABASE "AutoPremium";

\c "AutoPremium";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'administrador')),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand VARCHAR(80) NOT NULL,
  model VARCHAR(80) NOT NULL,
  year SMALLINT NOT NULL CHECK (year BETWEEN 1950 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  image_path TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'reservado', 'vendido', 'mantenimiento')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL CHECK (scheduled_at > CURRENT_TIMESTAMP),
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'cancelada', 'realizada')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_vehicle ON appointments(vehicle_id);

-- Usuario administrador inicial
INSERT INTO users (first_name, last_name, email, password_hash, role)
VALUES ('Admin', 'AutoPremium', 'admin@autopremium.com', '$2b$10$QwJmH8G0Lx6PnP0Qnxeq6uX9Ha7WvyaManIeZDV4SSQdlqzTeWY5G', 'administrador');

-- La contraseña del administrador inicial es: Admin123*

