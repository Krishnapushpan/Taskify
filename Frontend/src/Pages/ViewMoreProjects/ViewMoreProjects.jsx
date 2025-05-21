import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUserPlus,
  FaUsers,
  FaSync,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const ViewMoreProjects = () => {
  const [projects, setProjects] = useState([]);
  const [assignedProjectIds, setAssignedProjectIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/projects/all", {
          withCredentials: true,
        });

        console.log("ViewMore API Response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          // Sort projects by creation date (newest first)
          const sortedProjects = response.data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          setProjects(sortedProjects);
        } else {
          console.warn("Unexpected API response format:", response.data);
          setProjects([]);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    const fetchAssignedProjects = async () => {
      try {
        const response = await axios.get("/api/teams/all", { withCredentials: true });
        // Extract project IDs from assignments
        const ids = response.data.map(a => a.project?._id || a.project);
        setAssignedProjectIds(ids);
      } catch (err) {
        setAssignedProjectIds([]);
      }
    };

    fetchProjects();
    fetchAssignedProjects();
    // Get user role from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    setUserRole(userData?.role);
  }, []);

  // Format date to display in DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <div className="view-more-projects-page">
      <div className="view-more-projects-header">
        <h1 className="view-more-projects-title">All Upcoming Projects</h1>
        <Link to="/admin-dashboard" className="back-button">
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </div>

      <div className="projects-container">
        {loading ? (
          <div className="loading-container">
            <FaSync className="loading-icon spin" />
            <p>Loading projects...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-container">
            <p>No additional projects found</p>
          </div>
        ) : (
          <div className="upcoming-projects-grid">
            {projects.map((project) => (
              <div key={project._id} className="upcoming-project-card">
                <div className="upcoming-project-header">
                  {project.projectName}
                </div>
                <div className="upcoming-project-body">
                  <div className="upcoming-project-description">
                    {project.description}
                  </div>
                  <div className="upcoming-project-details">
                    <div className="upcoming-project-detail">
                      <div className="upcoming-project-detail-label">
                        <FaCalendarAlt />
                        Start Date:
                      </div>
                      <div className="upcoming-project-detail-value">
                        {formatDate(project.startDate)}
                      </div>
                    </div>
                    <div className="upcoming-project-detail">
                      <div className="upcoming-project-detail-label">
                        <FaClock />
                        Due Date:
                      </div>
                      <div className="upcoming-project-detail-value">
                        {formatDate(project.endDate)}
                      </div>
                    </div>
                    {project.budget && (
                      <div className="upcoming-project-detail">
                        <div className="upcoming-project-detail-label">
                          Budget:
                        </div>
                        <div className="upcoming-project-detail-value">
                          ${project.budget}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="upcoming-project-footer">
                  {userRole === "admin" && (
                    assignedProjectIds.includes(project._id) ? (
                      <button className="assign-project-button" disabled>
                        <FaUsers className="assign-project-button-icon" />
                        <span>Assigned</span>
                      </button>
                    ) : (
                      <Link
                        to={`/assign-project/${project._id}`}
                        className="assign-project-button"
                      >
                        <FaUsers className="assign-project-button-icon" />
                        <span>Assign Team</span>
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMoreProjects;
