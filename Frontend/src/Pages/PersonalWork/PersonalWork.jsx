import React, { useState, useEffect } from "react";
import axios from "axios";

const statusOptions = [
  "In Progress",
  "Completed",
  "Pending",
];

const PersonalWork = () => {
  const [works, setWorks] = useState([]);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [editingPercentageId, setEditingPercentageId] = useState(null);
  const [percentageUpdate, setPercentageUpdate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData?.userid;
        console.log("try", userId);
        // Adjust the endpoint to your actual API for fetching personal work
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/works/personal?userId=${userId}`, { withCredentials: true });
        setWorks(response.data);
        console.log("response", response.data);
      } catch (err) {
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    ).toString().padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleEditClick = (work) => {
    setEditingStatusId(work._id);
    setStatusUpdate(work.status || "");
  };

  const handleStatusChange = async (workId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/works/${workId}/status`, { status: newStatus }, { withCredentials: true });
      setWorks((prev) =>
        prev.map((w) =>
          w._id === workId
            ? { ...w, status: newStatus }
            : w
        )
      );
      setEditingStatusId(null);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleEditPercentageClick = (work) => {
    setEditingPercentageId(work._id);
    setPercentageUpdate(work.percentage || 0);
  };

  const handlePercentageChange = async (workId, newPercentage) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/works/${workId}/percentage`,
        { percentage: parseInt(newPercentage) },
        { withCredentials: true }
      );
      setWorks((prev) =>
        prev.map((w) =>
          w._id === workId
            ? { ...w, percentage: parseInt(newPercentage) }
            : w
        )
      );
      setEditingPercentageId(null);
    } catch (err) {
      alert("Failed to update percentage");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2 className="project-list-title">My Work Assignments</h2>
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
          </tr>
        </thead>
        <tbody>
          {works.map((w, idx) => (
            <tr key={w._id}>
              <td>{idx + 1}</td>
              <td>{w.workName || w.projectName}</td>
              <td>{w.workDescription || w.description}</td>
              <td>{formatDate(w.dueDate)}</td>
              <td>
                {editingStatusId === w._id ? (
                  <select
                    className="status-dropdown"
                    value={statusUpdate}
                    onChange={(e) => {
                      setStatusUpdate(e.target.value);
                      handleStatusChange(w._id, e.target.value);
                    }}
                    autoFocus
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {w.status || "N/A"}
                    <button
                      className="status-edit-btn"
                      onClick={() => handleEditClick(w)}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </td>
              <td>
                {editingPercentageId === w._id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={percentageUpdate}
                      onChange={(e) => setPercentageUpdate(e.target.value)}
                      style={{ width: '60px' }}
                    />
                    <button
                      onClick={() => handlePercentageChange(w._id, percentageUpdate)}
                      style={{ padding: '2px 8px' }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {w.percentage || 0}%
                    <button
                      className="status-edit-btn"
                      onClick={() => handleEditPercentageClick(w)}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonalWork;
