import { prisma } from "../config/database";

// ==========================================
// CREATE ADDENDUM
// ==========================================

export const createAddendum = async (
  organizationId: string,
  data: {
    projectId: string;
    bidPackageId?: string;
    number: number;
    title: string;
    description?: string;
  }
) => {
  // Verify project belongs to organization
  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      organizationId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // If bid package is provided, verify it belongs
  // to the same project and organization
  if (data.bidPackageId) {
    const bidPackage = await prisma.bidPackage.findFirst({
      where: {
        id: data.bidPackageId,
        projectId: data.projectId,
        project: {
          organizationId,
        },
      },
    });

    if (!bidPackage) {
      throw new Error("Bid package not found");
    }
  }

  return prisma.addendum.create({
    data: {
      organizationId,
      projectId: data.projectId,
      bidPackageId: data.bidPackageId,
      number: data.number,
      title: data.title,
      description: data.description,
      status: "DRAFT",
    },
  });
};

// ==========================================
// GET ALL ADDENDA
// ==========================================

export const getAddenda = async (
  organizationId: string,
  projectId: string,
  bidPackageId?: string
) => {
  // Verify project belongs to organization
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (bidPackageId) {
    const bidPackage = await prisma.bidPackage.findFirst({
      where: {
        id: bidPackageId,
        projectId,
        project: {
          organizationId,
        },
      },
    });

    if (!bidPackage) {
      throw new Error("Bid package not found");
    }
  }

  return prisma.addendum.findMany({
    where: {
      organizationId,
      projectId,
      ...(bidPackageId ? { bidPackageId } : {}),
    },
    orderBy: {
      number: "asc",
    },
  });
};

// ==========================================
// GET SINGLE ADDENDUM
// ==========================================

export const getAddendumById = async (
  organizationId: string,
  projectId: string,
  addendumId: string
) => {
  const addendum = await prisma.addendum.findFirst({
    where: {
      id: addendumId,
      organizationId,
      projectId,
    },
  });

  if (!addendum) {
    throw new Error("Addendum not found");
  }

  return addendum;
};

// ==========================================
// UPDATE ADDENDUM
// ==========================================

export const updateAddendum = async (
  organizationId: string,
  projectId: string,
  addendumId: string,
  data: {
    number?: number;
    title?: string;
    description?: string;
    bidPackageId?: string | null;
  }
) => {
  const existingAddendum = await prisma.addendum.findFirst({
    where: {
      id: addendumId,
      organizationId,
      projectId,
    },
  });

  if (!existingAddendum) {
    throw new Error("Addendum not found");
  }

  if (existingAddendum.status !== "DRAFT") {
    throw new Error("Only draft addendum can be updated");
  }

  if (data.bidPackageId) {
    const bidPackage = await prisma.bidPackage.findFirst({
      where: {
        id: data.bidPackageId,
        projectId,
        project: {
          organizationId,
        },
      },
    });

    if (!bidPackage) {
      throw new Error("Bid package not found");
    }
  }

  return prisma.addendum.update({
    where: {
      id: addendumId,
    },
    data: {
      number: data.number,
      title: data.title,
      description: data.description,
      bidPackageId: data.bidPackageId,
    },
  });
};

// ==========================================
// PUBLISH ADDENDUM
// ==========================================

export const publishAddendum = async (
  organizationId: string,
  projectId: string,
  addendumId: string
) => {
  const existingAddendum = await prisma.addendum.findFirst({
    where: {
      id: addendumId,
      organizationId,
      projectId,
    },
  });

  if (!existingAddendum) {
    throw new Error("Addendum not found");
  }

  if (existingAddendum.status === "CANCELLED") {
    throw new Error("Cancelled addendum cannot be published");
  }

  if (existingAddendum.status === "PUBLISHED") {
    throw new Error("Addendum is already published");
  }

  return prisma.addendum.update({
    where: {
      id: addendumId,
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
};

// ==========================================
// CANCEL ADDENDUM
// ==========================================

export const cancelAddendum = async (
  organizationId: string,
  projectId: string,
  addendumId: string
) => {
  const existingAddendum = await prisma.addendum.findFirst({
    where: {
      id: addendumId,
      organizationId,
      projectId,
    },
  });

  if (!existingAddendum) {
    throw new Error("Addendum not found");
  }

  if (existingAddendum.status === "CANCELLED") {
    throw new Error("Addendum is already cancelled");
  }

  return prisma.addendum.update({
    where: {
      id: addendumId,
    },
    data: {
      status: "CANCELLED",
    },
  });
};

// ==========================================
// DELETE ADDENDUM
// ==========================================

export const deleteAddendum = async (
  organizationId: string,
  projectId: string,
  addendumId: string
) => {
  const existingAddendum = await prisma.addendum.findFirst({
    where: {
      id: addendumId,
      organizationId,
      projectId,
    },
  });

  if (!existingAddendum) {
    throw new Error("Addendum not found");
  }

  if (existingAddendum.status !== "DRAFT") {
    throw new Error("Only draft addendum can be deleted");
  }

  return prisma.addendum.delete({
    where: {
      id: addendumId,
    },
  });
};