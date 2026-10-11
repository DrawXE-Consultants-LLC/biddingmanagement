import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";

// ==========================================
// REQUIRE PLATFORM ADMIN
// ==========================================

export const requirePlatformAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: "JWT configuration is missing",
    });
    return;
  }

  let decoded: jwt.JwtPayload;

  try {
    const verified = jwt.verify(token, secret);

    if (typeof verified === "string") {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    decoded = verified;
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }

  // Support common JWT identity claim names.
  const userId = decoded.userId ?? decoded.id ?? decoded.sub;

  if (typeof userId !== "string" || !userId) {
    res.status(401).json({
      success: false,
      message: "Token does not contain a valid user ID",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        isActive: true,
        platformRole: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "User not found or account is inactive",
      });
      return;
    }

    if (user.platformRole !== "PLATFORM_ADMIN") {
      res.status(403).json({
        success: false,
        message: "Platform Admin access required",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Platform Admin Authorization Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify Platform Admin permissions",
    });
  }
};