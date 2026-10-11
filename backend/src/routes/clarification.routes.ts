import { Router } from "express";

import {
  createClarificationController,
  getClarificationsController,
  getClarificationByIdController,
  answerClarificationController,
  closeClarificationController,
  deleteClarificationController,
} from "../controllers/clarification.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

// ==========================================
// ROLES ALLOWED TO READ CLARIFICATIONS
// ==========================================

const clarificationReadRoles = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.ESTIMATOR,
  UserRole.PROJECT_MANAGER,
  UserRole.VIEWER,
];

// ==========================================
// CREATE CLARIFICATION
// OWNER / ADMIN / ESTIMATOR / PROJECT MANAGER
// ==========================================

router.post(
  "/organizations/:organizationId/clarifications",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  createClarificationController
);

// ==========================================
// GET ALL CLARIFICATIONS FOR BID PACKAGE
// AUTHORIZED ORGANIZATION MEMBERS
// ==========================================

router.get(
  "/organizations/:organizationId/bid-packages/:bidPackageId/clarifications",
  authenticate,
  authorize(...clarificationReadRoles),
  getClarificationsController
);

// ==========================================
// GET SINGLE CLARIFICATION
// AUTHORIZED ORGANIZATION MEMBERS
// ==========================================

router.get(
  "/organizations/:organizationId/bid-packages/:bidPackageId/clarifications/:clarificationId",
  authenticate,
  authorize(...clarificationReadRoles),
  getClarificationByIdController
);

// ==========================================
// ANSWER CLARIFICATION
// OWNER / ADMIN / ESTIMATOR / PROJECT MANAGER
// ==========================================

router.patch(
  "/organizations/:organizationId/bid-packages/:bidPackageId/clarifications/:clarificationId/answer",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  answerClarificationController
);

// ==========================================
// CLOSE CLARIFICATION
// OWNER / ADMIN / PROJECT MANAGER
// ==========================================

router.patch(
  "/organizations/:organizationId/bid-packages/:bidPackageId/clarifications/:clarificationId/close",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  closeClarificationController
);

// ==========================================
// DELETE CLARIFICATION
// OWNER / ADMIN ONLY
// ==========================================

router.delete(
  "/organizations/:organizationId/bid-packages/:bidPackageId/clarifications/:clarificationId",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN
  ),
  deleteClarificationController
);

export default router;