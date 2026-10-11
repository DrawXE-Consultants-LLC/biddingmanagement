import { Router } from "express";

import {
  createDocumentController,
  getProjectDocumentsController,
  getDocumentController,
  updateDocumentController,
  deleteDocumentController,
  uploadProjectDocumentController,
} from "../controllers/document.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { UserRole } from "../types/auth.types";
import { uploadDocument } from "../middleware/upload.middleware";

const router = Router();

// ==========================================
// ROLES ALLOWED TO READ DOCUMENTS
// Membership in the requested organization
// is also checked by authorize().
// ==========================================

const documentReadRoles = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.ESTIMATOR,
  UserRole.PROJECT_MANAGER,
  UserRole.VIEWER,
];

// ==========================================
// CREATE DOCUMENT METADATA
// ==========================================

router.post(
  "/organizations/:organizationId/projects/:projectId/documents",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  createDocumentController
);

// ==========================================
// UPLOAD ACTUAL PROJECT DOCUMENT
// ==========================================

router.post(
  "/organizations/:organizationId/projects/:projectId/documents/upload",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  uploadDocument,
  uploadProjectDocumentController
);

// ==========================================
// GET PROJECT DOCUMENTS
// ==========================================

router.get(
  "/organizations/:organizationId/projects/:projectId/documents",
  authenticate,
  authorize(...documentReadRoles),
  getProjectDocumentsController
);

// ==========================================
// GET SINGLE DOCUMENT
// ==========================================

router.get(
  "/organizations/:organizationId/documents/:documentId",
  authenticate,
  authorize(...documentReadRoles),
  getDocumentController
);

// ==========================================
// UPDATE DOCUMENT
// ==========================================

router.patch(
  "/organizations/:organizationId/documents/:documentId",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  updateDocumentController
);

// ==========================================
// DELETE DOCUMENT
// ==========================================

router.delete(
  "/organizations/:organizationId/documents/:documentId",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN
  ),
  deleteDocumentController
);

export default router;