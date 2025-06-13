import express from "express";
import userRoutes from "./User/routes/UsersRoute.js";
import projectRoutes from "./Project/routes/ProjectRoute.js";
import assignTeamRoutes from "./AssignTeam/routes/AssignTeamRoute.js";
import assignWorkRoutes from "./AssignWork/routes/AssignWorkRoute.js";
import workCountRoutes from "./WorkCount/routes/WorkCountRoute.js";
import meetingRoutes from "./Meetings/routes/MeetingRoute.js";
import notificationRoutes from "./Notification/routes/NotificationRoute.js";
import fileUploadRoutes from "./fileuploads/Route/FileUploadRoute.js";
import workUploadRoutes from "./WorkUploads/Route/WorkUploadRoute.js";
const router = express.Router();

// User routes
router.use("/users", userRoutes);

// Project routes
router.use("/projects", projectRoutes);

// Assign Team routes
router.use("/teams", assignTeamRoutes);

// Assign Work routes
router.use("/works", assignWorkRoutes);

// Work Count routes
router.use("/work", workCountRoutes);

// Meeting routes
router.use("/meetings", meetingRoutes);

// Notification routes
router.use("/notifications", notificationRoutes);

// File Upload routes
router.use("/file-uploads", fileUploadRoutes);

// Work Upload routes
router.use("/work-uploads", workUploadRoutes);

export default router;
