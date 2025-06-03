import express from 'express';
import { createMeeting, getAllMeetings, getMeetingsByClient } from '../Controllers/MeetingController.js';

const router = express.Router();

// Create a new meeting
router.post('/', createMeeting);

// Get all meetings (for testing)
router.get('/', getAllMeetings);

// Get meetings created by a specific client
router.get('/client/:clientId', getMeetingsByClient);

export default router;

