import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Documents.css";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user"));
        setUserRole(userData?.role);
        const userId = userData?.userid;
        let files = [];
  
        if (userData.role === "Team Lead") {
          // Team Lead: show their own uploads
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/file-uploads/uploaded-by/${userId}`,
            { withCredentials: true }
          );
          files = response.data;
        } else if (userData.role === "Admin" || userData.role === "admin") {
          // Admin: show all files
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/file-uploads/`,
            { withCredentials: true }
          );
          files = response.data;
        } else if (userData.role === "Team Member" || userData.role === "Student") {
          // Team Member/Student: show files by assigned project names
          // 1. Fetch assigned works
          const worksRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/works/personal`,
            {
              params: { userId: userId },
              withCredentials: true,
            }
          );
          // 2. Get unique project names
          const projectNames = [
            ...new Set(
              (worksRes.data || [])
                .map((work) => work.projectName || work.projectId?.projectName)
                .filter(Boolean)
            ),
          ];
          // 3. Fetch files by project names
          if (projectNames.length > 0) {
            const filesRes = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/file-uploads/by-projects`,
              { projectNames },
              { withCredentials: true }
            );
            files = filesRes.data;
          } else {
            files = [];
          }
        } else {
          // Default: show all files
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/file-uploads/`,
            { withCredentials: true }
          );
          files = response.data;
        }
  
        setDocuments(files);
      } catch (err) {
        setError("Failed to fetch documents");
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/file-uploads/${id}`, { withCredentials: true });
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
              {(userRole === "Team Member" || userRole === "Student" || userRole === "admin") && (<th>Uploaded By</th>)}
              <th>Document</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No documents found</td></tr>
            ) : (
              documents.map((doc, idx) => (
                <tr key={doc._id}>
                  <td>{idx + 1}</td>
                  <td>{doc.projectName}</td>
                  <td>{formatDate(doc.uploadDate)}</td>
                  {/* Show uploadedBy for team members and students */}
                  {(userRole === "Team Member" || userRole === "Student" || userRole === "admin") && (
                    <td>{doc.uploadedBy?.fullName || doc.uploadedBy || "N/A"}</td>
                  )}
                  <td>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/file-uploads/${doc._id}`}
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

export default Documents;
