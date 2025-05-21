import express from "express";
import {
  registerUser,
  loginUser,
  createUser,
  getClients,
  getTeamMembers,
  getTeamLeads,
  getStudents,
  getUserCounts,
  updateUser,
  deleteUser,
} from "../controllers/UsersController.js";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Create user route (for admin)
router.post("/create", createUser);

// Get all clients route
router.get("/clients", getClients);

// Get all team members route
router.get("/team-members", getTeamMembers);

// Get all team leads route
router.get("/team-leads", getTeamLeads);

// Get all students route
router.get("/students", getStudents);

// Get user counts route (temporarily removed auth for testing)
router.get("/counts", getUserCounts);

// Update user by ID
router.put("/:id", updateUser);

// Delete user by ID
router.delete("/:id", deleteUser);

export default router;
