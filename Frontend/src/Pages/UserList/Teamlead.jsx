import React, { useState, useEffect } from "react";
import axios from "axios";
import "./List.css";

const Teamlead = () => {
  const [teamLeads, setTeamLeads] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userData?.role === "admin");
  }, []);

  // Fetch team leads when component mounts
  useEffect(() => {
    fetchTeamLeads();
  }, []);

  const fetchTeamLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/team-leads", {
        withCredentials: true,
      });
      setTeamLeads(response.data.teamLeads);
      setError("");
    } catch (error) {
      setError("Failed to fetch team leads. Please try again later.");
      console.error("Error fetching team leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const lead = teamLeads.find((l) => l._id === id);
    setEditLead({ ...lead });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team lead?")) {
      try {
        await axios.delete(`/api/users/${id}`, { withCredentials: true });
        setTeamLeads(teamLeads.filter((lead) => lead._id !== id));
        setError(""); // Clear any existing errors
      } catch (error) {
        console.error("Delete error:", error);
        setError("Failed to delete team lead. Please try again.");
      }
    }
  };

  const handleModalChange = (e) => {
    setEditLead({ ...editLead, [e.target.name]: e.target.value });
  };

  const handleModalSave = async () => {
    try {
      // Add update API call here when implemented
      // await axios.put(`/api/users/${editLead._id}`, editLead);
      setTeamLeads(
        teamLeads.map((l) => (l._id === editLead._id ? editLead : l))
      );
      setModalOpen(false);
      setEditLead(null);
    } catch (error) {
      setError("Failed to update team lead. Please try again.");
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditLead(null);
  };

  if (loading) {
    return <div className="loading">Loading team leads...</div>;
  }

  return (
    <div className="client-list-wrapper">
      <div className="project-list-container">
        <div className="project-list-header">
          <h2 className="project-list-title">Team Leads</h2>
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
              {teamLeads.map((lead, idx) => (
                <tr key={lead._id}>
                  <td>{idx + 1}</td>
                  <td>{lead.fullName}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.position || "N/A"}</td>
                  {isAdmin && (
                    <td>
                      <button
                        className="client-edit-btn"
                        onClick={() => handleEdit(lead._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="client-delete-btn"
                        onClick={() => handleDelete(lead._id)}
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
            <h3>Edit Team Lead</h3>
            <label className="modal-label">
              Full Name:
              <input
                type="text"
                name="fullName"
                value={editLead.fullName}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Email:
              <input
                type="email"
                name="email"
                value={editLead.email}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Phone Number:
              <input
                type="text"
                name="phone"
                value={editLead.phone}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Position:
              <input
                type="text"
                name="position"
                value={editLead.position || ""}
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

export default Teamlead;
