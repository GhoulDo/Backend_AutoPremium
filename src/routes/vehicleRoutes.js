import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js'
import { createVehicleSchema, updateVehicleSchema, vehicleIdSchema } from '../validation/vehicleSchemas.js'

const router = Router()

router.get('/', listVehicles)
router.get('/:id', validate(vehicleIdSchema), getVehicle)

router.post('/', authenticate, authorizeRoles('administrador'), validate(createVehicleSchema), createVehicle)
router.patch('/:id', authenticate, authorizeRoles('administrador'), validate(updateVehicleSchema), updateVehicle)
router.delete('/:id', authenticate, authorizeRoles('administrador'), validate(vehicleIdSchema), deleteVehicle)

export default router







