import React, { useState, useEffect } from "react";
import axios from "axios";

const WorkStatus = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userid;

    const fetchWorks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/works?teamLead=${userId}`, { withCredentials: true });
        setWorks(response.data);
      } catch (err) {
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchWorks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    ).toString().padStart(2, "0")}/${date.getFullYear()}`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2 className="project-list-title">All Work Assignments</h2>
      </div>
      <table className="project-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Project Name</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Team Lead</th>
            <th>Team Members</th>
            <th>Students</th>
          </tr>
        </thead>
        <tbody>
          {works.map((w, idx) => (
            <tr key={w._id}>
              <td>{idx + 1}</td>
              <td>{w.projectName}</td>
              <td>{w.workDescription}</td>
              <td>{formatDate(w.dueDate)}</td>
              <td>{w.status || "N/A"}</td>
              <td>{w.teamLead?.fullName || "N/A"}</td>
              <td>
                {w.teamMembers && w.teamMembers.length > 0
                  ? w.teamMembers.map((m) => m.fullName).join(", ")
                  : "N/A"}
              </td>
              <td>
                {w.students && w.students.length > 0
                  ? w.students.map((s) => s.fullName).join(", ")
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkStatus;

