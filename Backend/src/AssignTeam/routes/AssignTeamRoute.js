import express from "express";
import {
  assignTeam,
  getTeamByProject,
  getAllTeamAssignments,
  updateAssignmentStatus,
  getUserAssignments
} from "../controllers/AssignTeamController.js";
import { verifyToken } from "../../Middleware/auth.js";

const router = express.Router();

// Assign team to a project (requires authentication)
router.post("/assign", verifyToken, assignTeam);

// Get team assignment for a specific project (requires authentication)
router.get("/project/:projectId", verifyToken, getTeamByProject);

// Get all team assignments (for admin)
router.get("/all", verifyToken, getAllTeamAssignments);

// Update assignment status
router.patch('/:id/status', updateAssignmentStatus);

// Get assignments relevant to a specific user
router.get('/user-assignments', getUserAssignments);

export default router;
