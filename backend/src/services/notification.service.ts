import { prisma } from "../config/database";

// ==========================================
// CREATE NOTIFICATION
// INTERNAL BUSINESS-SERVICE USE
// ==========================================

export const createNotification = async (data: {
  userId: string;
  organizationId?: string;
  type:
    | "BID_INVITATION"
    | "BID_SUBMITTED"
    | "CLARIFICATION_CREATED"
    | "CLARIFICATION_ANSWERED"
    | "ADDENDUM_PUBLISHED"
    | "BID_AWARDED"
    | "PROJECT_UPDATE"
    | "SYSTEM";
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: data.userId,
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  if (data.organizationId) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }
  }

  return prisma.notification.create({
    data: {
      userId: data.userId,
      organizationId: data.organizationId,
      type: data.type,
      title: data.title,
      message: data.message,
      entityType: data.entityType,
      entityId: data.entityId,
    },
  });
};

// ==========================================
// VERIFY ORGANIZATION MEMBERSHIP
// ==========================================

const assertOrganizationMembership = async (
  userId: string,
  organizationId?: string
): Promise<void> => {
  if (!organizationId) return;

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    select: {
      organization: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error(
      "User is not a member of this organization"
    );
  }

  if (membership.organization.status !== "ACTIVE") {
    throw new Error(
      "User is not a member of this organization"
    );
  }
};

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

export const getMyNotifications = async (
  userId: string,
  organizationId?: string
) => {
  await assertOrganizationMembership(userId, organizationId);

  return prisma.notification.findMany({
    where: {
      userId,
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET UNREAD NOTIFICATIONS
// ==========================================

export const getUnreadNotifications = async (
  userId: string,
  organizationId?: string
) => {
  await assertOrganizationMembership(userId, organizationId);

  return prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET UNREAD NOTIFICATION COUNT
// ==========================================

export const getUnreadNotificationCount = async (
  userId: string,
  organizationId?: string
) => {
  await assertOrganizationMembership(userId, organizationId);

  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
      ...(organizationId ? { organizationId } : {}),
    },
  });
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead = async (
  userId: string,
  notificationId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.isRead) {
    return notification;
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  const updatedNotification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!updatedNotification) {
    throw new Error("Notification not found");
  }

  return updatedNotification;
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsRead = async (
  userId: string,
  organizationId?: string
) => {
  await assertOrganizationMembership(userId, organizationId);

  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
      ...(organizationId ? { organizationId } : {}),
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// ==========================================
// DELETE NOTIFICATION
// ==========================================

export const deleteNotification = async (
  userId: string,
  notificationId: string
) => {
  const result = await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (result.count === 0) {
    throw new Error("Notification not found");
  }

  return result;
};