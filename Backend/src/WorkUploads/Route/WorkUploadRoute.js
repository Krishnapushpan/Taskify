import express from "express";
import multer from "multer";
import {
  uploadWorkFile,
  getWorkUploads,
  downloadWorkFile,
  deleteWorkFile,
  getWorkUploadsByUser,
  getWorkUploadsByTeamLead,
} from "../controllers/WorkUploadController.js";
import { verifyToken } from "../../Middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Upload a work file (supports: projectName, description, uploadedBy, teamlead, file)
router.post("/", verifyToken, upload.single("file"), uploadWorkFile);

// Get all work uploads (optionally filter by project, user, or teamlead)
router.get("/", verifyToken, getWorkUploads);

// Download a work file by ID
router.get("/:id", verifyToken, downloadWorkFile);

// Delete a work file by ID
router.delete("/:id", verifyToken, deleteWorkFile);

// Get work uploads for a specific user (uploadedBy)
router.get("/user/:uploadedBy", verifyToken, getWorkUploadsByUser);

// Get work uploads for a specific team lead
router.get("/teamlead/:teamlead", verifyToken, getWorkUploadsByTeamLead);

export default router;
