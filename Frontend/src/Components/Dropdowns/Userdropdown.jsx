import React from "react";

const dropdownItems = [
  "Client List",
  "Team Lead List",
  "Team Member List",
  "Student List",
];

const Userdropdown = ({ visible, onItemClick }) => {
  if (!visible) return null;
  return (
    <ul className="sidebar-dropdown">
      {dropdownItems.map((item, idx) => (
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

export default Userdropdown;
