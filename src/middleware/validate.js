import { ApiError } from '../utils/ApiError.js'

export const validate = (schema) => {
  return (req, res, next) => {
    const data = {
      body: req.body,
      params: req.params,
      query: req.query
    }

    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true })

    if (error) {
      return next(ApiError.badRequest(error.details.map(d => d.message).join(', ')))
    }

    req.body = value.body || req.body
    req.params = value.params || req.params
    req.query = value.query || req.query

    return next()
  }
}

