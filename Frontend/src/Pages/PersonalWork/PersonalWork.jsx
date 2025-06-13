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
  const [selectedFile, setSelectedFile] = useState({});
  const [uploading, setUploading] = useState({});

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
      const formData = new FormData();
      formData.append("status", newStatus);
      if (selectedFile[workId]) {
        formData.append("workFile", selectedFile[workId]);
      }
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/works/${workId}/status`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setWorks((prev) =>
        prev.map((w) =>
          w._id === workId
            ? { ...w, status: newStatus }
            : w
        )
      );
      setEditingStatusId(null);
      setSelectedFile((prev) => ({ ...prev, [workId]: null }));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleFileChange = (workId, file) => {
    setSelectedFile((prev) => ({ ...prev, [workId]: file }));
  };

  const handleFileUpload = async (workId) => {
    const file = selectedFile[workId];
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB");
      return;
    }
    try {
      setUploading((prev) => ({ ...prev, [workId]: true }));
      const formData = new FormData();
      formData.append("workFile", file);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/works/${workId}/status`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      const work = works.find(w => w._id === workId);
      const userData = JSON.parse(localStorage.getItem("user"));
      const fileFormData = new FormData();
      fileFormData.append("file", file);
      fileFormData.append("projectName", work.projectName);
      fileFormData.append("description", work.workDescription);
      fileFormData.append("uploadedBy", userData.userid);
      fileFormData.append("teamlead", work.teamLead?.fullName || work.teamLead || "N/A");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/work-uploads/`,
        fileFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      alert("File uploaded successfully!");
      setSelectedFile((prev) => ({ ...prev, [workId]: null }));
      setWorks((prev) => prev.map(w => w._id === workId ? { ...w, workFile: { data: true } } : w));
    } catch (err) {
      alert("Failed to upload file");
    } finally {
      setUploading((prev) => ({ ...prev, [workId]: false }));
    }
  };

  const handleDeleteFile = async (workId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/works/${workId}/file`,
        { withCredentials: true }
      );
      setWorks((prev) => prev.map(w => w._id === workId ? { ...w, workFile: null } : w));
      alert("File deleted successfully!");
    } catch (err) {
      alert("Failed to delete file");
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
        <h2 className="project-list-title">My Work Assignments members</h2>
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
            <th>File</th>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      className="status-dropdown"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      autoFocus
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <input
                      type="file"
                      onChange={e => handleFileChange(w._id, e.target.files[0])}
                      style={{ marginLeft: 8 }}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    {selectedFile[w._id] && (
                      <span style={{ fontSize: '12px', color: '#888' }}>{selectedFile[w._id].name}</span>
                    )}
                    <button
                      className="status-edit-btn"
                      onClick={() => handleStatusChange(w._id, statusUpdate)}
                    >
                      Save
                    </button>
                  </div>
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
              <td>
                <input
                  type="file"
                  onChange={e => handleFileChange(w._id, e.target.files[0])}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  style={{ marginBottom: 4 }}
                />
                {selectedFile[w._id] && (
                  <button
                    onClick={() => handleFileUpload(w._id)}
                    disabled={uploading[w._id]}
                    style={{ marginLeft: 4 }}
                  >
                    {uploading[w._id] ? 'Uploading...' : 'Upload'}
                  </button>
                )}
                {!w.workFile || !w.workFile.data ? (
                  <span style={{ color: '#aaa', marginLeft: 8 }}>No File</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonalWork;
