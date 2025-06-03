import AssignTeam from "../models/AssignTeamModel.js";
import Project from "../../Project/models/ProjectModel.js";
import User from "../../User/models/UsersModel.js";

// Assign team members to a project
export const assignTeam = async (req, res) => {
  try {
    const { projectId, teamLeadId, teamMemberIds, studentIds, percentage } = req.body;

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Validate team lead exists if provided
    if (teamLeadId) {
      const teamLead = await User.findById(teamLeadId);
      if (!teamLead) {
        return res.status(404).json({ message: "Team lead not found" });
      }
      if (teamLead.role !== "Team Lead") {
        return res
          .status(400)
          .json({ message: "Selected user is not a team lead" });
      }
    }

    // Validate percentage if provided
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return res.status(400).json({ message: "Percentage must be between 0 and 100" });
    }

    // Check if an assignment already exists for this project
    const existingAssignment = await AssignTeam.findOne({ project: projectId });

    if (existingAssignment) {
      // Update existing assignment
      existingAssignment.teamLead = teamLeadId || existingAssignment.teamLead;
      existingAssignment.teamMembers =
        teamMemberIds || existingAssignment.teamMembers;
      existingAssignment.students = studentIds || existingAssignment.students;
      if (req.body.projectName)
        existingAssignment.projectName = req.body.projectName;
      if (req.body.description)
        existingAssignment.description = req.body.description;
      if (req.body.startDate) existingAssignment.startDate = req.body.startDate;
      if (req.body.dueDate) existingAssignment.dueDate = req.body.dueDate;
      if (percentage !== undefined) existingAssignment.percentage = percentage;
      // Copy projectFile from Project
      if (project.projectFile && project.projectFile.data) {
        existingAssignment.projectFile = {
          data: project.projectFile.data,
          contentType: project.projectFile.contentType,
          originalName: project.projectFile.originalName,
        };
      }
      await existingAssignment.save();

      // Populate details before sending response
      const updatedAssignment = await AssignTeam.findById(
        existingAssignment._id
      )
        .populate("project", "projectName description startDate endDate budget projectFile")
        .populate("teamLead", "fullName email role position")
        .populate("teamMembers", "fullName email role position")
        .populate("students", "fullName email role");

      return res.status(200).json({
        message: "Team assignment updated successfully",
        assignment: updatedAssignment,
      });
    } else {
      // Create new assignment
      const newAssignment = new AssignTeam({
        project: projectId,
        teamLead: teamLeadId,
        teamMembers: teamMemberIds,
        students: studentIds,
        projectName: req.body.projectName,
        description: req.body.description,
        startDate: req.body.startDate,
        dueDate: req.body.dueDate,
        projectCreator: project.addedBy,
        percentage: percentage || 0,
        // Copy projectFile from Project
        projectFile: project.projectFile && project.projectFile.data
          ? {
              data: project.projectFile.data,
              contentType: project.projectFile.contentType,
              originalName: project.projectFile.originalName,
            }
          : undefined,
      });

      await newAssignment.save();

      // Populate details before sending response
      const populatedAssignment = await AssignTeam.findById(newAssignment._id)
        .populate("project", "projectName description startDate endDate budget projectFile")
        .populate("teamLead", "fullName email role position")
        .populate("teamMembers", "fullName email role position")
        .populate("students", "fullName email role");

      return res.status(201).json({
        message: "Team assigned to project successfully",
        assignment: populatedAssignment,
      });
    }
  } catch (error) {
    console.error("Assign team error:", error);
    res
      .status(500)
      .json({ message: "Failed to assign team", error: error.message });
  }
};

// Get team assignment for a specific project
export const getTeamByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the team assignment for the given project
    const teamAssignment = await AssignTeam.findOne({ project: projectId })
      .populate("project", "projectName description startDate endDate budget projectFile")
      .populate("teamLead", "fullName email role position")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role");

    if (!teamAssignment) {
      return res
        .status(404)
        .json({ message: "No team assignment found for this project" });
    }

    res.status(200).json(teamAssignment);
  } catch (error) {
    console.error("Get team error:", error);
    res
      .status(500)
      .json({ message: "Failed to get team assignment", error: error.message });
  }
};

// Get all team assignments (for admin)
export const getAllTeamAssignments = async (req, res) => {
  try {
    const teamAssignments = await AssignTeam.find()
      .populate("project", "projectName description startDate endDate budget projectFile")
      .populate("teamLead", "fullName email role position")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(teamAssignments);
  } catch (error) {
    console.error("Get all team assignments error:", error);
    res.status(500).json({
      message: "Failed to get team assignments",
      error: error.message,
    });
  }
};

export const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const assignment = await AssignTeam.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    assignment.status = status;
    await assignment.save();
    res.status(200).json({ message: "Status updated", assignment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update status", error: error.message });
  }
};

// Get assignments relevant to a specific user
export const getUserAssignments = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find assignments where the user is a team lead, team member, or student
    const assignments = await AssignTeam.find({
      $or: [
        { teamLead: userId },
        { teamMembers: userId },
        { students: userId },
      ],
    })
      .populate("project", "projectName description startDate endDate budget projectFile")
      .populate("teamLead", "fullName email role position")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Get user assignments error:", error);
    res.status(500).json({
      message: "Failed to get user assignments",
      error: error.message,
    });
  }
};

// Get assignments for projects created by a specific user (projectCreator)
export const getAssignmentsByProjectCreator = async (req, res) => {
  try {
    const { creatorId } = req.query;
    if (!creatorId) {
      return res.status(400).json({ message: "Creator ID is required" });
    }

    const assignments = await AssignTeam.find({ projectCreator: creatorId })
      .populate("project", "projectName description startDate endDate budget projectFile")
      .populate("teamLead", "fullName email role position")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Get assignments by project creator error:", error);
    res.status(500).json({
      message: "Failed to get assignments by project creator",
      error: error.message,
    });
  }
};

// Search assignments by project name (case-insensitive, no creatorId)
export const searchAssignmentsByProjectName = async (req, res) => {
  try {
    const { projectName } = req.query;
    if (!projectName) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const assignments = await AssignTeam.find({
      projectName: { $regex: new RegExp(projectName, 'i') }
    })
      .populate("project", "projectName description startDate endDate budget projectFile")
      .populate("teamLead", "fullName email role position")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Search assignments by project name error:", error);
    res.status(500).json({
      message: "Failed to search assignments by project name",
      error: error.message,
    });
  }
};

// Update assignment percentage
export const updateAssignmentPercentage = async (req, res) => {
  try {
    const { id } = req.params;
    const { percentage } = req.body;

    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: "Percentage must be between 0 and 100" });
    }

    const assignment = await AssignTeam.findByIdAndUpdate(
      id,
      { $set: { percentage } },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ message: "Percentage updated", assignment });
  } catch (error) {
    console.error("Failed to update percentage:", error);
    res.status(500).json({ message: "Failed to update percentage", error: error.message });
  }
};

export const getAssignedUsersForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(projectId);
    const assignment = await AssignTeam.findOne({ _id: projectId })
      .populate('teamMembers', 'fullName email role position')
      .populate('students', 'fullName email role');
    if (!assignment) {
      return res.status(404).json({ message: 'No assignment found for this project' });
    }
    res.status(200).json({
      teamMembers: assignment.teamMembers,
      students: assignment.students,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assigned users', error: error.message });
  }
};

// Get project counts for a client (projectCreator)
export const getProjectCountsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Find all assignments for this client
    const assignments = await AssignTeam.find({ projectCreator: clientId });
    const total = assignments.length;
    let completed = 0, inProgress = 0, pending = 0;
    assignments.forEach(a => {
      const status = (a.status || "").toLowerCase();
      if (status === "completed") completed++;
      else if (status === "in progress" || status === "inprogress") inProgress++;
      else pending++;
    });
    res.status(200).json({
      counts: {
        total,
        completed,
        inProgress,
        pending
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project counts", error: error.message });
  }
};

// Serve the uploaded project file from AssignTeam
export const getAssignmentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await AssignTeam.findById(id);
    if (!assignment || !assignment.projectFile || !assignment.projectFile.data) {
      return res.status(404).json({ message: "File not found" });
    }
    res.set('Content-Type', assignment.projectFile.contentType);
    res.set('Content-Disposition', `inline; filename="${assignment.projectFile.originalName}"`);
    res.send(assignment.projectFile.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch file", error: error.message });
  }
};

// Get unique projects assigned to a user (team lead, team member, or student)
export const getProjectsAssignedToUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    // Find assignments where user is team lead, team member, or student
    const assignments = await AssignTeam.find({
      $or: [
        { teamLead: userId },
        { teamMembers: userId },
        { students: userId }
      ]
    }).populate("project", "projectName description startDate endDate");
    // Extract unique projects
    const uniqueProjects = {};
    assignments.forEach(a => {
      if (a.project && !uniqueProjects[a.project._id]) {
        uniqueProjects[a.project._id] = a.project;
      }
    });
    res.status(200).json(Object.values(uniqueProjects));
  } catch (error) {
    res.status(500).json({ message: "Failed to get projects for user", error: error.message });
  }
};
