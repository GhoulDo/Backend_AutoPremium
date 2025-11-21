import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import vehicleRoutes from './routes/vehicleRoutes.js'
import userRoutes from './routes/userRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import { bootstrapData } from './utils/bootstrap.js'
import { ApiError } from './utils/ApiError.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AutoPremium API funcionando' })
})

app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/appointments', appointmentRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message })
  }

  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  })
})

const PORT = process.env.PORT || 4000

const startServer = async () => {
  await bootstrapData()

  app.listen(PORT, () => {
    console.log(`Servidor AutoPremium escuchando en puerto ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error)
  process.exit(1)
})

