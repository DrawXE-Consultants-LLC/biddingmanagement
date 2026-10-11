import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import {
  getMyInvitationsController,
  getMyInvitationByIdController,
  respondToInvitationController,
  getBidderWorkspaceController,
  getBidderProjectDocumentsController,
  getMyBidForInvitationController,
  saveMyBidDraftController,
  submitMyBidForInvitationController,
  askBidderClarificationController,
  getMyBidderClarificationsController,
  getMyBidderAddendaController,
  downloadBidderDocumentController,
  getMyBidLineItemsController,
  createMyBidLineItemController,
  updateMyBidLineItemController,
  deleteMyBidLineItemController,
  getMyBidSummaryController,
} from "../controllers/bidderPortal.controller";

const router = Router();

// ==========================================
// BIDDER PORTAL — AUTHENTICATED ROUTES
// ==========================================

// Get invitations for the logged-in user
router.get(
  "/bidder-portal/invitations",
  authenticate,
  getMyInvitationsController
);

// Get one invitation
router.get(
  "/bidder-portal/invitations/:invitationId",
  authenticate,
  getMyInvitationByIdController
);

// Accept or decline an invitation
router.patch(
  "/bidder-portal/invitations/:invitationId/respond",
  authenticate,
  respondToInvitationController
);

// Get workspace for an accepted invitation
router.get(
  "/bidder-portal/invitations/:invitationId/workspace",
  authenticate,
  getBidderWorkspaceController
);

// Get documents for an accepted invitation
router.get(
  "/bidder-portal/invitations/:invitationId/documents",
  authenticate,
  getBidderProjectDocumentsController
);

// ==========================================
// BID
// ==========================================

// Get my bid
router.get(
  "/bidder-portal/invitations/:invitationId/bid",
  authenticate,
  getMyBidForInvitationController
);

// Save or update bid draft
router.put(
  "/bidder-portal/invitations/:invitationId/bid/draft",
  authenticate,
  saveMyBidDraftController
);

// Submit bid
router.patch(
  "/bidder-portal/invitations/:invitationId/bid/submit",
  authenticate,
  submitMyBidForInvitationController
);

// Get bidder bid summary
router.get(
  "/bidder-portal/invitations/:invitationId/bid/summary",
  authenticate,
  getMyBidSummaryController
);

// ==========================================
// CLARIFICATIONS
// ==========================================

// Ask a question
router.post(
  "/bidder-portal/invitations/:invitationId/clarifications",
  authenticate,
  askBidderClarificationController
);

// Get my questions and answers
router.get(
  "/bidder-portal/invitations/:invitationId/clarifications",
  authenticate,
  getMyBidderClarificationsController
);

// ==========================================
// ADDENDA
// ==========================================

// Get published addenda
router.get(
  "/bidder-portal/invitations/:invitationId/addenda",
  authenticate,
  getMyBidderAddendaController
);

// ==========================================
// DOCUMENT DOWNLOAD
// ==========================================

router.get(
  "/bidder-portal/invitations/:invitationId/documents/:documentId/download",
  authenticate,
  downloadBidderDocumentController
);

// ==========================================
// BID LINE ITEMS
// ==========================================

// Get my bid line items
router.get(
  "/bidder-portal/invitations/:invitationId/bid/line-items",
  authenticate,
  getMyBidLineItemsController
);

// Create bid line item
router.post(
  "/bidder-portal/invitations/:invitationId/bid/line-items",
  authenticate,
  createMyBidLineItemController
);

// Update bid line item
router.patch(
  "/bidder-portal/invitations/:invitationId/bid/line-items/:lineItemId",
  authenticate,
  updateMyBidLineItemController
);

// Delete bid line item
router.delete(
  "/bidder-portal/invitations/:invitationId/bid/line-items/:lineItemId",
  authenticate,
  deleteMyBidLineItemController
);

export default router;