import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Documents.css";

const WorkDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user"));
        const userRole = userData?.role;
        const userId = userData?.userid;
        let response;
        if (userRole === "Team Lead") {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/work-uploads/teamlead/${userData.fullName}`, { withCredentials: true });
        } else if (userRole === "Admin" || userRole === "admin") {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/work-uploads/`, { withCredentials: true });
        } else {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/work-uploads/user/${userId}`, { withCredentials: true });
        }
        setDocuments(response.data);
      } catch (err) {
        setError("Failed to fetch work documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/work-uploads/${id}`, { withCredentials: true });
      setDocuments((prev) => prev.filter(doc => doc._id !== id));
    } catch (err) {
      alert("Failed to delete document");
    }
  };

  return (
    <div className="documents-container">
      <h2>Uploaded Documents</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table className="documents-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Project Name</th>
              <th>Uploaded Date</th>
              <th>Document</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>No documents found</td></tr>
            ) : (
              documents.map((doc, idx) => (
                <tr key={doc._id}>
                  <td>{idx + 1}</td>
                  <td>{doc.projectName}</td>
                  <td>{formatDate(doc.uploadDate)}</td>
                  <td>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/work-uploads/${doc._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-document-button"
                    >
                      View Document
                    </a>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WorkDocuments;
