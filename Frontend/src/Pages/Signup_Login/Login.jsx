import React, { useState, useEffect } from "react";
import { FiMail, FiLock } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/users/login", {
        email: form.email,
        password: form.password,
      });

      if (response.data.status) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
        // Navigate to AdminDashboard
        navigate("/admin-dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        {/* Left Info Card */}
        <div className="login-info-card">
          <div className="login-info-title">TASKIFY</div>
          <div className="login-info-heading">
            We're here to help you level up.
          </div>
          <div className="login-info-desc">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout.
          </div>
          <div className="login-info-quote">
            <div>
              There are many variations of passages of Lorem Ipsum available,
              but the majority in some form
            </div>
            {/* <div className="login-info-profile">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="profile" className="login-info-avatar" />
              <div>
                <div className="login-info-name">Timson K</div>
                <div className="login-info-role">Freelancer</div>
              </div>
            </div> */}
          </div>
        </div>
        {/* Right Login Form */}
        <div className="login-form-section">
          <div className="login-form-title">Sign In</div>
          <div className="login-form-subtitle">
            We are here to help you and we'd love to connect with you.
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-input-wrapper">
              <FiMail className="login-input-icon" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="login-input"
                required
              />
            </div>
            <div className="login-input-wrapper">
              <FiLock className="login-input-icon" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="login-input"
                required
              />
            </div>
            {error && <span className="student-form-error">{error}</span>}
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
          <div className="login-signup-row">
            <span>Don't have an account?</span>
            <a href="/signup" className="login-signup-link">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
