import dotenv from 'dotenv'
import { bootstrapData } from '../utils/bootstrap.js'

dotenv.config()

bootstrapData()
  .then(() => {
    console.log('Datos iniciales verificados correctamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error ejecutando el seed:', error)
    process.exit(1)
  })


