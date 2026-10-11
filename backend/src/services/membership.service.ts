import { prisma } from "../config/database";

type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "ESTIMATOR"
  | "PROJECT_MANAGER"
  | "VIEWER";

const organizationRoles: OrganizationRole[] = [
  "OWNER",
  "ADMIN",
  "ESTIMATOR",
  "PROJECT_MANAGER",
  "VIEWER",
];

const isOrganizationRole = (
  role: string
): role is OrganizationRole => {
  return organizationRoles.includes(role as OrganizationRole);
};

const getActorMembership = async (
  client: typeof prisma,
  organizationId: string,
  actorUserId: string
) => {
  return client.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: actorUserId,
        organizationId,
      },
    },
    select: {
      id: true,
      role: true,
    },
  });
};

// ==========================================
// GET ORGANIZATION MEMBERS
// ==========================================

export const getOrganizationMembers = async (
  organizationId: string
) => {
  return prisma.membership.findMany({
    where: {
      organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
};

// ==========================================
// ADD MEMBER TO ORGANIZATION
// ==========================================

export const addMember = async (
  organizationId: string,
  userId: string,
  role: string,
  actorUserId: string
) => {
  if (!isOrganizationRole(role)) {
    throw new Error("Invalid organization role");
  }

  const actorMembership = await getActorMembership(
    prisma,
    organizationId,
    actorUserId
  );

  if (
    !actorMembership ||
    !["OWNER", "ADMIN"].includes(actorMembership.role)
  ) {
    throw new Error(
      "Not authorized to add members to this organization"
    );
  }

  // Only an OWNER may assign OWNER or ADMIN roles.
  if (
    ["OWNER", "ADMIN"].includes(role) &&
    actorMembership.role !== "OWNER"
  ) {
    throw new Error(
      "Only the organization owner can assign OWNER or ADMIN roles"
    );
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (organization.status !== "ACTIVE") {
    throw new Error("Organization is not active");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  const existingMembership =
    await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

  if (existingMembership) {
    throw new Error(
      "User is already a member of this organization"
    );
  }

  return prisma.membership.create({
    data: {
      userId,
      organizationId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

// ==========================================
// CHANGE MEMBER ROLE
// OWNER ONLY
// ==========================================

export const updateMemberRole = async (
  organizationId: string,
  membershipId: string,
  role: string,
  actorUserId: string
) => {
  if (!isOrganizationRole(role)) {
    throw new Error("Invalid organization role");
  }

  return prisma.$transaction(async (tx) => {
    const actorMembership = await tx.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: actorUserId,
          organizationId,
        },
      },
    });

    if (!actorMembership || actorMembership.role !== "OWNER") {
      throw new Error(
        "Only the organization owner can change member roles"
      );
    }

    const targetMembership = await tx.membership.findFirst({
      where: {
        id: membershipId,
        organizationId,
      },
    });

    if (!targetMembership) {
      throw new Error("Membership not found");
    }

    // Prevent demoting the last remaining OWNER.
    if (
      targetMembership.role === "OWNER" &&
      role !== "OWNER"
    ) {
      const ownerCount = await tx.membership.count({
        where: {
          organizationId,
          role: "OWNER",
        },
      });

      if (ownerCount <= 1) {
        throw new Error(
          "Cannot remove the last owner from an organization"
        );
      }
    }

    return tx.membership.update({
      where: {
        id: targetMembership.id,
      },
      data: {
        role,
      },
    });
  });
};

// ==========================================
// REMOVE MEMBER
// OWNER / ADMIN
// ==========================================

export const removeMember = async (
  organizationId: string,
  membershipId: string,
  actorUserId: string
) => {
  return prisma.$transaction(async (tx) => {
    const actorMembership = await tx.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: actorUserId,
          organizationId,
        },
      },
    });

    if (
      !actorMembership ||
      !["OWNER", "ADMIN"].includes(actorMembership.role)
    ) {
      throw new Error(
        "Not authorized to remove members from this organization"
      );
    }

    const targetMembership = await tx.membership.findFirst({
      where: {
        id: membershipId,
        organizationId,
      },
    });

    if (!targetMembership) {
      throw new Error("Membership not found");
    }

    if (targetMembership.role === "OWNER") {
      if (actorMembership.role !== "OWNER") {
        throw new Error(
          "Only the organization owner can remove an owner"
        );
      }

      const ownerCount = await tx.membership.count({
        where: {
          organizationId,
          role: "OWNER",
        },
      });

      if (ownerCount <= 1) {
        throw new Error(
          "Cannot remove the last owner from an organization"
        );
      }
    }

    await tx.membership.delete({
      where: {
        id: targetMembership.id,
      },
    });

    return true;
  });
};