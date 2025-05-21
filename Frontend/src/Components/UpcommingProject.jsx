import React, { useState, useEffect } from "react";
import {
  FaSyncAlt,
  FaWindowMinimize,
  FaTimes,
  FaUserAlt,
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const UpcomingProject = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);

  // Function to fetch projects from API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/projects/all", {
        withCredentials: true,
      });

      console.log("API Response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        // Sort projects by creation date (newest first)
        const sortedProjects = response.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Only show the most recent project in the dashboard (latest created)
        setProjects(sortedProjects.slice(0, 1));
      } else {
        console.warn("Unexpected API response format:", response.data);
        setProjects([]);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
    // Get user role from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    setUserRole(userData?.role);
    console.log(userData?.role);
    
  }, []);

  // Function to refresh the project list
  const handleRefresh = () => {
    fetchProjects();
  };

  // Function to minimize the project list
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Function to close the project list
  const handleClose = () => {
    setIsVisible(false);
  };

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

  if (!isVisible) {
    return null;
  }

  return (
    <div className="upcoming-projects-container">
      <div className="upcoming-header">
        <h2 className="upcoming-title">Upcoming Projects</h2>
        <div className="upcoming-actions">
          <div
            className={isLoading ? "fa-spin" : ""}
            style={{ cursor: "pointer" }}
          >
            <FaSyncAlt
              style={{ color: "#adb5bd", fontSize: "16px" }}
              onClick={handleRefresh}
              title="Refresh"
            />
          </div>
          <FaWindowMinimize
            style={{
              color: "#adb5bd",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "-10px",
            }}
            onClick={handleMinimize}
            title="Minimize"
          />
          <FaTimes
            style={{ color: "#adb5bd", fontSize: "16px", cursor: "pointer" }}
            onClick={handleClose}
            title="Close"
          />
        </div>
      </div>

      {!isMinimized && (
        <>
          {isLoading ? (
            <div className="upcoming-loading">Loading projects...</div>
          ) : error ? (
            <div className="upcoming-error">{error}</div>
          ) : projects.length === 0 ? (
            <div className="upcoming-empty">No upcoming projects found</div>
          ) : (
            <div className="upcoming-cards">
              {projects.map((project) => (
                <div key={project._id} className="upcoming-card">
                  <div className="upcoming-card-header">
                    {project.projectName}
                  </div>
                  <div className="upcoming-card-body">
                    <div className="upcoming-card-description">
                      {project.description}
                    </div>
                    <div className="upcoming-card-details">
                      <div className="upcoming-card-detail">
                        <div className="upcoming-card-detail-label">
                          <FaCalendarAlt
                            style={{ marginRight: "8px", fontSize: "12px" }}
                          />
                          Start Date:
                        </div>
                        <div className="upcoming-card-detail-value">
                          {formatDate(project.startDate)}
                        </div>
                      </div>
                      <div className="upcoming-card-detail">
                        <div className="upcoming-card-detail-label">
                          <FaClock
                            style={{ marginRight: "8px", fontSize: "12px" }}
                          />
                          Due Date:
                        </div>
                        <div className="upcoming-card-detail-value">
                          {formatDate(project.endDate)}
                        </div>
                      </div>
                    </div>
                    {userRole === "admin" && (
                      <Link to={`/assign-project/${project._id}`} className="assign-project-button">
                        Assign Team
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/view-more-projects" className="view-more-container">
            <div className="view-more-text">View More Projects</div>
            <FaArrowRight className="view-more-icon" />
          </Link>
        </>
      )}
    </div>
  );
};

export default UpcomingProject;
