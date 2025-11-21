import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { query } from '../config/db.js'

const signToken = (user) => {
  return jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role
  }, process.env.JWT_SECRET, { expiresIn: '12h' })
}

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password, role = 'cliente', phone } = req.body

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' })
    }

    if (!['cliente', 'administrador'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await query(`
      INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, first_name, last_name, email, role
    `, [firstName, lastName, email, hashedPassword, role, phone])

    const user = result.rows[0]
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const match = await bcrypt.compare(password, user.password_hash)

    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = signToken(user)

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
}







