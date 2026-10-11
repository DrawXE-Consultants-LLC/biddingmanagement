import { prisma } from "../config/database";
import path from "path";
import { stat } from "fs/promises";

// ==========================================
// HELPER: GET ACTIVE USER EMAIL
// ==========================================

const getActiveUserEmail = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or account is inactive");
  }

  return user.email;
};

// ==========================================
// GET MY INVITATIONS
// ==========================================

export const getMyInvitations = async (
  userId: string
) => {
  const email = await getActiveUserEmail(userId);

  return prisma.invitation.findMany({
    where: {
      email,
    },
    select: {
      id: true,
      organizationId: true,
      bidPackageId: true,
      bidderId: true,
      email: true,
      status: true,
      expiresAt: true,
      acceptedAt: true,
      declinedAt: true,
      createdAt: true,

      organization: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },

      bidder: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
        },
      },

      bidPackage: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          bidDeadline: true,

          project: {
            select: {
              id: true,
              name: true,
              location: true,
              bidDeadline: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET SINGLE INVITATION
// ==========================================

export const getMyInvitationById = async (
  userId: string,
  invitationId: string
) => {
  const email = await getActiveUserEmail(userId);

  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      email,
    },
    select: {
      id: true,
      organizationId: true,
      bidPackageId: true,
      bidderId: true,
      email: true,
      status: true,
      expiresAt: true,
      acceptedAt: true,
      declinedAt: true,
      createdAt: true,

      organization: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },

      bidder: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
        },
      },

      bidPackage: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          bidDeadline: true,

          project: {
            select: {
              id: true,
              name: true,
              location: true,
              bidDeadline: true,
            },
          },
        },
      },
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  return invitation;
};

// ==========================================
// ACCEPT OR DECLINE INVITATION
// ==========================================

export const respondToInvitation = async (
  userId: string,
  invitationId: string,
  decision: "ACCEPTED" | "DECLINED"
) => {
  const email = await getActiveUserEmail(userId);

  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      email,
    },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      organization: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new Error(
      "Only pending invitations can be accepted or declined"
    );
  }

  if (invitation.expiresAt <= new Date()) {
    await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    throw new Error("Invitation has expired");
  }

  if (
    decision === "ACCEPTED" &&
    invitation.organization.status !== "ACTIVE"
  ) {
    throw new Error(
      "This organization's account is not active"
    );
  }

  return prisma.invitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      status: decision,
      acceptedAt:
        decision === "ACCEPTED" ? new Date() : null,
      declinedAt:
        decision === "DECLINED" ? new Date() : null,
    },
    select: {
      id: true,
      organizationId: true,
      bidPackageId: true,
      bidderId: true,
      email: true,
      status: true,
      expiresAt: true,
      acceptedAt: true,
      declinedAt: true,
      updatedAt: true,
    },
  });
};

// ==========================================
// GET BIDDER PROJECT WORKSPACE
// ==========================================

export const getBidderWorkspace = async (
  userId: string,
  invitationId: string
) => {
  const email = await getActiveUserEmail(userId);

  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      email,
      status: "ACCEPTED",
    },
    select: {
      id: true,
      organizationId: true,
      bidPackageId: true,
      bidderId: true,
      status: true,

      organization: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },

      bidder: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
        },
      },

      bidPackage: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          bidDeadline: true,

          project: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              status: true,
              startDate: true,
              bidDeadline: true,
            },
          },
        },
      },
    },
  });

  if (!invitation) {
    throw new Error(
      "Accepted invitation not found or access denied"
    );
  }

  if (invitation.organization.status !== "ACTIVE") {
    throw new Error("Organization account is not active");
  }

  const documents = await prisma.document.findMany({
    where: {
      organizationId: invitation.organizationId,
      projectId: invitation.bidPackage.project.id,
    },
    select: {
      id: true,
      name: true,
      originalName: true,
      fileType: true,
      fileSize: true,
      category: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    invitation: {
      id: invitation.id,
      status: invitation.status,
    },
    organization: invitation.organization,
    bidder: invitation.bidder,
    bidPackage: invitation.bidPackage,
    project: invitation.bidPackage.project,
    documents,
  };
};

// ==========================================
// GET DOCUMENTS FOR ACCEPTED INVITATION
// ==========================================

export const getBidderProjectDocuments = async (
  userId: string,
  invitationId: string
) => {
  const workspace = await getBidderWorkspace(
    userId,
    invitationId
  );

  return workspace.documents;
};

// ==========================================
// HELPER: GET ACCEPTED INVITATION CONTEXT
// ==========================================

const getAcceptedInvitationContext = async (
  userId: string,
  invitationId: string
) => {
  const email = await getActiveUserEmail(userId);

  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      email,
      status: "ACCEPTED",
    },
    select: {
      id: true,
      organizationId: true,
      bidPackageId: true,
      bidderId: true,

      organization: {
        select: {
          status: true,
        },
      },

      bidPackage: {
        select: {
          projectId: true,
          status: true,
          bidDeadline: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new Error(
      "Accepted invitation not found or access denied"
    );
  }

  if (invitation.organization.status !== "ACTIVE") {
    throw new Error("Organization account is not active");
  }

  return invitation;
};

// ==========================================
// GET MY BID FOR AN INVITATION
// ==========================================

export const getMyBidForInvitation = async (
  userId: string,
  invitationId: string
) => {
  const invitation = await getAcceptedInvitationContext(
    userId,
    invitationId
  );

  return prisma.bid.findFirst({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    include: {
      lineItems: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// VALIDATE BID SUBMISSION WINDOW
// ==========================================

const validateBidSubmissionWindow = async (
  userId: string,
  invitationId: string
) => {
  const invitation = await getAcceptedInvitationContext(
    userId,
    invitationId
  );

  if (invitation.bidPackage.status !== "OPEN") {
    throw new Error(
      "Bid package is not open for submissions"
    );
  }

  if (
    invitation.bidPackage.bidDeadline &&
    invitation.bidPackage.bidDeadline <= new Date()
  ) {
    throw new Error("Bid submission deadline has passed");
  }

  return invitation;
};

// ==========================================
// SAVE MY BID DRAFT
// ==========================================

export const saveMyBidDraft = async (
  userId: string,
  invitationId: string,
  data: {
    amount?: number;
    notes?: string;
  }
) => {
  const invitation = await validateBidSubmissionWindow(
    userId,
    invitationId
  );

  if (
    data.amount !== undefined &&
    (
      !Number.isFinite(data.amount) ||
      data.amount <= 0
    )
  ) {
    throw new Error(
      "Bid amount must be a positive number"
    );
  }

  if (
    data.notes !== undefined &&
    typeof data.notes !== "string"
  ) {
    throw new Error("Bid notes must be a string");
  }

  if (
    data.amount === undefined &&
    data.notes === undefined
  ) {
    throw new Error(
      "Provide an amount or notes to save the draft"
    );
  }

  const existingBid = await prisma.bid.findFirst({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingBid && existingBid.status !== "DRAFT") {
    throw new Error(
      "Only a draft bid can be edited"
    );
  }

  if (existingBid) {
    return prisma.bid.update({
      where: {
        id: existingBid.id,
      },
      data: {
        amount: data.amount,
        notes: data.notes,
      },
      include: {
        lineItems: true,
      },
    });
  }

  return prisma.bid.create({
    data: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
      amount: data.amount,
      notes: data.notes,
      status: "DRAFT",
    },
    include: {
      lineItems: true,
    },
  });
};

// ==========================================
// SUBMIT MY BID
// ==========================================

export const submitMyBidForInvitation = async (
  userId: string,
  invitationId: string
) => {
  const invitation = await validateBidSubmissionWindow(
    userId,
    invitationId
  );

  const bid = await prisma.bid.findFirst({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!bid) {
    throw new Error(
      "Bid draft not found. Save a draft first"
    );
  }

  if (bid.status !== "DRAFT") {
    throw new Error(
      "Only a draft bid can be submitted"
    );
  }

  if (
    bid.amount === null ||
    Number(bid.amount) <= 0
  ) {
    throw new Error(
      "A positive bid amount is required before submission"
    );
  }

  return prisma.bid.update({
    where: {
      id: bid.id,
    },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    include: {
      lineItems: true,
    },
  });
};

// ==========================================
// ASK A QUESTION FROM BIDDER PORTAL
// ==========================================

export const askBidderClarification = async (
  userId: string,
  invitationId: string,
  question: string
) => {
  if (!question.trim()) {
    throw new Error("Question is required");
  }

  const invitation = await getAcceptedInvitationContext(
    userId,
    invitationId
  );

  if (invitation.bidPackage.status !== "OPEN") {
    throw new Error(
      "Bid package is not open for questions"
    );
  }

  if (
    invitation.bidPackage.bidDeadline &&
    invitation.bidPackage.bidDeadline <= new Date()
  ) {
    throw new Error(
      "Question submission deadline has passed"
    );
  }

  const bid = await prisma.bid.findFirst({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
    },
  });

  return prisma.clarification.create({
    data: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
      bidId: bid?.id,
      question: question.trim(),
      status: "OPEN",
    },
  });
};

// ==========================================
// GET MY QUESTIONS / ANSWERS
// ==========================================

export const getMyBidderClarifications = async (
  userId: string,
  invitationId: string
) => {
  const invitation = await getAcceptedInvitationContext(
    userId,
    invitationId
  );

  return prisma.clarification.findMany({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    select: {
      id: true,
      bidPackageId: true,
      bidId: true,
      question: true,
      answer: true,
      status: true,
      answeredAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET PUBLISHED ADDENDA FOR BIDDER
// ==========================================

export const getMyBidderAddenda = async (
  userId: string,
  invitationId: string
) => {
  const invitation = await getAcceptedInvitationContext(
    userId,
    invitationId
  );

  return prisma.addendum.findMany({
    where: {
      organizationId: invitation.organizationId,
      projectId: invitation.bidPackage.projectId,
      status: "PUBLISHED",
      OR: [
        {
          bidPackageId: invitation.bidPackageId,
        },
        {
          bidPackageId: null,
        },
      ],
    },
    select: {
      id: true,
      number: true,
      title: true,
      description: true,
      projectId: true,
      bidPackageId: true,
      status: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: {
      number: "asc",
    },
  });
};
// ==========================================
// SECURE BIDDER DOCUMENT DOWNLOAD
// ==========================================

export const getBidderDocumentForDownload = async (
  userId: string,
  invitationId: string,
  documentId: string
) => {
  // Verify accepted invitation and active organization.
  const invitation = await getAcceptedInvitationContext(
    userId,
    invitationId
  );

  // Document must belong to the invited project's organization.
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      organizationId: invitation.organizationId,
      projectId: invitation.bidPackage.projectId,
    },
    select: {
      id: true,
      originalName: true,
      fileUrl: true,
      fileType: true,
    },
  });

  if (!document) {
    throw new Error("Document not found or access denied");
  }

  // Only allow generated local storage filenames.
  // Never use an arbitrary URL or path supplied by a request.
  const storageKey = document.fileUrl;

  if (
    !storageKey ||
    storageKey !== path.basename(storageKey) ||
    storageKey.includes("/") ||
    storageKey.includes("\\") ||
    storageKey.includes("..")
  ) {
    throw new Error(
      "Document is not available for secure download"
    );
  }

  // Must match the directory used by upload.middleware.ts.
  const storageRoot = path.resolve(
    __dirname,
    "../../uploads/documents"
  );

  const filePath = path.resolve(storageRoot, storageKey);

  // Prevent directory traversal.
  if (!filePath.startsWith(storageRoot + path.sep)) {
    throw new Error("Invalid document storage path");
  }

  // Confirm the file actually exists and is a regular file.
  try {
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      throw new Error("Stored document is not a file");
    }
  } catch {
    throw new Error("Document file is missing from storage");
  }

  // Do not expose the internal storage path to the client
  // except as an internal value for the download controller.
  return {
    filePath,
    originalName: path.basename(document.originalName),
    fileType: document.fileType,
  };
};
// ==========================================
// GET MY BID LINE ITEMS
// ==========================================

export const getMyBidLineItemsForInvitation = async (
  userId: string,
  invitationId: string
) => {
  const invitation = await getAcceptedInvitationContext(
    userId,
    invitationId
  );

  const bid = await prisma.bid.findFirst({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!bid) {
    return [];
  }

  return prisma.bidLineItem.findMany({
    where: {
      bidId: bid.id,
      organizationId: invitation.organizationId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

// ==========================================
// CREATE BID LINE ITEM
// ==========================================

export const createMyBidLineItem = async (
  userId: string,
  invitationId: string,
  data: {
    name: string;
    description?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
  }
) => {
  const invitation = await validateBidSubmissionWindow(
    userId,
    invitationId
  );

  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new Error("Line item name is required");
  }

  if (
    data.quantity !== undefined &&
    (!Number.isFinite(data.quantity) || data.quantity <= 0)
  ) {
    throw new Error("Quantity must be a positive number");
  }

  if (
    data.unitPrice !== undefined &&
    (!Number.isFinite(data.unitPrice) || data.unitPrice < 0)
  ) {
    throw new Error("Unit price must be a non-negative number");
  }

  const bid = await prisma.bid.findFirst({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!bid) {
    throw new Error("Bid draft not found. Save a draft first");
  }

  if (bid.status !== "DRAFT") {
    throw new Error("Only a draft bid can be modified");
  }

  const totalPrice =
    data.quantity !== undefined &&
    data.unitPrice !== undefined
      ? data.quantity * data.unitPrice
      : undefined;

  return prisma.bidLineItem.create({
    data: {
      bidId: bid.id,
      organizationId: invitation.organizationId,
      name: data.name.trim(),
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      totalPrice,
    },
  });
};

// ==========================================
// UPDATE MY BID LINE ITEM
// ==========================================

export const updateMyBidLineItem = async (
  userId: string,
  invitationId: string,
  lineItemId: string,
  data: {
    name?: string;
    description?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
  }
) => {
  const invitation = await validateBidSubmissionWindow(
    userId,
    invitationId
  );

  if (
    data.name !== undefined &&
    (typeof data.name !== "string" || !data.name.trim())
  ) {
    throw new Error("Line item name cannot be empty");
  }

  if (
    data.quantity !== undefined &&
    (!Number.isFinite(data.quantity) || data.quantity <= 0)
  ) {
    throw new Error("Quantity must be a positive number");
  }

  if (
    data.unitPrice !== undefined &&
    (!Number.isFinite(data.unitPrice) || data.unitPrice < 0)
  ) {
    throw new Error("Unit price must be a non-negative number");
  }

  const bid = await prisma.bid.findFirst({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!bid) {
    throw new Error("Bid draft not found");
  }

  if (bid.status !== "DRAFT") {
    throw new Error("Only a draft bid can be modified");
  }

  const existingItem = await prisma.bidLineItem.findFirst({
    where: {
      id: lineItemId,
      bidId: bid.id,
      organizationId: invitation.organizationId,
    },
  });

  if (!existingItem) {
    throw new Error("Bid line item not found");
  }

  const quantity =
    data.quantity !== undefined
      ? data.quantity
      : existingItem.quantity !== null
        ? Number(existingItem.quantity)
        : undefined;

  const unitPrice =
    data.unitPrice !== undefined
      ? data.unitPrice
      : existingItem.unitPrice !== null
        ? Number(existingItem.unitPrice)
        : undefined;

  const pricingChanged =
    data.quantity !== undefined ||
    data.unitPrice !== undefined;

  const totalPrice =
    quantity !== undefined && unitPrice !== undefined
      ? quantity * unitPrice
      : pricingChanged
        ? null
        : undefined;

  return prisma.bidLineItem.update({
    where: {
      id: existingItem.id,
    },
    data: {
      name: data.name?.trim(),
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      totalPrice,
    },
  });
};

// ==========================================
// DELETE MY BID LINE ITEM
// ==========================================

export const deleteMyBidLineItem = async (
  userId: string,
  invitationId: string,
  lineItemId: string
) => {
  const invitation = await validateBidSubmissionWindow(
    userId,
    invitationId
  );

  const bid = await prisma.bid.findFirst({
    where: {
      organizationId: invitation.organizationId,
      bidPackageId: invitation.bidPackageId,
      bidderId: invitation.bidderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!bid) {
    throw new Error("Bid draft not found");
  }

  if (bid.status !== "DRAFT") {
    throw new Error("Only a draft bid can be modified");
  }

  const existingItem = await prisma.bidLineItem.findFirst({
    where: {
      id: lineItemId,
      bidId: bid.id,
      organizationId: invitation.organizationId,
    },
  });

  if (!existingItem) {
    throw new Error("Bid line item not found");
  }

  return prisma.bidLineItem.delete({
    where: {
      id: existingItem.id,
    },
  });
};
// ==========================================
// GET BIDDER BID SUMMARY
// ==========================================

export const getMyBidSummaryForInvitation = async (
  userId: string,
  invitationId: string
) => {
  const invitation = await getAcceptedInvitationContext(
    userId,
    invitationId
  );

  const [bidPackage, bid] = await Promise.all([
    prisma.bidPackage.findUnique({
      where: {
        id: invitation.bidPackageId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        bidDeadline: true,
        project: {
          select: {
            id: true,
            name: true,
            location: true,
            status: true,
          },
        },
      },
    }),

    prisma.bid.findFirst({
      where: {
        organizationId: invitation.organizationId,
        bidPackageId: invitation.bidPackageId,
        bidderId: invitation.bidderId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lineItems: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),
  ]);

  if (!bidPackage) {
    throw new Error("Bid package not found");
  }

  const lineItems = bid?.lineItems ?? [];

  const lineItemsTotal = lineItems.reduce(
    (total, item) =>
      total +
      (item.totalPrice !== null
        ? Number(item.totalPrice)
        : 0),
    0
  );

  return {
    invitation: {
      id: invitation.id,
      status: "ACCEPTED",
    },

    project: bidPackage.project,
    bidPackage: {
      id: bidPackage.id,
      name: bidPackage.name,
      description: bidPackage.description,
      status: bidPackage.status,
      bidDeadline: bidPackage.bidDeadline,
    },

    bid: bid
      ? {
          id: bid.id,
          amount: bid.amount,
          notes: bid.notes,
          status: bid.status,
          submittedAt: bid.submittedAt,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        }
      : null,

    lineItems,

    summary: {
      bidAmount:
        bid?.amount !== null && bid
          ? Number(bid.amount)
          : null,
      lineItemCount: lineItems.length,
      lineItemsTotal: Number(lineItemsTotal.toFixed(2)),
    },
  };
};