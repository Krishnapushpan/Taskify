import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaCheckCircle,
  FaHourglassHalf,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";

const WorkCount = ({ userId }) => {
  const [counts, setCounts] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        // If userId is provided, fetch counts for that specific user
        if (userId) {
          response = await axios.get(`/api/work/user/${userId}/counts`, {
            withCredentials: true,
          });
        } else {
          // Otherwise fetch global counts (for admin dashboard)
          response = await axios.get("/api/work/counts", {
            withCredentials: true,
          });
        }

        if (response.data && response.data.counts) {
          setCounts(response.data.counts);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching work counts:", err);
        setError("Failed to load work stats");

        // Fallback to placeholder values in case of error
        setCounts({
          totalAssigned: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [userId]);

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
    counts.inProgress === 0;

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
