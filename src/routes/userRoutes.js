import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import { getProfile, listUsers, updateRole } from '../controllers/userController.js'

const router = Router()

router.get('/me', authenticate, getProfile)

router.get('/', authenticate, authorizeRoles('administrador'), listUsers)
router.patch('/:userId/role', authenticate, authorizeRoles('administrador'), updateRole)

export default router







