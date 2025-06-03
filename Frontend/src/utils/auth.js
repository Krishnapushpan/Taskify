import { jwtDecode } from "jwt-decode";

// Authentication utilities

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const user = localStorage.getItem("user");
  return !!user; // Convert to boolean
};

/**
 * Get the current user data
 * @returns {Object|null} User data object or null if not authenticated
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * Get user role
 * @returns {string|null} User role or null if not authenticated
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

/**
 * Logout user
 * @param {Function} callback Optional callback after logout
 */
export const logout = (callback) => {
  localStorage.removeItem("user");
  sessionStorage.clear();

  if (callback && typeof callback === "function") {
    callback();
  }
};

/**
 * Get user details from JWT token stored in localStorage
 * @returns {Object|null} Decoded user object or null if not found/invalid
 */
export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode(token); // returns the payload (user info, roles, etc.)
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Get user role from JWT token stored in localStorage
 * @returns {string|null} User role or null if not found/invalid
 */
export const getUserRoleFromToken = () => {
  const user = getUserFromToken();
  return user ? user.role : null;
};
