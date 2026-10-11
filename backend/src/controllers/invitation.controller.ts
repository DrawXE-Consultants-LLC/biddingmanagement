import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  createInvitation,
  getOrganizationInvitations,
  getInvitationById,
  cancelInvitation,
  acceptInvitation,
  declineInvitation,
} from "../services/invitation.service";

// ==========================================
// CREATE INVITATION
// ==========================================

export const createInvitationController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const { bidPackageId, bidderId, email } = req.body;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    if (
      typeof bidPackageId !== "string" ||
      typeof bidderId !== "string" ||
      typeof email !== "string" ||
      !bidPackageId.trim() ||
      !bidderId.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "bidPackageId, bidderId and email are required",
      });
    }

    const invitation = await createInvitation(
      organizationId,
      bidPackageId,
      bidderId,
      email
    );

    return res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      invitation,
    });
  } catch (error: unknown) {
    console.error("Create Invitation Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create invitation",
    });
  }
};

// ==========================================
// GET ORGANIZATION INVITATIONS
// ==========================================

export const getInvitationsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    const invitations = await getOrganizationInvitations(
      organizationId
    );

    return res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error: unknown) {
    console.error("Get Organization Invitations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invitations",
    });
  }
};

// ==========================================
// GET SINGLE INVITATION
// ==========================================

export const getInvitationController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const invitationId =
      req.params.invitationId as string;

    if (!organizationId || !invitationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Invitation ID are required",
      });
    }

    const invitation = await getInvitationById(
      organizationId,
      invitationId
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    return res.status(200).json({
      success: true,
      invitation,
    });
  } catch (error: unknown) {
    console.error("Get Invitation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invitation",
    });
  }
};

// ==========================================
// ACCEPT INVITATION
// Only the invited user can accept
// ==========================================

export const acceptInvitationController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const organizationId =
      req.params.organizationId as string;

    const invitationId =
      req.params.invitationId as string;

    if (!organizationId || !invitationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Invitation ID are required",
      });
    }

    // The service checks that the invitation email matches
    // the authenticated user's email.
    const invitation = await acceptInvitation(
      organizationId,
      invitationId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      invitation,
    });
  } catch (error: unknown) {
    console.error("Accept Invitation Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to accept invitation";

    const statusCode =
      message ===
      "Invitation not found or does not belong to the authenticated user"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// ==========================================
// DECLINE INVITATION
// Only the invited user can decline
// ==========================================

export const declineInvitationController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const organizationId =
      req.params.organizationId as string;

    const invitationId =
      req.params.invitationId as string;

    if (!organizationId || !invitationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Invitation ID are required",
      });
    }

    const invitation = await declineInvitation(
      organizationId,
      invitationId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Invitation declined successfully",
      invitation,
    });
  } catch (error: unknown) {
    console.error("Decline Invitation Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to decline invitation";

    const statusCode =
      message ===
      "Invitation not found or does not belong to the authenticated user"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// ==========================================
// CANCEL INVITATION
// Owner / Admin authorization enforced by routes
// ==========================================

export const cancelInvitationController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const invitationId =
      req.params.invitationId as string;

    if (!organizationId || !invitationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Invitation ID are required",
      });
    }

    const invitation = await cancelInvitation(
      organizationId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
      invitation,
    });
  } catch (error: unknown) {
    console.error("Cancel Invitation Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel invitation",
    });
  }
};