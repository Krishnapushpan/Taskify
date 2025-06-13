import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Projects/Projects.css";

const statusLabels = [
  { key: "all", label: "All" },
  { key: "Completed", label: "Completed" },
  { key: "In Progress", label: "In Progress" },
  { key: "Pending", label: "Pending" },
];

const MyWork = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
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
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/works/personal?userId=${userID}`,
          { withCredentials: true }
        );
        setAssignments(res.data);
        // Extract unique projects
        const uniqueProjects = [];
        const seen = new Set();
        res.data.forEach(a => {
          const projId = a.projectId?._id || a.projectId || a.projectName;
          if (projId && !seen.has(projId)) {
            uniqueProjects.push({
              _id: a.projectId?._id || a.projectId || a.projectName,
              projectName: a.projectId?.projectName || a.projectName || "-",
              description: a.projectId?.description || ""
            });
            seen.add(projId);
          }
        });
        setProjects(uniqueProjects);
        // Auto-select first project if available
        if (uniqueProjects.length > 0) setSelectedProject(uniqueProjects[0]);
      } catch (err) {
        setAssignments([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Filter assignments for the selected project and status
  const filteredAssignments = selectedProject
    ? assignments.filter(
        a =>
          (a.projectId?._id || a.projectId || a.projectName) === selectedProject._id &&
          (statusFilter === "all" || a.status === statusFilter)
      )
    : [];

  return (
    <div className="projects-modern-page">
      <h1 className="projects-modern-title">My Work Assignments</h1>
      <div className="projects-modern-layout">
        <div className="projects-list-sidebar">
          <h3>My Projects</h3>
          {loading ? (
            <div>Loading...</div>
          ) : projects.length === 0 ? (
            <div style={{ color: "#888" }}>No projects found.</div>
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
        <div className="project-details-main">
          {selectedProject ? (
            <>
              <div className="project-details-header">
                <h2>{selectedProject.projectName}</h2>
                <div className="project-details-desc">{selectedProject.description}</div>
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
                {loading ? (
                  <div>Loading assignments...</div>
                ) : filteredAssignments.length === 0 ? (
                  <div style={{ padding: 16, color: "#888" }}>No assignments found for this project.</div>
                ) : (
                  <table className="work-assignments-table-modern">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Remaining Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((a) => {
                        // Calculate remaining days
                        let remainingDays = "-";
                        if (a.dueDate) {
                          const today = new Date();
                          const due = new Date(a.dueDate);
                          const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                          remainingDays = diff;
                        }
                        return (
                          <tr key={a._id}>
                            <td>{a.workDescription}</td>
                            <td>{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "-"}</td>
                            <td>{a.status}</td>
                            <td>{remainingDays < 0 ? `Overdue (${Math.abs(remainingDays)})` : remainingDays}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="project-details-placeholder">Select a project to view your work assignments.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyWork;
