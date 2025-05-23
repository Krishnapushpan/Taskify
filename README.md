# Task Management System

A web-based platform for managing projects, assigning work, and tracking progress within a team. The system supports multiple user roles and provides dashboards and features tailored to each role for efficient collaboration and accountability.

## 🚀 Features

### 🔐 User Roles & Authentication
- **Roles**: Admin, Team Lead, Team Member, Student, Client
- **Authentication**: Role-based access using JWT
- **Session Management**: Role and user ID stored in `localStorage` for frontend access

### 📁 Project Management
- Admins and Clients can create and manage projects

### 👥 Team Assignment
- Assign Team Leads, Team Members, and Students to projects
- Managed through a dedicated UI
- Stored in the backend for tracking and management

### 📝 Work Assignment
- Admin Assign the Team for the project 
- Team Leads assign tasks to Team Members and Students

### 📊 Work Tracking
- **Personal Work View**: Users see only their assigned tasks
- **Team Lead View**: Track all assigned work and statuses
- **Admin/Client View**: View overall statistics and progress

### 🔄 Status Updates
- Team Members and Students can update their task statuses (e.g., In Progress, Completed, Pending)
- Updates are immediately reflected in relevant dashboards

### 📉 Role-Based Dashboards
- **Admin Dashboard**: Overview of users and projects, user management
- **Team Lead Dashboard**: Projects, task assignment, task tracking
- **Team Member/Student Dashboard**: View/update own tasks

---

## 🛠️ Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | React.js, Axios                |
| Backend     | Node.js, Express.js            |
| Database    | MongoDB, Mongoose              |
| Auth        | JWT                            |

---

## 🔁 Workflow (How It Works)

1. **Login**
   - User logs in
   - User's role and ID are saved in `localStorage`

2. **Dashboard Display**
   - Role-based dashboard rendered (Admin, Team Lead, etc.)

3. **User Creation**
   - Admins create users (Team Lead, Team Member, Student)

4. **Project Creation**
   - Admins and Clients create projects

5. **Team Assignment**
   - Admin assign Team Lead, Team members and students to projects

6. **Task Assignment**
   - Team Leads assign detailed work/tasks to Team members/students

7. **Work Tracking**
   - Users update task statuses
   - Team Leads and Admins monitor progress

---


## 📦 Installation

```bash
# Clone the repo
git clone git@github.com:Krishnapushpan/Task_Management_System.git
cd Task_Management_System

# Install backend dependencies
cd Backend
npm install

## Environment Variables
 Backend (.env)
 create .env in the src folder

PORT=Enter the port here 
SECRET_KEY=your_jwt_secret

# Start backend
npm run dev

# In another terminal, install frontend dependencies
cd ../Frontend
npm install

# Start frontend
npm run dev

```

## 📄Summary
This system streamlines project and task management for organizations with multiple roles, ensuring clear assignment, tracking, and accountability for all work.
