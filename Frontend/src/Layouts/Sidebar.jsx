import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaUserShield,
  FaLayerGroup,
  FaBox,
  FaPuzzlePiece,
  FaRegChartBar,
  FaWpforms,
  FaTable,
  FaMapMarkerAlt,
  FaShareAlt,
  FaSignOutAlt,
  FaUserPlus,
  FaTasks,
} from "react-icons/fa";
import Userdropdown from "../Components/Dropdowns/Userdropdown";
import { logout, getUserFromToken, getCurrentUser } from "../utils/auth";

const Sidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [fullName, setFullName] = useState("");
  const sidebarRef = useRef(null);

  useEffect(() => {
    let user = getUserFromToken();
    if (!user) {
      user = getCurrentUser();
    }
    setUserRole(user?.role || "");
    setFullName(user?.fullName || "");
  }, []);

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/logout`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Use logout utility to clear local storage
      logout(() => {
        // Navigate to login page
        navigate("/", { replace: true });
        // Force page refresh to clear React Router's internal history
        window.location.reload();
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the backend call fails, still clear local storage and redirect
      logout(() => {
        navigate("/", { replace: true });
        window.location.reload();
      });
    }
  };

  return (
    <div className="sidebar" ref={sidebarRef}>
      <div className="sidebar-header">
        <span className="sidebar-logo">
          {" "}
          <span className="logo-icon" />{" "}
          <span className="logo-text">Taskify</span>{" "}
        </span>
       
      </div>
       {/* User info under Taskify heading */}
       <div style={{ marginTop: 8,display: "flex", flexDirection: "column", marginBottom: 8, paddingLeft: 28 }}>
          <div style={{ fontWeight: 600, color: "#fffff", fontSize: 20 }}>{fullName}</div>
          <div style={{ color: "#666", fontSize: 15 }}>{userRole}</div>
        </div>
      <div className="sidebar-section sidebar-main">Main</div>
      <ul className="sidebar-menu">
        <li
          className={onItemClick ? undefined : "active"}
          onClick={() => onItemClick && onItemClick("Dashboard")}
          style={{ cursor: "pointer" }}
        >
          <FaTachometerAlt className="sidebar-icon" />
          <span>Dashboard</span>
          {/* <span className="sidebar-badge blue">9+</span> */}
        </li>
        {userRole === "admin" && (
          <li
            onClick={() => onItemClick && onItemClick("Add Client")}
            style={{ cursor: "pointer" }}
          >
            <FaUserPlus className="sidebar-icon" />
            <span>Add User</span>
          </li>
        )}
        {userRole === "admin" && (
          <li
            onClick={() => onItemClick && onItemClick("Meetings")}
            style={{ cursor: "pointer" }}
          >
            <FaTable className="sidebar-icon" />
            <span>Meetings</span>
          </li>
        )}
        {(userRole === "admin" || userRole === "Client") && (
          <li
            onClick={() => onItemClick && onItemClick("Add Project")}
            style={{ cursor: "pointer" }}
          >
            <FaLayerGroup className="sidebar-icon" />
            <span>Add Project</span>
          </li>
        )}
        {/* Show Projects for both Admin and Team Lead */}
        {(userRole === "admin" || userRole === "Team Lead") && (
          <li
            onClick={() => onItemClick && onItemClick("Projects")}
            style={{ cursor: "pointer" }}
          >
            <FaFileAlt className="sidebar-icon" />
            <span>Projects</span>
          </li>
        )}
        {/* Hide User List for non-admins */}
        {userRole === "admin" && (
          <>
            <li
              onClick={() => {
                setUserDropdownOpen((open) => !open);
                onItemClick && onItemClick("Client List");
              }}
              style={{ color: userDropdownOpen ? "#64c5b1" : undefined }}
            >
              <FaUserShield className="sidebar-icon" />
              <span>User List</span>
              <span
                className="sidebar-arrow"
                style={{
                  transform: userDropdownOpen ? "rotate(90deg)" : "none",
                  color: userDropdownOpen ? "#64c5b1" : undefined,
                }}
              >
                &#8250;
              </span>
            </li>
            <Userdropdown visible={userDropdownOpen} onItemClick={onItemClick} />
          </>
        )}
        {/* My Work for Team Member and Student */}
        {(userRole === "Team Member" || userRole === "Student") && (
          <li
            onClick={() => onItemClick && onItemClick("My Work")}
            style={{ cursor: "pointer" }}
          >
            <FaTasks className="sidebar-icon" />
            <span>My Work</span>
          </li>
        )}
        {(userRole === "Team Lead" || userRole === "admin") && (
          <li
            onClick={() => onItemClick && onItemClick("Documents")}
            style={{ cursor: "pointer" }}
          >
            <FaFileAlt className="sidebar-icon" />
            <span>Documents</span>
          </li>
        )}
        {(userRole !== "Client")&&(<li
          onClick={() => onItemClick && onItemClick("WorkDocuments")}
          style={{ cursor: "pointer" }}
        >
          <FaFileAlt className="sidebar-icon" />
          <span>Work Documents</span>
        </li>)}
      </ul>
      {/* Logout Button */}
      <div className="sidebar-footer">
        <li
          onClick={handleLogout}
          style={{
            cursor: "pointer",
            color: "#dc3545",
            display: "flex",
            alignItems: "center",
            padding: "10px 15px",
            marginTop: "auto",
            marginLeft: 18,
          }}
        >
          <FaSignOutAlt className="sidebar-icon" />
          <span>Logout</span>
        </li>
      </div>
    </div>
  );
};

export default Sidebar;
