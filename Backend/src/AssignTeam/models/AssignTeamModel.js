import mongoose from "mongoose";

const assignTeamSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  projectCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  projectName: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  startDate: {
    type: Date,
    required: false,
  },
  dueDate: {
    type: Date,
    required: false,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ["Planning", "In Progress", "Completed", "Pending", "Started"],
    default: "Planning",
  },
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  projectFile: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
  workFile: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AssignTeam = mongoose.model("AssignTeam", assignTeamSchema);

export default AssignTeam;
