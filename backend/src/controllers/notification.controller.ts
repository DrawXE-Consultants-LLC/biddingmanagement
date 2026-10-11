import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  getMyNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notification.service";

// ==========================================
// VERIFY AUTHENTICATED USER
// ==========================================

const getOwnUserId = (
  req: AuthRequest,
  res: Response
): string | null => {
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return null;
  }

  const requestedUserId = req.params.userId;

  if (
    typeof requestedUserId !== "string" ||
    requestedUserId !== authenticatedUserId
  ) {
    res.status(403).json({
      success: false,
      message: "You can only access your own notifications",
    });

    return null;
  }

  return authenticatedUserId;
};

// ==========================================
// VALIDATE OPTIONAL ORGANIZATION FILTER
// ==========================================

const getOrganizationFilter = (
  req: AuthRequest,
  res: Response
): string | undefined | null => {
  const rawOrganizationId = req.query.organizationId;

  if (rawOrganizationId === undefined) {
    return undefined;
  }

  if (
    typeof rawOrganizationId !== "string" ||
    !rawOrganizationId.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid organization ID",
    });

    return null;
  }

  return rawOrganizationId.trim();
};

// ==========================================
// HANDLE SERVICE ERRORS
// ==========================================

const handleNotificationError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  const message =
    error instanceof Error ? error.message : "";

  if (
    message ===
    "User is not a member of this organization"
  ) {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  if (message === "Notification not found") {
    return res.status(404).json({
      success: false,
      message,
    });
  }

  if (message === "Organization not found") {
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
// GET MY NOTIFICATIONS
// ==========================================

export const getMyNotificationsController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = getOwnUserId(req, res);

  if (!userId) return;

  const organizationId = getOrganizationFilter(req, res);

  if (organizationId === null) return;

  try {
    const notifications = await getMyNotifications(
      userId,
      organizationId
    );

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error: unknown) {
    return handleNotificationError(
      res,
      error,
      "Failed to fetch notifications"
    );
  }
};

// ==========================================
// GET UNREAD NOTIFICATIONS
// ==========================================

export const getUnreadNotificationsController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = getOwnUserId(req, res);

  if (!userId) return;

  const organizationId = getOrganizationFilter(req, res);

  if (organizationId === null) return;

  try {
    const notifications = await getUnreadNotifications(
      userId,
      organizationId
    );

    return res.status(200).json({
      success: true,
      message: "Unread notifications fetched successfully",
      data: notifications,
    });
  } catch (error: unknown) {
    return handleNotificationError(
      res,
      error,
      "Failed to fetch unread notifications"
    );
  }
};

// ==========================================
// GET UNREAD NOTIFICATION COUNT
// ==========================================

export const getUnreadNotificationCountController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = getOwnUserId(req, res);

  if (!userId) return;

  const organizationId = getOrganizationFilter(req, res);

  if (organizationId === null) return;

  try {
    const count = await getUnreadNotificationCount(
      userId,
      organizationId
    );

    return res.status(200).json({
      success: true,
      message: "Unread notification count fetched successfully",
      data: { count },
    });
  } catch (error: unknown) {
    return handleNotificationError(
      res,
      error,
      "Failed to fetch unread notification count"
    );
  }
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsReadController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = getOwnUserId(req, res);

  if (!userId) return;

  const notificationId = req.params.notificationId;

  if (
    typeof notificationId !== "string" ||
    !notificationId.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid notification ID is required",
    });
  }

  try {
    const notification = await markNotificationAsRead(
      userId,
      notificationId
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error: unknown) {
    return handleNotificationError(
      res,
      error,
      "Failed to mark notification as read"
    );
  }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsReadController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = getOwnUserId(req, res);

  if (!userId) return;

  const organizationId = getOrganizationFilter(req, res);

  if (organizationId === null) return;

  try {
    const result = await markAllNotificationsAsRead(
      userId,
      organizationId
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (error: unknown) {
    return handleNotificationError(
      res,
      error,
      "Failed to mark all notifications as read"
    );
  }
};

// ==========================================
// DELETE NOTIFICATION
// ==========================================

export const deleteNotificationController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = getOwnUserId(req, res);

  if (!userId) return;

  const notificationId = req.params.notificationId;

  if (
    typeof notificationId !== "string" ||
    !notificationId.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid notification ID is required",
    });
  }

  try {
    await deleteNotification(userId, notificationId);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: unknown) {
    return handleNotificationError(
      res,
      error,
      "Failed to delete notification"
    );
  }
};