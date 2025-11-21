import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js'

const router = Router()

router.get('/', listVehicles)
router.get('/:id', getVehicle)

router.post('/', authenticate, authorizeRoles('administrador'), createVehicle)
router.patch('/:id', authenticate, authorizeRoles('administrador'), updateVehicle)
router.delete('/:id', authenticate, authorizeRoles('administrador'), deleteVehicle)

export default router







