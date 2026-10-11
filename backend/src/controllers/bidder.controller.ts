import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  createBidder,
  getBidders,
  getBidderById,
  updateBidder,
  deleteBidder,
} from "../services/bidder.service";

// ==========================================
// CREATE BIDDER
// ==========================================

export const createBidderController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const {
      companyName,
      contactName,
      email,
      phone,
      address,
      website,
      notes,
    } = req.body;

    if (
      typeof companyName !== "string" ||
      !companyName.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name and email are required",
      });
    }

    const bidder = await createBidder(
      organizationId,
      {
        companyName,
        contactName,
        email,
        phone,
        address,
        website,
        notes,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Bidder created successfully",
      bidder,
    });
  } catch (error: unknown) {
    console.error("Create Bidder Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create bidder",
    });
  }
};

// ==========================================
// GET BIDDER DIRECTORY
// ==========================================

export const getBidderList = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const bidders = await getBidders(organizationId);

    return res.status(200).json({
      success: true,
      bidders,
    });
  } catch (error: unknown) {
    console.error("Get Bidder List Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bidders",
    });
  }
};

// ==========================================
// GET SINGLE BIDDER
// ==========================================

export const getBidder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const bidderId =
      req.params.bidderId as string;

    const bidder = await getBidderById(
      organizationId,
      bidderId
    );

    if (!bidder) {
      return res.status(404).json({
        success: false,
        message: "Bidder not found",
      });
    }

    return res.status(200).json({
      success: true,
      bidder,
    });
  } catch (error: unknown) {
    console.error("Get Bidder Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bidder",
    });
  }
};

// ==========================================
// UPDATE BIDDER
// ==========================================

export const updateBidderController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const bidderId =
      req.params.bidderId as string;

    const {
      companyName,
      contactName,
      email,
      phone,
      address,
      website,
      notes,
      status,
    } = req.body;

    if (
      companyName !== undefined &&
      (
        typeof companyName !== "string" ||
        !companyName.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name cannot be empty",
      });
    }

    if (
      email !== undefined &&
      (
        typeof email !== "string" ||
        !email.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Email cannot be empty",
      });
    }

    if (
      status !== undefined &&
      status !== "ACTIVE" &&
      status !== "INACTIVE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid bidder status",
      });
    }

    const bidder = await updateBidder(
      organizationId,
      bidderId,
      {
        companyName,
        contactName,
        email,
        phone,
        address,
        website,
        notes,
        status,
      }
    );

    if (!bidder) {
      return res.status(404).json({
        success: false,
        message: "Bidder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bidder updated successfully",
      bidder,
    });
  } catch (error: unknown) {
    console.error("Update Bidder Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update bidder",
    });
  }
};

// ==========================================
// DELETE BIDDER
// ==========================================

export const deleteBidderController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.params.organizationId as string;

    const bidderId =
      req.params.bidderId as string;

    const result = await deleteBidder(
      organizationId,
      bidderId
    );

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Bidder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bidder deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete Bidder Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete bidder",
    });
  }
};