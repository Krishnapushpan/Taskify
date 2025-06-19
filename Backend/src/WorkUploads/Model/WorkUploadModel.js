import mongoose from "mongoose";

const workUploadSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String, required: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadDate: { type: Date, default: Date.now },
  teamlead: { type: String, required: true },
  file: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
});

const WorkUpload = mongoose.model("WorkUpload", workUploadSchema);

export default WorkUpload;
