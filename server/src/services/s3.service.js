import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { bucketName, getS3Url, s3Client } from "../config/s3.js";
import { createAppError, sanitizeFileName } from "../utils/helpers.js";

/**
 * Maps AWS SDK errors into application errors.
 * @param {Error & { name?: string }} error
 * @param {string} action
 * @returns {Error & { statusCode: number }}
 */
function normalizeS3Error(error, action) {
  if (error instanceof NoSuchKey || error?.name === "NoSuchKey") {
    return createAppError(404, "File not found in storage.");
  }

  if (error?.name === "AccessDenied") {
    return createAppError(502, `Storage access denied while attempting to ${action}.`);
  }

  if (error?.name === "NoSuchBucket") {
    return createAppError(502, "Storage bucket is not configured correctly.");
  }

  return createAppError(502, `Storage operation failed while attempting to ${action}.`);
}

/**
 * Uploads a file buffer to S3.
 * @param {Express.Multer.File} file
 * @param {string} userId
 * @returns {Promise<{ key: string, url: string, size: number }>}
 */
export async function uploadToS3(file, userId) {
  const safeOriginalName = sanitizeFileName(file.originalname);
  const key = `users/${userId}/${uuidv4()}-${safeOriginalName}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    console.log(`Uploaded file to S3: ${key}`);

    return {
      key,
      url: getS3Url(key),
      size: file.size,
    };
  } catch (error) {
    throw normalizeS3Error(error, "upload file");
  }
}

/**
 * Deletes an object from S3.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function deleteFromS3(key) {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    console.log(`Deleted file from S3: ${key}`);
    return true;
  } catch (error) {
    if (error?.name === "NoSuchKey") {
      return false;
    }

    throw normalizeS3Error(error, "delete file");
  }
}

/**
 * Creates a signed download URL for an object.
 * @param {string} key
 * @param {number} [expiresIn=3600]
 * @returns {Promise<string>}
 */
export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  try {
    return await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
      { expiresIn }
    );
  } catch (error) {
    throw normalizeS3Error(error, "download file");
  }
}

/**
 * Creates a signed upload URL for direct-to-S3 uploads.
 * @param {string} key
 * @param {string} contentType
 * @param {number} [expiresIn=300]
 * @returns {Promise<string>}
 */
export async function getSignedUploadUrl(key, contentType, expiresIn = 300) {
  try {
    return await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn }
    );
  } catch (error) {
    throw normalizeS3Error(error, "prepare upload");
  }
}

/**
 * Copies an S3 object to a new key.
 * @param {string} sourceKey
 * @param {string} destinationKey
 * @param {string} contentType
 * @returns {Promise<string>}
 */
export async function copyObjectInS3(sourceKey, destinationKey, contentType) {
  try {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        Key: destinationKey,
        CopySource: `${bucketName}/${sourceKey}`,
        ContentType: contentType,
        MetadataDirective: "REPLACE",
      })
    );

    console.log(`Copied file in S3: ${sourceKey} -> ${destinationKey}`);
    return getS3Url(destinationKey);
  } catch (error) {
    throw normalizeS3Error(error, "copy file");
  }
}
