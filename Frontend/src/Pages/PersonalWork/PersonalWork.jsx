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
      
      // Get the work details
      const work = works.find(w => w._id === workId);
      if (!work) {
        throw new Error("Work assignment not found");
      }

      // Debug log to see work data
      console.log("Work assignment data:", work);

      const userData = JSON.parse(localStorage.getItem("user"));
      console.log("User data:", userData);

      if (!work.projectName) {
        console.error("Missing projectName in work assignment");
        alert("Error: Project Name is missing");
        return;
      }

      // Upload to work-uploads endpoint
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("projectName", work.projectName);
      uploadFormData.append("uploadedBy", userData.userid);
      uploadFormData.append("teamlead", userData.userid); // Using current user as teamlead for now
      uploadFormData.append("description", work.workDescription || "File upload for " + work.projectName);

      // Log FormData contents
      for (let pair of uploadFormData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // First update work status
      const statusFormData = new FormData();
      statusFormData.append("status", work.status || "In Progress");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/works/${workId}/status`,
        statusFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      // Then upload file
      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/work-uploads`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Upload response:", uploadResponse.data);

      // Update local state
      setSelectedFile((prev) => ({ ...prev, [workId]: null }));
      setWorks((prev) => prev.map(w => w._id === workId ? { ...w, workFile: { data: true } } : w));
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error details:", {
        response: err.response?.data,
        status: err.response?.status,
        error: err.message
      });
      alert("Failed to upload file: " + (err.response?.data?.message || err.message));
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
      console.error("Delete error:", err);
      alert("Failed to delete file: " + (err.response?.data?.message || err.message));
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

  // Add file download functionality
  const handleDownloadFile = async (workId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/works/${workId}/file`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file: " + (error.response?.data?.message || error.message));
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
              <td>{w.projectName}</td>
              <td>{w.workDescription}</td>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="file"
                    onChange={e => handleFileChange(w._id, e.target.files[0])}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  {selectedFile[w._id] && (
                    <button
                      onClick={() => handleFileUpload(w._id)}
                      disabled={uploading[w._id]}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: uploading[w._id] ? '#ccc' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: uploading[w._id] ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {uploading[w._id] ? 'Uploading...' : 'Upload'}
                    </button>
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

export default PersonalWork;
