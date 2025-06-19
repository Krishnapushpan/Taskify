import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Projects.css";

const ProfileCard = ({ user, onClick }) => {
  // Determine position: show user.position if available, otherwise 'Learning' for students
  let position = user.position;
  if (!position && (user.role === 'Student' || user.role === 'student')) {
    position = 'Learning';
  }
  return (
    <div className="profile-card" onClick={onClick}>
      <div className="profile-card-avatar">
        {(user.fullName || user.name || "U")[0]}
      </div>
      <div className="profile-card-name">{user.fullName || user.name}</div>
      {position && (
        <div className="profile-card-position">{position}</div>
      )}
      {user.skills && user.skills.length > 0 && (
        <div className="profile-card-skills">
          {user.skills.map((skill, idx) => (
            <span key={idx} className="profile-card-skill">
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ViewDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { project } = location.state || {};

  // State for assignment details
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAssignments, setUserAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Get user role from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUserRole(userData?.role || "");
  }, []);

  // Get projectId for fetching assignment
  const projectId = project?._id || project?.project?._id;

  useEffect(() => {
    // If project already has teamMembers and students, use it directly
    if ((project?.teamMembers && project?.teamMembers.length > 0) || (project?.students && project?.students.length > 0)) {
      setAssignment(project);
      return;
    }
    // Otherwise, fetch assignment details
    if (projectId) {
      setLoading(true);
      axios.get(`${import.meta.env.VITE_API_URL}/api/teams/project/${projectId}`, { withCredentials: true })
        .then(res => {
          setAssignment(res.data);
          setError("");
        })
        .catch(err => {
          setAssignment(null);
          setError("No team assignment found for this project");
        })
        .finally(() => setLoading(false));
    }
  }, [project, projectId]);

  const handleUserCardClick = async (user) => {
    setSelectedUser(user);
    setLoadingAssignments(true);
    try {
      // Try to fetch assignments for this user and project
      // If you have a direct endpoint, use it. Otherwise, fetch all assignments for the project and filter.
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/works/project-by-name/${encodeURIComponent(project.projectName || project.project?.projectName)}/assignments-by-status?status=all`, { withCredentials: true });
      // Filter assignments for this user
      const userId = user._id;
      const filtered = res.data.filter(a => {
        const memberIds = (a.teamMembers || []).map(m => m._id || m);
        const studentIds = (a.students || []).map(s => s._id || s);
        return memberIds.includes(userId) || studentIds.includes(userId);
      });
      setUserAssignments(filtered);
    } catch (err) {
      setUserAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  if (!project) {
    return (
      <div className="view-details-container">
        <h2>No project details found.</h2>
        <button className="back-button" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const projectName = project.projectName || project.project?.projectName;
  const description = project.description || project.project?.description;
  const startDate = project.startDate || project.project?.startDate;
  const endDate = project.endDate || project.project?.endDate;

  // Use assignment if available, else fallback to project
  const teamMembers = assignment?.teamMembers || project.teamMembers || [];
  const students = assignment?.students || project.students || [];
  const teamLead = assignment?.teamLead || project.teamLead || null;

  return (
    <div className="view-details-container">
      <div className="view-details-header">
        <h2 className="view-details-title">{projectName}</h2>
        <div className="view-details-description">{description}</div>
        <div className="view-details-dates">
          <div className="view-details-date-item">
            <b>Start Date</b>
            <span>{startDate ? new Date(startDate).toLocaleDateString() : "-"}</span>
          </div>
          <div className="view-details-date-item">
            <b>Due Date</b>
            <span>{endDate ? new Date(endDate).toLocaleDateString() : "-"}</span>
          </div>
          {teamLead && (
            <div className="view-details-date-item">
              <b>Team Lead</b>
              <span>
                {teamLead.fullName || teamLead.name}
                {teamLead.position && (
                  <span style={{ color: "#888", marginLeft: 8 }}>({teamLead.position})</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
      {loading ? (
        <div>Loading team assignment...</div>
      ) : error ? (
        <div style={{ color: "#e53935", marginBottom: 16 }}>{error}</div>
      ) : (
        <div className="view-details-section">
          <div>
            <h4>Team Members</h4>
            <div className="profile-cards-container">
              {teamMembers.length > 0 ? teamMembers.map((m, idx) => (
                <ProfileCard key={m._id || idx} user={m} onClick={() => handleUserCardClick(m)} />
              )) : <div style={{ color: "#aaa" }}>None</div>}
            </div>
          </div>
          <div>
            <h4>Students</h4>
            <div className="profile-cards-container">
              {students.length > 0 ? students.map((s, idx) => (
                <ProfileCard key={s._id || idx} user={s} onClick={() => handleUserCardClick(s)} />
              )) : <div style={{ color: "#aaa" }}>None</div>}
            </div>
          </div>
        </div>
      )}
      {/* Work assignments for selected user */}
      {selectedUser && (
        <div className="assignments-section">
          <h3 className="assignments-title">Work assigned to {selectedUser.fullName || selectedUser.name}</h3>
          {loadingAssignments ? (
            <div>Loading assignments...</div>
          ) : userAssignments.length === 0 ? (
            <div>No assignments found for this user.</div>
          ) : (
            <div className="assignments-table-container">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Remaining Days</th>
                  </tr>
                </thead>
                <tbody>
                  {userAssignments.map((a) => (
                    <tr key={a._id}>
                      <td>{a.workDescription}</td>
                      <td>{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "-"}</td>
                      <td className={`status-${a.status.toLowerCase().replace(' ', '-')}`}>
                        {a.status}
                      </td>
                      <td>{a.percentage !== undefined ? `${a.percentage}%` : (a.progress !== undefined ? `${a.progress}%` : "-")}</td>
                      <td className={a.remainingDays < 0 ? 'remaining-days-overdue' : 'remaining-days'}>
                        {a.remainingDays < 0 ? `Overdue (${Math.abs(a.remainingDays)})` : a.remainingDays}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default ViewDetails;
