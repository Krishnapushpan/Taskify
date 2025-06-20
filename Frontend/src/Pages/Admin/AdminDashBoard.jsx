import React, { useState, useEffect } from "react";
import Sidebar from "../../Layouts/Sidebar";
import CountUsers from "../../Components/CountUsers";
import ProjectList from "../../Components/ProjectList";
import UpcommingProject from "../../Components/UpcommingProject";
import AddProject from "../AddProject/AddProject";
import CreateUser from "../CreateUser/CreateUser";
import ClientList from "../UserList/ClientList";
import StudentList from "../UserList/StudentList";
import TeamMember from "../UserList/TeamMember";
import Teamlead from "../UserList/Teamlead";
import PersonalWork from "../PersonalWork/PersonalWork";
import MenuIcon from "../../assets/menu-icon";
import WorkCount from "../../Components/WorkCount";
import WorkStatus from "../WorkStatus/WorkStatus";
import ProjectCount from "../../Components/ProjectCount";
import Meeting from "../Meeting/Meeting";
import Projects from "../Projects/Projects";
import ViewDetails from "../Projects/ViewDetails";
import MyWork from "../MyWork/MyWork";
import Documents from "../Documents/Documents";
import WorkDocuments from "../Documents/WorkDocuments";
import Tasks from "../Tasks/Tasks";

const AdminDashBoard = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [userRole, setUserRole] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Get user role from localStorage on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("User data from localStorage:", userData); // Debug log
    if (userData && userData.role) {
      setUserRole(userData.role);
      console.log("Set user role to:", userData.role); // Debug log
    }
  }, []);

  // Handle window resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
      if (window.innerWidth >= 1000) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedProject(null); // Clear selected project when switching items
    if (isMobile) {
      setSidebarOpen(false); // Close sidebar on selection in mobile view
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setSelectedItem("ViewDetails");
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedItem("Projects");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if user is team member or student with more flexible role checking
  const isTeamMemberOrStudent =
    userRole === "Team Member" ||
    userRole === "Student" ||
    userRole === "team_member" ||
    userRole === "student" ||
    userRole === "TeamMember" ||
    userRole === "teamMember";

  const isAdminOrClientOrTeamLead =
    userRole === "Admin" ||
    userRole === "admin" ||
    userRole === "Client" ||
    userRole === "client" ||
    userRole === "Team Lead" ||
    userRole === "team_lead" ||
    userRole === "teamLead";

    const isAdmin = 
    userRole === "Admin" ||
    userRole === "admin";

  const isTeamLead =
    userRole === "Team Lead" ||
    userRole === "team_lead" ||
    userRole === "teamLead";

  const isAdminOrClient =
    userRole === "Admin" ||
    userRole === "admin" ||
    userRole === "Client" ||
    userRole === "client";

  const isTeamMemberOrStudentOrTeamLead = isTeamMemberOrStudent || isTeamLead;

  const isAdminOrTeamLead =
    userRole === "Admin" ||
    userRole === "admin" ||
    userRole === "Team Lead" ||
    userRole === "team_lead" ||
    userRole === "teamLead";

  console.log("Current userRole:", userRole); // Debug log
  console.log("isTeamMemberOrStudent:", isTeamMemberOrStudent); // Debug log

  return (
    <div className="admin-dashboard-main">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <MenuIcon />
        </button>
      )}

      {/* Sidebar Overlay - only shown when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar - conditionally shown on mobile */}
      <div className={`sidebar-container ${sidebarOpen ? "open" : "closed"}`}>
        <Sidebar onItemClick={handleItemClick} />
      </div>

      <div className="admin-dashboard-content">
        {selectedItem === "Add Client" ? (
          <CreateUser />
        ) : selectedItem === "Add Project" ? (
          <AddProject />
        ) : selectedItem === "Client List" ? (
          <ClientList />
        ) : selectedItem === "Student List" ? (
          <StudentList />
        ) : selectedItem === "Team Member List" ? (
          <TeamMember />
        ) : selectedItem === "Team Lead List" ? (
          <Teamlead />
        ) : selectedItem === "Meetings" ? (
          <Meeting />
        ) : selectedItem === "Projects" ? (
          <Projects onViewDetails={handleViewDetails} />
        ) : selectedItem === "ViewDetails" && selectedProject ? (
          <ViewDetails project={selectedProject} onBack={handleBackToProjects} />
        ) : selectedItem === "My Work" ? (
          <MyWork />
        ) : selectedItem === "Tasks" ? (
          <Tasks />
        ) : selectedItem === "Documents" ? (
          <Documents />
        ) : selectedItem === "WorkDocuments" ? (
          <WorkDocuments />
        ) : (
          <>
            <h1
              style={{
                marginBottom: "20px",
                fontSize: "24px",
                fontWeight: "600",
                color: "#323a46",
              }}
            >
              Welcome!
            </h1>
            {isAdmin && <CountUsers />}
           
            {userRole === "Client" || userRole === "client" ? (
              <>
                <ProjectCount />
              </>
            ) : (
              isTeamMemberOrStudentOrTeamLead && <WorkCount />
            )}
            {isAdmin &&
            <div style={{ marginTop: "20px" }}>
              <UpcommingProject />
            </div> }

            <div style={{ marginTop: "20px" }}>
              <ProjectList />
              {(userRole === "Client" || userRole === "client") && (
                <div style={{ marginTop: "20px" }}>
                  <Meeting />
                </div>
              )}
            </div>
            {isAdminOrTeamLead && (
              <div style={{ marginTop: "20px" }}>
                <WorkStatus />
              </div>
            )}
            {isTeamMemberOrStudent && (
              <div style={{ marginTop: "20px" }}>
                <PersonalWork />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashBoard;
