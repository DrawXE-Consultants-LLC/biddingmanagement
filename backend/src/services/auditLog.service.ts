import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

// ==========================================
// CREATE AUDIT LOG
// ==========================================

export const createAuditLog = async (data: {
  userId?: string;
  organizationId?: string;
  action:
    | "LOGIN"
    | "LOGOUT"
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "INVITE"
    | "ACCEPT"
    | "DECLINE"
    | "SUBMIT"
    | "WITHDRAW"
    | "ANSWER"
    | "CLOSE"
    | "PUBLISH"
    | "CANCEL"
    | "AWARD"
    | "REJECT"
    | "READ"
    | "SYSTEM";
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}) => {
  // Verify user if provided
  if (data.userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
  }

  // Verify organization if provided
  if (data.organizationId) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }
  }

  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      organizationId: data.organizationId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      description: data.description,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
};

// ==========================================
// GET ORGANIZATION AUDIT LOGS
// ==========================================

export const getOrganizationAuditLogs = async (
  organizationId: string
) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return prisma.auditLog.findMany({
    where: {
      organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET USER AUDIT LOGS
// ==========================================

export const getUserAuditLogs = async (
  userId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.auditLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET AUDIT LOGS BY ENTITY
// ==========================================

export const getEntityAuditLogs = async (
  organizationId: string,
  entityType: string,
  entityId: string
) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return prisma.auditLog.findMany({
    where: {
      organizationId,
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET SINGLE AUDIT LOG
// ==========================================

export const getAuditLogById = async (
  organizationId: string,
  auditLogId: string
) => {
  const auditLog = await prisma.auditLog.findFirst({
    where: {
      id: auditLogId,
      organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!auditLog) {
    throw new Error("Audit log not found");
  }

  return auditLog;
};