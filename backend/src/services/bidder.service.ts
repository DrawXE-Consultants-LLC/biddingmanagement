import { prisma } from "../config/database";

// ==========================================
// CREATE BIDDER
// ==========================================

export const createBidder = async (
  organizationId: string,
  data: {
    companyName: string;
    contactName?: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
    notes?: string;
  }
) => {
  return prisma.bidder.create({
    data: {
      organizationId,
      companyName: data.companyName.trim(),
      contactName: data.contactName,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      address: data.address,
      website: data.website,
      notes: data.notes,
    },
  });
};

// ==========================================
// GET ALL BIDDERS FOR ORGANIZATION
// ==========================================

export const getBidders = async (
  organizationId: string
) => {
  return prisma.bidder.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET SINGLE BIDDER
// ORGANIZATION-SCOPED
// ==========================================

export const getBidderById = async (
  organizationId: string,
  bidderId: string
) => {
  return prisma.bidder.findFirst({
    where: {
      id: bidderId,
      organizationId,
    },
  });
};

// ==========================================
// UPDATE BIDDER
// ORGANIZATION-SCOPED
// ==========================================

export const updateBidder = async (
  organizationId: string,
  bidderId: string,
  data: {
    companyName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    notes?: string;
    status?: "ACTIVE" | "INACTIVE";
  }
) => {
  // Explicitly allow only editable bidder fields.
  // organizationId and id can never be changed here.
  const safeData = {
    companyName: data.companyName?.trim(),
    contactName: data.contactName,
    email: data.email?.trim().toLowerCase(),
    phone: data.phone,
    address: data.address,
    website: data.website,
    notes: data.notes,
    status: data.status,
  };

  const result = await prisma.bidder.updateMany({
    where: {
      id: bidderId,
      organizationId,
    },
    data: safeData,
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.bidder.findFirst({
    where: {
      id: bidderId,
      organizationId,
    },
  });
};

// ==========================================
// DELETE BIDDER
// ORGANIZATION-SCOPED
// ==========================================

export const deleteBidder = async (
  organizationId: string,
  bidderId: string
) => {
  return prisma.bidder.deleteMany({
    where: {
      id: bidderId,
      organizationId,
    },
  });
};