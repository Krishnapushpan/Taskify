import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      // Redirect to dashboard if already authenticated
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim() !== "") {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
    }
  };

  const handleToggleTask = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div>
      {/* Header/Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <span className="logo">
            ✔️ <span className="logo-text">TaskManager</span>
          </span>
        </div>
        <nav className="navbar-center">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
        </nav>
        <div className="navbar-right">
          <button className="sign-in-btn" onClick={handleSignIn}>
            SIGN IN
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Task Management System</h1>
        <p>
          Prioritize. Organize. Manage. Repeat. With our task management
          software, your days of burnout are behind you. Spend more time
          completing your tasks and less time managing them, and enhance
          productivity at scale by tracking milestones, setting dependencies,
          and accomplishing task goals.
        </p>
        <button className="get-started-btn" onClick={handleSignUp}>
          GET STARTED
        </button>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2>Why Choose Our Task Management System?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">≡</div>
            <h3>Task Organization</h3>
            <p>
              Create, assign, and organize tasks with ease. Set priorities,
              deadlines, and dependencies to keep your projects on track.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Performance Tracking</h3>
            <p>
              Monitor progress with visual dashboards and reports. Identify
              bottlenecks and optimize your team's workflow.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Team Collaboration</h3>
            <p>
              Foster teamwork with shared tasks, comments, and file attachments.
              Keep everyone aligned and productive.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🕒</div>
            <h3>Time Management</h3>
            <p>
              Track time spent on tasks, set time estimates, and analyze time
              utilization for better resource management.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
