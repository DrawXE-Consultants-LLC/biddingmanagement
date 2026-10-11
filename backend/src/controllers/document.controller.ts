import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { unlink } from "fs/promises";
import { prisma } from "../config/database";

import {
  createDocument,
  getProjectDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../services/document.service";

// ==========================================
// CREATE DOCUMENT METADATA
// ==========================================

export const createDocumentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const projectId =
      req.params.projectId as string;

    const {
      name,
      originalName,
      fileUrl,
      fileType,
      fileSize,
      category,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof originalName !== "string" ||
      !originalName.trim() ||
      typeof fileUrl !== "string" ||
      !fileUrl.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "name, originalName and fileUrl are required",
      });
    }

    // Validate optional file metadata.
    if (
      fileSize !== undefined &&
      (
        typeof fileSize !== "number" ||
        !Number.isInteger(fileSize) ||
        fileSize < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "fileSize must be a non-negative integer",
      });
    }

    // Verify project ownership by organization.
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found in this organization",
      });
    }

    const document = await createDocument(
      organizationId,
      projectId,
      {
        name: name.trim(),
        originalName: originalName.trim(),
        fileUrl: fileUrl.trim(),
        fileType,
        fileSize,
        category,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      document,
    });
  } catch (error: unknown) {
    console.error("Create Document Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create document",
    });
  }
};

// ==========================================
// GET PROJECT DOCUMENTS
// ==========================================

export const getProjectDocumentsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const projectId =
      req.params.projectId as string;

    // Ensure this project belongs to the requested organization.
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found in this organization",
      });
    }

    const documents = await getProjectDocuments(
      organizationId,
      projectId
    );

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error: unknown) {
    console.error("Get Project Documents Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

// ==========================================
// GET SINGLE DOCUMENT
// ==========================================

export const getDocumentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const documentId =
      req.params.documentId as string;

    // Service query scopes the document to this organization.
    const document = await getDocumentById(
      organizationId,
      documentId
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error: unknown) {
    console.error("Get Document Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch document",
    });
  }
};

// ==========================================
// UPDATE DOCUMENT
// ==========================================

export const updateDocumentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const documentId =
      req.params.documentId as string;

    const { name, category } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Document name cannot be empty",
      });
    }

    const allowedCategories = [
      "DRAWING",
      "SPECIFICATION",
      "ADDENDUM",
      "BID_DOCUMENT",
      "OTHER",
    ];

    if (
      category !== undefined &&
      !allowedCategories.includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid document category",
      });
    }

    const result = await updateDocument(
      organizationId,
      documentId,
      {
        name: name?.trim(),
        category,
      }
    );

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
    });
  } catch (error: unknown) {
    console.error("Update Document Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update document",
    });
  }
};

// ==========================================
// DELETE DOCUMENT
// ==========================================

export const deleteDocumentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const documentId =
      req.params.documentId as string;

    const result = await deleteDocument(
      organizationId,
      documentId
    );

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete Document Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};

// ==========================================
// UPLOAD ACTUAL PROJECT DOCUMENT
// ==========================================

export const uploadProjectDocumentController = async (
  req: AuthRequest,
  res: Response
) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "Please select a file to upload",
    });
  }

  try {
    const organizationId =
      req.params.organizationId as string;

    const projectId =
      req.params.projectId as string;

    const allowedCategories = [
      "DRAWING",
      "SPECIFICATION",
      "ADDENDUM",
      "BID_DOCUMENT",
      "OTHER",
    ];

    const category = req.body.category;

    if (
      category !== undefined &&
      !allowedCategories.includes(category)
    ) {
      await unlink(file.path).catch(() => undefined);

      return res.status(400).json({
        success: false,
        message: "Invalid document category",
      });
    }

    // Verify project belongs to the requested organization.
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      await unlink(file.path).catch(() => undefined);

      return res.status(404).json({
        success: false,
        message: "Project not found in this organization",
      });
    }

    const name =
      typeof req.body.name === "string" &&
      req.body.name.trim()
        ? req.body.name.trim()
        : file.originalname;

    // Store the generated private storage key.
    const document = await createDocument(
      organizationId,
      projectId,
      {
        name,
        originalName: file.originalname,
        fileUrl: file.filename,
        fileType: file.mimetype,
        fileSize: file.size,
        category,
      }
    );

    // Do not expose the internal storage filename.
    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        id: document.id,
        organizationId: document.organizationId,
        projectId: document.projectId,
        name: document.name,
        originalName: document.originalName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        category: document.category,
        createdAt: document.createdAt,
      },
    });
  } catch (error: unknown) {
    // Remove uploaded file if database creation failed.
    await unlink(file.path).catch(() => undefined);

    console.error("Upload Project Document Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
};