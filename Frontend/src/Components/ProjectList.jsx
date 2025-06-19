import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaSyncAlt, FaWindowMinimize, FaTimes, FaBell, FaTrash, FaUpload, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  // const [searchTerm, setSearchTerm] = useState("");
  const [editingPercentageId, setEditingPercentageId] = useState(null);
  const [percentageUpdate, setPercentageUpdate] = useState("");
  const [meetingSchedulerOpen, setMeetingSchedulerOpen] = useState(null);
  const [meetingDate, setMeetingDate] = useState(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationDropdownRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState({});
  const [uploading, setUploading] = useState({});
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const userData = JSON.parse(localStorage.getItem("user"));
        let response;

        if (userData?.role === "admin") {
          // Admin: fetch all assignments
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/teams/all`,
            {
              withCredentials: true,
            }
          );
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams/all`, {
            withCredentials: true,
          });
        } else if (userData?.role === "Client") {
          // Client: fetch assignments for projects created by this client
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/teams/by-project-creator?creatorId=${userData.userid}`,
            { withCredentials: true }
          );
        } else {
          // Others: fetch only relevant assignments
          const userId = userData?.userid;
          response = await axios.get(
            `${
              import.meta.env.VITE_API_URL
            }/api/teams/user-assignments?userId=${userId}`,
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
      console.log("try", userData.role);
      if (userData?.role === "admin") {
        response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/teams/all`,
          { withCredentials: true }
        );
      } else {
        const userId = userData?.userid;
        response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/teams/user-assignments?userId=${userId}`,
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
      const formData = new FormData();
      formData.append("status", newStatus);
      
      if (selectedFile) {
        formData.append("workFile", selectedFile);
      }
  
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/teams/${assignmentId}/status`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true
        }
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
      setSelectedFile(null);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleFileChange = (assignmentId, file) => {
    setSelectedFile(prev => ({ ...prev, [assignmentId]: file }));
  };

  const handleFileUpload = async (assignmentId) => {
    const file = selectedFile[assignmentId];
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB");
      return;
    }
    try {
      setUploading(prev => ({ ...prev, [assignmentId]: true }));
      const formData = new FormData();
      formData.append("workFile", file);
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/teams/${assignmentId}/status`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      const assignment = assignments.find(a => a._id === assignmentId);
      const userData = JSON.parse(localStorage.getItem("user"));
      const fileFormData = new FormData();
      fileFormData.append("file", file);
      fileFormData.append("projectId", assignment.project?._id || assignment.projectId);
      fileFormData.append("projectName", assignment.projectName || assignment.project?.projectName);
      fileFormData.append("uploadedBy", userData.userid);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/file-uploads/`,
        fileFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      alert("File uploaded successfully!");
      setSelectedFile(prev => ({ ...prev, [assignmentId]: null }));
      setAssignments(prev => prev.map(a => a._id === assignmentId ? { ...a, workFile: { data: true } } : a));
    } catch (err) {
      alert("Failed to upload file");
    } finally {
      setUploading(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const handleDownloadFile = async (assignmentId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/teams/work-file/${assignmentId}`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Failed to download file.");
    }
  };

  const handleEditPercentageClick = (assignment) => {
    setEditingPercentageId(assignment._id);
    setPercentageUpdate(assignment.percentage || 0);
  };

  const handlePercentageChange = async (assignmentId, newPercentage) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/teams/${assignmentId}/percentage`,
        { percentage: parseInt(newPercentage) },
        { withCredentials: true }
      );
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId
            ? {
                ...a,
                percentage: parseInt(newPercentage),
              }
            : a
        )
      );
      setEditingPercentageId(null);
    } catch (err) {
      alert("Failed to update percentage");
    }
  };

  // Add new function to handle project start notification
  const handleProjectStart = async (assignment) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          projectId: assignment._id,
          projectName: assignment.projectName || assignment.project?.projectName,
          message: `Project "${assignment.projectName || assignment.project?.projectName}" has been started`,
          senderId: userData.userid,
          senderName: userData.fullName,
          receiverId: assignment.projectCreator,
          type: 'project_start'
        },
        { withCredentials: true }
      );

      // Update project status
      await handleStatusChange(assignment._id, "Started");
      
      alert("Project start notification sent to client!");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification");
    }
  };


  // Add function to fetch notifications
  const fetchNotifications = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications/user/${userData.userid}`,
        { withCredentials: true }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Add useEffect for notifications
  useEffect(() => {
    if (user?.role === "Client") {
      fetchNotifications();
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/notifications/user/${userData.userid}/read-all`,
        {},
        { withCredentials: true }
      );
      // Update local state: set all notifications as read
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const handleDeleteFile = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/teams/work-file/${assignmentId}`,
        { withCredentials: true }
      );
      alert("File deleted successfully!");
      setAssignments((prev) => prev.map(a => a._id === assignmentId ? { ...a, workFile: null } : a));
    } catch (err) {
      alert("Failed to delete file");
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
          {user?.role === "Client" && (
            <div className="notification-icon" style={{ position: 'relative', marginRight: '15px' }}>
              <FaBell
                style={{ color: "#adb5bd", fontSize: "16px", cursor: "pointer" }}
                onClick={async () => {
                  if (!showNotifications) {
                    await markAllNotificationsAsRead();
                  }
                  setShowNotifications(!showNotifications);
                }}
              />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
              {showNotifications && (
                <div className="notification-dropdown" ref={notificationDropdownRef}>
                  <button
                    className="notification-close-btn"
                    onClick={() => setShowNotifications(false)}
                    title="Close"
                  >
                    ×
                  </button>
                  {notifications.length === 0 ? (
                    <div className="notification-item">No notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification._id} className="notification-item">
                        <button
                          className="notification-delete-btn"
                          onClick={async () => {
                            try {
                              await axios.delete(
                                `${import.meta.env.VITE_API_URL}/api/notifications/${notification._id}`,
                                { withCredentials: true }
                              );
                              setNotifications((prev) =>
                                prev.filter((n) => n._id !== notification._id)
                              );
                            } catch (err) {
                              alert("Failed to delete notification");
                            }
                          }}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                        <p>{notification.message}</p>
                        <small>{new Date(notification.createdAt).toLocaleString()}</small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
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

      {/* Search box for clients
      {user?.role === "Client" && (
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search by project name"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: "6px", marginRight: "8px" }}
          />
          <button onClick={handleSearch} style={{ padding: "6px 12px" }}>
            Search
          </button>
        </div>
      )} */}

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
                  {user?.role === "Team Lead" && <th>Assign Work</th>}
                  <th>Progress</th>
                  {user?.role === "Client" && <th>Team Manager</th>}
                  {user?.role !== "Client" && !isCompactView && user?.role !== "Team Lead" && <th>Team Lead</th>}
                  {user?.role !== "Client" && !isCompactView &&  user?.role !== "Team Lead" &&<th>Team Members</th>}
                  {user?.role !== "Client" && !isCompactView  && user?.role !== "Team Lead" &&<th>Students</th>}
                  {user?.role === "Client" && <th>Schedule Meeting</th>}
                  {user?.role === "Team Lead" && <th>Work File</th>}
                  {user?.role === "Client" || user?.role === "admin" &&<th>Documents</th>}
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isCompactView ? 6 : user?.role === "Client" ? 12 : 11}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                              {/* {isTeamLead && (
                                <input
                                  type="file"
                                  onChange={handleFileChange}
                                  className="text-sm"
                                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                />
                              )} */}
                            </div>
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
                                  {a.status === "Planning" && (
                                    <button
                                      className="start-project-btn"
                                      style={{ marginLeft: "8px" }}
                                      onClick={() => handleProjectStart(a)}
                                    >
                                      Start Project
                                    </button>
                                  )}
                                  
                                </>
                              )}
                            </>
                          )}
                        </td>
                        {user?.role === "Team Lead" &&<td> {isTeamLead && (
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
                        </button>)}</td>}
                        <td>
                          {editingPercentageId === a._id ? (
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
                                onClick={() => handlePercentageChange(a._id, percentageUpdate)}
                                style={{ padding: '2px 8px' }}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {a.percentage || 0}%
                              {isTeamLead && (
                                <button
                                  className="status-edit-btn"
                                  onClick={() => handleEditPercentageClick(a)}
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        {/* Team Manager column for client only */}
                        {user?.role === "Client" && <td>Admin</td>}
                        {/* Only show these columns if not client */}
                        {user?.role !== "Client" && user?.role !== "Team Lead" && !isCompactView && (
                          <td>{a.teamLead?.fullName || "N/A"}</td>
                        )}
                        {user?.role !== "Client" && user?.role !== "Team Lead" && !isCompactView && (
                          <td>
                            {a.teamMembers && a.teamMembers.length > 0
                              ? a.teamMembers.map((m) => m.fullName).join(", ")
                              : "N/A"}
                          </td>
                        )}
                        {user?.role !== "Client" && user?.role !== "Team Lead" && !isCompactView &&  (
                          <td>
                            {a.students && a.students.length > 0
                              ? a.students.map((s) => s.fullName).join(", ")
                              : "N/A"}
                          </td>
                        )}
                        {/* Schedule Meeting column for client only */}
                        {user?.role === "Client" && (
                          <td>
                            <button
                              className="status-edit-btn"
                              onClick={() => setMeetingSchedulerOpen(meetingSchedulerOpen === a._id ? null : a._id)}
                            >
                              Schedule Meeting
                            </button>
                            {meetingSchedulerOpen === a._id && (
                              <div style={{ marginTop: 8 }}>
                                <DatePicker
                                  selected={meetingDate}
                                  onChange={date => setMeetingDate(date)}
                                  showTimeSelect
                                  timeFormat="HH:mm"
                                  timeIntervals={15}
                                  dateFormat="MMMM d, yyyy h:mm aa"
                                  placeholderText="Select date & time"
                                  minDate={new Date()}
                                />
                                <button
                                  style={{ marginLeft: 8, padding: '4px 12px' }}
                                  onClick={async () => {
                                    if (meetingDate) {
                                      try {
                                        const userData = JSON.parse(localStorage.getItem("user"));
                                        await axios.post(`${import.meta.env.VITE_API_URL}/api/meetings`, {
                                          projectId: a.project?._id || a.projectId,
                                          projectCreator: a.projectCreator || userData?.userid,
                                          fullName: userData?.fullName || '',
                                          projectName: a.projectName || a.project?.projectName || '',
                                          dueDate: a.dueDate || a.project?.endDate || '',
                                          meetingDateTime: meetingDate,
                                        }, { withCredentials: true });
                                        alert(`Meeting scheduled for ${meetingDate.toLocaleString()}`);
                                      } catch (err) {
                                        alert('Failed to schedule meeting.');
                                      }
                                      setMeetingSchedulerOpen(null);
                                      setMeetingDate(null);
                                    } else {
                                      alert('Please select a date and time.');
                                    }
                                  }}
                                >
                                  Confirm
                                </button>
                                <button
                                  style={{ marginLeft: 8, padding: '4px 12px' }}
                                  onClick={() => {
                                    setMeetingSchedulerOpen(null);
                                    setMeetingDate(null);
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                        {/* View Document button for admin and client */}
                        {(user?.role === "admin" || user?.role === "Client") && (
                          ((a.projectFile && a.projectFile.data) || (a.project && a.project.projectFile && a.project.projectFile.data)) && (
                            <td>
                              <a
                                href={`${import.meta.env.VITE_API_URL}/api/teams/file/${a._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view-document-button"
                                style={{ marginLeft: "10px" }}
                              >
                                View Document
                              </a>
                            </td>
                          )
                        )}
                        {user?.role === "Team Lead" && (
                          <td>
                            <input
                              type="file"
                              onChange={e => handleFileChange(a._id, e.target.files[0])}
                              className="text-sm"
                              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            />
                            {selectedFile[a._id] && (
                              <button
                                onClick={() => handleFileUpload(a._id)}
                                disabled={uploading[a._id]}
                                style={{ marginLeft: 8, padding: '2px 8px' }}
                              >
                                {uploading[a._id] ? 'Uploading...' : 'Upload'}
                              </button>
                            )}
                            {!a.workFile || !a.workFile.data ? (
                              <span style={{ color: '#aaa', marginLeft: 8 }}>No File</span>
                            ) : null}
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

      <style jsx>{`
        .notification-icon {
          position: relative;
        }
        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #ff4444;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 12px;
        }
        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 1000;
          min-width: 400px;
          max-width: 500px;
          max-height: 500px;
          overflow-y: auto;
          padding-top: 28px;
        }
        .notification-item {
          padding: 14px 16px 10px 16px;
          border-bottom: 1px solid #eee;
        }
        .notification-item:last-child {
          border-bottom: none;
        }
        .notification-item p {
          margin: 0;
          font-size: 15px;
        }
        .notification-item small {
          color: #666;
          font-size: 13px;
        }
        .notification-close-btn {
          position: absolute;
          top: 4px;
          right: 8px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #888;
        }
        .notification-close-btn:hover {
          color: #ff4444;
        }
        .start-project-btn {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .start-project-btn:hover {
          background-color: #218838;
        }
        .notification-delete-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          float: right;
          margin-left: 8px;
          font-size: 15px;
        }
        .notification-delete-btn:hover {
          color: #ff4444;
        }
      `}</style>
    </div>
  );
};

export default ProjectList;
