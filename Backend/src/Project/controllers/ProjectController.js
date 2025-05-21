import Project from "../models/ProjectModel.js";
import mongoose from "mongoose";

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { projectName, description, startDate, endDate, budget } = req.body;
    const role = req.role;

    if (
      role !== "client" &&
      role !== "admin" &&
      role !== "Client" &&
      role !== "Admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    } else {
      console.log("Creating project with user ID:", req.userId);

      // Create new project
      const newProject = new Project({
        projectName,
        description,
        startDate,
        endDate,
        budget,
        createdBy: req.userId, // Get userId from auth middleware
      });

      // Save project to database
      await newProject.save();

      res.status(201).json({
        message: "Project created successfully",
        project: {
          id: newProject._id,
          projectName: newProject.projectName,
          startDate: newProject.startDate,
          endDate: newProject.endDate,
        },
      });
    }
  } catch (error) {
    console.error("Create project error:", error);
    res
      .status(500)
      .json({ message: "Failed to create project", error: error.message });
  }
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    // Removed authentication requirement for easier demonstration
    const projects = await Project.find().sort({ createdAt: -1 });

    console.log("Projects fetched:", projects.length);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch projects", error: error.message });
  }
};

// Get a specific project by ID
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate("createdBy", "fullName email")
      .populate("team", "fullName email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Get project error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch project", error: error.message });
  }
};

// Update a project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, description, startDate, endDate, budget, status } =
      req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        projectName,
        description,
        startDate,
        endDate,
        budget,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res
      .status(500)
      .json({ message: "Failed to update project", error: error.message });
  }
};

// Delete a project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete project", error: error.message });
  }
};

// Assign team members to a project
export const assignTeamToProject = async (req, res) => {
  try {
    const { projectId, teamMembers } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Add team members to project
    project.team = teamMembers;
    await project.save();

    res.status(200).json({
      message: "Team assigned to project successfully",
      project: {
        id: project._id,
        projectName: project.projectName,
        team: project.team,
      },
    });
  } catch (error) {
    console.error("Assign team error:", error);
    res
      .status(500)
      .json({ message: "Failed to assign team", error: error.message });
  }
};

// Get project with team details
export const getProjectWithTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // First get the project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Try to find the team assignment for this project
    const teamAssignment = await mongoose
      .model("AssignTeam")
      .findOne({ project: id })
      .populate("teamLead", "fullName email role position")
      .populate("teamMembers", "fullName email role position")
      .populate("students", "fullName email role");

    // Return project with team details if assignment exists
    res.status(200).json({
      project: {
        _id: project._id,
        projectName: project.projectName,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        status: project.status,
        createdAt: project.createdAt,
      },
      team: teamAssignment || null,
    });
  } catch (error) {
    console.error("Get project with team error:", error);
    res.status(500).json({
      message: "Failed to fetch project with team",
      error: error.message,
    });
  }
};
