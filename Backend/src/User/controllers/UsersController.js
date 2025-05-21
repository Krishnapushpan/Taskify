import User from "../models/UsersModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, position } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if this is the first user (will be admin)
    // const found = await User.findOne({ role: "admin" });
    let role = "Client";
    // if (!found) {
    //   role = "admin";
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      position, // Set position as null by default
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        position: newUser.position,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Authentication failed - User doesn't exist" });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "Authentication failed - Password doesn't match" });
    }

    // Generate JWT token
      const token = jwt.sign(
        {
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        userid:user._id
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Set cookie
    res.cookie("Authtoken", token);

    // Send response
    res.json({
      status: true,
      message: "Login success",
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        userid:user._id
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, position } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      position,
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        position: newUser.position,
      },
    });
  } catch (error) {
    console.error("User creation error:", error);
    res
      .status(500)
      .json({ message: "User creation failed", error: error.message });
  }
};

export const getClients = async (req, res) => {
  try {
    // Find all users with role 'client'
    const clients = await User.find({ role: "Client" })
      .select("fullName email phone position") // Only select needed fields
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      message: "Clients fetched successfully",
      clients,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch clients", error: error.message });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    // Find all users with role 'Team Member'
    const teamMembers = await User.find({ role: "Team Member" })
      .select("fullName email phone position") // Only select needed fields
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      message: "Team members fetched successfully",
      teamMembers,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch team members", error: error.message });
  }
};

export const getTeamLeads = async (req, res) => {
  try {
    // Find all users with role 'Team Lead'
    const teamLeads = await User.find({ role: "Team Lead" })
      .select("fullName email phone position") // Only select needed fields
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      message: "Team leads fetched successfully",
      teamLeads,
    });
  } catch (error) {
    console.error("Error fetching team leads:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch team leads", error: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    // Find all users with role 'Student'
    const students = await User.find({ role: "Student" })
      .select("fullName email phone role") // Only select needed fields
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch students", error: error.message });
  }
};

export const getUserCounts = async (req, res) => {
  try {
    // For testing, removed any auth requirement
    // Count users by role
    const clientCount = await User.countDocuments({ role: "Client" });
    const teamLeadCount = await User.countDocuments({ role: "Team Lead" });
    const teamMemberCount = await User.countDocuments({ role: "Team Member" });
    const studentCount = await User.countDocuments({ role: "Student" });

    res.status(200).json({
      message: "User counts fetched successfully",
      counts: {
        clients: clientCount,
        teamLeads: teamLeadCount,
        teamMembers: teamMemberCount,
        students: studentCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user counts", error: error.message });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};
