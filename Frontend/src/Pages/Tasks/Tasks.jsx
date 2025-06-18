import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Tasks.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectNames, setProjectNames] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");
        const userData = JSON.parse(localStorage.getItem("user"));
        console.log("Fetching tasks for user:", userData);

        if (!userData?.userid) {
          throw new Error("User data not found");
        }

        let response;
        if (userData.role === "Admin" || userData.role === "admin") {
          // Admin: fetch all work assignments
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/works/all`,
            { withCredentials: true }
          );
        } else if (userData.role === "Team Lead") {
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/works`,
            {
              params: { teamLead: userData.userid },
              withCredentials: true
            }
          );
        } else {
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/works/personal`,
            {
              params: { userId: userData.userid },
              withCredentials: true
            }
          );
        }

        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setTasks(response.data);
          // For admin, extract unique project names for filtering
          if (userData.role === "Admin" || userData.role === "admin") {
            const uniqueProjects = [
              ...new Set(
                response.data.map(task => task.projectName || task.projectId?.projectName).filter(Boolean)
              )
            ];
            setProjectNames(uniqueProjects);
          }
        } else {
          setError("No tasks found");
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(
          err.response?.data?.message ||
          "Failed to fetch tasks. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      ).toString().padStart(2, "0")}/${date.getFullYear()}`;
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#4caf50";
      case "in progress":
        return "#ff9800";
      case "pending":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  // For admin, filter by project name
  const userData = JSON.parse(localStorage.getItem("user"));
  const isAdmin = userData?.role === "Admin" || userData?.role === "admin";
  const isTeamLead = userData?.role === "Team Lead";
  const isTeamMember = userData?.role === "Team Member";
  const isStudent = userData?.role === "Student";

  let filteredTasks = tasks;
  if (isAdmin && projectFilter !== "all") {
    filteredTasks = tasks.filter(task => (task.projectName || task.projectId?.projectName) === projectFilter);
  } else {
    filteredTasks = tasks.filter(task => {
      if (filter === "all") return true;
      if (filter === "team_members") return task.teamMembers?.length > 0;
      if (filter === "students") return task.students?.length > 0;
      return true;
    });
  }

  if (loading) {
    return (
      <div className="tasks-container">
        <div className="loading-state">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h2>{isTeamLead ? "Team Tasks" : isAdmin ? "All Tasks" : "My Tasks"}</h2>
        {isAdmin && projectNames.length > 0 && (
          <div className="filter-buttons">
            <button
              className={projectFilter === "all" ? "active" : ""}
              onClick={() => setProjectFilter("all")}
            >
              All Projects
            </button>
            {projectNames.map((name) => (
              <button
                key={name}
                className={projectFilter === name ? "active" : ""}
                onClick={() => setProjectFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        {isTeamLead && (
          <div className="filter-buttons">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              className={filter === "team_members" ? "active" : ""}
              onClick={() => setFilter("team_members")}
            >
              Team Members ({tasks.filter(task => task.teamMembers?.length > 0).length})
            </button>
            <button
              className={filter === "students" ? "active" : ""}
              onClick={() => setFilter("students")}
            >
              Students ({tasks.filter(task => task.students?.length > 0).length})
            </button>
          </div>
        )}
      </div>

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found.</p>
            {isTeamLead && <p>Try changing the filter or check back later for new tasks.</p>}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.projectName || "Untitled Task"}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status || "Pending"}
                </span>
              </div>
              <div className="task-description">
                {task.workDescription || "No description provided"}
              </div>
              <div className="task-details">
                <div className="detail-item">
                  <strong>Due Date:</strong> {formatDate(task.dueDate)}
                </div>
                <div className="detail-item">
                  <strong>Progress:</strong>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${task.percentage || 0}%`,
                        backgroundColor: task.percentage >= 100 ? '#4caf50' : '#1976d2'
                      }}
                    />
                    <span className="progress-text">{task.percentage || 0}%</span>
                  </div>
                </div>
                <div className="detail-item">
                  <strong>Priority:</strong>
                  <span style={{ color: getPriorityColor(task.priority) }}>
                    {task.priority || "Medium"}
                  </span>
                </div>
                {(isTeamMember || isStudent) && task.teamLead && (
                  <div className="detail-item">
                    <strong>Team Lead:</strong> {task.teamLead.fullName || task.teamLead}
                  </div>
                )}
              </div>
              {isTeamLead && (
                <div className="task-assignees">
                  {task.teamMembers?.length > 0 && (
                    <div className="assignee-section">
                      <strong>Team Members:</strong>
                      <ul>
                        {task.teamMembers.map((member) => (
                          <li key={member._id}>{member.fullName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {task.students?.length > 0 && (
                    <div className="assignee-section">
                      <strong>Students:</strong>
                      <ul>
                        {task.students.map((student) => (
                          <li key={student._id}>{student.fullName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {!isTeamLead && (
                <div className="task-assignees">
                  {task.teamMembers?.length > 0 && (
                    <div className="assignee-section">
                      <strong>Team Members:</strong>
                      <ul>
                        {task.teamMembers.map((member) => (
                          <li key={member._id}>{member.fullName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {task.students?.length > 0 && (
                    <div className="assignee-section">
                      <strong>Students:</strong>
                      <ul>
                        {task.students.map((student) => (
                          <li key={student._id}>{student.fullName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {task.workFile && (
                <div className="task-file">
                  <a
                    href={`${import.meta.env.VITE_API_URL}/api/works/${task._id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-file-button"
                  >
                    View Attached File
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
