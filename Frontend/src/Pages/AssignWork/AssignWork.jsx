import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaUsers,
  FaCheckCircle,
  FaSync,
  FaPlus,
  FaTimes,
  FaEdit,
  FaList,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./AssignWork.css";

const AssignWork = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const projectDataFromState = location.state || {};

  const [project, setProject] = useState(
    projectDataFromState.projectName
      ? {
          _id: projectId,
          projectName: projectDataFromState.projectName,
          description: projectDataFromState.description,
          startDate: projectDataFromState.startDate,
          endDate: projectDataFromState.endDate,
          ...projectDataFromState.project,
        }
      : null
  );
  const [teamMembers, setTeamMembers] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(!projectDataFromState.projectName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [showExisting, setShowExisting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize with one empty assignment
  useEffect(() => {
    setAssignments([
      {
        id: Date.now(),
        workDescription: "",
        selectedMembers: [],
        dueDate: "",
        priority: "Medium",
      },
    ]);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!projectDataFromState.projectName) {
          setIsLoading(true);
        }
        setError("");

        // First, try to fetch project details with team
        let projectData = null;
        try {
          const projectResponse = await axios.get(
            `/api/projects/${projectId}/with-team`,
            { withCredentials: true }
          );
          projectData = projectResponse.data?.project || projectResponse.data;

          // Only update project state if we didn't already have data from location.state
          // or if the API data has more details
          if (!project || !project.projectName) {
            setProject(projectData);
          }
        } catch (err) {
          console.warn(
            "Failed to fetch project with team, trying basic project fetch:",
            err
          );

          // Fallback: try to get basic project info
          if (!project || !project.projectName) {
            try {
              const basicProjectResponse = await axios.get(
                `/api/projects/${projectId}`,
                { withCredentials: true }
              );
              projectData =
                basicProjectResponse.data?.project || basicProjectResponse.data;
              setProject(projectData);
            } catch (basicErr) {
              console.error("Failed to fetch basic project info:", basicErr);
            }
          }
        }

        // Fetch team members
        try {
          const membersResponse = await axios.get("/api/users/team-members", {
            withCredentials: true,
          });

          const members =
            membersResponse.data?.teamMembers ||
            membersResponse.data?.data ||
            membersResponse.data ||
            [];
          setTeamMembers(Array.isArray(members) ? members : []);
        } catch (err) {
          console.warn("Failed to fetch team members:", err);

          // Fallback: try to get all users and filter by role
          try {
            const allUsersResponse = await axios.get("/api/users", {
              withCredentials: true,
            });
            const allUsers =
              allUsersResponse.data?.users ||
              allUsersResponse.data?.data ||
              allUsersResponse.data ||
              [];

            const members = allUsers.filter(
              (user) =>
                user.role === "team_member" ||
                user.role === "teamMember" ||
                user.role === "developer" ||
                user.position
            );
            setTeamMembers(members);
          } catch (fallbackErr) {
            console.error("Failed to fetch users as fallback:", fallbackErr);
            setTeamMembers([]);
          }
        }

        // Fetch students
        try {
          const studentsResponse = await axios.get("/api/users/students", {
            withCredentials: true,
          });

          const students =
            studentsResponse.data?.students ||
            studentsResponse.data?.data ||
            studentsResponse.data ||
            [];
          setStudents(Array.isArray(students) ? students : []);
        } catch (err) {
          console.warn("Failed to fetch students:", err);

          try {
            const allUsersResponse = await axios.get("/api/users", {
              withCredentials: true,
            });
            const allUsers =
              allUsersResponse.data?.users ||
              allUsersResponse.data?.data ||
              allUsersResponse.data ||
              [];

            const students = allUsers.filter(
              (user) => user.role === "student" || user.role === "intern"
            );
            setStudents(students);
          } catch (fallbackErr) {
            console.error(
              "Failed to fetch users as fallback for students:",
              fallbackErr
            );
            setStudents([]);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        // Only show error if we don't have project data from state
        if (!project || !project.projectName) {
          setError("Failed to load data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    } else {
      setError("No project ID provided");
      setIsLoading(false);
    }
  }, [projectId, projectDataFromState]);

  // Add a function to fetch existing work assignments for this project
  useEffect(() => {
    const fetchExistingAssignments = async () => {
      if (!projectId) return;

      try {
        const response = await axios.get(
          `/api/assignments/project/${projectId}`,
          {
            withCredentials: true,
          }
        );

        setExistingAssignments(response.data);
      } catch (err) {
        console.error("Error fetching existing assignments:", err);
      }
    };

    fetchExistingAssignments();
  }, [projectId]);

  // Get all people (team members + students) for selection
  const allPeople = [
    ...teamMembers.map((member) => ({ ...member, type: "team_member" })),
    ...students.map((student) => ({ ...student, type: "student" })),
  ];

  const addNewAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      {
        id: Date.now(),
        workDescription: "",
        selectedMembers: [],
        dueDate: "",
        priority: "Medium",
      },
    ]);
  };

  const removeAssignment = (assignmentId) => {
    if (assignments.length > 1) {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    }
  };

  const updateAssignment = (assignmentId, field, value) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, [field]: value }
          : assignment
      )
    );
  };

  const handlePersonToggle = (assignmentId, personId) => {
    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.id === assignmentId) {
          const isSelected = assignment.selectedMembers.includes(personId);
          return {
            ...assignment,
            selectedMembers: isSelected
              ? assignment.selectedMembers.filter((id) => id !== personId)
              : [...assignment.selectedMembers, personId],
          };
        }
        return assignment;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    // Get team lead id from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    const teamLeadId = userData?.userid;

    try {
      // Validate assignments
      const validAssignments = assignments.filter(
        (assignment) =>
          assignment.workDescription.trim() &&
          assignment.selectedMembers.length > 0
      );

      if (validAssignments.length === 0) {
        setError(
          "Please add at least one assignment with work description and assignees."
        );
        setIsSaving(false);
        return;
      }

      const promises = validAssignments.map(async (assignment) => {
        // Separate team members and students based on their type
        const teamMemberIds = assignment.selectedMembers.filter((id) =>
          allPeople.find(
            (person) => person._id === id && person.type === "team_member"
          )
        );

        const studentIds = assignment.selectedMembers.filter((id) =>
          allPeople.find(
            (person) => person._id === id && person.type === "student"
          )
        );

        const assignmentData = {
          projectId,
          projectName: project?.projectName || project?.name,
          workDescription: assignment.workDescription,
          teamMemberIds,
          studentIds,
          status: "Pending",
          teamLeadId,
        };

        // Add optional fields if they exist
        if (assignment.dueDate) {
          assignmentData.dueDate = assignment.dueDate;
        }

        if (assignment.priority) {
          assignmentData.priority = assignment.priority;
        }

        return axios.post("/api/works/create", assignmentData, {
          withCredentials: true,
        });
      });

      const results = await Promise.all(promises);

      setSuccessMessage(
        `${validAssignments.length} work assignment(s) created successfully!`
      );

      // Reset form
      setAssignments([
        {
          id: Date.now(),
          workDescription: "",
          selectedMembers: [],
          dueDate: "",
          priority: "Medium",
        },
      ]);

      // Optional: redirect after success
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error("Error assigning work:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to assign work. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getSelectedPeople = (selectedMemberIds) => {
    return allPeople.filter((person) => selectedMemberIds.includes(person._id));
  };

  // Check if we're on a mobile screen
  const isMobile = windowWidth <= 768;

  if (isLoading) {
    return (
      <div className="assign-work-page">
        <div className="loading-container">
          <FaSync className="spinning" />
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="assign-work-page">
        <div className="error-container">
          <h2>Error Loading Project</h2>
          <p>{error}</p>
          <button onClick={handleGoBack} className="back-button">
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assign-work-page">
      <div className="assign-work-header">
        <h1>{isMobile ? "Assign Work" : "Assign Work to Team"}</h1>
        <button onClick={handleGoBack} className="back-button">
          <FaArrowLeft /> {isMobile ? "Back" : "Return to Dashboard"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="assign-work-container">
        <div className="project-details">
          <h2>{project?.projectName || project?.name || "Unknown Project"}</h2>
          <p>{project?.description || "No description available"}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {project?.startDate && (
              <p>
                <strong>Start Date:</strong>{" "}
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            )}
            {project?.endDate && (
              <p>
                <strong>End Date:</strong>{" "}
                {new Date(project.endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {existingAssignments.length > 0 && (
            <div className="existing-assignments-toggle">
              <button
                type="button"
                className="toggle-button"
                onClick={() => setShowExisting(!showExisting)}
              >
                <FaList /> {showExisting ? "Hide" : "Show"} Existing Assignments
                ({existingAssignments.length})
              </button>
            </div>
          )}
        </div>

        {showExisting && existingAssignments.length > 0 && (
          <div className="existing-assignments">
            <h3>Existing Work Assignments</h3>
            <div className="assignments-grid">
              {existingAssignments.map((assignment) => (
                <div key={assignment._id} className="assignment-card existing">
                  <div className="assignment-header">
                    <h4>
                      {assignment.status === "Completed" && (
                        <span className="status-dot completed"></span>
                      )}
                      {assignment.status === "In Progress" && (
                        <span className="status-dot in-progress"></span>
                      )}
                      {assignment.status === "Pending" && (
                        <span className="status-dot pending"></span>
                      )}
                      {assignment.status}
                    </h4>
                    {assignment.priority && (
                      <div
                        className={`priority-indicator ${assignment.priority.toLowerCase()}`}
                      >
                        {assignment.priority}
                      </div>
                    )}
                  </div>
                  <div className="assignment-content">
                    <p className="work-description">
                      {assignment.workDescription}
                    </p>
                    {assignment.dueDate && (
                      <div className="due-date">
                        <FaClock /> Due:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="assigned-to">
                      <strong>Assigned to:</strong>
                      <div className="assigned-people">
                        {assignment.teamMembers.map((member) => (
                          <div
                            key={member._id}
                            className="assigned-person member"
                          >
                            {member.fullName || member.name}
                          </div>
                        ))}
                        {assignment.students.map((student) => (
                          <div
                            key={student._id}
                            className="assigned-person student"
                          >
                            {student.fullName || student.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="assign-work-form">
          <div className="assignments-list">
            <div className="assignments-header">
              <h3>New Work Assignments</h3>
              <button
                type="button"
                onClick={addNewAssignment}
                className="add-assignment-btn"
              >
                <FaPlus /> {isMobile ? "Add" : "Add Assignment"}
              </button>
            </div>

            <div className="assignments-grid">
              {assignments.map((assignment, index) => (
                <div key={assignment.id} className="assignment-card">
                  <div className="assignment-header">
                    <h4>Assignment #{index + 1}</h4>
                    {assignments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAssignment(assignment.id)}
                        className="remove-assignment-btn"
                        aria-label="Remove assignment"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <div className="assignment-content">
                    <div className="work-description-section">
                      <label htmlFor={`workDescription-${assignment.id}`}>
                        Work Description:
                      </label>
                      <textarea
                        id={`workDescription-${assignment.id}`}
                        value={assignment.workDescription}
                        onChange={(e) =>
                          updateAssignment(
                            assignment.id,
                            "workDescription",
                            e.target.value
                          )
                        }
                        placeholder="Enter the work to be assigned..."
                        rows={isMobile ? 2 : 3}
                        required
                      />
                    </div>

                    <div className="assignment-details">
                      <div className="detail-field">
                        <label htmlFor={`dueDate-${assignment.id}`}>
                          Due Date:
                        </label>
                        <input
                          type="date"
                          id={`dueDate-${assignment.id}`}
                          value={assignment.dueDate}
                          onChange={(e) =>
                            updateAssignment(
                              assignment.id,
                              "dueDate",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="detail-field">
                        <label htmlFor={`priority-${assignment.id}`}>
                          Priority:
                        </label>
                        <select
                          id={`priority-${assignment.id}`}
                          value={assignment.priority}
                          onChange={(e) =>
                            updateAssignment(
                              assignment.id,
                              "priority",
                              e.target.value
                            )
                          }
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="assignees-section">
                      <h5>Assign to:</h5>
                      <div className="people-selection">
                        {allPeople.length === 0 ? (
                          <p className="no-people">
                            No team members or students available
                          </p>
                        ) : (
                          <div className="people-grid">
                            {allPeople.map((person) => (
                              <div
                                key={person._id}
                                className={`person-item ${
                                  assignment.selectedMembers.includes(
                                    person._id
                                  )
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handlePersonToggle(assignment.id, person._id)
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={assignment.selectedMembers.includes(
                                    person._id
                                  )}
                                  onChange={() =>
                                    handlePersonToggle(
                                      assignment.id,
                                      person._id
                                    )
                                  }
                                  aria-label={`Select ${
                                    person.fullName || person.name
                                  }`}
                                />
                                <div className="person-avatar">
                                  {getInitials(person.fullName || person.name)}
                                </div>
                                <div className="person-info">
                                  <div className="person-name">
                                    {person.fullName ||
                                      person.name ||
                                      "Unknown"}
                                  </div>
                                  <div className="person-role">
                                    {person.type === "team_member"
                                      ? person.position ||
                                        person.role ||
                                        "Team Member"
                                      : "Student"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {assignment.selectedMembers.length > 0 && (
                        <div className="selected-summary">
                          <h6>
                            Selected ({assignment.selectedMembers.length}):
                          </h6>
                          <div className="selected-people">
                            {getSelectedPeople(assignment.selectedMembers).map(
                              (person) => (
                                <span
                                  key={person._id}
                                  className="selected-person-tag"
                                >
                                  {person.fullName || person.name}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handlePersonToggle(
                                        assignment.id,
                                        person._id
                                      )
                                    }
                                    className="remove-person-btn"
                                    aria-label={`Remove ${
                                      person.fullName || person.name
                                    }`}
                                  >
                                    <FaTimes />
                                  </button>
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={
                isSaving ||
                assignments.every(
                  (a) =>
                    !a.workDescription.trim() || a.selectedMembers.length === 0
                )
              }
            >
              {isSaving ? (
                <>
                  <FaSync className="spinning" />{" "}
                  {isMobile ? "Saving..." : "Assigning Work..."}
                </>
              ) : (
                <>
                  <FaCheckCircle />{" "}
                  {isMobile ? "Assign Work" : "Assign All Work"}
                </>
              )}
            </button>

            <div className="submit-summary">
              <p>
                {
                  assignments.filter(
                    (a) =>
                      a.workDescription.trim() && a.selectedMembers.length > 0
                  ).length
                }{" "}
                of {assignments.length} assignments ready to submit
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignWork;
