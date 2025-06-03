import express from "express";
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
  getPersonalWorkAssignments
} from "../controllers/AssignWorkController.js";
import { verifyToken } from "../../Middleware/auth.js";

const router = express.Router();

// Create new work assignment
router.post("/create", verifyToken, createWorkAssignment);

// Alternative endpoint for creating assignments (used in frontend)
router.post("/assignments/create", verifyToken, createWorkAssignment);

// Get all work assignments
router.get("/all", verifyToken, getAllWorkAssignments);

// Get work assignments by project ID
router.get("/project/:projectId", verifyToken, getWorkAssignmentsByProject);
router.get(
  "/assignments/project/:projectId",
  verifyToken,
  getWorkAssignmentsByProject
);

// Update work assignment status
router.put("/:id/status", verifyToken, updateWorkAssignmentStatus);

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

export default router;
