import mongoose from "mongoose";

const fileUploadSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  projectName: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadDate: { type: Date, default: Date.now },
  file: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
});

const FileUpload = mongoose.model("FileUpload", fileUploadSchema);

export default FileUpload;
