import AssignWork from "../models/AssignWorkModel.js";

// Create new work assignment
export const createWorkAssignment = async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      workDescription,
      teamMemberIds,
      studentIds,
      dueDate,
      priority,
      status,
      teamLeadId,
    } = req.body;

    // Create assignment object with required fields
    const assignmentData = {
      projectId,
      projectName,
      workDescription,
      teamMembers: teamMemberIds,
      students: studentIds,
    };

    // Add optional fields if they exist
    if (dueDate) {
      assignmentData.dueDate = dueDate;
    }

    if (priority) {
      assignmentData.priority = priority;
    }

    if (status) {
      assignmentData.status = status;
    }

    if (teamLeadId) {
      assignmentData.teamLead = teamLeadId;
    }

    const newAssignment = new AssignWork(assignmentData);

    await newAssignment.save();

    res.status(201).json({
      message: "Work assigned successfully",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Create work assignment error:", error);
    res.status(500).json({
      message: "Failed to assign work",
      error: error.message,
    });
  }
};

// Get all work assignments
export const getAllWorkAssignments = async (req, res) => {
  try {
    const assignments = await AssignWork.find()
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Get work assignments error:", error);
    res.status(500).json({
      message: "Failed to fetch work assignments",
      error: error.message,
    });
  }
};

// Get work assignments by project ID
export const getWorkAssignmentsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const assignments = await AssignWork.find({ projectId })
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Get project work assignments error:", error);
    res.status(500).json({
      message: "Failed to fetch project work assignments",
      error: error.message,
    });
  }
};

// Update work assignment status
export const updateWorkAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedAssignment = await AssignWork.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({ message: "Work assignment not found" });
    }

    res.status(200).json({
      message: "Work assignment status updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Update work assignment error:", error);
    res.status(500).json({
      message: "Failed to update work assignment",
      error: error.message,
    });
  }
};

// Delete work assignment
export const deleteWorkAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAssignment = await AssignWork.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return res.status(404).json({ message: "Work assignment not found" });
    }

    res.status(200).json({
      message: "Work assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete work assignment error:", error);
    res.status(500).json({
      message: "Failed to delete work assignment",
      error: error.message,
    });
  }
};

export const getPersonalWork = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId", userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find assignments where the user is a team member or student
    const assignments = await AssignWork.find({
      $or: [
        { teamMembers: userId },
        { students: userId }
      ]
    })
      .populate("project", "projectName description startDate endDate")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to get personal work", error: error.message });
  }
};

// Get all work assignments for a specific user (team member or student)
export const getUserWorkAssignments = async (req, res) => {
  try {
    // You can use req.query.userId or req.params.userId depending on your route
    const userId = req.params.userId || req.query.userId;
    console.log("userId", userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find assignments where the user is a team member or student
    const assignments = await AssignWork.find({
      $or: [
        { teamMembers: userId },
        { students: userId }
      ]
    })
      .populate("projectName", "projectName description startDate endDate")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
    console.log("assignments", assignments);
  } catch (error) {
    console.error("Get user work assignments error:", error);
    res.status(500).json({
      message: "Failed to get user work assignments",
      error: error.message,
    });
  }
};

// Get work assignments by team lead
export const getWorkAssignmentsByTeamLead = async (req, res) => {
  try {
    const { teamLead } = req.query;
    let filter = {};
    if (teamLead) {
      filter.teamLead = teamLead;
    }
    const assignments = await AssignWork.find(filter)
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .populate("teamLead", "fullName email role position")
      .sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Get work assignments by team lead error:", error);
    res.status(500).json({
      message: "Failed to fetch work assignments by team lead",
      error: error.message,
    });
  }
};
