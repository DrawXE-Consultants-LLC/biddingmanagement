import { Router } from "express";

import {
  createAddendumController,
  getAddendaController,
  getAddendumByIdController,
  updateAddendumController,
  publishAddendumController,
  cancelAddendumController,
  deleteAddendumController,
} from "../controllers/addendum.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

// ==========================================
// ROLES ALLOWED TO READ ADDENDA
// ==========================================

const addendumReadRoles = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.ESTIMATOR,
  UserRole.PROJECT_MANAGER,
  UserRole.VIEWER,
];

// ==========================================
// CREATE ADDENDUM
// OWNER / ADMIN / ESTIMATOR / PROJECT MANAGER
// ==========================================

router.post(
  "/organizations/:organizationId/addenda",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  createAddendumController
);

// ==========================================
// GET ALL ADDENDA FOR PROJECT
// AUTHORIZED ORGANIZATION MEMBERS
// ==========================================

router.get(
  "/organizations/:organizationId/projects/:projectId/addenda",
  authenticate,
  authorize(...addendumReadRoles),
  getAddendaController
);

// ==========================================
// GET SINGLE ADDENDUM
// AUTHORIZED ORGANIZATION MEMBERS
// ==========================================

router.get(
  "/organizations/:organizationId/projects/:projectId/addenda/:addendumId",
  authenticate,
  authorize(...addendumReadRoles),
  getAddendumByIdController
);

// ==========================================
// UPDATE ADDENDUM
// OWNER / ADMIN / ESTIMATOR / PROJECT MANAGER
// ==========================================

router.patch(
  "/organizations/:organizationId/projects/:projectId/addenda/:addendumId",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  updateAddendumController
);

// ==========================================
// PUBLISH ADDENDUM
// OWNER / ADMIN / PROJECT MANAGER
// ==========================================

router.patch(
  "/organizations/:organizationId/projects/:projectId/addenda/:addendumId/publish",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  publishAddendumController
);

// ==========================================
// CANCEL ADDENDUM
// OWNER / ADMIN / PROJECT MANAGER
// ==========================================

router.patch(
  "/organizations/:organizationId/projects/:projectId/addenda/:addendumId/cancel",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  cancelAddendumController
);

// ==========================================
// DELETE ADDENDUM
// OWNER / ADMIN ONLY
// ==========================================

router.delete(
  "/organizations/:organizationId/projects/:projectId/addenda/:addendumId",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN
  ),
  deleteAddendumController
);

export default router;