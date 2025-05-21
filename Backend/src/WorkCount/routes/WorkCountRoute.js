import express from "express";
import {
  getWorkCounts,
  getUserWorkCounts,
} from "../controllers/WorkCountController.js";
import { verifyToken } from "../../Middleware/auth.js";

const router = express.Router();

// Get overall work counts (for admins/dashboard)
router.get("/counts", verifyToken, getWorkCounts);

// Get work counts for a specific user
router.get("/user/:userId/counts", verifyToken, getUserWorkCounts);

export default router;
