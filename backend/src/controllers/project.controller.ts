import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/database";

import {
  createProject,
  getOrganizationProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../services/project.service";

// ==========================================
// CREATE PROJECT
// ==========================================

export const createProjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const {
      name,
      description,
      location,
      startDate,
      bidDeadline,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const parsedStartDate = startDate
      ? new Date(startDate)
      : undefined;

    const parsedBidDeadline = bidDeadline
      ? new Date(bidDeadline)
      : undefined;

    if (
      parsedStartDate &&
      Number.isNaN(parsedStartDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (
      parsedBidDeadline &&
      Number.isNaN(parsedBidDeadline.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid bid deadline",
      });
    }

    const project = await createProject(
      organizationId,
      {
        name: name.trim(),
        description,
        location,
        startDate: parsedStartDate,
        bidDeadline: parsedBidDeadline,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error: unknown) {
    console.error("Create Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

// ==========================================
// GET ORGANIZATION PROJECTS
// ==========================================

export const getProjects = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const projects = await getOrganizationProjects(
      organizationId
    );

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error: unknown) {
    console.error("Get Projects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

// ==========================================
// GET SINGLE PROJECT
// ==========================================

export const getProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const projectId =
      req.params.projectId as string;

    const organizationId =
      req.params.organizationId as string;

    // Verify project belongs to the resolved organization.
    const scopedProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!scopedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = await getProjectById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error: unknown) {
    console.error("Get Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};

// ==========================================
// UPDATE PROJECT
// ==========================================

export const updateProjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const projectId =
      req.params.projectId as string;

    const organizationId =
      req.params.organizationId as string;

    // Scope this operation to the resolved organization.
    const scopedProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!scopedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const {
      name,
      description,
      location,
      status,
      startDate,
      bidDeadline,
    } = req.body;

    // Only permit editable project fields.
    // organizationId and other protected fields are ignored.
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Project name cannot be empty",
        });
      }

      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (location !== undefined) {
      updateData.location = location;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (startDate !== undefined) {
      if (startDate === null || startDate === "") {
        updateData.startDate = null;
      } else {
        const parsedStartDate = new Date(startDate);

        if (Number.isNaN(parsedStartDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date",
          });
        }

        updateData.startDate = parsedStartDate;
      }
    }

    if (bidDeadline !== undefined) {
      if (bidDeadline === null || bidDeadline === "") {
        updateData.bidDeadline = null;
      } else {
        const parsedBidDeadline = new Date(bidDeadline);

        if (Number.isNaN(parsedBidDeadline.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid bid deadline",
          });
        }

        updateData.bidDeadline = parsedBidDeadline;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid project fields provided",
      });
    }

    const project = await updateProject(
      projectId,
      updateData as Parameters<typeof updateProject>[1]
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error: unknown) {
    console.error("Update Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

// ==========================================
// DELETE PROJECT
// ==========================================

export const deleteProjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const projectId =
      req.params.projectId as string;

    const organizationId =
      req.params.organizationId as string;

    // Verify ownership before delete.
    const scopedProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!scopedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await deleteProject(projectId);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};