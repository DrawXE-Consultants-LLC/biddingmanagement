import { Router } from "express";

import {
  createBidderController,
  getBidderList,
  getBidder,
  updateBidderController,
  deleteBidderController,
} from "../controllers/bidder.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { resolveBidderOrganization } from "../middleware/bidderOrganization.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

// ==========================================
// ROLES ALLOWED TO READ BIDDER DIRECTORY
// ==========================================

const bidderReadRoles = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.ESTIMATOR,
  UserRole.PROJECT_MANAGER,
  UserRole.VIEWER,
];

// ==========================================
// CREATE BIDDER
// OWNER / ADMIN / ESTIMATOR / PROJECT MANAGER
// ==========================================

router.post(
  "/organizations/:organizationId/bidders",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  createBidderController
);

// ==========================================
// GET BIDDER DIRECTORY
// AUTHORIZED ORGANIZATION MEMBERS ONLY
// ==========================================

router.get(
  "/organizations/:organizationId/bidders",
  authenticate,
  authorize(...bidderReadRoles),
  getBidderList
);

// ==========================================
// GET SINGLE BIDDER
// RESOLVE ORGANIZATION BEFORE AUTHORIZATION
// ==========================================

router.get(
  "/bidders/:bidderId",
  authenticate,
  resolveBidderOrganization,
  authorize(...bidderReadRoles),
  getBidder
);

// ==========================================
// UPDATE BIDDER
// OWNER / ADMIN / ESTIMATOR / PROJECT MANAGER
// ==========================================

router.patch(
  "/bidders/:bidderId",
  authenticate,
  resolveBidderOrganization,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  updateBidderController
);

// ==========================================
// DELETE BIDDER
// OWNER / ADMIN ONLY
// ==========================================

router.delete(
  "/bidders/:bidderId",
  authenticate,
  resolveBidderOrganization,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN
  ),
  deleteBidderController
);

export default router;