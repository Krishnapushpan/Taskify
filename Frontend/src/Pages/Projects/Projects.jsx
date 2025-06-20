import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Projects.css";

const statusLabels = [
  { key: "all", label: "All" },
  { key: "Completed", label: "Completed" },
  { key: "In Progress", label: "In Progress" },
  { key: "Pending", label: "Pending" },
];

const Projects = ({ onViewDetails }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [workCounts, setWorkCounts] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamlead, setIsTeamlead] = useState(false);
  const [viewMode, setViewMode] = useState("projects"); // "projects" or "assignments"
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const userStr = localStorage.getItem("user");
        let userID = undefined;
        let userRole = undefined;
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userID = userObj.userid;
          userRole = userObj.role;
          setIsAdmin(userRole === "admin");
          setIsTeamlead(userRole === "Team Lead");
        }

        if (userRole === "admin") {
          // Admin: fetch all projects
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams/admin/all-projects`, { withCredentials: true });
          setProjects(res.data);
        } else if (userRole === "Team Lead") {
          // Teamlead: fetch only assigned projects
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/teams/projects-by-user?userId=${userID}`,
            { withCredentials: true }
          );
          setProjects(res.data);
        } else {
          // Regular user: fetch only assigned projects
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/teams/projects-by-user?userId=${userID}`,
            { withCredentials: true }
          );
          setProjects(res.data);
        }
      } catch (err) {
        setError("Failed to load data");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/assign-team/admin/project/${projectId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      // Refresh the data
      const [projectsRes, assignmentsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/assign-team/admin/all-projects`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/assign-team/admin/all-assignments`, { withCredentials: true })
      ]);
      setProjects(projectsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error("Failed to update status:", error);
      setError("Failed to update project status");
    }
  };

  const handleDeleteProject = async (projectId) => {
    const project = projects.find(p => p._id === projectId);
    
    // Debug logging to check project and ID
    console.log("Project to delete:", {
      givenId: projectId,
      project: project,
      projectId: project?._id,
      allProjects: projects.map(p => ({ id: p._id, name: p.projectName }))
    });

    if (!project || !project._id) {
      setError("Invalid project ID");
      return;
    }

    const projectName = project.projectName || 'this project';
    
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This will permanently delete:\n\n• The project itself\n• All team assignments\n• All work assignments\n• All uploaded files\n• All meetings\n• All notifications\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      console.log("Making delete request for project ID:", project._id);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/projects/${project._id}`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("Delete response:", response.data);
      
      // Refresh projects data
      console.log("Refreshing projects data...");
      const projectsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/projects/all`, 
        { withCredentials: true }
      );
      
      setProjects(projectsRes.data);
      
      // Show detailed success message with deletion summary
      const summary = response.data.cascadeDeleteSummary;
      let successMessage = `Project "${projectName}" deleted successfully!`;
      
      if (summary && summary.totalRecordsDeleted > 0) {
        successMessage += `\n\nDeleted ${summary.totalRecordsDeleted} related records:\n`;
        if (summary.details.assignWork > 0) successMessage += `• ${summary.details.assignWork} work assignments\n`;
        if (summary.details.assignTeam > 0) successMessage += `• ${summary.details.assignTeam} team assignments\n`;
        if (summary.details.fileUpload > 0) successMessage += `• ${summary.details.fileUpload} uploaded files\n`;
        if (summary.details.workUpload > 0) successMessage += `• ${summary.details.workUpload} work files\n`;
        if (summary.details.notification > 0) successMessage += `• ${summary.details.notification} notifications\n`;
        if (summary.details.meeting > 0) successMessage += `• ${summary.details.meeting} meetings\n`;
      }
      
      setSuccess(successMessage);
      setTimeout(() => setSuccess(""), 8000); // Clear success message after 8 seconds
    } catch (err) {
      console.error("Delete project error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        projectId: project._id,
        projectDetails: project
      });
      
      if (err.response?.status === 404) {
        setError("Project not found. It may have been already deleted.");
        // Refresh the projects list
        const projectsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/projects/all`, 
          { withCredentials: true }
        );
        setProjects(projectsRes.data);
      } else {
        setError("Failed to delete project: " + (err.response?.data?.message || err.message));
      }
      setTimeout(() => setError(""), 5000); // Clear error message after 5 seconds
    }
  };

  const filteredProjects = statusFilter === "all"
    ? projects
    : projects.filter(p => p.status === statusFilter);

  const filteredAssignments = statusFilter === "all"
    ? assignments
    : assignments.filter(a => a.status === statusFilter);

  const handleViewDetails = (project) => {
    if (onViewDetails) {
      onViewDetails(project);
    }
  };

  return (
    <div className="projects-modern-page">
      <h1 className="projects-modern-title">Projects</h1>
      <div className="projects-container">
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>
            {success}
          </div>
        )}
        <div className="table-container">
          <div className="work-assignments-table-modern-container">
            <table className="work-assignments-table-modern">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Description</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  {isAdmin && <th>Created By</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.projectName}</td>
                    <td>{project.description}</td>
                    <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}</td>
                    <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}</td>
                    {isAdmin && (
                      <td>{project.addedBy?.fullName || project.addedBy || "-"}</td>
                    )}
                    <td>
                      <button
                        onClick={() => handleViewDetails(project)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #1976d2",
                          background: "#fff",
                          color: "#1976d2",
                          cursor: "pointer",
                          marginRight: isAdmin ? 8 : 0
                        }}
                      >
                        View Details
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            console.log("Delete button clicked for project:", {
                              id: project._id,
                              name: project.projectName,
                              project: project
                            });
                            handleDeleteProject(project._id);
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "1px solid #e53935",
                            background: "#fff",
                            color: "#e53935",
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;

