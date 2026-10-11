import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/database";

// ==========================================
// RESOLVE PROJECT ORGANIZATION
// ==========================================

export const resolveProjectOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Verify authentication
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // 2. Normalize and validate project ID
    const rawProjectId: unknown = req.params.projectId;

    const projectId =
      typeof rawProjectId === "string"
        ? rawProjectId.trim()
        : Array.isArray(rawProjectId) &&
            typeof rawProjectId[0] === "string"
          ? rawProjectId[0].trim()
          : "";

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Valid Project ID is required",
      });
      return;
    }

    // 3. Find the project and its actual organization
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        organizationId: true,
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    // 4. Resolve the organization from the database,
    // not from a client-supplied organization ID.
    req.params.organizationId = project.organizationId;

    // 5. Continue to membership and role checks
    next();
  } catch (error: unknown) {
    console.error(
      "Resolve Project Organization Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to resolve project organization",
    });
  }
};