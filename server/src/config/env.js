import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envSchema = Joi.object({
  PORT: Joi.number().port().default(5000),
  MONGODB_URI: Joi.string()
    .pattern(/^mongodb(\+srv)?:\/\//)
    .required()
    .messages({
      "string.pattern.base":
        "MONGODB_URI must start with mongodb:// or mongodb+srv://",
    }),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRY: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRY: Joi.string().default("7d"),
  CLIENT_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
}).unknown(true);

const { error, value } = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

export const env = {
  port: value.PORT,
  mongodbUri: value.MONGODB_URI,
  jwtAccessSecret: value.JWT_ACCESS_SECRET,
  jwtRefreshSecret: value.JWT_REFRESH_SECRET,
  jwtAccessExpiry: value.JWT_ACCESS_EXPIRY,
  jwtRefreshExpiry: value.JWT_REFRESH_EXPIRY,
  clientUrl: value.CLIENT_URL,
  nodeEnv: value.NODE_ENV,
};
