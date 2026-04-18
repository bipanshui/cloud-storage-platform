import multer from "multer";
import { env } from "../config/env.js";
import { createAppError } from "../utils/helpers.js";

const storage = multer.memoryStorage();

/**
 * Rejects disallowed MIME types before upload processing.
 * @param {import("express").Request} _req
 * @param {Express.Multer.File} file
 * @param {import("multer").FileFilterCallback} callback
 * @returns {void}
 */
function fileFilter(_req, file, callback) {
  if (!env.allowedFileTypes.includes(file.mimetype)) {
    callback(createAppError(400, "File type not allowed"));
    return;
  }

  callback(null, true);
}

const multerInstance = multer({
  storage,
  limits: {
    fileSize: env.maxFileSize,
    files: 10,
  },
  fileFilter,
});

/**
 * Normalizes multer errors into API errors.
 * @param {import("express").RequestHandler} multerHandler
 * @returns {import("express").RequestHandler}
 */
function wrapUpload(multerHandler) {
  return (req, res, next) => {
    multerHandler(req, res, (error) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          next(createAppError(400, `File too large. Maximum size is ${env.maxFileSize / 1048576}MB`));
          return;
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          next(createAppError(400, "Unexpected file field"));
          return;
        }
      }

      next(error.statusCode ? error : createAppError(400, error.message));
    });
  };
}

export const uploadSingleFile = wrapUpload(multerInstance.single("file"));
export const uploadMultipleFilesMiddleware = wrapUpload(multerInstance.array("files", 10));
