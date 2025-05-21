import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaUsers,
  FaUserTie,
  FaSync,
} from "react-icons/fa";

const AssignTeam = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teamLeads, setTeamLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Function to fetch project details
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Get project data with any existing team assignment
        const projectResponse = await axios.get(
          `/api/projects/${projectId}/with-team`,
          {
            withCredentials: true,
          }
        );

        console.log("Project with team response:", projectResponse.data);

        if (projectResponse.data && projectResponse.data.project) {
          setProject(projectResponse.data.project);

          // If team is already assigned, pre-select them
          if (projectResponse.data.team) {
            const team = projectResponse.data.team;
            if (team.teamLead) {
              setSelectedTeamLead(team.teamLead._id);
            }
            if (team.teamMembers && team.teamMembers.length > 0) {
              setSelectedTeamMembers(
                team.teamMembers.map((member) => member._id)
              );
            }
            if (team.students && team.students.length > 0) {
              setSelectedStudents(team.students.map((student) => student._id));
            }
          }
        }

        // Fetch team leads
        const leadsResponse = await axios.get("/api/users/team-leads", {
          withCredentials: true,
        });

        if (leadsResponse.data && leadsResponse.data.teamLeads) {
          const formattedLeads = leadsResponse.data.teamLeads.map((lead) => ({
            id: lead._id,
            name: lead.fullName,
            role: lead.position || "Team Lead",
            email: lead.email,
            skills: [lead.position || "Leadership"],
          }));
          setTeamLeads(formattedLeads);
        }

        // Fetch team members
        const membersResponse = await axios.get("/api/users/team-members", {
          withCredentials: true,
        });

        if (membersResponse.data && membersResponse.data.teamMembers) {
          const formattedMembers = membersResponse.data.teamMembers.map(
            (member) => ({
              id: member._id,
              name: member.fullName,
              role: member.position || "Team Member",
              email: member.email,
              skills: [member.position || "Development"],
            })
          );
          setTeamMembers(formattedMembers);
        }

        // Fetch students
        const studentsResponse = await axios.get("/api/users/students", {
          withCredentials: true,
        });

        if (studentsResponse.data && studentsResponse.data.students) {
          const formattedStudents = studentsResponse.data.students.map(
            (student) => ({
              id: student._id,
              name: student.fullName,
              role: "Student",
              email: student.email,
              skills: ["Learning"],
            })
          );
          setStudents(formattedStudents);
        }
      } catch (err) {
        console.error("Error fetching project or team data:", err);
        setError(
          "Failed to load project or team data. " +
            (err.response?.data?.message || "")
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  // Format date to display in DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Handler for selecting a team lead
  const handleTeamLeadSelect = (teamLeadId) => {
    setSelectedTeamLead(selectedTeamLead === teamLeadId ? null : teamLeadId);
  };

  // Handler for selecting team members
  const handleTeamMemberSelect = (memberId) => {
    setSelectedTeamMembers((prevSelected) => {
      if (prevSelected.includes(memberId)) {
        return prevSelected.filter((id) => id !== memberId);
      } else {
        return [...prevSelected, memberId];
      }
    });
  };

  // Handler for selecting students
  const handleStudentSelect = (studentId) => {
    setSelectedStudents((prevSelected) => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter((id) => id !== studentId);
      } else {
        return [...prevSelected, studentId];
      }
    });
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      const assignmentData = {
        projectId,
        teamLeadId: selectedTeamLead,
        teamMemberIds: selectedTeamMembers,
        studentIds: selectedStudents,
        projectName: project?.projectName,
        description: project?.description,
        startDate: project?.startDate,
        dueDate: project?.endDate,
      };

      console.log("Sending assignment data:", assignmentData);

      const response = await axios.post("/api/teams/assign", assignmentData, {
        withCredentials: true,
      });

      console.log("Assignment response:", response.data);

      setSuccessMessage("Team assigned successfully!");

      // Navigate back to projects after a short delay
      setTimeout(() => {
        navigate("/view-more-projects");
      }, 2000);
    } catch (err) {
      console.error("Error assigning team:", err);
      setError(
        "Failed to assign team: " +
          (err.response?.data?.message || "Unknown error")
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Function to get initials from a name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="assign-team-page">
        <div className="assign-team-content">
          <div className="assign-team-header">
            <h1 className="assign-team-title">
              <FaSync className="loading-icon spinning" /> Loading project
              details...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="assign-team-page">
        <div className="assign-team-content">
          <div className="assign-team-header">
            <h1 className="assign-team-title">Error</h1>
            <div className="error-message">{error}</div>
            <Link to="/view-more-projects" className="back-button">
              <FaArrowLeft /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="assign-team-page">
        <div className="assign-team-content">
          <div className="assign-team-header">
            <h1 className="assign-team-title">Project not found</h1>
            <Link to="/view-more-projects" className="back-button">
              <FaArrowLeft /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assign-team-page">
      <div className="assign-team-content">
        <div className="assign-team-header">
          <h1 className="assign-team-title">Assign Team to Project</h1>
          <Link to="/view-more-projects" className="back-button">
            <FaArrowLeft /> Back to Projects
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="centered-content-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="assign-team-container">
              {/* Project header with name and description */}
              <div className="assign-team-project-header">
                <div className="assign-team-project-name">
                  {project.projectName}
                </div>
                <div className="assign-team-project-description">
                  {project.description}
                </div>
              </div>

              {/* Project details section */}
              <div className="assign-team-project-details">
                <div className="assign-team-detail">
                  <div className="assign-team-detail-label">
                    <FaCalendarAlt style={{ marginRight: "8px" }} />
                    Start Date
                  </div>
                  <div className="assign-team-detail-value">
                    {formatDate(project.startDate)}
                  </div>
                </div>
                <div className="assign-team-detail">
                  <div className="assign-team-detail-label">
                    <FaCalendarAlt style={{ marginRight: "8px" }} />
                    Due Date
                  </div>
                  <div className="assign-team-detail-value">
                    {formatDate(project.endDate)}
                  </div>
                </div>
                {project.budget && (
                  <div className="assign-team-detail">
                    <div className="assign-team-detail-label">Budget</div>
                    <div className="assign-team-detail-value">
                      ${project.budget}
                    </div>
                  </div>
                )}
              </div>

              {/* Team selection sections */}
              <div className="team-lead-section">
                <div className="assign-team-section-title">
                  <FaUserTie style={{ marginRight: "8px" }} />
                  Select Team Lead (Choose 1)
                </div>
                <ul className="team-member-list">
                  {teamLeads.length === 0 ? (
                    <li className="no-members-item">No team leads available</li>
                  ) : (
                    teamLeads.map((lead) => (
                      <li
                        key={lead.id}
                        className={`team-member-item ${
                          selectedTeamLead === lead.id ? "selected" : ""
                        }`}
                        onClick={() => handleTeamLeadSelect(lead.id)}
                      >
                        <input
                          type="radio"
                          className="team-member-checkbox"
                          checked={selectedTeamLead === lead.id}
                          onChange={() => handleTeamLeadSelect(lead.id)}
                        />
                        <div className="team-member-avatar">
                          {getInitials(lead.name)}
                        </div>
                        <div className="team-member-details">
                          <div className="team-member-name">{lead.name}</div>
                          <div className="team-member-role">{lead.role}</div>
                          <div className="member-skills">
                            {lead.skills.map((skill, index) => (
                              <span key={index} className="member-skill">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="assign-team-grid">
                <div className="assign-team-section">
                  <div className="assign-team-section-title">
                    <FaUsers style={{ marginRight: "8px" }} />
                    Select Team Members
                  </div>
                  <ul className="team-member-list">
                    {teamMembers.length === 0 ? (
                      <li className="no-members-item">
                        No team members available
                      </li>
                    ) : (
                      teamMembers.map((member) => (
                        <li
                          key={member.id}
                          className={`team-member-item ${
                            selectedTeamMembers.includes(member.id) ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="team-member-checkbox"
                            checked={selectedTeamMembers.includes(member.id)}
                            onChange={() => handleTeamMemberSelect(member.id)}
                          />
                          <div className="team-member-avatar">
                            {getInitials(member.name)}
                          </div>
                          <div className="team-member-details">
                            <div className="team-member-name">
                              {member.name}
                            </div>
                            <div className="team-member-role">
                              {member.role}
                            </div>
                            <div className="member-skills">
                              {member.skills.map((skill, index) => (
                                <span key={index} className="member-skill">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="assign-team-section">
                  <div className="assign-team-section-title">
                    <FaUsers style={{ marginRight: "8px" }} />
                    Select Students
                  </div>
                  <ul className="team-member-list">
                    {students.length === 0 ? (
                      <li className="no-members-item">No students available</li>
                    ) : (
                      students.map((student) => (
                        <li
                          key={student.id}
                          className={`team-member-item ${
                            selectedStudents.includes(student.id) ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="team-member-checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleStudentSelect(student.id)}
                          />
                          <div className="team-member-avatar">
                            {getInitials(student.name)}
                          </div>
                          <div className="team-member-details">
                            <div className="team-member-name">
                              {student.name}
                            </div>
                            <div className="team-member-role">
                              {student.role}
                            </div>
                            <div className="member-skills">
                              {student.skills.map((skill, index) => (
                                <span key={index} className="member-skill">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="submit-button-container">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <FaSync
                        className="spinning"
                        style={{ marginRight: "10px" }}
                      />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle style={{ marginRight: "10px" }} />
                      Assign Team to Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignTeam;
