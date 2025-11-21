import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import {
  createAppointment,
  listMyAppointments,
  listAllAppointments,
  updateAppointmentStatus
} from '../controllers/appointmentController.js'
import { validate } from '../middleware/validate.js'
import { createAppointmentSchema, updateAppointmentStatusSchema } from '../validation/appointmentSchemas.js'

const router = Router()

router.use(authenticate)

router.post('/', validate(createAppointmentSchema), createAppointment)
router.get('/me', listMyAppointments)

router.get('/', authorizeRoles('administrador'), listAllAppointments)
router.patch('/:id/status', authorizeRoles('administrador'), validate(updateAppointmentStatusSchema), updateAppointmentStatus)

export default router







