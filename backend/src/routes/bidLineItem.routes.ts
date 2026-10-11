import { Router } from "express";

import {
  createBidLineItemController,
  getBidLineItemsController,
  getBidLineItemByIdController,
  updateBidLineItemController,
  deleteBidLineItemController,
} from "../controllers/bidLineItem.controller";

const router = Router();

// ==========================================
// BID LINE ITEMS
// ==========================================

// Create line item
router.post(
  "/organizations/:organizationId/bids/:bidId/line-items",
  createBidLineItemController
);

// Get all line items
router.get(
  "/organizations/:organizationId/bids/:bidId/line-items",
  getBidLineItemsController
);

// Get single line item
router.get(
  "/organizations/:organizationId/bids/:bidId/line-items/:lineItemId",
  getBidLineItemByIdController
);

// Update line item
router.patch(
  "/organizations/:organizationId/bids/:bidId/line-items/:lineItemId",
  updateBidLineItemController
);

// Delete line item
router.delete(
  "/organizations/:organizationId/bids/:bidId/line-items/:lineItemId",
  deleteBidLineItemController
);

export default router;