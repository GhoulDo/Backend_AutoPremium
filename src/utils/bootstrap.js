import bcrypt from 'bcrypt'

import { query } from '../config/db.js'

const sampleVehicles = [
  {
    brand: 'Ferrari',
    model: 'SF90 Stradale',
    year: 2024,
    price: 1275000,
    image_path: 'https://images.autopremium.com/ferrari-sf90.jpg',
    description: 'Híbrido V8 986 hp, tracción AWD, tecnología de Fórmula 1.',
    status: 'disponible'
  },
  {
    brand: 'Lamborghini',
    model: 'Revuelto',
    year: 2024,
    price: 1350000,
    image_path: 'https://images.autopremium.com/lamborghini-revuelto.jpg',
    description: 'Motor V12 híbrido de 1015 CV, diseño futurista.',
    status: 'disponible'
  },
  {
    brand: 'Rolls-Royce',
    model: 'Spectre',
    year: 2025,
    price: 420000,
    image_path: 'https://images.autopremium.com/rollsroyce-spectre.jpg',
    description: 'Primer coupé eléctrico ultra lujo, autonomía 520 km.',
    status: 'disponible'
  }
]

const ensureExtension = async (name) => {
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS "${name}"`)
  } catch (error) {
    console.warn(`No se pudo crear la extensión ${name}: ${error.message}`)
  }
}

const createSchemaIfNeeded = async () => {
  await ensureExtension('uuid-ossp')

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      first_name VARCHAR(80) NOT NULL,
      last_name VARCHAR(80) NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'administrador')),
      phone VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS vehicles (
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
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL CHECK (scheduled_at > CURRENT_TIMESTAMP),
      status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'cancelada', 'realizada')),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_appointments_vehicle ON appointments(vehicle_id)`)
}

const ensureAdminUser = async () => {
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@autopremium.com'
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123*'

  const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email])
  if (existing.rowCount > 0) {
    console.log(`Administrador inicial ya existe (${email})`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await query(`
    INSERT INTO users (first_name, last_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4, 'administrador')
  `, ['Admin', 'AutoPremium', email, passwordHash])

  console.log(`Administrador inicial creado (${email})`)
  console.log(`Contraseña temporal: ${password}`)
}

const ensureSampleVehicles = async () => {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM vehicles')
  if (rows[0].count > 0) {
    return
  }

  for (const vehicle of sampleVehicles) {
    await query(`
      INSERT INTO vehicles (brand, model, year, price, image_path, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.price,
      vehicle.image_path,
      vehicle.description,
      vehicle.status
    ])
  }

  console.log('Se insertaron vehículos de ejemplo (solo primera vez)')
}

export const bootstrapData = async () => {
  console.log('Verificando datos iniciales...')
  await createSchemaIfNeeded()
  await ensureAdminUser()
  await ensureSampleVehicles()
}


