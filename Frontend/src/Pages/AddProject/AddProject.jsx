import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import "../../form.css";

const AddProject = () => {
  const [form, setForm] = useState({
    projectName: "",
    description: "",
    startDate: null,
    endDate: null,
    budget: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, field) => {
    setForm({ ...form, [field]: date });
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
      // Convert form data for API
      const projectData = {
        projectName: form.projectName,
        description: form.description,
        startDate: form.startDate.toISOString(),
        endDate: form.endDate.toISOString(),
        budget: Number(form.budget),
      };

      console.log("Sending project data:", projectData);

      // Send data to backend API
      const response = await axios.post("/api/projects/create", projectData, {
        withCredentials: true, // This will send cookies automatically
        headers: {
          "Content-Type": "application/json",
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
          budget: "",
        });
      }
    } catch (error) {
      console.error("Project creation error:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(
          error.response.data?.message ||
            error.response.data?.error ||
            "Server error: " + error.response.status
        );
        console.log("Error response:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        setError(
          "No response from server. Please check your network connection."
        );
        console.log("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("Error: " + error.message);
      }
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
                minDate={form.startDate} // Ensures end date is after start date
                required
                showPopperArrow={false}
                calendarIconClassName="datepicker-calendar-icon"
                icon={<CalendarIcon />}
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
            <button
              type="submit"
              className="add-project-submit-btn"
              disabled={loading}
            >
              {loading ? "SUBMITTING..." : "SUBMIT"}
            </button>
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
