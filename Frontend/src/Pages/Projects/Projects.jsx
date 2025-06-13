import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Projects.css";
import { useNavigate } from "react-router-dom";

const statusLabels = [
  { key: "all", label: "All" },
  { key: "Completed", label: "Completed" },
  { key: "In Progress", label: "In Progress" },
  { key: "Pending", label: "Pending" },
];

const Projects = () => {
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
  const navigate = useNavigate();

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

  const filteredProjects = statusFilter === "all"
    ? projects
    : projects.filter(p => p.status === statusFilter);

  const filteredAssignments = statusFilter === "all"
    ? assignments
    : assignments.filter(a => a.status === statusFilter);

  return (
    <div className="projects-modern-page">
      <h1 className="projects-modern-title">Projects</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (isAdmin || isTeamlead) ? (
        <div className="admin-projects-view">
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
                        onClick={() => navigate("/view-details", { state: { project } })}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #1976d2",
                          background: "#fff",
                          color: "#1976d2",
                          cursor: "pointer"
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="projects-modern-layout">
          <div className="projects-list-sidebar">
            <h3>All Projects</h3>
            <ul className="projects-list">
              {projects.map((project) => (
                <li key={project._id}>
                  <div className="project-list-card">
                    <div className="project-list-card-title">{project.projectName}</div>
                    <div className="project-list-card-desc">{project.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="project-details-main">
            <div className="project-details-placeholder">
              Select a project to view details
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

