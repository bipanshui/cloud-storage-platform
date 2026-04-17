import Joi from "joi";

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

export const registerSchema = Joi.object({
  firstName: Joi.string().trim().max(50).required(),
  lastName: Joi.string().trim().max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().pattern(passwordPattern).required().messages({
    "string.pattern.base":
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

