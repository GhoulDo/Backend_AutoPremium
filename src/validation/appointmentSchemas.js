import Joi from 'joi'

const statusEnum = ['pendiente', 'confirmada', 'cancelada', 'realizada']

const futureDate = Joi.string().isoDate().custom((value, helpers) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return helpers.error('any.invalid')
  }
  if (date <= new Date()) {
    return helpers.error('date.less', { limit: 'fecha futura' })
  }
  return value
}, 'fecha futura')

export const createAppointmentSchema = Joi.object({
  body: Joi.object({
    vehicleId: Joi.string().uuid().required(),
    scheduledAt: futureDate.required(),
    notes: Joi.string().max(2000).allow(null, '')
  }).required()
})

export const updateAppointmentStatusSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object({
    status: Joi.string().valid(...statusEnum).required()
  })
})

