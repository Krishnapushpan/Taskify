import express from "express";
import {
  createWorkAssignment,
  getAllWorkAssignments,
  getWorkAssignmentsByProject,
  updateWorkAssignmentStatus,
  deleteWorkAssignment,
  // getPersonalWork,
  getUserWorkAssignments,
  getWorkAssignmentsByTeamLead
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
router.get("/personal", getUserWorkAssignments);

// Get work assignments by team lead (or all if no filter)
router.get("/", getWorkAssignmentsByTeamLead);

export default router;
