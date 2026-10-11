import { Router } from "express";

import {
  createInvitationController,
  getInvitationsController,
  getInvitationController,
  cancelInvitationController,
  acceptInvitationController,
  declineInvitationController,
} from "../controllers/invitation.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

// Roles permitted to view organization invitations.
// authorize() also verifies organization membership.
const invitationReadRoles = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.ESTIMATOR,
  UserRole.PROJECT_MANAGER,
  UserRole.VIEWER,
];

// ==========================================
// CREATE INVITATION
// OWNER / ADMIN / ESTIMATOR / PROJECT MANAGER
// ==========================================

router.post(
  "/organizations/:organizationId/invitations",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.ESTIMATOR,
    UserRole.PROJECT_MANAGER
  ),
  createInvitationController
);

// ==========================================
// GET ORGANIZATION INVITATIONS
// AUTHORIZED ORGANIZATION MEMBERS ONLY
// ==========================================

router.get(
  "/organizations/:organizationId/invitations",
  authenticate,
  authorize(...invitationReadRoles),
  getInvitationsController
);

// ==========================================
// GET SINGLE INVITATION
// AUTHORIZED ORGANIZATION MEMBERS ONLY
// ==========================================

router.get(
  "/organizations/:organizationId/invitations/:invitationId",
  authenticate,
  authorize(...invitationReadRoles),
  getInvitationController
);

// ==========================================
// ACCEPT INVITATION
// ONLY THE INVITED USER
// ==========================================

router.patch(
  "/organizations/:organizationId/invitations/:invitationId/accept",
  authenticate,
  acceptInvitationController
);

// ==========================================
// DECLINE INVITATION
// ONLY THE INVITED USER
// ==========================================

router.patch(
  "/organizations/:organizationId/invitations/:invitationId/decline",
  authenticate,
  declineInvitationController
);

// ==========================================
// CANCEL INVITATION
// OWNER / ADMIN ONLY
// ==========================================

router.patch(
  "/organizations/:organizationId/invitations/:invitationId/cancel",
  authenticate,
  authorize(
    UserRole.OWNER,
    UserRole.ADMIN
  ),
  cancelInvitationController
);

export default router;