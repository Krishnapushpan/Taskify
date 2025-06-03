import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiUserCheck } from 'react-icons/fi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (name === 'password') {
      if (!validatePassword(value)) {
        setPasswordError('Password must be at least 8 characters long and contain at least one uppercase letter, one special character, and one number');
    } else {
      setPasswordError('');
      }
    }
    
    if (name === 'phone') {
      if (!validatePhone(value)) {
        setPhoneError('Phone number must be exactly 10 digits');
      } else {
        setPhoneError('');
      }
    }

    if (name === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(form.password)) {
      setPasswordError('Password must be at least 8 characters long and contain at least one uppercase letter, one special character, and one number');
      return;
    }

    if (!validatePhone(form.phone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    if (!validateEmail(form.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        position: form.position
      });

      if (response.data) {
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
          <div className="login-form-subtitle">Only client can create an account.</div>
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
            {emailError && <span className="student-form-error">{emailError}</span>}
            <div className="login-input-wrapper">
              <FiPhone className="login-input-icon" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="login-input"
                maxLength="10"
                required
              />
            </div>
            {phoneError && <span className="student-form-error">{phoneError}</span>}
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
            <button className="login-signup-link" onClick={handleSignIn}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
