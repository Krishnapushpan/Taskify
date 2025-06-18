import express from "express";
import multer from "multer";
import {
  createWorkAssignment,
  getAllWorkAssignments,
  getWorkAssignmentsByProject,
  updateWorkAssignmentStatus,
  deleteWorkAssignment,
  // getPersonalWork,
  getUserWorkAssignments,
  getWorkAssignmentsByTeamLead,
  updateWorkAssignmentPercentage,
  getWorkCountsByUserRole,
  getWorkAssignmentsByProjectWithStatus,
  getWorkCountsByProject,
  getWorkAssignmentsByProjectStatusLogic,
  getProjectsByTeamLead,
  getWorkAssignmentsByProjectNameStatusLogic,
  getWorkCounts,
  getPersonalWorkAssignments,
  getWorkFile
} from "../controllers/AssignWorkController.js";
import { verifyToken } from "../../Middleware/auth.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Create new work assignment with file upload
router.post("/", verifyToken, upload.single('workFile'), createWorkAssignment);

// Get all work assignments
router.get("/all", verifyToken, getAllWorkAssignments);

// Get work assignments by project ID
router.get("/project/:projectId", verifyToken, getWorkAssignmentsByProject);
router.get(
  "/assignments/project/:projectId",
  verifyToken,
  getWorkAssignmentsByProject
);

// // Get personal work assignments
// router.get("/personal/:userId", verifyToken, getPersonalWorkAssignments);

// // Get work assignments by team lead (or all if no filter)
// router.get("/by-teamlead", verifyToken, getWorkAssignmentsByTeamLead);

// Update work assignment status
router.put("/:id/status", verifyToken, upload.single('workFile'), updateWorkAssignmentStatus);

// Delete work assignment
router.delete("/:id", verifyToken, deleteWorkAssignment);

// Get personal work assignments for a user (userId as path param)
router.get("/personal", getPersonalWorkAssignments);

// Get work assignments by team lead (or all if no filter)
router.get("/", getWorkAssignmentsByTeamLead);

// Update work assignment percentage
router.patch('/:id/percentage', verifyToken, updateWorkAssignmentPercentage);

// Get work counts by user role
router.get("/counts/by-role", getWorkCountsByUserRole);

// Get work assignments by project with optional status
router.get("/project/:projectId/assignments", getWorkAssignmentsByProjectWithStatus);

// Get work counts by project
router.get("/counts/project/:projectId", getWorkCountsByProject);

// Get work assignments by project status logic
router.get("/project/:projectId/assignments-by-status", getWorkAssignmentsByProjectStatusLogic);

// Get projects by team lead
router.get("/projects-by-teamlead", getProjectsByTeamLead);

// Get work assignments by project name and status
router.get("/project-by-name/:projectName/assignments-by-status", getWorkAssignmentsByProjectNameStatusLogic);

// Get work counts
router.get("/counts", getWorkCounts);

// Get work file
router.get("/:id/file", verifyToken, getWorkFile);

export default router;
