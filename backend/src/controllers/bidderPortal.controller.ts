import { Request, Response } from "express";

import {
  getMyInvitations,
  getMyInvitationById,
  respondToInvitation,
  getBidderWorkspace,
  getBidderProjectDocuments,
  getMyBidForInvitation,
  saveMyBidDraft,
  submitMyBidForInvitation,
  askBidderClarification,
  getMyBidderClarifications,
  getMyBidderAddenda,
  getBidderDocumentForDownload,
  getMyBidLineItemsForInvitation,
  createMyBidLineItem,
  updateMyBidLineItem,
  deleteMyBidLineItem,
  getMyBidSummaryForInvitation,
} from "../services/bidderPortal.service";

// ==========================================
// GET AUTHENTICATED USER ID
// ==========================================

const getAuthenticatedUserId = (
  req: Request
): string | null => {
  const authRequest = req as Request & {
    user?: {
      id?: string;
    };
  };

  const userId = authRequest.user?.id;

  return typeof userId === "string" && userId.trim()
    ? userId
    : null;
};

// ==========================================
// GET MY INVITATIONS
// ==========================================

export const getMyInvitationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const invitations = await getMyInvitations(userId);

    return res.status(200).json({
      success: true,
      message: "Your invitations fetched successfully",
      data: invitations,
    });
  } catch (error: unknown) {
    console.error("Get My Invitations Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch invitations";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

// ==========================================
// GET SINGLE INVITATION
// ==========================================

export const getMyInvitationByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;

    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const invitation = await getMyInvitationById(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Invitation details fetched successfully",
      data: invitation,
    });
  } catch (error: unknown) {
    console.error("Get My Invitation Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch invitation";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

// ==========================================
// ACCEPT OR DECLINE INVITATION
// ==========================================

export const respondToInvitationController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;

    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const { decision } = req.body;

    if (
      decision !== "ACCEPTED" &&
      decision !== "DECLINED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Decision must be ACCEPTED or DECLINED",
      });
    }

    const invitation = await respondToInvitation(
      userId,
      invitationId,
      decision
    );

    return res.status(200).json({
      success: true,
      message:
        decision === "ACCEPTED"
          ? "Invitation accepted successfully"
          : "Invitation declined successfully",
      data: invitation,
    });
  } catch (error: unknown) {
    console.error("Respond To Invitation Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to respond to invitation";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};
// ==========================================
// GET BIDDER PROJECT WORKSPACE
// ==========================================

export const getBidderWorkspaceController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const workspace = await getBidderWorkspace(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Bidder workspace fetched successfully",
      data: workspace,
    });
  } catch (error: unknown) {
    console.error("Get Bidder Workspace Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch bidder workspace";

    const statusCode =
      message === "Accepted invitation not found or access denied"
        ? 404
        : message === "Organization account is not active"
          ? 403
          : 400;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// ==========================================
// GET DOCUMENTS FOR ACCEPTED INVITATION
// ==========================================

export const getBidderProjectDocumentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const documents = await getBidderProjectDocuments(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Bidder project documents fetched successfully",
      data: documents,
    });
  } catch (error: unknown) {
    console.error("Get Bidder Documents Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch bidder documents";

    const statusCode =
      message === "Accepted invitation not found or access denied"
        ? 404
        : message === "Organization account is not active"
          ? 403
          : 400;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};// ==========================================
// GET MY BID FOR AN INVITATION
// ==========================================

export const getMyBidForInvitationController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const bid = await getMyBidForInvitation(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Your bid fetched successfully",
      data: bid,
    });
  } catch (error: unknown) {
    console.error("Get My Bid Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch your bid",
    });
  }
};

// ==========================================
// SAVE MY BID DRAFT
// ==========================================

export const saveMyBidDraftController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const { amount, notes } = req.body;

    if (
      amount !== undefined &&
      (
        typeof amount !== "number" ||
        !Number.isFinite(amount)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number",
      });
    }

    if (
      notes !== undefined &&
      typeof notes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Notes must be a string",
      });
    }

    const bid = await saveMyBidDraft(
      userId,
      invitationId,
      {
        amount,
        notes,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Bid draft saved successfully",
      data: bid,
    });
  } catch (error: unknown) {
    console.error("Save Bid Draft Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to save bid draft",
    });
  }
};

// ==========================================
// SUBMIT MY BID
// ==========================================

export const submitMyBidForInvitationController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const bid = await submitMyBidForInvitation(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Bid submitted successfully",
      data: bid,
    });
  } catch (error: unknown) {
    console.error("Submit Bid Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit bid",
    });
  }
};
// ==========================================
// ASK QUESTION FROM BIDDER PORTAL
// ==========================================

export const askBidderClarificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const { question } = req.body;

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const clarification = await askBidderClarification(
      userId,
      invitationId,
      question
    );

    return res.status(201).json({
      success: true,
      message: "Question submitted successfully",
      data: clarification,
    });
  } catch (error: unknown) {
    console.error("Ask Bidder Clarification Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit question",
    });
  }
};

// ==========================================
// GET MY QUESTIONS AND ANSWERS
// ==========================================

export const getMyBidderClarificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const clarifications = await getMyBidderClarifications(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Your questions fetched successfully",
      data: clarifications,
    });
  } catch (error: unknown) {
    console.error("Get Bidder Clarifications Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch questions",
    });
  }
};
// ==========================================
// GET PUBLISHED ADDENDA
// ==========================================

export const getMyBidderAddendaController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const addenda = await getMyBidderAddenda(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Published addenda fetched successfully",
      data: addenda,
    });
  } catch (error: unknown) {
    console.error("Get Bidder Addenda Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch published addenda",
    });
  }
};
// ==========================================
// DOWNLOAD BIDDER PROJECT DOCUMENT
// ==========================================

export const downloadBidderDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawInvitationId = req.params.invitationId;
    const rawDocumentId = req.params.documentId;

    const invitationId = Array.isArray(rawInvitationId)
      ? rawInvitationId[0]
      : rawInvitationId;

    const documentId = Array.isArray(rawDocumentId)
      ? rawDocumentId[0]
      : rawDocumentId;

    if (!invitationId || !documentId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID and Document ID are required",
      });
    }

    const document = await getBidderDocumentForDownload(
      userId,
      invitationId,
      documentId
    );

    return res.download(
      document.filePath,
      document.originalName,
      {
        headers: {
          "Content-Type":
            document.fileType || "application/octet-stream",
        },
      },
      (error) => {
        if (error) {
          console.error("Bidder Document Download Error:", error);

          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Failed to download document",
            });
          }
        }
      }
    );
  } catch (error: unknown) {
    console.error("Download Bidder Document Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to download document";

    if (
      message === "Accepted invitation not found or access denied" ||
      message === "Document not found or access denied"
    ) {
      return res.status(404).json({
        success: false,
        message: "Document not found or access denied",
      });
    }

    if (message === "Organization account is not active") {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    if (message === "Document file is missing from storage") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
};
// ==========================================
// GET MY BID LINE ITEMS
// ==========================================

export const getMyBidLineItemsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const lineItems = await getMyBidLineItemsForInvitation(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Bid line items fetched successfully",
      data: lineItems,
    });
  } catch (error: unknown) {
    console.error("Get Bid Line Items Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch bid line items",
    });
  }
};

// ==========================================
// CREATE MY BID LINE ITEM
// ==========================================

export const createMyBidLineItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const {
      name,
      description,
      quantity,
      unit,
      unitPrice,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Line item name is required",
      });
    }

    if (
      quantity !== undefined &&
      (
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    if (
      unitPrice !== undefined &&
      (
        typeof unitPrice !== "number" ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Unit price must be a non-negative number",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    if (
      unit !== undefined &&
      typeof unit !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Unit must be a string",
      });
    }

    const lineItem = await createMyBidLineItem(
      userId,
      invitationId,
      {
        name,
        description,
        quantity,
        unit,
        unitPrice,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Bid line item created successfully",
      data: lineItem,
    });
  } catch (error: unknown) {
    console.error("Create Bid Line Item Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create bid line item",
    });
  }
};

// ==========================================
// UPDATE MY BID LINE ITEM
// ==========================================

export const updateMyBidLineItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawInvitationId = req.params.invitationId;
    const rawLineItemId = req.params.lineItemId;

    const invitationId = Array.isArray(rawInvitationId)
      ? rawInvitationId[0]
      : rawInvitationId;

    const lineItemId = Array.isArray(rawLineItemId)
      ? rawLineItemId[0]
      : rawLineItemId;

    if (!invitationId || !lineItemId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID and Line Item ID are required",
      });
    }

    const {
      name,
      description,
      quantity,
      unit,
      unitPrice,
    } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Line item name cannot be empty",
      });
    }

    if (
      quantity !== undefined &&
      (
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    if (
      unitPrice !== undefined &&
      (
        typeof unitPrice !== "number" ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Unit price must be a non-negative number",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    if (
      unit !== undefined &&
      typeof unit !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Unit must be a string",
      });
    }

    const lineItem = await updateMyBidLineItem(
      userId,
      invitationId,
      lineItemId,
      {
        name,
        description,
        quantity,
        unit,
        unitPrice,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Bid line item updated successfully",
      data: lineItem,
    });
  } catch (error: unknown) {
    console.error("Update Bid Line Item Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update bid line item",
    });
  }
};

// ==========================================
// DELETE MY BID LINE ITEM
// ==========================================

export const deleteMyBidLineItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawInvitationId = req.params.invitationId;
    const rawLineItemId = req.params.lineItemId;

    const invitationId = Array.isArray(rawInvitationId)
      ? rawInvitationId[0]
      : rawInvitationId;

    const lineItemId = Array.isArray(rawLineItemId)
      ? rawLineItemId[0]
      : rawLineItemId;

    if (!invitationId || !lineItemId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID and Line Item ID are required",
      });
    }

    await deleteMyBidLineItem(
      userId,
      invitationId,
      lineItemId
    );

    return res.status(200).json({
      success: true,
      message: "Bid line item deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete Bid Line Item Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete bid line item",
    });
  }
};
// ==========================================
// GET BIDDER BID SUMMARY
// ==========================================

export const getMyBidSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rawId = req.params.invitationId;
    const invitationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required",
      });
    }

    const summary = await getMyBidSummaryForInvitation(
      userId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Bid summary fetched successfully",
      data: summary,
    });
  } catch (error: unknown) {
    console.error("Get Bid Summary Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch bid summary",
    });
  }
};