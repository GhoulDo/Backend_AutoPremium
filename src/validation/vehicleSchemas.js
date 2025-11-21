import Joi from 'joi'
import { idParamSchema } from './commonSchemas.js'

const statusEnum = ['disponible', 'reservado', 'vendido', 'mantenimiento']
const currentYear = new Date().getFullYear() + 1

const baseVehicle = {
  brand: Joi.string().min(2).max(80),
  model: Joi.string().min(1).max(80),
  year: Joi.number().integer().min(1950).max(currentYear),
  price: Joi.number().precision(2).min(0),
  imagePath: Joi.string().uri().allow('').messages({
    'string.uri': 'imagePath debe ser una URL válida'
  }),
  description: Joi.string().max(5000).allow(null, ''),
  status: Joi.string().valid(...statusEnum)
}

export const createVehicleSchema = Joi.object({
  body: Joi.object({
    ...baseVehicle,
    brand: baseVehicle.brand.required(),
    model: baseVehicle.model.required(),
    year: baseVehicle.year.required(),
    price: baseVehicle.price.required(),
    imagePath: baseVehicle.imagePath.required()
  }).required()
})

export const updateVehicleSchema = Joi.object({
  params: idParamSchema('id'),
  body: Joi.object({
    ...baseVehicle
  }).min(1)
})

export const vehicleIdSchema = Joi.object({
  params: idParamSchema('id')
})

