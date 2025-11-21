import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está configurada. Verifica tu archivo .env')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
})

const verifyConnection = async () => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    console.log('Conexión a PostgreSQL establecida correctamente')
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error.message)
    process.exit(1)
  }
}

verifyConnection()

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL', err)
  process.exit(-1)
})

export const query = (text, params) => pool.query(text, params)

export const getClient = async () => pool.connect()

