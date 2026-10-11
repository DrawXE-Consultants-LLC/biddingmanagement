import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.resolve(
  __dirname,
  "../../uploads/documents"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

// ==========================================
// ALLOWED FILE TYPES
// ==========================================

const allowedMimeTypes: Record<string, string[]> = {
  ".pdf": ["application/pdf"],

  ".doc": ["application/msword"],

  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  ".xls": ["application/vnd.ms-excel"],

  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],

  ".png": ["image/png"],

  ".jpg": ["image/jpeg"],

  ".jpeg": ["image/jpeg"],

  ".dwg": [
    "application/acad",
    "application/x-acad",
    "application/octet-stream",
    "image/vnd.dwg",
  ],

  ".dxf": [
    "application/dxf",
    "application/x-dxf",
    "application/octet-stream",
    "image/vnd.dxf",
  ],
};

// ==========================================
// MULTER STORAGE
// ==========================================

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const safeFilename = `${randomUUID()}${extension}`;

    callback(null, safeFilename);
  },
});

// ==========================================
// FILE VALIDATION
// ==========================================

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback
) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const supportedMimeTypes = allowedMimeTypes[extension];

  if (!supportedMimeTypes) {
    callback(
      new Error(
        "Unsupported file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, DWG and DXF"
      )
    );
    return;
  }

  if (!supportedMimeTypes.includes(file.mimetype)) {
    callback(
      new Error(
        "File type does not match the supported file format"
      )
    );
    return;
  }

  callback(null, true);
};

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1,
  },
});

// ==========================================
// SINGLE DOCUMENT UPLOAD MIDDLEWARE
// ==========================================

export const uploadDocument = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single("file")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const statusCode =
        error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

      res.status(statusCode).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "File size must not exceed 25 MB"
            : error.message,
      });

      return;
    }

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "File upload failed",
    });
  });
};