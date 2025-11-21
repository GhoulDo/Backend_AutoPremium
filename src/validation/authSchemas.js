import Joi from 'joi'

const passwordSchema = Joi.string().min(8).max(64)
  .pattern(/[A-Z]/, 'una mayúscula')
  .pattern(/[a-z]/, 'una minúscula')
  .pattern(/[0-9]/, 'un número')
  .messages({
    'string.pattern.name': 'La contraseña debe contener {#name}'
  })

export const registerSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().min(2).max(80).required(),
    lastName: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().lowercase().required(),
    password: passwordSchema.required(),
    role: Joi.string().valid('cliente', 'administrador').default('cliente'),
    phone: Joi.string().max(20).allow(null, '')
  }).required()
})

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required()
  }).required()
})

