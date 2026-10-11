import { prisma } from "../config/database";

// ==========================================
// PLATFORM OVERVIEW / ANALYTICS
// ==========================================

export const getPlatformOverview = async () => {
  const [
    totalOrganizations,
    totalUsers,
    activeUsers,
    totalProjects,
    totalBids,
    activeSubscriptions,
    subscriptions,
    recentOrganizations,
  ] = await Promise.all([
    prisma.organization.count(),

    prisma.user.count(),

    prisma.user.count({
      where: {
        isActive: true,
      },
    }),

    prisma.project.count(),

    prisma.bid.count(),

    prisma.organizationSubscription.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.organizationSubscription.findMany({
      where: {
        status: {
          in: ["ACTIVE", "TRIAL"],
        },
      },
      include: {
        plan: {
          select: {
            monthlyPrice: true,
          },
        },
      },
    }),

    prisma.organization.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            memberships: true,
            projects: true,
            bids: true,
          },
        },
      },
    }),
  ]);

  const estimatedMonthlyRevenue = subscriptions.reduce(
    (total, subscription) =>
      total + Number(subscription.plan.monthlyPrice),
    0
  );

  return {
    totalOrganizations,
    totalUsers,
    activeUsers,
    totalProjects,
    totalBids,
    activeSubscriptions,
    estimatedMonthlyRevenue,
    recentOrganizations,
  };
};

// ==========================================
// GET ALL FABRICATORS / ORGANIZATIONS
// ==========================================

export const getAllOrganizations = async () => {
  return prisma.organization.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: {
          memberships: true,
          projects: true,
          bids: true,
          bidders: true,
        },
      },
    },
  });
};

// ==========================================
// GET SINGLE ORGANIZATION
// ==========================================

export const getOrganizationById = async (
  organizationId: string
) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
            },
          },
        },
      },
      _count: {
        select: {
          projects: true,
          bidders: true,
          bids: true,
        },
      },
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return organization;
};

// ==========================================
// UPDATE ORGANIZATION STATUS
// ==========================================

export const updateOrganizationStatus = async (
  organizationId: string,
  status: "ACTIVE" | "SUSPENDED"
) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      status,
    },
  });
};

// ==========================================
// GET ALL USERS
// ==========================================

export const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      platformRole: true,
      createdAt: true,
      updatedAt: true,
      memberships: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      },
    },
  });
};

// ==========================================
// UPDATE USER STATUS
// ==========================================

export const updateUserStatus = async (
  userId: string,
  isActive: boolean
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      platformRole: true,
    },
  });
};

// ==========================================
// GET SUBSCRIPTION PLANS
// ==========================================

export const getSubscriptionPlans = async () => {
  return prisma.subscriptionPlan.findMany({
    orderBy: {
      monthlyPrice: "asc",
    },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });
};

// ==========================================
// CREATE SUBSCRIPTION PLAN
// ==========================================

export const createSubscriptionPlan = async (data: {
  name: string;
  description?: string;
  monthlyPrice: number;
  maxUsers?: number | null;
  maxProjects?: number | null;
  maxBidsPerMonth?: number | null;
}) => {
  const existingPlan = await prisma.subscriptionPlan.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingPlan) {
    throw new Error("Subscription plan name already exists");
  }

  if (!Number.isFinite(data.monthlyPrice) || data.monthlyPrice < 0) {
    throw new Error("Monthly price must be a valid non-negative number");
  }

  return prisma.subscriptionPlan.create({
    data: {
      name: data.name,
      description: data.description,
      monthlyPrice: data.monthlyPrice,
      maxUsers: data.maxUsers,
      maxProjects: data.maxProjects,
      maxBidsPerMonth: data.maxBidsPerMonth,
    },
  });
};

// ==========================================
// UPDATE SUBSCRIPTION PLAN
// ==========================================

export const updateSubscriptionPlan = async (
  planId: string,
  data: {
    name?: string;
    description?: string | null;
    monthlyPrice?: number;
    maxUsers?: number | null;
    maxProjects?: number | null;
    maxBidsPerMonth?: number | null;
    isActive?: boolean;
  }
) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: {
      id: planId,
    },
  });

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  if (
    data.monthlyPrice !== undefined &&
    (!Number.isFinite(data.monthlyPrice) || data.monthlyPrice < 0)
  ) {
    throw new Error("Monthly price must be a valid non-negative number");
  }

  if (data.name !== undefined && data.name !== plan.name) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingPlan) {
      throw new Error("Subscription plan name already exists");
    }
  }

  return prisma.subscriptionPlan.update({
    where: {
      id: planId,
    },
    data,
  });
};

// ==========================================
// ASSIGN SUBSCRIPTION TO ORGANIZATION
// ==========================================

export const assignOrganizationSubscription = async (data: {
  organizationId: string;
  planId: string;
  status?: "ACTIVE" | "TRIAL";
  startsAt?: Date;
  endsAt?: Date | null;
}) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: data.organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const plan = await prisma.subscriptionPlan.findFirst({
    where: {
      id: data.planId,
      isActive: true,
    },
  });

  if (!plan) {
    throw new Error("Active subscription plan not found");
  }

  const subscriptionData = {
    planId: data.planId,
    status: data.status ?? ("ACTIVE" as const),
    startsAt: data.startsAt ?? new Date(),
    endsAt: data.endsAt,
    cancelledAt: null,
  };

  return prisma.organizationSubscription.upsert({
    where: {
      organizationId: data.organizationId,
    },
    create: {
      organizationId: data.organizationId,
      ...subscriptionData,
    },
    update: subscriptionData,
    include: {
      organization: true,
      plan: true,
    },
  });
};

// ==========================================
// UPDATE SUBSCRIPTION STATUS
// ==========================================

export const updateOrganizationSubscriptionStatus = async (
  organizationId: string,
  status:
    | "ACTIVE"
    | "TRIAL"
    | "PAST_DUE"
    | "CANCELLED"
    | "EXPIRED"
) => {
  const subscription =
    await prisma.organizationSubscription.findUnique({
      where: {
        organizationId,
      },
    });

  if (!subscription) {
    throw new Error("Organization subscription not found");
  }

  return prisma.organizationSubscription.update({
    where: {
      organizationId,
    },
    data: {
      status,
      cancelledAt:
        status === "CANCELLED" ? new Date() : null,
    },
    include: {
      organization: true,
      plan: true,
    },
  });
};