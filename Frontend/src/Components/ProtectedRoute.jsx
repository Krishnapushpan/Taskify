import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(isAuthenticated());
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage events (like logout from another tab)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  if (isLoading) {
    // You could render a loading spinner here
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuth) {
    // Redirect to login if not authenticated, save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
