import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignTeamToProject,
  getProjectWithTeam,
  getProjectFile,
} from "../controllers/ProjectController.js";
import { verifyToken } from "../../Middleware/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

// Create a new project (requires authentication)
router.post("/create", verifyToken, upload.single('projectFile'), createProject);

// Get all projects (temporarily removed auth for testing)
router.get("/all", verifyToken, getAllProjects);

// Get project by ID (requires authentication)
router.get("/:id", verifyToken, getProjectById);

// Get project with team details (requires authentication)
router.get("/:id/with-team", verifyToken, getProjectWithTeam);

// Get project file by ID (requires authentication)
router.get("/file/:id", verifyToken, getProjectFile);

// Update a project (requires authentication)
router.put("/:id", verifyToken, updateProject);

// Delete a project (requires authentication)
router.delete("/:id", verifyToken, deleteProject);

// Assign team members to a project (requires authentication)
router.post("/assign-team", verifyToken, assignTeamToProject);

export default router;
