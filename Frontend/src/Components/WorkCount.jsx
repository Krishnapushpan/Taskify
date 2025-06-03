import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaCheckCircle,
  FaHourglassHalf,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";

const WorkCount = ({ userId: propUserId }) => {
  const [counts, setCounts] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError("");
        let response;
        // Get user info from localStorage
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = propUserId || userData?.userid;
        const role = userData?.role;
        // If team lead, team member, or student, fetch counts by role
        if (
          ["Team Lead", "team_lead", "teamLead", "Team Member", "team_member", "teamMember", "Student", "student"].includes(role)
        ) {
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/works/counts/by-role?userId=${userId}&role=${role}`,
            { withCredentials: true }
          );
        } else {
          // Otherwise fetch global counts (for admin dashboard)
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/works/counts`, {
            withCredentials: true,
          });
        }
        if (response.data && response.data.counts) {
          setCounts({
            ...response.data.counts,
            overdue: response.data.counts.overdue || 0,
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching work counts:", err);
        setError("Failed to load work stats");
        setCounts({
          totalAssigned: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          overdue: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, [propUserId]);

  const stats = [
    {
      title: "TOTAL ASSIGNED",
      count: counts.totalAssigned,
      icon: <FaTasks className="count-icon" />,
      color: "#6658dd",
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
    {
      title: "IN PROGRESS",
      count: counts.inProgress,
      icon: <FaSpinner className="count-icon" />,
      color: "#4fc6e1",
    },
    {
      title: "OVERDUE",
      count: counts.overdue,
      icon: <FaExclamationTriangle className="count-icon" />,
      color: "#e53935",
    },
  ];

  if (loading) {
    return (
      <div className="count-users-container loading">
        <FaSpinner className="spinning" /> Loading work statistics...
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

  // If all counts are zero, show a message
  const allZero =
    counts.totalAssigned === 0 &&
    counts.completed === 0 &&
    counts.pending === 0 &&
    counts.inProgress === 0 &&
    counts.overdue === 0;

  if (allZero) {
    return (
      <div className="count-users-container empty">
        <div className="empty-message">
          <FaTasks className="empty-icon" />
          <p>
            No work assignments found. Assignments will appear here once
            created.
          </p>
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

export default WorkCount;
