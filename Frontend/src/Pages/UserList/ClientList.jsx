import React, { useState, useEffect } from "react";
import axios from "axios";
import "./List.css";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userData?.role === "admin");
  }, []);

  // Fetch clients when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/clients", {
        withCredentials: true,
      });
      setClients(response.data.clients);
      setError("");
    } catch (error) {
      setError("Failed to fetch clients. Please try again later.");
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const client = clients.find((c) => c._id === id);
    setEditClient({ ...client });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await axios.delete(`/api/users/${id}`, { withCredentials: true });
        setClients(clients.filter((client) => client._id !== id));
        setError(""); // Clear any existing errors
      } catch (error) {
        console.error("Delete error:", error);
        setError("Failed to delete client. Please try again.");
      }
    }
  };

  const handleModalChange = (e) => {
    setEditClient({ ...editClient, [e.target.name]: e.target.value });
  };

  const handleModalSave = async () => {
    try {
      console.log("Updating client with ID:", editClient._id, editClient);
      await axios.put(`/api/users/${editClient._id}`, editClient, {
        withCredentials: true,
      });
      setClients(
        clients.map((c) => (c._id === editClient._id ? editClient : c))
      );
      setModalOpen(false);
      setEditClient(null);
    } catch (error) {
      setError("Failed to update client. Please try again.");
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditClient(null);
  };

  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  return (
    <div className="client-list-wrapper">
      <div className="project-list-container">
        <div className="project-list-header">
          <h2 className="project-list-title">Clients</h2>
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
              {clients.map((client, idx) => (
                <tr key={client._id}>
                  <td>{idx + 1}</td>
                  <td>{client.fullName}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{client.position || "N/A"}</td>
                  {isAdmin && (
                    <td>
                      <button
                        className="client-edit-btn"
                        onClick={() => handleEdit(client._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="client-delete-btn"
                        onClick={() => handleDelete(client._id)}
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
            <h3>Edit Client</h3>
            <label className="modal-label">
              Full Name:
              <input
                type="text"
                name="fullName"
                value={editClient.fullName}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Email:
              <input
                type="email"
                name="email"
                value={editClient.email}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Phone Number:
              <input
                type="text"
                name="phone"
                value={editClient.phone}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Position:
              <input
                type="text"
                name="position"
                value={editClient.position || ""}
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

export default ClientList;
