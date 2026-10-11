import { Request, Response } from "express";

import {
  createClarification,
  getClarifications,
  getClarificationById,
  answerClarification,
  closeClarification,
  deleteClarification,
} from "../services/clarification.service";

// ==========================================
// CREATE CLARIFICATION
// ==========================================

export const createClarificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);

    const {
      bidPackageId,
      bidId,
      bidderId,
      question,
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    if (!bidPackageId) {
      return res.status(400).json({
        success: false,
        message: "Bid Package ID is required",
      });
    }

    if (!bidderId) {
      return res.status(400).json({
        success: false,
        message: "Bidder ID is required",
      });
    }

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const clarification = await createClarification(
      organizationId,
      {
        bidPackageId,
        bidId,
        bidderId,
        question,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Clarification created successfully",
      data: clarification,
    });
  } catch (error: any) {
    console.error("Create Clarification Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to create clarification",
    });
  }
};

// ==========================================
// GET ALL CLARIFICATIONS
// ==========================================

export const getClarificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidPackageId = String(req.params.bidPackageId);

    if (!organizationId || !bidPackageId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID and Bid Package ID are required",
      });
    }

    const clarifications = await getClarifications(
      organizationId,
      bidPackageId
    );

    return res.status(200).json({
      success: true,
      message: "Clarifications fetched successfully",
      data: clarifications,
    });
  } catch (error: any) {
    console.error("Get Clarifications Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to fetch clarifications",
    });
  }
};

// ==========================================
// GET SINGLE CLARIFICATION
// ==========================================

export const getClarificationByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidPackageId = String(req.params.bidPackageId);
    const clarificationId = String(req.params.clarificationId);

    if (
      !organizationId ||
      !bidPackageId ||
      !clarificationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Bid Package ID and Clarification ID are required",
      });
    }

    const clarification = await getClarificationById(
      organizationId,
      bidPackageId,
      clarificationId
    );

    return res.status(200).json({
      success: true,
      message: "Clarification fetched successfully",
      data: clarification,
    });
  } catch (error: any) {
    console.error("Get Clarification Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to fetch clarification",
    });
  }
};

// ==========================================
// ANSWER CLARIFICATION
// ==========================================

export const answerClarificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidPackageId = String(req.params.bidPackageId);
    const clarificationId = String(req.params.clarificationId);

    const { answer } = req.body;

    if (
      !organizationId ||
      !bidPackageId ||
      !clarificationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Bid Package ID and Clarification ID are required",
      });
    }

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const clarification = await answerClarification(
      organizationId,
      bidPackageId,
      clarificationId,
      answer
    );

    return res.status(200).json({
      success: true,
      message: "Clarification answered successfully",
      data: clarification,
    });
  } catch (error: any) {
    console.error("Answer Clarification Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to answer clarification",
    });
  }
};

// ==========================================
// CLOSE CLARIFICATION
// ==========================================

export const closeClarificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidPackageId = String(req.params.bidPackageId);
    const clarificationId = String(req.params.clarificationId);

    if (
      !organizationId ||
      !bidPackageId ||
      !clarificationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Bid Package ID and Clarification ID are required",
      });
    }

    const clarification = await closeClarification(
      organizationId,
      bidPackageId,
      clarificationId
    );

    return res.status(200).json({
      success: true,
      message: "Clarification closed successfully",
      data: clarification,
    });
  } catch (error: any) {
    console.error("Close Clarification Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to close clarification",
    });
  }
};

// ==========================================
// DELETE CLARIFICATION
// ==========================================

export const deleteClarificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidPackageId = String(req.params.bidPackageId);
    const clarificationId = String(req.params.clarificationId);

    if (
      !organizationId ||
      !bidPackageId ||
      !clarificationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Bid Package ID and Clarification ID are required",
      });
    }

    await deleteClarification(
      organizationId,
      bidPackageId,
      clarificationId
    );

    return res.status(200).json({
      success: true,
      message: "Clarification deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Clarification Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to delete clarification",
    });
  }
};