import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../../form.css";

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

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
      formData.append("projectName", form.projectName);
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
      }
    } catch (error) {
      console.error("Project creation error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
            error.response.data?.error ||
            "Server error: " + error.response.status
        );
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

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="add-project-form-group">
              <label htmlFor="projectName"> Project Name:</label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                placeholder="Project Name"
                required
              />
            </div>
            <div className="add-project-form-group">
              <label htmlFor="description">Description:</label>
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
              <label htmlFor="startDate">Start Date:</label>
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
              <label htmlFor="endDate">End Date:</label>
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
              <label htmlFor="budget">Budget:</label>
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
              >
                {loading && paymentStatus === "proceed" ? "SUBMITTING..." : "Proceed with Payment"}
              </button>
              <button
                type="submit"
                className="add-project-submit-btn"
                disabled={loading}
                onClick={() => setPaymentStatus("non-proceed")}
                style={{ background: "#888", color: "#fff" }}
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
