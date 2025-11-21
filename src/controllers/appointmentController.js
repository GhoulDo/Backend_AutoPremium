import { query } from '../config/db.js'

export const createAppointment = async (req, res, next) => {
  const { vehicleId, scheduledAt, notes } = req.body

  try {
    if (!vehicleId || !scheduledAt) {
      return res.status(400).json({ error: 'Vehículo y fecha son obligatorios' })
    }

    const scheduledDate = new Date(scheduledAt)
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Fecha inválida' })
    }

    const now = new Date()
    if (scheduledDate <= now) {
      return res.status(400).json({ error: 'La cita debe programarse en una fecha futura' })
    }

    const { rows: vehicleRows } = await query('SELECT id, status FROM vehicles WHERE id = $1', [vehicleId])
    const vehicle = vehicleRows[0]

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' })
    }

    if (['vendido', 'mantenimiento'].includes(vehicle.status)) {
      return res.status(400).json({ error: 'El vehículo no está disponible para agendar' })
    }

    const conflict = await query(`
      SELECT 1
      FROM appointments
      WHERE vehicle_id = $1
        AND status IN ('pendiente', 'confirmada')
        AND scheduled_at BETWEEN ($2::timestamptz) - INTERVAL '1 hour' AND ($2::timestamptz) + INTERVAL '1 hour'
      LIMIT 1
    `, [vehicleId, scheduledDate])

    if (conflict.rowCount > 0) {
      return res.status(409).json({ error: 'El vehículo ya tiene una cita en el horario seleccionado' })
    }

    const result = await query(`
      INSERT INTO appointments (user_id, vehicle_id, scheduled_at, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, vehicleId, scheduledDate, notes])

    res.status(201).json({ appointment: result.rows[0] })
  } catch (error) {
    next(error)
  }
}

export const listMyAppointments = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT a.*, v.brand, v.model, v.image_path
      FROM appointments a
      JOIN vehicles v ON v.id = a.vehicle_id
      WHERE a.user_id = $1
      ORDER BY a.scheduled_at DESC
    `, [req.user.id])

    res.json({ appointments: result.rows })
  } catch (error) {
    next(error)
  }
}

export const listAllAppointments = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT a.*, u.first_name, u.last_name, u.email, v.brand, v.model
      FROM appointments a
      JOIN users u ON u.id = a.user_id
      JOIN vehicles v ON v.id = a.vehicle_id
      ORDER BY a.scheduled_at DESC
    `)

    res.json({ appointments: result.rows })
  } catch (error) {
    next(error)
  }
}

export const updateAppointmentStatus = async (req, res, next) => {
  const { id } = req.params
  const { status } = req.body

  try {
    const validStatuses = ['pendiente', 'confirmada', 'cancelada', 'realizada']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado no válido' })
    }

    const appointmentRes = await query('SELECT id, vehicle_id FROM appointments WHERE id = $1', [id])

    if (appointmentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }

    const vehicleId = appointmentRes.rows[0].vehicle_id

    const result = await query(`
      UPDATE appointments
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id])

    if (status === 'confirmada') {
      await query(`
        UPDATE vehicles
        SET status = 'reservado', updated_at = NOW()
        WHERE id = $1 AND status IN ('disponible', 'reservado')
      `, [vehicleId])
    }

    if (status === 'cancelada' || status === 'realizada') {
      await query(`
        UPDATE vehicles
        SET status = 'disponible', updated_at = NOW()
        WHERE id = $1 AND status = 'reservado'
      `, [vehicleId])
    }

    res.json({ appointment: result.rows[0] })
  } catch (error) {
    next(error)
  }
}

