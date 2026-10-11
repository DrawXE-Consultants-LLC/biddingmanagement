import { prisma } from "../config/database";

// ==========================================
// CREATE CLARIFICATION
// ==========================================

export const createClarification = async (
  organizationId: string,
  data: {
    bidPackageId: string;
    bidId?: string;
    bidderId: string;
    question: string;
  }
) => {
  if (
    typeof data.question !== "string" ||
    !data.question.trim()
  ) {
    throw new Error("Question is required");
  }

  // Verify Bid Package belongs to the organization.
  const bidPackage = await prisma.bidPackage.findFirst({
    where: {
      id: data.bidPackageId,
      project: {
        organizationId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!bidPackage) {
    throw new Error("Bid package not found");
  }

  // Verify bidder belongs to the same organization.
  const bidder = await prisma.bidder.findFirst({
    where: {
      id: data.bidderId,
      organizationId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  if (!bidder) {
    throw new Error("Active bidder not found");
  }

  // If a Bid ID is provided, verify all relationships.
  if (data.bidId) {
    const bid = await prisma.bid.findFirst({
      where: {
        id: data.bidId,
        organizationId,
        bidPackageId: data.bidPackageId,
        bidderId: data.bidderId,
      },
      select: {
        id: true,
      },
    });

    if (!bid) {
      throw new Error("Bid not found");
    }
  }

  return prisma.clarification.create({
    data: {
      organizationId,
      bidPackageId: data.bidPackageId,
      bidId: data.bidId,
      bidderId: data.bidderId,
      question: data.question.trim(),
      status: "OPEN",
    },
  });
};

// ==========================================
// GET ALL CLARIFICATIONS
// ==========================================

export const getClarifications = async (
  organizationId: string,
  bidPackageId: string
) => {
  const bidPackage = await prisma.bidPackage.findFirst({
    where: {
      id: bidPackageId,
      project: {
        organizationId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!bidPackage) {
    throw new Error("Bid package not found");
  }

  return prisma.clarification.findMany({
    where: {
      organizationId,
      bidPackageId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      bidder: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
        },
      },
      bid: {
        // Do not expose bid amounts through the
        // general clarification listing.
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
};

// ==========================================
// GET SINGLE CLARIFICATION
// ==========================================

export const getClarificationById = async (
  organizationId: string,
  bidPackageId: string,
  clarificationId: string
) => {
  const clarification = await prisma.clarification.findFirst({
    where: {
      id: clarificationId,
      organizationId,
      bidPackageId,
    },
    include: {
      bidder: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
        },
      },
      bid: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!clarification) {
    throw new Error("Clarification not found");
  }

  return clarification;
};

// ==========================================
// ANSWER CLARIFICATION
// ==========================================

export const answerClarification = async (
  organizationId: string,
  bidPackageId: string,
  clarificationId: string,
  answer: string
) => {
  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("Answer is required");
  }

  const clarification = await prisma.clarification.findFirst({
    where: {
      id: clarificationId,
      organizationId,
      bidPackageId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!clarification) {
    throw new Error("Clarification not found");
  }

  if (clarification.status === "CLOSED") {
    throw new Error("Clarification is already closed");
  }

  // Keep the mutation scoped to the same organization
  // and Bid Package as the initial lookup.
  return prisma.clarification.update({
    where: {
      id: clarificationId,
      organizationId,
      bidPackageId,
    },
    data: {
      answer: answer.trim(),
      status: "ANSWERED",
      answeredAt: new Date(),
    },
  });
};

// ==========================================
// CLOSE CLARIFICATION
// ==========================================

export const closeClarification = async (
  organizationId: string,
  bidPackageId: string,
  clarificationId: string
) => {
  const clarification = await prisma.clarification.findFirst({
    where: {
      id: clarificationId,
      organizationId,
      bidPackageId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!clarification) {
    throw new Error("Clarification not found");
  }

  if (clarification.status === "CLOSED") {
    throw new Error("Clarification is already closed");
  }

  return prisma.clarification.update({
    where: {
      id: clarificationId,
      organizationId,
      bidPackageId,
    },
    data: {
      status: "CLOSED",
    },
  });
};

// ==========================================
// DELETE CLARIFICATION
// ==========================================

export const deleteClarification = async (
  organizationId: string,
  bidPackageId: string,
  clarificationId: string
) => {
  const clarification = await prisma.clarification.findFirst({
    where: {
      id: clarificationId,
      organizationId,
      bidPackageId,
    },
    select: {
      id: true,
    },
  });

  if (!clarification) {
    throw new Error("Clarification not found");
  }

  return prisma.clarification.delete({
    where: {
      id: clarificationId,
      organizationId,
      bidPackageId,
    },
  });
};