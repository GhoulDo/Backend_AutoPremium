import { query } from '../config/db.js'

export const listVehicles = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM vehicles ORDER BY created_at DESC')
    res.json({ vehicles: result.rows })
  } catch (error) {
    next(error)
  }
}

export const getVehicle = async (req, res, next) => {
  const { id } = req.params

  try {
    const result = await query('SELECT * FROM vehicles WHERE id = $1', [id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' })
    }
    res.json({ vehicle: result.rows[0] })
  } catch (error) {
    next(error)
  }
}

export const createVehicle = async (req, res, next) => {
  const {
    brand,
    model,
    year,
    price,
    imagePath,
    description,
    status = 'disponible'
  } = req.body

  try {
    if (!brand || !model || !year || !price || !imagePath) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    const parsedYear = Number(year)
    if (!Number.isInteger(parsedYear) || parsedYear < 1950 || parsedYear > new Date().getFullYear() + 1) {
      return res.status(400).json({ error: 'Año del vehículo inválido' })
    }

    const parsedPrice = Number(price)
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Precio inválido' })
    }

    const validStatuses = ['disponible', 'reservado', 'vendido', 'mantenimiento']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido para el vehículo' })
    }

    const result = await query(`
      INSERT INTO vehicles (brand, model, year, price, image_path, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [brand, model, parsedYear, parsedPrice, imagePath, description, status])

    res.status(201).json({ vehicle: result.rows[0] })
  } catch (error) {
    next(error)
  }
}

export const updateVehicle = async (req, res, next) => {
  const { id } = req.params
  const {
    brand,
    model,
    year,
    price,
    imagePath,
    description,
    status
  } = req.body

  try {
    if (status) {
      const validStatuses = ['disponible', 'reservado', 'vendido', 'mantenimiento']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Estado inválido para el vehículo' })
      }
    }

    let yearValue = year
    if (year !== undefined) {
      const parsedYear = Number(year)
      if (!Number.isInteger(parsedYear) || parsedYear < 1950 || parsedYear > new Date().getFullYear() + 1) {
        return res.status(400).json({ error: 'Año del vehículo inválido' })
      }
      yearValue = parsedYear
    }

    let priceValue = price
    if (price !== undefined) {
      const parsedPrice = Number(price)
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Precio inválido' })
      }
      priceValue = parsedPrice
    }

    const result = await query(`
      UPDATE vehicles
      SET brand = COALESCE($1, brand),
          model = COALESCE($2, model),
          year = COALESCE($3, year),
          price = COALESCE($4, price),
          image_path = COALESCE($5, image_path),
          description = COALESCE($6, description),
          status = COALESCE($7, status),
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [brand, model, yearValue, priceValue, imagePath, description, status, id])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' })
    }

    res.json({ vehicle: result.rows[0] })
  } catch (error) {
    next(error)
  }
}

export const deleteVehicle = async (req, res, next) => {
  const { id } = req.params

  try {
    const result = await query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

