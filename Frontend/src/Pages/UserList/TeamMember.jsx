import React, { useState, useEffect } from "react";
import axios from "axios";
import "./List.css";

const TeamMember = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userData?.role === "admin");
  }, []);

  // Fetch team members when component mounts
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/team-members", {
        withCredentials: true,
      });
      setTeamMembers(response.data.teamMembers);
      setError("");
    } catch (error) {
      setError("Failed to fetch team members. Please try again later.");
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const member = teamMembers.find((m) => m._id === id);
    setEditMember({ ...member });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      try {
        await axios.delete(`/api/users/${id}`, { withCredentials: true });
        setTeamMembers(teamMembers.filter((member) => member._id !== id));
        setError(""); // Clear any existing errors
      } catch (error) {
        console.error("Delete error:", error);
        setError("Failed to delete team member. Please try again.");
      }
    }
  };

  const handleModalChange = (e) => {
    setEditMember({ ...editMember, [e.target.name]: e.target.value });
  };

  const handleModalSave = async () => {
    try {
      // Add update API call here when implemented
      // await axios.put(`/api/users/${editMember._id}`, editMember);
      setTeamMembers(
        teamMembers.map((m) => (m._id === editMember._id ? editMember : m))
      );
      setModalOpen(false);
      setEditMember(null);
    } catch (error) {
      setError("Failed to update team member. Please try again.");
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditMember(null);
  };

  if (loading) {
    return <div className="loading">Loading team members...</div>;
  }

  return (
    <div className="client-list-wrapper">
      <div className="project-list-container">
        <div className="project-list-header">
          <h2 className="project-list-title">Team Members</h2>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="table-responsive">
          <table className="project-list-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Position</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, idx) => (
                <tr key={member._id}>
                  <td>{idx + 1}</td>
                  <td>{member.fullName}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{member.position || "N/A"}</td>
                  {isAdmin && (
                    <td>
                      <button
                        className="client-edit-btn"
                        onClick={() => handleEdit(member._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="client-delete-btn"
                        onClick={() => handleDelete(member._id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Team Member</h3>
            <label className="modal-label">
              Full Name:
              <input
                type="text"
                name="fullName"
                value={editMember.fullName}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Email:
              <input
                type="email"
                name="email"
                value={editMember.email}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Phone Number:
              <input
                type="text"
                name="phone"
                value={editMember.phone}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Position:
              <input
                type="text"
                name="position"
                value={editMember.position || ""}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <div className="modal-actions">
              <button className="client-edit-btn" onClick={handleModalSave}>
                Save
              </button>
              <button className="client-delete-btn" onClick={handleModalCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMember;
