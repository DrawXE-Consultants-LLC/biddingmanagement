import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  getOrganizationMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from "../services/membership.service";

// ==========================================
// HANDLE MEMBERSHIP ERRORS
// ==========================================

const handleMembershipError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  const message =
    error instanceof Error ? error.message : "";

  if (
    message.includes("Not authorized") ||
    message.startsWith("Only the organization owner") ||
    message.startsWith("Cannot remove the last owner")
  ) {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  if (
    message === "Membership not found" ||
    message === "Organization not found" ||
    message === "User not found or inactive"
  ) {
    return res.status(404).json({
      success: false,
      message,
    });
  }

  if (message.includes("already a member")) {
    return res.status(409).json({
      success: false,
      message,
    });
  }

  if (
    message === "Invalid organization role" ||
    message === "Organization is not active"
  ) {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  console.error(fallbackMessage, error);

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

// ==========================================
// GET MEMBERS
// ==========================================

export const getMembers = async (
  req: AuthRequest,
  res: Response
) => {
  const organizationId =
    req.params.organizationId as string;

  try {
    const members = await getOrganizationMembers(
      organizationId
    );

    return res.status(200).json({
      success: true,
      members,
    });
  } catch (error: unknown) {
    return handleMembershipError(
      res,
      error,
      "Failed to fetch members"
    );
  }
};

// ==========================================
// ADD MEMBER
// ==========================================

export const createMember = async (
  req: AuthRequest,
  res: Response
) => {
  const actorUserId = req.user?.id;

  if (!actorUserId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const organizationId =
    req.params.organizationId as string;

  const { userId, role } = req.body;

  if (
    typeof userId !== "string" ||
    !userId.trim() ||
    typeof role !== "string" ||
    !role.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "userId and role are required",
    });
  }

  try {
    const membership = await addMember(
      organizationId,
      userId.trim(),
      role.trim(),
      actorUserId
    );

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      membership,
    });
  } catch (error: unknown) {
    return handleMembershipError(
      res,
      error,
      "Failed to add member"
    );
  }
};

// ==========================================
// CHANGE MEMBER ROLE
// OWNER ONLY
// ==========================================

export const changeMemberRole = async (
  req: AuthRequest,
  res: Response
) => {
  const actorUserId = req.user?.id;

  if (!actorUserId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const organizationId =
    req.params.organizationId as string;

  const membershipId =
    req.params.membershipId as string;

  const { role } = req.body;

  if (
    typeof membershipId !== "string" ||
    !membershipId.trim() ||
    typeof role !== "string" ||
    !role.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "membershipId and role are required",
    });
  }

  try {
    const membership = await updateMemberRole(
      organizationId,
      membershipId,
      role.trim(),
      actorUserId
    );

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      membership,
    });
  } catch (error: unknown) {
    return handleMembershipError(
      res,
      error,
      "Failed to update member role"
    );
  }
};

// ==========================================
// REMOVE MEMBER
// OWNER / ADMIN
// ==========================================

export const deleteMember = async (
  req: AuthRequest,
  res: Response
) => {
  const actorUserId = req.user?.id;

  if (!actorUserId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const organizationId =
    req.params.organizationId as string;

  const membershipId =
    req.params.membershipId as string;

  if (
    typeof membershipId !== "string" ||
    !membershipId.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Membership ID is required",
    });
  }

  try {
    await removeMember(
      organizationId,
      membershipId,
      actorUserId
    );

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error: unknown) {
    return handleMembershipError(
      res,
      error,
      "Failed to remove member"
    );
  }
};