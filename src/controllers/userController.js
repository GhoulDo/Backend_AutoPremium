import { query } from '../config/db.js'

export const getProfile = async (req, res, next) => {
  try {
    const result = await query('SELECT id, first_name, last_name, email, role, phone, created_at FROM users WHERE id = $1', [req.user.id])
    const user = result.rows[0]
    res.json({ user })
  } catch (error) {
    next(error)
  }
}

export const listUsers = async (req, res, next) => {
  try {
    const result = await query('SELECT id, first_name, last_name, email, role, phone, created_at FROM users ORDER BY created_at DESC', [])
    res.json({ users: result.rows })
  } catch (error) {
    next(error)
  }
}

export const updateRole = async (req, res, next) => {
  const { userId } = req.params
  const { role } = req.body

  try {
    if (!['cliente', 'administrador'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' })
    }

    const result = await query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, role', [role, userId])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    next(error)
  }
}







