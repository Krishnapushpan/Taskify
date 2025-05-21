import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiUserCheck } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    position: null
  });
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'password' && e.target.value.length > 0 && e.target.value.length < 6) {
      setPasswordError('Minimum of 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setPasswordError('Minimum of 6 characters');
      return;
    }

    try {
      const response = await axios.post('/api/users/register', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        position: form.position
      });

      if (response.data) {
        // Show success message and redirect to login
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        {/* Left Info Card */}
        <div className="login-info-card">
          <div className="login-info-title">TASKIFY</div>
          <div className="login-info-heading">Create your client account</div>
          <div className="login-info-desc">
            Sign up to get started and connect with our platform as a client.
          </div>
          <div className="login-info-quote">
            <div>"The journey of a thousand miles begins with a single step."</div>
          </div>
        </div>
        {/* Right Signup Form */}
        <div className="login-form-section">
          <div className="login-form-title">Sign Up</div>
          <div className="login-form-subtitle">Fill in your details to create a client account.</div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-input-wrapper">
              <FiUser className="login-input-icon" />
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="login-input"
                required
              />
            </div>
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
              <FiPhone className="login-input-icon" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
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
            {passwordError && (
              <span className="student-form-error">{passwordError}</span>
            )}
            {error && (
              <span className="student-form-error">{error}</span>
            )}
            <button type="submit" className="login-btn">Sign Up</button>
          </form>
          <div className="login-signup-row">
            <span>Already have an account?</span>
            <a href="/login" className="login-signup-link">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
