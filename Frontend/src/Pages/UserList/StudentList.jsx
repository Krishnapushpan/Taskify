import React, { useState, useEffect } from "react";
import axios from "axios";
import "./List.css";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userData?.role === "admin");
  }, []);

  // Fetch students when component mounts
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/students", {
        withCredentials: true,
      });
      setStudents(response.data.students);
      setError("");
    } catch (error) {
      setError("Failed to fetch students. Please try again later.");
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const student = students.find((s) => s._id === id);
    setEditStudent({ ...student });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`/api/users/${id}`, { withCredentials: true });
        setStudents(students.filter((student) => student._id !== id));
        setError(""); // Clear any existing errors
      } catch (error) {
        console.error("Delete error:", error);
        setError("Failed to delete student. Please try again.");
      }
    }
  };

  const handleModalChange = (e) => {
    setEditStudent({ ...editStudent, [e.target.name]: e.target.value });
  };

  const handleModalSave = async () => {
    try {
      // Add update API call here when implemented
      // await axios.put(`/api/users/${editStudent._id}`, editStudent);
      setStudents(
        students.map((s) => (s._id === editStudent._id ? editStudent : s))
      );
      setModalOpen(false);
      setEditStudent(null);
    } catch (error) {
      setError("Failed to update student. Please try again.");
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditStudent(null);
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="client-list-wrapper">
      <div className="project-list-container">
        <div className="project-list-header">
          <h2 className="project-list-title">Students</h2>
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
                <th>Role</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student._id}>
                  <td>{idx + 1}</td>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.role}</td>
                  {isAdmin && (
                    <td>
                      <button
                        className="client-edit-btn"
                        onClick={() => handleEdit(student._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="client-delete-btn"
                        onClick={() => handleDelete(student._id)}
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
            <h3>Edit Student</h3>
            <label className="modal-label">
              Full Name:
              <input
                type="text"
                name="fullName"
                value={editStudent.fullName}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Email:
              <input
                type="email"
                name="email"
                value={editStudent.email}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Phone Number:
              <input
                type="text"
                name="phone"
                value={editStudent.phone}
                onChange={handleModalChange}
                className="modal-input"
              />
            </label>
            <label className="modal-label">
              Role:
              <input
                type="text"
                name="role"
                value={editStudent.role}
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

export default StudentList;
