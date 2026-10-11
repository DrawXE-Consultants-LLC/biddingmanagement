import { Router } from "express";

import {
  getMembers,
  createMember,
  changeMemberRole,
  deleteMember,
} from "../controllers/membership.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireOrganizationMember } from "../middleware/organization.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

const memberReadRoles = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.ESTIMATOR,
  UserRole.PROJECT_MANAGER,
  UserRole.VIEWER,
];

// ==========================================
// GET MEMBERS
// AUTHORIZED ORGANIZATION MEMBERS
// ==========================================

router.get(
  "/organizations/:organizationId/members",
  authenticate,
  requireOrganizationMember,
  authorize(...memberReadRoles),
  getMembers
);

// ==========================================
// ADD MEMBER
// OWNER / ADMIN
// Service enforces which roles each actor can assign.
// ==========================================

router.post(
  "/organizations/:organizationId/members",
  authenticate,
  requireOrganizationMember,
  authorize(UserRole.OWNER, UserRole.ADMIN),
  createMember
);

// ==========================================
// CHANGE MEMBER ROLE
// OWNER ONLY
// ==========================================

router.patch(
  "/organizations/:organizationId/members/:membershipId",
  authenticate,
  requireOrganizationMember,
  authorize(UserRole.OWNER),
  changeMemberRole
);

// ==========================================
// REMOVE MEMBER
// OWNER / ADMIN
// Service protects owners and last-owner membership.
// ==========================================

router.delete(
  "/organizations/:organizationId/members/:membershipId",
  authenticate,
  requireOrganizationMember,
  authorize(UserRole.OWNER, UserRole.ADMIN),
  deleteMember
);

export default router;