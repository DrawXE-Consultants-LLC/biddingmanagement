import { Request, Response } from "express";
import {
  createBidLineItem,
  getBidLineItems,
  getBidLineItemById,
  updateBidLineItem,
  deleteBidLineItem,
} from "../services/bidLineItem.service";

// ==========================================
// CREATE BID LINE ITEM
// ==========================================

export const createBidLineItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidId = String(req.params.bidId);

    const {
      name,
      description,
      quantity,
      unit,
      unitPrice,
      totalPrice,
    } = req.body;

    if (!organizationId || !bidId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Bid ID are required",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const lineItem = await createBidLineItem(
      organizationId,
      bidId,
      {
        name,
        description,
        quantity,
        unit,
        unitPrice,
        totalPrice,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Bid line item created successfully",
      data: lineItem,
    });
  } catch (error: any) {
    console.error("Create Bid Line Item Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create bid line item",
    });
  }
};

// ==========================================
// GET ALL BID LINE ITEMS
// ==========================================

export const getBidLineItemsController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidId = String(req.params.bidId);

    if (!organizationId || !bidId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Bid ID are required",
      });
    }

    const lineItems = await getBidLineItems(
      organizationId,
      bidId
    );

    return res.status(200).json({
      success: true,
      message: "Bid line items fetched successfully",
      data: lineItems,
    });
  } catch (error: any) {
    console.error("Get Bid Line Items Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch bid line items",
    });
  }
};

// ==========================================
// GET SINGLE BID LINE ITEM
// ==========================================

export const getBidLineItemByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidId = String(req.params.bidId);
    const lineItemId = String(req.params.lineItemId);

    if (!organizationId || !bidId || !lineItemId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Bid ID and Line Item ID are required",
      });
    }

    const lineItem = await getBidLineItemById(
      organizationId,
      bidId,
      lineItemId
    );

    return res.status(200).json({
      success: true,
      message: "Bid line item fetched successfully",
      data: lineItem,
    });
  } catch (error: any) {
    console.error("Get Bid Line Item Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch bid line item",
    });
  }
};

// ==========================================
// UPDATE BID LINE ITEM
// ==========================================

export const updateBidLineItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidId = String(req.params.bidId);
    const lineItemId = String(req.params.lineItemId);

    if (!organizationId || !bidId || !lineItemId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Bid ID and Line Item ID are required",
      });
    }

    const {
      name,
      description,
      quantity,
      unit,
      unitPrice,
      totalPrice,
    } = req.body;

    const updatedLineItem = await updateBidLineItem(
      organizationId,
      bidId,
      lineItemId,
      {
        name,
        description,
        quantity,
        unit,
        unitPrice,
        totalPrice,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Bid line item updated successfully",
      data: updatedLineItem,
    });
  } catch (error: any) {
    console.error("Update Bid Line Item Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update bid line item",
    });
  }
};

// ==========================================
// DELETE BID LINE ITEM
// ==========================================

export const deleteBidLineItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = String(req.params.organizationId);
    const bidId = String(req.params.bidId);
    const lineItemId = String(req.params.lineItemId);

    if (!organizationId || !bidId || !lineItemId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization ID, Bid ID and Line Item ID are required",
      });
    }

    await deleteBidLineItem(
      organizationId,
      bidId,
      lineItemId
    );

    return res.status(200).json({
      success: true,
      message: "Bid line item deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Bid Line Item Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete bid line item",
    });
  }
};