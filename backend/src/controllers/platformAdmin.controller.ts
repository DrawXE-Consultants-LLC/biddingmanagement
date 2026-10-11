import { Request, Response } from "express";

import {
  getPlatformOverview,
  getAllOrganizations,
  getOrganizationById,
  updateOrganizationStatus,
  getAllUsers,
  updateUserStatus,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  assignOrganizationSubscription,
  updateOrganizationSubscriptionStatus,
} from "../services/platformAdmin.service";

// ==========================================
// HELPER: READ ROUTE PARAMETER
// ==========================================

const getParam = (
  value: string | string[] | undefined
): string => {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};

// ==========================================
// PLATFORM OVERVIEW
// ==========================================

export const getPlatformOverviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const overview = await getPlatformOverview();

    return res.status(200).json({
      success: true,
      message: "Platform overview fetched successfully",
      data: overview,
    });
  } catch (error: any) {
    console.error("Platform Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch platform overview",
    });
  }
};

// ==========================================
// GET ALL FABRICATORS
// ==========================================

export const getAllOrganizationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizations = await getAllOrganizations();

    return res.status(200).json({
      success: true,
      message: "Fabricators fetched successfully",
      data: organizations,
    });
  } catch (error: any) {
    console.error("Get Fabricators Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch fabricators",
    });
  }
};

// ==========================================
// GET SINGLE FABRICATOR
// ==========================================

export const getOrganizationByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = getParam(req.params.organizationId);

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    const organization = await getOrganizationById(organizationId);

    return res.status(200).json({
      success: true,
      message: "Fabricator details fetched successfully",
      data: organization,
    });
  } catch (error: any) {
    console.error("Get Fabricator Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch fabricator",
    });
  }
};

// ==========================================
// UPDATE FABRICATOR STATUS
// ==========================================

export const updateOrganizationStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = getParam(req.params.organizationId);
    const { status } = req.body;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or SUSPENDED",
      });
    }

    const organization = await updateOrganizationStatus(
      organizationId,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Fabricator status updated successfully",
      data: organization,
    });
  } catch (error: any) {
    console.error("Update Fabricator Status Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update fabricator status",
    });
  }
};

// ==========================================
// GET ALL USERS
// ==========================================

export const getAllUsersController = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Platform users fetched successfully",
      data: users,
    });
  } catch (error: any) {
    console.error("Get Platform Users Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch platform users",
    });
  }
};

// ==========================================
// UPDATE USER STATUS
// ==========================================

export const updateUserStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getParam(req.params.userId);
    const { isActive } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const user = await updateUserStatus(userId, isActive);

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Update User Status Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
};

// ==========================================
// GET SUBSCRIPTION PLANS
// ==========================================

export const getSubscriptionPlansController = async (
  req: Request,
  res: Response
) => {
  try {
    const plans = await getSubscriptionPlans();

    return res.status(200).json({
      success: true,
      message: "Subscription plans fetched successfully",
      data: plans,
    });
  } catch (error: any) {
    console.error("Get Subscription Plans Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subscription plans",
    });
  }
};

// ==========================================
// CREATE SUBSCRIPTION PLAN
// ==========================================

export const createSubscriptionPlanController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      description,
      monthlyPrice,
      maxUsers,
      maxProjects,
      maxBidsPerMonth,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Plan name is required",
      });
    }

    if (
      typeof monthlyPrice !== "number" ||
      !Number.isFinite(monthlyPrice) ||
      monthlyPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Monthly price must be a non-negative number",
      });
    }

    const plan = await createSubscriptionPlan({
      name: name.trim(),
      description,
      monthlyPrice,
      maxUsers,
      maxProjects,
      maxBidsPerMonth,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: plan,
    });
  } catch (error: any) {
    console.error("Create Subscription Plan Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create subscription plan",
    });
  }
};

// ==========================================
// UPDATE SUBSCRIPTION PLAN
// ==========================================

export const updateSubscriptionPlanController = async (
  req: Request,
  res: Response
) => {
  try {
    const planId = getParam(req.params.planId);

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Subscription plan ID is required",
      });
    }

    const {
      name,
      description,
      monthlyPrice,
      maxUsers,
      maxProjects,
      maxBidsPerMonth,
      isActive,
    } = req.body;

    if (
      monthlyPrice !== undefined &&
      (
        typeof monthlyPrice !== "number" ||
        !Number.isFinite(monthlyPrice) ||
        monthlyPrice < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Monthly price must be a non-negative number",
      });
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const plan = await updateSubscriptionPlan(planId, {
      name,
      description,
      monthlyPrice,
      maxUsers,
      maxProjects,
      maxBidsPerMonth,
      isActive,
    });

    return res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: plan,
    });
  } catch (error: any) {
    console.error("Update Subscription Plan Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update subscription plan",
    });
  }
};

// ==========================================
// ASSIGN SUBSCRIPTION TO ORGANIZATION
// ==========================================

export const assignOrganizationSubscriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = getParam(req.params.organizationId);

    const {
      planId,
      status,
      startsAt,
      endsAt,
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    if (typeof planId !== "string" || !planId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    if (
      status !== undefined &&
      !["ACTIVE", "TRIAL"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or TRIAL",
      });
    }

    const parsedStartsAt =
      startsAt === undefined ? undefined : new Date(startsAt);

    const parsedEndsAt =
      endsAt === undefined || endsAt === null
        ? endsAt
        : new Date(endsAt);

    if (
      parsedStartsAt &&
      Number.isNaN(parsedStartsAt.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "startsAt must be a valid date",
      });
    }

    if (
      parsedEndsAt instanceof Date &&
      Number.isNaN(parsedEndsAt.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "endsAt must be a valid date or null",
      });
    }

    const subscription = await assignOrganizationSubscription({
      organizationId,
      planId,
      status,
      startsAt: parsedStartsAt,
      endsAt: parsedEndsAt,
    });

    return res.status(200).json({
      success: true,
      message: "Organization subscription assigned successfully",
      data: subscription,
    });
  } catch (error: any) {
    console.error("Assign Subscription Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to assign subscription",
    });
  }
};

// ==========================================
// UPDATE ORGANIZATION SUBSCRIPTION STATUS
// ==========================================

export const updateOrganizationSubscriptionStatusController =
  async (req: Request, res: Response) => {
    try {
      const organizationId = getParam(req.params.organizationId);
      const { status } = req.body;

      const allowedStatuses = [
        "ACTIVE",
        "TRIAL",
        "PAST_DUE",
        "CANCELLED",
        "EXPIRED",
      ];

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: "Organization ID is required",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription status",
        });
      }

      const subscription =
        await updateOrganizationSubscriptionStatus(
          organizationId,
          status
        );

      return res.status(200).json({
        success: true,
        message: "Subscription status updated successfully",
        data: subscription,
      });
    } catch (error: any) {
      console.error("Update Subscription Status Error:", error);

      return res.status(400).json({
        success: false,
        message:
          error.message || "Failed to update subscription status",
      });
    }
  };