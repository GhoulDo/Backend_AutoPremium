import Joi from 'joi'

export const updateRoleSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    role: Joi.string().valid('cliente', 'administrador').required()
  })
})

