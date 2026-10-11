import { prisma } from "../config/database";

// ==========================================
// CREATE BID LINE ITEM
// ==========================================

export const createBidLineItem = async (
  organizationId: string,
  bidId: string,
  data: {
    name: string;
    description?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    totalPrice?: number;
  }
) => {
  const bid = await prisma.bid.findFirst({
    where: {
      id: bidId,
      organizationId,
    },
  });

  if (!bid) {
    throw new Error("Bid not found");
  }

  const totalPrice =
    data.totalPrice ??
    (data.quantity !== undefined && data.unitPrice !== undefined
      ? data.quantity * data.unitPrice
      : undefined);

  const lineItem = await prisma.bidLineItem.create({
    data: {
      bidId,
      organizationId,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      totalPrice,
    },
  });

  return lineItem;
};

// ==========================================
// GET ALL BID LINE ITEMS
// ==========================================

export const getBidLineItems = async (
  organizationId: string,
  bidId: string
) => {
  const bid = await prisma.bid.findFirst({
    where: {
      id: bidId,
      organizationId,
    },
  });

  if (!bid) {
    throw new Error("Bid not found");
  }

  return prisma.bidLineItem.findMany({
    where: {
      bidId,
      organizationId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

// ==========================================
// GET SINGLE BID LINE ITEM
// ==========================================

export const getBidLineItemById = async (
  organizationId: string,
  bidId: string,
  lineItemId: string
) => {
  const lineItem = await prisma.bidLineItem.findFirst({
    where: {
      id: lineItemId,
      bidId,
      organizationId,
    },
  });

  if (!lineItem) {
    throw new Error("Bid line item not found");
  }

  return lineItem;
};

// ==========================================
// UPDATE BID LINE ITEM
// ==========================================

export const updateBidLineItem = async (
  organizationId: string,
  bidId: string,
  lineItemId: string,
  data: {
    name?: string;
    description?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    totalPrice?: number;
  }
) => {
  const existingItem = await prisma.bidLineItem.findFirst({
    where: {
      id: lineItemId,
      bidId,
      organizationId,
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

  const totalPrice =
    data.totalPrice ??
    (quantity !== undefined && unitPrice !== undefined
      ? quantity * unitPrice
      : existingItem.totalPrice !== null
        ? Number(existingItem.totalPrice)
        : undefined);

  return prisma.bidLineItem.update({
    where: {
      id: lineItemId,
    },
    data: {
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      totalPrice,
    },
  });
};

// ==========================================
// DELETE BID LINE ITEM
// ==========================================

export const deleteBidLineItem = async (
  organizationId: string,
  bidId: string,
  lineItemId: string
) => {
  const existingItem = await prisma.bidLineItem.findFirst({
    where: {
      id: lineItemId,
      bidId,
      organizationId,
    },
  });

  if (!existingItem) {
    throw new Error("Bid line item not found");
  }

  return prisma.bidLineItem.delete({
    where: {
      id: lineItemId,
    },
  });
};