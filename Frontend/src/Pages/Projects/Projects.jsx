import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Projects.css";

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");
        // Get userId from localStorage (parse JSON)
        const userStr = localStorage.getItem("user");
        let userID = undefined;
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            userID = userObj.userid;
          } catch (e) {
            console.error("Failed to parse user from localStorage", e);
          }
        }
        console.log(userID, "checking");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/teams/projects-by-user?userId=${userID}`,
          { withCredentials: true }
        );
        setProjects(res.data);
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch work counts when a project is selected
  useEffect(() => {
    if (!selectedProject) return;
    const fetchCounts = async () => {
      try {
        const countsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/works/counts/project/${selectedProject._id}`);
        setWorkCounts(countsRes.data.counts);
      } catch (err) {
        setWorkCounts(null);
      }
    };
    fetchCounts();
  }, [selectedProject]);

  // Fetch assignments for the selected project and status
  useEffect(() => {
    if (!selectedProject) return;
    const fetchAssignments = async () => {
      try {
        setLoadingAssignments(true);
        // Use the backend route for assignments by project name and status
        const assignRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/works/project-by-name/${encodeURIComponent(selectedProject.projectName)}/assignments-by-status?status=${statusFilter}`,
          { withCredentials: true }
        );
        setAssignments(assignRes.data);
      } catch (err) {
        setAssignments([]);
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, [selectedProject, statusFilter]);

  // Filter assignments by status
  const filteredAssignments = statusFilter === "all"
    ? assignments
    : assignments.filter(a => a.status === statusFilter);

  return (
    <div className="projects-modern-page">
      <h1 className="projects-modern-title">Projects</h1>
      <div className="projects-modern-layout">
        {/* Project List Sidebar */}
        <div className="projects-list-sidebar">
          <h3>All Projects</h3>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div style={{ color: "red" }}>{error}</div>
          ) : (
            <ul className="projects-list">
              {projects.map((project) => (
                <li
                  key={project._id}
                  className={selectedProject && selectedProject._id === project._id ? "selected" : ""}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="project-list-card">
                    <div className="project-list-card-title">{project.projectName}</div>
                    <div className="project-list-card-desc">{project.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Project Details & Work Stats */}
        <div className="project-details-main">
          {selectedProject ? (
            <>
              <div className="project-details-header">
                <h2>{selectedProject.projectName}</h2>
                <div className="project-details-desc">{selectedProject.description}</div>
                <div className="project-details-dates">
                  <span>Start: {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : "-"}</span>
                  <span>Due: {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : "-"}</span>
                </div>
              </div>
        
              <div className="work-status-tabs">
                {statusLabels.map((s) => {
                  let btnStyle = {};
                  if (s.key === "all") btnStyle = { background: statusFilter === s.key ? "#1976d2" : "#e3f0ff", color: statusFilter === s.key ? "#fff" : "#1976d2" };
                  else if (s.key === "Completed") btnStyle = { background: statusFilter === s.key ? "#43a047" : "#e8f5e9", color: statusFilter === s.key ? "#fff" : "#43a047" };
                  else if (s.key === "In Progress") btnStyle = { background: statusFilter === s.key ? "#fb8c00" : "#fff3e0", color: statusFilter === s.key ? "#fff" : "#fb8c00" };
                  else if (s.key === "Pending") btnStyle = { background: statusFilter === s.key ? "#e53935" : "#ffebee", color: statusFilter === s.key ? "#fff" : "#e53935" };
                  return (
                    <button
                      key={s.key}
                      className={statusFilter === s.key ? "active" : ""}
                      style={{ ...btnStyle, border: "none", borderRadius: 6, marginRight: 8, padding: "8px 18px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
                      onClick={() => setStatusFilter(s.key)}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <div className="work-assignments-table-modern-container">
                {loadingAssignments ? (
                  <div>Loading assignments...</div>
                ) : filteredAssignments.length === 0 ? (
                  <div style={{ padding: 16, color: "#888" }}>No assignments found for this status.</div>
                ) : (
                  <table className="work-assignments-table-modern">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Remaining Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((a, idx) => (
                        <tr key={a._id}>
                          <td>
                            {(a.teamMembers && a.teamMembers.length > 0)
                              ? a.teamMembers.map(m => m.fullName).join(", ")
                              : (a.students && a.students.length > 0)
                                ? a.students.map(s => s.fullName).join(", ")
                                : "-"}
                          </td>
                          <td>{a.workDescription}</td>
                          <td>{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "-"}</td>
                          <td>{a.status}</td>
                          <td>{a.remainingDays !== undefined && a.remainingDays !== null ? a.remainingDays : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="project-details-placeholder">Select a project to view work assignments.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;

