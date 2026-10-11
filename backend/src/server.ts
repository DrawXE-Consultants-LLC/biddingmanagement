import dotenv from "dotenv";

dotenv.config();

import app from "./app";

import projectRoutes from "./routes/project.routes";
import bidPackageRoutes from "./routes/bidPackage.routes";
import bidderRoutes from "./routes/bidder.routes";
import invitationRoutes from "./routes/invitation.routes";
import documentRoutes from "./routes/document.routes";
import bidRoutes from "./routes/bid.routes";
import bidLineItemRoutes from "./routes/bidLineItem.routes";
import clarificationRoutes from "./routes/clarification.routes";
import addendumRoutes from "./routes/addendum.routes";
import notificationRoutes from "./routes/notification.routes";
import auditLogRoutes from "./routes/auditLog.routes";
import platformAdminRoutes from "./routes/platformAdmin.routes";
import bidderPortalRoutes from "./routes/bidderPortal.routes";

// ==========================================
// API ROUTES
// ==========================================

app.use("/api", projectRoutes);
app.use("/api", bidPackageRoutes);
app.use("/api", bidderRoutes);
app.use("/api", documentRoutes);
app.use("/api", invitationRoutes);
app.use("/api", bidRoutes);
app.use("/api", bidLineItemRoutes);
app.use("/api", clarificationRoutes);
app.use("/api", addendumRoutes);
app.use("/api", notificationRoutes);
app.use("/api", auditLogRoutes);
app.use("/api/platform-admin", platformAdminRoutes);
app.use("/api", bidderPortalRoutes);
// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});