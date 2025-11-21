import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import {
  createAppointment,
  listMyAppointments,
  listAllAppointments,
  updateAppointmentStatus
} from '../controllers/appointmentController.js'

const router = Router()

router.use(authenticate)

router.post('/', createAppointment)
router.get('/me', listMyAppointments)

router.get('/', authorizeRoles('administrador'), listAllAppointments)
router.patch('/:id/status', authorizeRoles('administrador'), updateAppointmentStatus)

export default router







