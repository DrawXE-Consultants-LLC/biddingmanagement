import { Request, Response } from "express";

import {
  createAddendum,
  getAddenda,
  getAddendumById,
  updateAddendum,
  publishAddendum,
  cancelAddendum,
  deleteAddendum,
} from "../services/addendum.service";

// ==========================================
// CREATE ADDENDUM
// ==========================================

export const createAddendumController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);

    const {
      projectId,
      bidPackageId,
      number,
      title,
      description,
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (number === undefined || number === null) {
      return res.status(400).json({
        success: false,
        message: "Addendum number is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const addendum = await createAddendum(
      organizationId,
      {
        projectId,
        bidPackageId,
        number,
        title,
        description,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Addendum created successfully",
      data: addendum,
    });
  } catch (error: any) {
    console.error("Create Addendum Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create addendum",
    });
  }
};

// ==========================================
// GET ALL ADDENDA
// ==========================================

export const getAddendaController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const projectId = String(req.params.projectId);

    const bidPackageId = req.query.bidPackageId
      ? String(req.query.bidPackageId)
      : undefined;

    if (!organizationId || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Project ID are required",
      });
    }

    const addenda = await getAddenda(
      organizationId,
      projectId,
      bidPackageId
    );

    return res.status(200).json({
      success: true,
      message: "Addenda fetched successfully",
      data: addenda,
    });
  } catch (error: any) {
    console.error("Get Addenda Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch addenda",
    });
  }
};

// ==========================================
// GET SINGLE ADDENDUM
// ==========================================

export const getAddendumByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const projectId = String(req.params.projectId);
    const addendumId = String(req.params.addendumId);

    if (!organizationId || !projectId || !addendumId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Project ID and Addendum ID are required",
      });
    }

    const addendum = await getAddendumById(
      organizationId,
      projectId,
      addendumId
    );

    return res.status(200).json({
      success: true,
      message: "Addendum fetched successfully",
      data: addendum,
    });
  } catch (error: any) {
    console.error("Get Addendum Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch addendum",
    });
  }
};

// ==========================================
// UPDATE ADDENDUM
// ==========================================

export const updateAddendumController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const projectId = String(req.params.projectId);
    const addendumId = String(req.params.addendumId);

    if (!organizationId || !projectId || !addendumId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Project ID and Addendum ID are required",
      });
    }

    const {
      number,
      title,
      description,
      bidPackageId,
    } = req.body;

    const addendum = await updateAddendum(
      organizationId,
      projectId,
      addendumId,
      {
        number,
        title,
        description,
        bidPackageId,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Addendum updated successfully",
      data: addendum,
    });
  } catch (error: any) {
    console.error("Update Addendum Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update addendum",
    });
  }
};

// ==========================================
// PUBLISH ADDENDUM
// ==========================================

export const publishAddendumController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const projectId = String(req.params.projectId);
    const addendumId = String(req.params.addendumId);

    if (!organizationId || !projectId || !addendumId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Project ID and Addendum ID are required",
      });
    }

    const addendum = await publishAddendum(
      organizationId,
      projectId,
      addendumId
    );

    return res.status(200).json({
      success: true,
      message: "Addendum published successfully",
      data: addendum,
    });
  } catch (error: any) {
    console.error("Publish Addendum Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to publish addendum",
    });
  }
};

// ==========================================
// CANCEL ADDENDUM
// ==========================================

export const cancelAddendumController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const projectId = String(req.params.projectId);
    const addendumId = String(req.params.addendumId);

    if (!organizationId || !projectId || !addendumId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Project ID and Addendum ID are required",
      });
    }

    const addendum = await cancelAddendum(
      organizationId,
      projectId,
      addendumId
    );

    return res.status(200).json({
      success: true,
      message: "Addendum cancelled successfully",
      data: addendum,
    });
  } catch (error: any) {
    console.error("Cancel Addendum Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel addendum",
    });
  }
};

// ==========================================
// DELETE ADDENDUM
// ==========================================

export const deleteAddendumController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const projectId = String(req.params.projectId);
    const addendumId = String(req.params.addendumId);

    if (!organizationId || !projectId || !addendumId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Project ID and Addendum ID are required",
      });
    }

    await deleteAddendum(
      organizationId,
      projectId,
      addendumId
    );

    return res.status(200).json({
      success: true,
      message: "Addendum deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Addendum Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete addendum",
    });
  }
};