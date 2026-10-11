import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/database";
import { UserRole } from "../types/auth.types";

// ==========================================
// ORGANIZATION-AWARE ROLE AUTHORIZATION
// ==========================================

export const authorize = (...allowedRoles: UserRole[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // 1. Authentication check
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // 2. Resolve organization ID
      const rawOrganizationId: unknown =
        req.params.organizationId ??
        req.body?.organizationId ??
        req.query.organizationId;

      const organizationId =
        typeof rawOrganizationId === "string"
          ? rawOrganizationId.trim()
          : Array.isArray(rawOrganizationId) &&
              typeof rawOrganizationId[0] === "string"
            ? rawOrganizationId[0].trim()
            : "";

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: "Valid organization ID is required",
        });
        return;
      }

      // 3. Verify membership and current account status
      const membership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
        select: {
          role: true,
          user: {
            select: {
              isActive: true,
            },
          },
          organization: {
            select: {
              status: true,
            },
          },
        },
      });

      if (!membership) {
        res.status(403).json({
          success: false,
          message: "User is not a member of this organization",
        });
        return;
      }

      if (!membership.user.isActive) {
        res.status(401).json({
          success: false,
          message: "User account is inactive",
        });
        return;
      }

      if (membership.organization.status !== "ACTIVE") {
        res.status(403).json({
          success: false,
          message: "Organization is not active",
        });
        return;
      }

      // 4. Verify organization-specific role
      const role = membership.role as UserRole;

      if (!allowedRoles.includes(role)) {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions for this organization",
        });
        return;
      }

      // 5. All checks passed
      next();
    } catch (error) {
      console.error("Organization RBAC Error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to verify organization permissions",
      });
    }
  };
};