import mongoose from "mongoose";

const assignWorkSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  workDescription: {
    type: String,
    required: true,
  },
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "In Progress",
  },
  dueDate: {
    type: Date,
    required: false,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  workFile: {
    data: Buffer,
    contentType: String,
    originalName: String,
  }
});

const AssignWork = mongoose.model("AssignWork", assignWorkSchema);

export default AssignWork;
