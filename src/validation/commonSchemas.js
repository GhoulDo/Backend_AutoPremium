import Joi from 'joi'

export const idParamSchema = (paramName = 'id') => Joi.object({
  [paramName]: Joi.string().uuid().required()
})

