import { createAppError } from "../utils/helpers.js";

/**
 * Validates request bodies against a Joi schema.
 * @param {import("joi").ObjectSchema} schema
 * @returns {import("express").RequestHandler}
 */
export function validate(schema) {
  return async (req, _res, next) => {
    try {
      req.body = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      next();
    } catch (error) {
      next(createAppError(400, error.message));
    }
  };
}

