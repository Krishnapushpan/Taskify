import Project from "../models/ProjectModel.js";
import mongoose from "mongoose";

// Create a new project
export const createProject = async (req, res) => {
  try {
    // req.body fields are available as strings
    const { projectName, description, startDate, endDate, budget, addedBy } = req.body;
    const role = req.role;
    console.log("getting role from the token:", role);

    if (
      role !== "client" &&
      role !== "admin" &&
      role !== "Client" &&
      role !== "Admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if project name already exists
    const existingProject = await Project.findOne({ projectName: { $regex: new RegExp(`^${projectName}$`, 'i') } });
    if (existingProject) {
      return res.status(400).json({ 
        message: `Project name "${projectName}" already exists.make it unique. Try another name.`,
        field: "projectName"
      });
    }

    console.log("Creating project with user ID:", req.userid);

    // Convert types
    const start = new Date(startDate);
    const end = new Date(endDate);
    const budgetNum = Number(budget);

    // req.file is the uploaded file (if any)
    // You can save file info to the database if needed

    // Create new project
    const newProject = new Project({
      projectName: projectName.trim(),
      description,
      startDate: start,
      endDate: end,
      budget: budgetNum,
      addedBy: addedBy || req.userId, // Use addedBy from request or fallback to userId from auth
      projectFile: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
            originalName: req.file.originalname,
          }
        : undefined,
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
  } catch (error) {
    console.error("Create project error:", error);
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Project name already exists. Please choose a different name.",
        field: "projectName"
      });
    }
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
    
    // First get the project to get its name
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const projectName = project.projectName;
    console.log(`Starting cascade delete for project: "${projectName}" (ID: ${id})`);
    
    // Delete the project itself
    const deletedProject = await Project.findByIdAndDelete(id);
    console.log(`Project "${projectName}" deleted successfully`);

    // Cascade delete: remove all related data using projectName
    let deletedCounts = {};
    
    try {
      // 1. AssignWork
      const AssignWork = (await import("../../AssignWork/models/AssignWorkModel.js")).default;
      const assignWorkResult = await AssignWork.deleteMany({ projectName: projectName });
      deletedCounts.assignWork = assignWorkResult.deletedCount;
      console.log(`Deleted ${assignWorkResult.deletedCount} AssignWork records`);

      // 2. AssignTeam
      const AssignTeam = (await import("../../AssignTeam/models/AssignTeamModel.js")).default;
      const assignTeamResult = await AssignTeam.deleteMany({ 
        $or: [
          { project: id },
          { projectId: id },
          { projectName: projectName }
        ]
      });
      deletedCounts.assignTeam = assignTeamResult.deletedCount;
      console.log(`Deleted ${assignTeamResult.deletedCount} AssignTeam records`);

      // 3. FileUpload
      const FileUpload = (await import("../../fileuploads/Model/FileUploadModel.js")).default;
      const fileUploadResult = await FileUpload.deleteMany({ 
        $or: [
          { projectId: id },
          { projectName: projectName }
        ]
      });
      deletedCounts.fileUpload = fileUploadResult.deletedCount;
      console.log(`Deleted ${fileUploadResult.deletedCount} FileUpload records`);

      // 4. WorkUpload
      const WorkUpload = (await import("../../WorkUploads/Model/WorkUploadModel.js")).default;
      const workUploadResult = await WorkUpload.deleteMany({ 
        $or: [
          { projectId: id },
          { projectName: projectName }
        ]
      });
      deletedCounts.workUpload = workUploadResult.deletedCount;
      console.log(`Deleted ${workUploadResult.deletedCount} WorkUpload records`);

      // 5. Notification
      const Notification = (await import("../../Notification/models/NotificationModel.js")).default;
      const notificationResult = await Notification.deleteMany({ 
        $or: [
          { projectId: id },
          { projectName: projectName }
        ]
      });
      deletedCounts.notification = notificationResult.deletedCount;
      console.log(`Deleted ${notificationResult.deletedCount} Notification records`);

      // 6. Meetings
      const Meeting = (await import("../../Meetings/models/MeetingModel.js")).default;
      const meetingResult = await Meeting.deleteMany({ 
        $or: [
          { projectId: id },
          { projectName: projectName }
        ]
      });
      deletedCounts.meeting = meetingResult.deletedCount;
      console.log(`Deleted ${meetingResult.deletedCount} Meeting records`);

    } catch (cascadeError) {
      console.error("Error during cascade delete:", cascadeError);
      // Continue with the response even if cascade delete fails
    }

    const totalDeleted = Object.values(deletedCounts).reduce((sum, count) => sum + count, 0);
    console.log(`Project "${projectName}" and ${totalDeleted} related records deleted successfully`);
    
    res.status(200).json({ 
      message: `Project "${projectName}" and all related data deleted successfully`,
      deletedProject: {
        id: deletedProject._id,
        projectName: deletedProject.projectName
      },
      cascadeDeleteSummary: {
        totalRecordsDeleted: totalDeleted,
        details: deletedCounts
      }
    });
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

// Serve the uploaded project file
export const getProjectFile = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project || !project.projectFile || !project.projectFile.data) {
      return res.status(404).json({ message: "File not found" });
    }
    res.set('Content-Type', project.projectFile.contentType);
    res.set('Content-Disposition', `inline; filename="${project.projectFile.originalName}"`);
    res.send(project.projectFile.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch file", error: error.message });
  }
};
