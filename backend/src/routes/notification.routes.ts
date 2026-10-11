import { Router } from "express";

import {
  getMyNotificationsController,
  getUnreadNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
} from "../controllers/notification.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All notification routes require authentication.
router.use(authenticate);

router.get(
  "/users/:userId/notifications",
  getMyNotificationsController
);

router.get(
  "/users/:userId/notifications/unread",
  getUnreadNotificationsController
);

router.get(
  "/users/:userId/notifications/unread/count",
  getUnreadNotificationCountController
);

router.patch(
  "/users/:userId/notifications/:notificationId/read",
  markNotificationAsReadController
);

router.patch(
  "/users/:userId/notifications/read-all",
  markAllNotificationsAsReadController
);

router.delete(
  "/users/:userId/notifications/:notificationId",
  deleteNotificationController
);

export default router;