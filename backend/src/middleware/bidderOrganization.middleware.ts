import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/database";

// ==========================================
// RESOLVE BIDDER ORGANIZATION
// ==========================================

export const resolveBidderOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const rawBidderId: unknown = req.params.bidderId;

    const bidderId =
      typeof rawBidderId === "string"
        ? rawBidderId.trim()
        : Array.isArray(rawBidderId) &&
            typeof rawBidderId[0] === "string"
          ? rawBidderId[0].trim()
          : "";

    if (!bidderId) {
      res.status(400).json({
        success: false,
        message: "Valid bidder ID is required",
      });
      return;
    }

    const bidder = await prisma.bidder.findUnique({
      where: {
        id: bidderId,
      },
      select: {
        organizationId: true,
      },
    });

    if (!bidder) {
      res.status(404).json({
        success: false,
        message: "Bidder not found",
      });
      return;
    }

    // Resolve organization from the database, not user input.
    req.params.organizationId = bidder.organizationId;

    next();
  } catch (error: unknown) {
    console.error("Resolve Bidder Organization Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to resolve bidder organization",
    });
  }
};