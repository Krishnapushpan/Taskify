import React, { useState, useEffect } from "react";
import { FaUserTie, FaUserCog, FaUsers, FaUserGraduate } from "react-icons/fa";
import axios from "axios";

const CountUsers = () => {
  const [counts, setCounts] = useState({
    clients: 0,
    teamLeads: 0,
    teamMembers: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users/counts", {
          withCredentials: true,
        });

        if (response.data && response.data.counts) {
          setCounts(response.data.counts);
        }
      } catch (err) {
        console.error("Error fetching user counts:", err);
        setError("Failed to load user counts");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const stats = [
    {
      title: "CLIENTS",
      count: counts.clients,
      icon: <FaUserTie className="count-icon" />,
      color: "#f1556c",
    },
    {
      title: "TEAM LEADS",
      count: counts.teamLeads,
      icon: <FaUserCog className="count-icon" />,
      color: "#6658dd",
    },
    {
      title: "TEAM MEMBERS",
      count: counts.teamMembers,
      icon: <FaUsers className="count-icon" />,
      color: "#4fc6e1",
    },
    {
      title: "STUDENTS",
      count: counts.students,
      icon: <FaUserGraduate className="count-icon" />,
      color: "#1abc9c",
    },
  ];

  if (loading) {
    return (
      <div className="count-users-container loading">
        Loading user statistics...
      </div>
    );
  }

  if (error) {
    return <div className="count-users-container error">{error}</div>;
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

export default CountUsers;
