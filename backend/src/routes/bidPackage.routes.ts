import { Router } from "express";

import {
  createBidPackageController,
  getBidPackages,
  getBidPackage,
  updateBidPackageController,
  deleteBidPackageController,
} from "../controllers/bidPackage.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

// Roles allowed to read Bid Packages.
// The authorize middleware also checks organization membership.
const packageReadRoles = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.ESTIMATOR,
  UserRole.PROJECT_MANAGER,
  UserRole.VIEWER,
];

// ==========================================
// CREATE BID PACKAGE
// Owner / Admin / Estimator
// ==========================================

router.post(
  "/organizations/:organizationId/projects/:projectId/bid-packages",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR
  ),
  createBidPackageController
);

// ==========================================
// GET ALL BID PACKAGES FOR PROJECT
// ==========================================

router.get(
  "/organizations/:organizationId/projects/:projectId/bid-packages",
  authenticate,
  authorize(...packageReadRoles),
  getBidPackages
);

// ==========================================
// GET SINGLE BID PACKAGE
// ==========================================

router.get(
  "/organizations/:organizationId/projects/:projectId/bid-packages/:bidPackageId",
  authenticate,
  authorize(...packageReadRoles),
  getBidPackage
);

// ==========================================
// UPDATE BID PACKAGE
// Owner / Admin / Estimator
// ==========================================

router.patch(
  "/organizations/:organizationId/projects/:projectId/bid-packages/:bidPackageId",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR
  ),
  updateBidPackageController
);

// ==========================================
// DELETE BID PACKAGE
// Owner / Admin only
// ==========================================

router.delete(
  "/organizations/:organizationId/projects/:projectId/bid-packages/:bidPackageId",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN
  ),
  deleteBidPackageController
);

export default router;