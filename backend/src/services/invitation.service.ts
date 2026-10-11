import crypto from "crypto";
import { prisma } from "../config/database";

// ==========================================
// CREATE INVITATION
// ==========================================

export const createInvitation = async (
  organizationId: string,
  bidPackageId: string,
  bidderId: string,
  email: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Invitation email is required");
  }

  // Verify bid package exists.
  const bidPackage = await prisma.bidPackage.findUnique({
    where: {
      id: bidPackageId,
    },
    select: {
      id: true,
      project: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!bidPackage) {
    throw new Error("Bid package not found");
  }

  // Verify bid package belongs to the requested organization.
  if (bidPackage.project.organizationId !== organizationId) {
    throw new Error(
      "Bid package does not belong to this organization"
    );
  }

  // Verify bidder exists.
  const bidder = await prisma.bidder.findUnique({
    where: {
      id: bidderId,
    },
    select: {
      id: true,
      organizationId: true,
      status: true,
    },
  });

  if (!bidder) {
    throw new Error("Bidder not found");
  }

  // Verify bidder belongs to the same organization.
  if (bidder.organizationId !== organizationId) {
    throw new Error(
      "Bidder does not belong to this organization"
    );
  }

  if (bidder.status !== "ACTIVE") {
    throw new Error("Bidder is inactive");
  }

  const token = crypto.randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return prisma.invitation.create({
    data: {
      organizationId,
      bidPackageId,
      bidderId,
      email: normalizedEmail,
      token,
      expiresAt,
    },
  });
};

// ==========================================
// GET ORGANIZATION INVITATIONS
// ==========================================

export const getOrganizationInvitations = async (
  organizationId: string
) => {
  return prisma.invitation.findMany({
    where: {
      organizationId,
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
      updatedAt: true,

      bidder: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          status: true,
        },
      },

      bidPackage: {
        select: {
          id: true,
          name: true,
          status: true,
          bidDeadline: true,
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

export const getInvitationById = async (
  organizationId: string,
  invitationId: string
) => {
  return prisma.invitation.findFirst({
    where: {
      id: invitationId,
      organizationId,
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
      updatedAt: true,

      bidder: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          status: true,
        },
      },

      bidPackage: {
        select: {
          id: true,
          name: true,
          status: true,
          bidDeadline: true,
        },
      },
    },
  });
};

// ==========================================
// HELPER: VALIDATE INVITATION RECIPIENT
// ==========================================

const getPendingInvitationForRecipient = async (
  organizationId: string,
  invitationId: string,
  userId: string
) => {
  // Verify authenticated user exists and is active.
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

  // Invitation must belong to the organization AND
  // the authenticated user's email.
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      organizationId,
      email: {
        equals: user.email,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      organizationId: true,
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
    throw new Error(
      "Invitation not found or does not belong to the authenticated user"
    );
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation is no longer pending");
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

  return invitation;
};

// ==========================================
// ACCEPT INVITATION
// Only the invited user can accept.
// ==========================================

export const acceptInvitation = async (
  organizationId: string,
  invitationId: string,
  userId: string
) => {
  const invitation = await getPendingInvitationForRecipient(
    organizationId,
    invitationId,
    userId
  );

  if (invitation.organization.status !== "ACTIVE") {
    throw new Error("Organization account is not active");
  }

  return prisma.invitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
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
// DECLINE INVITATION
// Only the invited user can decline.
// ==========================================

export const declineInvitation = async (
  organizationId: string,
  invitationId: string,
  userId: string
) => {
  const invitation = await getPendingInvitationForRecipient(
    organizationId,
    invitationId,
    userId
  );

  return prisma.invitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      status: "DECLINED",
      declinedAt: new Date(),
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
// CANCEL INVITATION
// Owner / Admin authorization is enforced by routes.
// ==========================================

export const cancelInvitation = async (
  organizationId: string,
  invitationId: string
) => {
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      organizationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new Error(
      "Only pending invitations can be cancelled"
    );
  }

  return prisma.invitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      status: "CANCELLED",
    },
    select: {
      id: true,
      organizationId: true,
      bidPackageId: true,
      bidderId: true,
      email: true,
      status: true,
      expiresAt: true,
      updatedAt: true,
    },
  });
};