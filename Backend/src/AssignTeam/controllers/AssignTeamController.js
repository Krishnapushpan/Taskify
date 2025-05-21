import AssignTeam from "../models/AssignTeamModel.js";
import Project from "../../Project/models/ProjectModel.js";
import User from "../../User/models/UsersModel.js";

// Assign team members to a project
export const assignTeam = async (req, res) => {
  try {
    const { projectId, teamLeadId, teamMemberIds, studentIds } = req.body;

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

    // Check if an assignment already exists for this project
    const existingAssignment = await AssignTeam.findOne({ project: projectId });

    if (existingAssignment) {
      // Update existing assignment
      existingAssignment.teamLead = teamLeadId || existingAssignment.teamLead;
      existingAssignment.teamMembers =
        teamMemberIds || existingAssignment.teamMembers;
      existingAssignment.students = studentIds || existingAssignment.students;
      if (req.body.projectName) existingAssignment.projectName = req.body.projectName;
      if (req.body.description) existingAssignment.description = req.body.description;
      if (req.body.startDate) existingAssignment.startDate = req.body.startDate;
      if (req.body.dueDate) existingAssignment.dueDate = req.body.dueDate;

      await existingAssignment.save();

      // Populate details before sending response
      const updatedAssignment = await AssignTeam.findById(
        existingAssignment._id
      )
        .populate("project", "projectName description startDate endDate budget")
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
      });

      await newAssignment.save();

      // Populate details before sending response
      const populatedAssignment = await AssignTeam.findById(newAssignment._id)
        .populate("project", "projectName description startDate endDate budget")
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
      .populate("project", "projectName description startDate endDate budget")
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
      .populate("project", "projectName description startDate endDate budget")
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
    res.status(500).json({ message: "Failed to update status", error: error.message });
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
        { students: userId }
      ]
    })
      .populate("project", "projectName description startDate endDate budget")
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
