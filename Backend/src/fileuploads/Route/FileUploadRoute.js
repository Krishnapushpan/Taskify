import express from "express";
import multer from "multer";
import { uploadFile, getFiles, downloadFile, deleteFile, getFilesByUploadedBy } from "../Controller/FileUploadController.js";
import { verifyToken } from "../../Middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Upload a file
router.post("/", verifyToken, upload.single("file"), uploadFile);

// Get all files (optionally filter by project or user)
router.get("/", verifyToken, getFiles);

// Download a file by ID
router.get("/:id", verifyToken, downloadFile);

// Delete a file by ID
router.delete("/:id", verifyToken, deleteFile);

// Get files uploaded by a specific user (uploadedBy)
router.get("/uploaded-by/:uploadedBy", verifyToken, getFilesByUploadedBy);

export default router;
