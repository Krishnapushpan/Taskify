import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Meeting.css";

const Meeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError("");
        const userData = JSON.parse(localStorage.getItem("user"));
        let response;
        if (userData?.role === "admin") {
          // Admin: fetch all meetings
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/meetings`, {
            withCredentials: true,
          });
        } else if (userData?.role === "Client") {
          // Client: fetch only their meetings
          const clientId = userData?.userid;
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/meetings/client/${clientId}`, {
            withCredentials: true,
          });
        }
        setMeetings(response.data);
      } catch (err) {
        setError("Failed to fetch meetings");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  return (
    <div className="project-list-container">
      <h2 className="project-list-title">Scheduled Meetings</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>Loading meetings...</div>
      ) : error ? (
        <div style={{ color: "#d32f2f", textAlign: "center" }}>{error}</div>
      ) : meetings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px" }}>No meetings found.</div>
      ) : (
        <div className="table-responsive">
          <table className="project-list-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project Name</th>
                {/* <th>Project Creator</th> */}
                <th>Client Name</th>
                <th>Project Due Date</th>
                <th>Meeting Date & Time</th>
                {/* <th>Created At</th> */}
              </tr>
            </thead>
            <tbody>
              {meetings.map((m, idx) => (
                <tr key={m._id}>
                  <td>{idx + 1}</td>
                  <td>{m.projectName}</td>
                  {/* <td>{m.projectCreator}</td> */}
                  <td>{m.fullName || '-'}</td>
                  <td>{m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '-'}</td>
                  <td>{m.meetingDateTime ? new Date(m.meetingDateTime).toLocaleString() : '-'}</td>
                  {/* <td>{m.createdAt ? new Date(m.createdAt).toLocaleString() : '-'}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Meeting;

