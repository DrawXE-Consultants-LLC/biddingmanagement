import { Router } from "express";

import { requirePlatformAdmin } from "../middleware/platformAdmin.middleware";

import {
  getPlatformOverviewController,
  getAllOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationStatusController,
  getAllUsersController,
  updateUserStatusController,
  getSubscriptionPlansController,
  createSubscriptionPlanController,
  updateSubscriptionPlanController,
  assignOrganizationSubscriptionController,
  updateOrganizationSubscriptionStatusController,
} from "../controllers/platformAdmin.controller";

const router = Router();

// All routes below require PLATFORM_ADMIN.
router.use(requirePlatformAdmin);

// ==========================================
// PLATFORM OVERVIEW
// ==========================================

router.get(
  "/overview",
  getPlatformOverviewController
);

// ==========================================
// FABRICATOR / ORGANIZATION MANAGEMENT
// ==========================================

router.get(
  "/organizations",
  getAllOrganizationsController
);

router.get(
  "/organizations/:organizationId",
  getOrganizationByIdController
);

router.patch(
  "/organizations/:organizationId/status",
  updateOrganizationStatusController
);

// ==========================================
// USER MANAGEMENT
// ==========================================

router.get(
  "/users",
  getAllUsersController
);

router.patch(
  "/users/:userId/status",
  updateUserStatusController
);

// ==========================================
// SUBSCRIPTION PLANS
// ==========================================

router.get(
  "/subscription-plans",
  getSubscriptionPlansController
);

router.post(
  "/subscription-plans",
  createSubscriptionPlanController
);

router.patch(
  "/subscription-plans/:planId",
  updateSubscriptionPlanController
);

// ==========================================
// ORGANIZATION SUBSCRIPTIONS
// ==========================================

router.put(
  "/organizations/:organizationId/subscription",
  assignOrganizationSubscriptionController
);

router.patch(
  "/organizations/:organizationId/subscription/status",
  updateOrganizationSubscriptionStatusController
);

export default router;