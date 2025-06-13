import express from "express";
import {
  assignTeam,
  getTeamByProject,
  getAllTeamAssignments,
  updateAssignmentStatus,
  getUserAssignments,
  getAssignmentsByProjectCreator,
  searchAssignmentsByProjectName,
  updateAssignmentPercentage,
  getAssignedUsersForProject,
  getProjectCountsByClient,
  getAssignmentFile,
  getProjectsAssignedToUser,
  getAllProjects,
  updateProjectStatus
} from "../controllers/AssignTeamController.js";
import { verifyToken } from "../../Middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/admin/all-projects", verifyToken, getAllProjects);
router.get("/admin/all-assignments", verifyToken, getAllTeamAssignments);
router.patch("/admin/project/:projectId/status", verifyToken, updateProjectStatus);

// Assign team to a project (requires authentication)
router.post("/assign", verifyToken, assignTeam);

// Get team assignment for a specific project (requires authentication)
router.get("/project/:projectId", verifyToken, getTeamByProject);

// Get all team assignments (for admin)
router.get("/all", verifyToken, getAllTeamAssignments);

// Update assignment status
router.patch("/:id/status", updateAssignmentStatus);

// Get assignments relevant to a specific user
router.get("/user-assignments", getUserAssignments);

// Get assignments for projects created by a specific user (client)
router.get('/by-project-creator', getAssignmentsByProjectCreator);

// Search assignments for projects created by a client and project name
router.get('/search-by-project-name', searchAssignmentsByProjectName);

// Update assignment percentage
router.patch('/:id/percentage', verifyToken, updateAssignmentPercentage);

// Get assigned users (team members and students) for a project
router.get('/assigned-users/:projectId', getAssignedUsersForProject);

// Get project counts for a client (projectCreator)
router.get('/project-counts/:clientId', getProjectCountsByClient);

// Get assignment file
router.get("/file/:id", getAssignmentFile);

// Get projects assigned to a user
router.get("/projects-by-user", getProjectsAssignedToUser);

export default router;
