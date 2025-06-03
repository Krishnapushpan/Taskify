import React, { useState, useEffect } from "react";
import { FaProjectDiagram, FaCheckCircle, FaHourglassHalf, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";

const ProjectCount = ({ clientId: propClientId }) => {
  const [counts, setCounts] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get clientId from prop or localStorage
  const clientId = propClientId || JSON.parse(localStorage.getItem("user"))?.userid;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError("");
        if (!clientId) throw new Error("No client ID provided");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams/project-counts/${clientId}`, {
          withCredentials: true,
        });
        if (response.data && response.data.counts) {
          setCounts(response.data.counts);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError("Failed to load project stats");
        setCounts({ total: 0, inProgress: 0, completed: 0, pending: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, [clientId]);

  const stats = [
    {
      title: "TOTAL PROJECTS",
      count: counts.total,
      icon: <FaProjectDiagram className="count-icon" />,
      color: "#6658dd",
    },
    {
      title: "IN PROGRESS",
      count: counts.inProgress,
      icon: <FaSpinner className="count-icon" />,
      color: "#4fc6e1",
    },
    {
      title: "COMPLETED",
      count: counts.completed,
      icon: <FaCheckCircle className="count-icon" />,
      color: "#1abc9c",
    },
    {
      title: "PENDING",
      count: counts.pending,
      icon: <FaHourglassHalf className="count-icon" />,
      color: "#f1556c",
    },
  ];

  if (loading) {
    return (
      <div className="count-users-container loading">
        <FaSpinner className="spinning" /> Loading project statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="count-users-container error">
        <FaExclamationTriangle /> {error}
      </div>
    );
  }

  const allZero =
    counts.total === 0 &&
    counts.inProgress === 0 &&
    counts.completed === 0 &&
    counts.pending === 0;

  if (allZero) {
    return (
      <div className="count-users-container empty">
        <div className="empty-message">
          <FaProjectDiagram className="empty-icon" />
          <p>No projects found. Projects will appear here once created.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="count-users-container">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="stat-card"
          style={{ backgroundColor: stat.color }}
        >
          <div className="stat-details">
            <div className="stat-title">{stat.title}</div>
            <div className="stat-count">{stat.count.toLocaleString()}</div>
          </div>
          <div className="stat-icon-container">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default ProjectCount;
