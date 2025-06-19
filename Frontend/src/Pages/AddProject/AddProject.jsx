import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../../form.css";

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Add these styles at the top of your component
const styles = {
  errorInput: {
    border: '2px solid #ff4d4f',
    boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)'
  },
  fieldError: {
    color: '#ff4d4f',
    fontSize: '14px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: '4px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box'
  },
  duplicateError: {
    color: '#ff4d4f',
    fontSize: '14px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#fff2f0',
    border: '2px solid #ff4d4f',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(255, 77, 79, 0.2)',
    animation: 'shake 0.5s ease-in-out',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box'
  },
  errorIcon: {
    marginRight: '6px',
    color: '#ff4d4f',
    flexShrink: 0
  }
};

// Add the shake animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
`;
document.head.appendChild(styleSheet);

const AddProject = () => {
  const [form, setForm] = useState({
    projectName: "",
    description: "",
    startDate: null,
    endDate: null,
    budget: ""
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("payment") === "success") {
      // Get form data from localStorage
      const pendingProject = JSON.parse(localStorage.getItem("pendingProject"));
      if (pendingProject) {
        handleSubmitAfterPayment(pendingProject);
        localStorage.removeItem("pendingProject");
      }
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDateChange = (date, field) => {
    setForm({ ...form, [field]: date });
  };

  const handleStripePayment = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const stripe = await stripePromise;
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects/create-checkout-session`,
        {
          amount: form.budget,
          projectName: form.projectName,
          userEmail: userData.email,
        },
        { withCredentials: true }
      );
      const sessionId = res.data.id;
      // Save form data to localStorage so you can use it after redirect
      localStorage.setItem("pendingProject", JSON.stringify(form));
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      setError("Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAfterPayment = async (pendingForm) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      Object.entries(pendingForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("addedBy", userData.userid);
      formData.append("paymentStatus", "Payment Done");
      // You may need to handle file upload separately if needed
      await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/create`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
        
      });
      setSuccess("Project created successfully after payment!");
      setForm({
        projectName: "",
        description: "",
        startDate: null,
        endDate: null,
        budget: ""
      });
      setFile(null);
      navigate("/add-project"); // Remove ?payment=success from URL
    } catch (error) {
      setError("Failed to create project after payment.");
    } finally {
      setLoading(false);
    }
  };

  const validateProjectName = async (projectName) => {
    try {
      // Check if project name is empty
      if (!projectName.trim()) {
        setFieldErrors(prev => ({ ...prev, projectName: "Project name is required" }));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      setFieldErrors(prev => ({ ...prev, projectName: "Error validating project name" }));
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    setLoading(true);

    // Validate project name
    const isProjectNameValid = await validateProjectName(form.projectName);
    if (!isProjectNameValid) {
      setLoading(false);
      return;
    }

    // Validate dates
    if (!form.startDate || !form.endDate) {
      setError("Please select both start and end dates");
      setLoading(false);
      return;
    }

    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.userid) {
        throw new Error("User not authenticated");
      }

      // Use FormData for file upload
      const formData = new FormData();
      formData.append("projectName", form.projectName.trim());
      formData.append("description", form.description);
      formData.append("startDate", form.startDate.toISOString());
      formData.append("endDate", form.endDate.toISOString());
      formData.append("budget", form.budget);
      formData.append("addedBy", userData.userid);
      if (file) {
        formData.append("projectFile", file);
      }
      formData.append("paymentStatus", paymentStatus);

      // Send data to backend API
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/create`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        setSuccess("Project created successfully!");
        // Clear form
        setForm({
          projectName: "",
          description: "",
          startDate: null,
          endDate: null,
          budget: ""
        });
        setFile(null);
        setFieldErrors({});
      }
    } catch (error) {
      console.error("Project creation error:", error);

      if (error.response) {
        if (error.response.data?.field === "projectName") {
          setFieldErrors(prev => ({ 
            ...prev, 
            projectName: error.response.data.message 
          }));
        } else {
          setError(
            error.response.data?.message ||
              error.response.data?.error ||
              "Server error: " + error.response.status
          );
        }
        console.log("Error response:", error.response.data);
      } else if (error.request) {
        setError(
          "No response from server. Please check your network connection."
        );
        console.log("Error request:", error.request);
      } else {
        setError("Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Razorpay integration
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve();
      const script = document.createElement("script");
      script.id = 'razorpay-script';
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    await loadRazorpayScript();

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      console.log("Razorpay Key ID:", razorpayKey);

      if (!razorpayKey || razorpayKey === "" || razorpayKey === "undefined") {
        setError("Razorpay Key ID is missing or invalid. Please check your .env file and restart the dev server.");
        setLoading(false);
        return;
      }

      // Create order on backend
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/razorpay/create-order`,
        { 
          amount: form.budget,
          projectId: form._id // If you have the project ID, otherwise you'll need to create the project first
        }
      );

      const order = orderResponse.data;

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Taskify Project Payment",
        description: form.projectName,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/razorpay/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: order.paymentId // Add the payment ID from the order response
              }
            );

            if (verifyResponse.data.success) {
              // Payment verified, create project
              handleSubmitAfterPayment({ ...form, paymentStatus: "Payment Done" });
            } else {
              setError("Payment verification failed. Please try again.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setError("Error verifying payment. Please contact support.");
          }
        },
        prefill: {
          name: userData.fullName,
          email: userData.email,
        },
        theme: { color: "#1976d2" },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          gpay: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setError("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Custom calendar icon component
  const CalendarIcon = () => <FaCalendarAlt className="calendar-icon" />;

  return (
    <div className="add-project-wrapper">
      <div className="add-project-container">
        <div className="add-project-form-section">
          <h1 className="add-project-title">Add Project</h1>

          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              color: '#ff4d4f',
              padding: '8px 12px',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
          {success && (
            <div className="success-message" style={{
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              color: '#52c41a',
              padding: '8px 12px',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="add-project-form-group">
              <label htmlFor="projectName">
                Project Name:
                <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                placeholder="Project Name"
                required
                style={fieldErrors.projectName ? styles.errorInput : {}}
              />
              {fieldErrors.projectName && (
                <div style={fieldErrors.projectName.includes("different name") ? styles.duplicateError : styles.fieldError}>
                  <span style={styles.errorIcon}>⚠</span>
                  {fieldErrors.projectName}
                </div>
              )}
            </div>

            <div className="add-project-form-group">
              <label htmlFor="description">
                Description:
                <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Project Description"
                rows="6"
                required
              ></textarea>
            </div>

            <div className="add-project-form-group">
              <label htmlFor="startDate">
                Start Date:
                <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>
              </label>
              <DatePicker
                id="startDate"
                selected={form.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select start date"
                required
                showPopperArrow={false}
                calendarIconClassName="datepicker-calendar-icon"
                icon={<CalendarIcon />}
              />
            </div>

            <div className="add-project-form-group">
              <label htmlFor="endDate">
                End Date:
                <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>
              </label>
              <DatePicker
                id="endDate"
                selected={form.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select end date"
                minDate={form.startDate}
                required
                showPopperArrow={false}
                calendarIconClassName="datepicker-calendar-icon"
                icon={<CalendarIcon />}
              />
            </div>

            <div className="add-project-form-group">
              <label htmlFor="projectFile">Project File (optional):</label>
              <input
                type="file"
                id="projectFile"
                name="projectFile"
                onChange={handleFileChange}
                accept="*"
              />
            </div>

            <div className="add-project-form-group">
              <label htmlFor="budget">
                Budget:
                <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="Budget (in USD)"
                min="0"
                required
              />
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button
                type="button"
                className="add-project-submit-btn"
                disabled={loading}
                onClick={handleRazorpayPayment}
                style={{
                  backgroundColor: loading ? '#d9d9d9' : '#1976d2',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading && paymentStatus === "proceed" ? "SUBMITTING..." : "Proceed with Payment"}
              </button>
              <button
                type="submit"
                className="add-project-submit-btn"
                disabled={loading}
                onClick={() => setPaymentStatus("non-proceed")}
                style={{
                  backgroundColor: loading ? '#d9d9d9' : '#888',
                  color: "#fff",
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading && paymentStatus === "non-proceed" ? "SUBMITTING..." : "Proceed without Payment"}
              </button>
            </div>
          </form>
        </div>
        <div className="add-project-image-section">
          {/* The image will be set via CSS background */}
        </div>
      </div>
    </div>
  );
};

export default AddProject;
