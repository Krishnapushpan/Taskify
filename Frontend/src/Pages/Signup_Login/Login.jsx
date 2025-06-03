import React, { useState, useEffect } from "react";
import { FiMail, FiLock } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (name === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
    setError(""); // Clear error when user types
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(form.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

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
            {emailError && <span className="student-form-error">{emailError}</span>}
            <div className="login-input-wrapper" style={{ position: 'relative' }}>
              <FiLock className="login-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="login-input"
                required
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#1681c2',
                  fontSize: '1.2rem',
                  zIndex: 2
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {error && <span className="student-form-error">{error}</span>}
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
          <div className="login-signup-row">
            <span>Only client can create account</span>
            <button className="login-signup-link" onClick={handleSignUp}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
