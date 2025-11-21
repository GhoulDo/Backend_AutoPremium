import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import { getProfile, listUsers, updateRole } from '../controllers/userController.js'
import { validate } from '../middleware/validate.js'
import { updateRoleSchema } from '../validation/userSchemas.js'

const router = Router()

router.get('/me', authenticate, getProfile)

router.get('/', authenticate, authorizeRoles('administrador'), listUsers)
router.patch('/:userId/role', authenticate, authorizeRoles('administrador'), validate(updateRoleSchema), updateRole)

export default router







