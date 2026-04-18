import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

export const s3Client = new S3Client({
  region: env.awsRegion,
  credentials: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
  },
});

export const bucketName = env.awsS3BucketName;

/**
 * Builds a bucket object URL for a given key.
 * @param {string} key
 * @returns {string}
 */
export function getS3Url(key) {
  return `https://${bucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`;
}
