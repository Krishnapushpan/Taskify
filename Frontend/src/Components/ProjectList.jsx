import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSyncAlt, FaWindowMinimize, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const statusOptions = [
  "Planning",
  "In Progress",
  "Completed",
  "Pending",
  "Started",
];

const ProjectList = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [user, setUser] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const userData = JSON.parse(localStorage.getItem("user"));
        let response;

        if (userData?.role === "admin") {
          // Admin: fetch all assignments
          response = await axios.get("/api/teams/all", {
            withCredentials: true,
          });
        } else {
          // Others: fetch only relevant assignments
          const userId = userData?.userid;
          response = await axios.get(
            `/api/teams/user-assignments?userId=${userId}`,
            { withCredentials: true }
          );
        }
        setAssignments(response.data);
      } catch (err) {
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();

    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("Logged in user ID:", userData?.userid);
    console.log("Full user data:", userData);
    setUser(userData);

    // Set up window resize listener for responsive design
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Function to refresh the project list
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      let response;

      if (userData?.role === "admin") {
        response = await axios.get("/api/teams/all", { withCredentials: true });
      } else {
        const userId = userData?.userid;
        response = await axios.get(
          `/api/teams/user-assignments?userId=${userId}`,
          { withCredentials: true }
        );
      }
      setAssignments(response.data);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to minimize the project list
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    console.log("Project list minimized/maximized");
  };

  // Function to close the project list
  const handleClose = () => {
    setIsVisible(false);
    console.log("Project list closed");
  };

  const handleEditClick = (assignment) => {
    setEditingStatusId(assignment._id);
    setStatusUpdate(assignment.status || assignment.project?.status || "");
  };

  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      await axios.patch(
        `/api/teams/${assignmentId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId
            ? {
                ...a,
                status: newStatus,
                project: { ...a.project, status: newStatus },
              }
            : a
        )
      );
      setEditingStatusId(null);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (!isVisible) {
    return null;
  }

  // Determine if we should show the compact view
  const isCompactView = windowWidth < 768;

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2 className="project-list-title">Projects</h2>
        <div className="project-list-actions">
          <div
            className={isLoading ? "fa-spin" : ""}
            style={{ cursor: "pointer" }}
          >
            <FaSyncAlt
              style={{ color: "#adb5bd", fontSize: "16px" }}
              onClick={handleRefresh}
              title="Refresh"
            />
          </div>
          <FaWindowMinimize
            style={{
              color: "#adb5bd",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "-10px",
            }}
            onClick={handleMinimize}
            title="Minimize"
          />
          <FaTimes
            style={{ color: "#adb5bd", fontSize: "16px", cursor: "pointer" }}
            onClick={handleClose}
            title="Close"
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          Loading projects...
        </div>
      ) : (
        !isMinimized && (
          <div className="table-responsive">
            <table className="project-list-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project Name</th>
                  {!isCompactView && <th>Description</th>}
                  <th>Start Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  {!isCompactView && <th>Team Lead</th>}
                  {!isCompactView && <th>Team Members</th>}
                  {!isCompactView && <th>Students</th>}
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isCompactView ? 5 : 9}
                      style={{ textAlign: "center" }}
                    >
                      No projects found
                    </td>
                  </tr>
                ) : (
                  assignments.map((a, idx) => {
                    const isTeamLead =
                      user &&
                      a.teamLead &&
                      (user._id === a.teamLead._id ||
                        user.email === a.teamLead.email);
                    return (
                      <tr key={a._id}>
                        <td>{idx + 1}</td>
                        <td>
                          {a.projectName || a.project?.projectName}
                          {isCompactView && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#777",
                                marginTop: "4px",
                              }}
                            >
                              Lead: {a.teamLead?.fullName || "N/A"}
                            </div>
                          )}
                        </td>
                        {!isCompactView && (
                          <td>{a.description || a.project?.description}</td>
                        )}
                        <td>
                          {formatDate(a.startDate || a.project?.startDate)}
                        </td>
                        <td>{formatDate(a.dueDate || a.project?.endDate)}</td>
                        <td>
                          {editingStatusId === a._id ? (
                            <select
                              className="status-dropdown"
                              value={statusUpdate}
                              onChange={(e) => {
                                setStatusUpdate(e.target.value);
                                handleStatusChange(a._id, e.target.value);
                              }}
                              autoFocus
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <>
                              {a.status || a.project?.status || "N/A"}
                              {isTeamLead && (
                                <>
                                  <button
                                    className="status-edit-btn"
                                    onClick={() => handleEditClick(a)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="assign-work-btn"
                                    style={
                                      isCompactView ? {} : { marginLeft: "8px" }
                                    }
                                    onClick={() =>
                                      navigate(`/assign-work/${a._id}`, {
                                        state: {
                                          projectName:
                                            a.projectName ||
                                            a.project?.projectName,
                                          description:
                                            a.description ||
                                            a.project?.description,
                                          startDate:
                                            a.startDate || a.project?.startDate,
                                          endDate:
                                            a.dueDate || a.project?.endDate,
                                          projectId: a._id,
                                          project: a.project,
                                        },
                                      })
                                    }
                                  >
                                    Assign Work
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </td>
                        {!isCompactView && (
                          <td>{a.teamLead?.fullName || "N/A"}</td>
                        )}
                        {!isCompactView && (
                          <td>
                            {a.teamMembers && a.teamMembers.length > 0
                              ? a.teamMembers.map((m) => m.fullName).join(", ")
                              : "N/A"}
                          </td>
                        )}
                        {!isCompactView && (
                          <td>
                            {a.students && a.students.length > 0
                              ? a.students.map((s) => s.fullName).join(", ")
                              : "N/A"}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default ProjectList;
