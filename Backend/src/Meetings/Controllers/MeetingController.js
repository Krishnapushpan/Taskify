import Meeting from '../models/MeetingModel.js';

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const { projectCreator, fullName, projectName, dueDate, meetingDateTime } = req.body;
    if (!projectCreator || !projectName || !dueDate || !meetingDateTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const meeting = new Meeting({
      projectCreator,
      fullName,
      projectName,
      dueDate,
      meetingDateTime
    });
    await meeting.save();
    res.status(201).json({ message: 'Meeting scheduled successfully', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Failed to schedule meeting', error: error.message });
  }
};

// Get all meetings (for testing)
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings', error: error.message });
  }
};

// Get meetings created by a specific client
export const getMeetingsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const meetings = await Meeting.find({ projectCreator: clientId }).sort({ createdAt: -1 });
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings', error: error.message });
  }
};

