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
      percentage
    } = req.body;

    // Create assignment object with required fields
    const assignmentData = {
      projectId,
      projectName,
      workDescription,
      teamMembers: teamMemberIds,
      students: studentIds,
      percentage: percentage || 0
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
      .populate("teamLead", "fullName email role position")
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
      .populate("teamLead", "fullName email role position")
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
      .populate("projectId", "projectName description startDate endDate")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .populate("teamLead", "fullName email role position")
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
      .populate("teamLead", "fullName email role position")
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

// Update only the percentage field
export const updateWorkAssignmentPercentage = async (req, res) => {
  try {
    const { id } = req.params;
    const { percentage } = req.body;
    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: "Percentage must be between 0 and 100" });
    }
    const assignment = await AssignWork.findByIdAndUpdate(
      id,
      { $set: { percentage } },
      { new: true, runValidators: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: "Work assignment not found" });
    }
    res.status(200).json({ message: "Percentage updated", assignment });
  } catch (error) {
    res.status(500).json({ message: "Failed to update percentage", error: error.message });
  }
};

// Get work counts by user role
export const getWorkCountsByUserRole = async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId || !role) {
      return res.status(400).json({ message: "User ID and role are required" });
    }
    let filter = {};
    if (role === "Team Lead" || role === "team_lead" || role === "teamLead") {
      filter.teamLead = userId;
    } else if (role === "Team Member" || role === "team_member" || role === "teamMember") {
      filter.teamMembers = userId;
    } else if (role === "Student" || role === "student") {
      filter.students = userId;
    } else {
      return res.status(400).json({ message: "Unsupported role" });
    }
    const totalAssigned = await AssignWork.countDocuments(filter);
    const completed = await AssignWork.countDocuments({ ...filter, status: "Completed" });
    const pending = await AssignWork.countDocuments({ ...filter, status: "Pending" });
    const inProgress = await AssignWork.countDocuments({ ...filter, status: "In Progress" });
    // Overdue: dueDate < today and status != 'Completed'
    const today = new Date();
    const overdue = await AssignWork.countDocuments({
      ...filter,
      dueDate: { $lt: today },
      status: { $ne: "Completed" }
    });
    res.status(200).json({
      counts: {
        totalAssigned,
        completed,
        pending,
        inProgress,
        overdue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get work counts by user role", error: error.message });
  }
};

// Get work assignments for a project, with optional status filter and remaining days
export const getWorkAssignmentsByProjectWithStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    let filter = { projectId };
    if (status && status !== "all") {
      filter.status = status;
    }
    let assignments = await AssignWork.find(filter)
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .populate("teamLead", "fullName email role position")
      .sort({ createdAt: -1 });
    // Add remainingDays field
    assignments = assignments.map(a => {
      let remainingDays = null;
      if (a.dueDate) {
        const today = new Date();
        const due = new Date(a.dueDate);
        remainingDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      }
      return { ...a.toObject(), remainingDays };
    });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments by project and status", error: error.message });
  }
};

// Get work counts for a specific project
export const getWorkCountsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    const filter = { projectId };
    const totalAssigned = await AssignWork.countDocuments(filter);
    const completed = await AssignWork.countDocuments({ ...filter, status: "Completed" });
    const pending = await AssignWork.countDocuments({ ...filter, status: "Pending" });
    const inProgress = await AssignWork.countDocuments({ ...filter, status: "In Progress" });
    res.status(200).json({
      counts: {
        totalAssigned,
        completed,
        pending,
        inProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get work counts by project", error: error.message });
  }
};

// Get work assignments for a project with custom status logic
export const getWorkAssignmentsByProjectStatusLogic = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    let filter = { projectId };
    if (status && status !== "all") {
      filter.status = status;
    }
    let assignments = await AssignWork.find(filter)
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .populate("teamLead", "fullName email role position")
      .sort({ createdAt: -1 });
    const today = new Date();
    assignments = assignments.map(a => {
      let remainingDays = null;
      if (status === "Completed") {
        remainingDays = 0;
      } else if (a.dueDate) {
        const due = new Date(a.dueDate);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (status === "Pending") {
          remainingDays = diff < 0 ? `Overdue by ${-diff} days` : diff;
        } else {
          remainingDays = diff;
        }
      }
      return { ...a.toObject(), remainingDays };
    });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments by project and status logic", error: error.message });
  }
};

// Get unique projects for a team lead
export const getProjectsByTeamLead = async (req, res) => {
  try {
    const { teamLead } = req.query;
    if (!teamLead) {
      return res.status(400).json({ message: "Team lead ID is required" });
    }
    // Find all assignments for this team lead
    const assignments = await AssignWork.find({ teamLead })
      .populate("projectId", "projectName description startDate endDate");
    // Extract unique projects
    const uniqueProjects = {};
    assignments.forEach(a => {
      if (a.projectId && !uniqueProjects[a.projectId._id]) {
        uniqueProjects[a.projectId._id] = a.projectId;
      }
    });
    res.status(200).json(Object.values(uniqueProjects));
  } catch (error) {
    res.status(500).json({ message: "Failed to get projects by team lead", error: error.message });
  }
};

// Get work assignments by project name and status, with remaining days
export const getWorkAssignmentsByProjectNameStatusLogic = async (req, res) => {
  try {
    const { projectName } = req.params;
    const { status } = req.query;
    if (!projectName) {
      return res.status(400).json({ message: "Project name is required" });
    }
    let filter = { projectName: { $regex: new RegExp(`^${projectName}$`, 'i') } };
    if (status && status !== "all") {
      filter.status = status;
    }
    let assignments = await AssignWork.find(filter)
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .populate("teamLead", "fullName email role position")
      .sort({ createdAt: -1 });
    const today = new Date();
    assignments = assignments.map(a => {
      let remainingDays = null;
      if (status === "Completed") {
        remainingDays = 0;
      } else if (a.dueDate) {
        const due = new Date(a.dueDate);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (status === "Pending") {
          remainingDays = diff < 0 ? `Overdue by ${-diff} days` : diff;
        } else {
          remainingDays = diff;
        }
      }
      return { ...a.toObject(), remainingDays };
    });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments by project name and status", error: error.message });
  }
};

// Add a global work counts endpoint with overdue
export const getWorkCounts = async (req, res) => {
  try {
    const totalAssigned = await AssignWork.countDocuments();
    const completed = await AssignWork.countDocuments({ status: "Completed" });
    const pending = await AssignWork.countDocuments({ status: "Pending" });
    const inProgress = await AssignWork.countDocuments({ status: "In Progress" });
    // Overdue: dueDate < today and status != 'Completed'
    const today = new Date();
    const overdue = await AssignWork.countDocuments({
      dueDate: { $lt: today },
      status: { $ne: "Completed" }
    });
    res.status(200).json({
      counts: {
        totalAssigned,
        completed,
        pending,
        inProgress,
        overdue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get global work counts", error: error.message });
  }
};

// Get all work assignments for a user (team member or student)
export const getPersonalWorkAssignments = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const assignments = await AssignWork.find({
      $or: [
        { teamMembers: userId },
        { students: userId }
      ]
    })
      .populate("projectId", "projectName description startDate endDate")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .populate("teamLead", "fullName email role position")
      .sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to get personal work assignments", error: error.message });
  }
};
