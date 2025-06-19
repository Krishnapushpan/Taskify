import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const WorkStatus = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userid;
    const role = userData?.role;
    setRole(role);

    const fetchWorks = async () => {
      try {
        setLoading(true);
        let response;
        if (role === "Admin" || role === "admin") {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/works/all`, { withCredentials: true });
        } else {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/works?teamLead=${userId}`, { withCredentials: true });
        }
        setWorks(response.data);
      } catch (err) {
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchWorks();
  }, []);

  const handleDelete = async (workId) => {
    if (!window.confirm("Are you sure you want to delete this work assignment? This action cannot be undone.")) {
      return;
    }

    try {
      console.log("Deleting work with ID:", workId);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/works/${workId}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Remove the deleted work from the state
        setWorks(works.filter(work => work._id !== workId));
        alert("Work assignment deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${import.meta.env.VITE_API_URL}/api/works/${workId}`
      });
      
      if (error.response?.status === 404) {
        alert("Work assignment not found. It may have been already deleted.");
        // Refresh the list to ensure we're showing current data
        window.location.reload();
      } else {
        alert("Failed to delete work assignment: " + (error.response?.data?.message || error.message));
      }
    }
  };

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
        <h2 className="project-list-title">All Work Assignments </h2>
      </div>
      <table className="project-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Project Name</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Team Lead</th>
            <th>Team Members</th>
            <th>Students</th>
            <th>Actions</th>
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
              <td>{w.percentage || 0}%</td>
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
              <td>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {role === "Team Lead" && (
                    <>
                      <Link
                        to={`/assign-work/${w.projectId}`}
                        state={{
                          workData: w,
                          isUpdate: true,
                          project: {
                            _id: w.projectId,
                            projectName: w.projectName,
                            description: w.description || "",
                            startDate: w.startDate,
                            endDate: w.dueDate
                          }
                        }}
                        className="update-work-button"
                      >
                        <FaEdit /> Update
                      </Link>
                      <button
                        onClick={() => handleDelete(w._id)}
                        className="delete-work-button"
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkStatus;

