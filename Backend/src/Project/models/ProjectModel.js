import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Planning", "In Progress", "Completed", "On Hold"],
    default: "Planning",
  },
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamMember",
    },
  ],
  projectFile: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
  paymentStatus: {
    type: String,
    enum: ["Payment Done", "Non Payment"],
    default: "Non Payment",
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
