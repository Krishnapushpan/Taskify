import React, { useState } from 'react';
import './User.css';
import UserRoleDropdown from '../../Components/Dropdowns/RoleDropdown';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const CreateUser = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    position: '',
    gender: '',
    password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [roleDropdownVisible, setRoleDropdownVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleRoleSelect = (role) => {
    setForm({ ...form, role, position: '' });
    setRoleDropdownVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/create`, form, {
        withCredentials: true
      });

      if (response.data) {
        setSuccess('User created successfully!');
        // Clear form
        setForm({
          fullName: '',
          email: '',
          phone: '',
          role: '',
          position: '',
          gender: '',
          password: '',
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="create-user-wrapper">
      <div className="create-user-container">
        <div className="create-user-form-section">
          <h2 className="create-user-title">Registration Form</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="create-user-form-group">
              <label>Full Name:
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                />
              </label>
            </div>
            <div className="create-user-form-group">
              <label>Email:
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
              </label>
              {emailError && <span className="student-form-error">{emailError}</span>}
            </div>
            <div className="create-user-form-group">
              <label>Phone:
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  maxLength="10"
                  required
                />
              </label>
              {phoneError && <span className="student-form-error">{phoneError}</span>}
            </div>
            <div className="create-user-form-group" style={{ position: 'relative' }}>
              <label>Role:
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onClick={() => setRoleDropdownVisible((v) => !v)}
                  placeholder="Select role"
                  readOnly
                  required
                  style={{ cursor: 'pointer', background: '#f9f9f9' }}
                />
              </label>
              <UserRoleDropdown visible={roleDropdownVisible} onItemClick={handleRoleSelect} />
            </div>
            {(form.role === 'Team Lead' || form.role === 'Team Member') && (
              <div className="create-user-form-group">
                <label>Position:
                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Enter position"
                    required
                  />
                </label>
              </div>
            )}
            <div className="create-user-form-group">
              <label>Password:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  style={{ paddingRight: '2.5em' }}
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#8d4a43',
                    fontSize: '1.35em',
                    zIndex: 2,
                    height: '26px',
                    width: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
            </div>
            <button type="submit" className="create-user-submit-btn">
              SUBMIT
            </button>
          </form>
        </div>
        <div className="create-user-image-section"></div>
      </div>
    </div>
  );
};

export default CreateUser;