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
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().required(),
  MAX_FILE_SIZE: Joi.number().integer().positive().default(104857600),
  ALLOWED_FILE_TYPES: Joi.string().required(),
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
  awsAccessKeyId: value.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: value.AWS_SECRET_ACCESS_KEY,
  awsRegion: value.AWS_REGION,
  awsS3BucketName: value.AWS_S3_BUCKET_NAME,
  maxFileSize: value.MAX_FILE_SIZE,
  allowedFileTypes: value.ALLOWED_FILE_TYPES.split(",").map((type) => type.trim()),
  nodeEnv: value.NODE_ENV,
};
