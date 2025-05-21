import React from "react";

const roleItems = [
  "Client",
  "Student",
  "Team Lead",
  "Team Member",
];

const UserRoleDropdown = ({ visible, onItemClick }) => {
  if (!visible) return null;
  return (
    <ul className="sidebar-dropdown">
      {roleItems.map((item, idx) => (
        <li
          key={idx}
          className="sidebar-dropdown-item"
          onClick={() => onItemClick && onItemClick(item)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

export default UserRoleDropdown;
