import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  getOrganizationAuditLogs,
  getUserAuditLogs,
  getEntityAuditLogs,
  getAuditLogById,
} from "../services/auditLog.service";

// ==========================================
// HELPERS
// ==========================================

const getPathParam = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (
    Array.isArray(value) &&
    typeof value[0] === "string" &&
    value[0].trim()
  ) {
    return value[0].trim();
  }

  return null;
};

const handleAuditLogError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  const message =
    error instanceof Error ? error.message : "";

  if (
    message === "Audit log not found" ||
    message === "Organization not found" ||
    message === "User not found"
  ) {
    return res.status(404).json({
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
// GET ORGANIZATION AUDIT LOGS
// OWNER / ADMIN AUTHORIZATION IS ON THE ROUTE
// ==========================================

export const getOrganizationAuditLogsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId = getPathParam(
      req.params.organizationId
    );

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    const auditLogs = await getOrganizationAuditLogs(
      organizationId
    );

    return res.status(200).json({
      success: true,
      message: "Organization audit logs fetched successfully",
      data: auditLogs,
    });
  } catch (error: unknown) {
    return handleAuditLogError(
      res,
      error,
      "Failed to fetch organization audit logs"
    );
  }
};

// ==========================================
// GET USER AUDIT LOGS
// USERS CAN READ ONLY THEIR OWN LOGS
// ==========================================

export const getUserAuditLogsController = async (
  req: AuthRequest,
  res: Response
) => {
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const requestedUserId = getPathParam(
    req.params.userId
  );

  if (!requestedUserId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({
      success: false,
      message: "You can only access your own audit logs",
    });
  }

  try {
    const auditLogs = await getUserAuditLogs(
      authenticatedUserId
    );

    return res.status(200).json({
      success: true,
      message: "User audit logs fetched successfully",
      data: auditLogs,
    });
  } catch (error: unknown) {
    return handleAuditLogError(
      res,
      error,
      "Failed to fetch user audit logs"
    );
  }
};

// ==========================================
// GET ENTITY AUDIT LOGS
// OWNER / ADMIN AUTHORIZATION IS ON THE ROUTE
// ==========================================

export const getEntityAuditLogsController = async (
  req: AuthRequest,
  res: Response
) => {
  const organizationId = getPathParam(
    req.params.organizationId
  );

  const entityType = getPathParam(
    req.params.entityType
  );

  const entityId = getPathParam(
    req.params.entityId
  );

  if (!organizationId || !entityType || !entityId) {
    return res.status(400).json({
      success: false,
      message:
        "Organization ID, Entity Type and Entity ID are required",
    });
  }

  try {
    const auditLogs = await getEntityAuditLogs(
      organizationId,
      entityType,
      entityId
    );

    return res.status(200).json({
      success: true,
      message: "Entity audit logs fetched successfully",
      data: auditLogs,
    });
  } catch (error: unknown) {
    return handleAuditLogError(
      res,
      error,
      "Failed to fetch entity audit logs"
    );
  }
};

// ==========================================
// GET SINGLE AUDIT LOG
// OWNER / ADMIN AUTHORIZATION IS ON THE ROUTE
// ==========================================

export const getAuditLogByIdController = async (
  req: AuthRequest,
  res: Response
) => {
  const organizationId = getPathParam(
    req.params.organizationId
  );

  const auditLogId = getPathParam(
    req.params.auditLogId
  );

  if (!organizationId || !auditLogId) {
    return res.status(400).json({
      success: false,
      message:
        "Organization ID and Audit Log ID are required",
    });
  }

  try {
    const auditLog = await getAuditLogById(
      organizationId,
      auditLogId
    );

    return res.status(200).json({
      success: true,
      message: "Audit log fetched successfully",
      data: auditLog,
    });
  } catch (error: unknown) {
    return handleAuditLogError(
      res,
      error,
      "Failed to fetch audit log"
    );
  }
};