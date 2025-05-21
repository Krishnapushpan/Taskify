import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import "../src/Pages/CreateUser/User.css";
import "./project.css";
import Home from "./Pages/Home/Home";
import AdminDashBoard from "./Pages/Admin/AdminDashBoard";
import ViewMoreProjects from "./Pages/ViewMoreProjects/ViewMoreProjects";
import AssignTeam from "./Pages/AssignTeam/AssignTeam";
import Login from "./Pages/Signup_Login/Login";
import Signup from "./Pages/Signup_Login/Signup";
import AssignWork from "./Pages/AssignWork/AssignWork";
import ProtectedRoute from "./Components/ProtectedRoute";
// import UserList from "./Pages/UserList";
function App() {
  return (
    <div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
            margin: "0 auto",
            textAlign: "center",
            width: "fit-content",
            maxWidth: "90%",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#4aed88",
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: "#ff4b4b",
            },
          },
        }}
      />
      {/* <Navbar /> */}

      {/* <Routes>{allRoutes}</Routes> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-more-projects"
          element={
            <ProtectedRoute>
              <ViewMoreProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assign-project/:projectId"
          element={
            <ProtectedRoute>
              <AssignTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assign-work/:projectId"
          element={
            <ProtectedRoute>
              <AssignWork />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
