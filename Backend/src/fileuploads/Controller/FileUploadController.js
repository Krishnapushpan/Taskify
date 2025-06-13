import FileUpload from "../Model/FileUploadModel.js";

// Upload a file
export const uploadFile = async (req, res) => {
  try {
    const { projectName, uploadedBy } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newFile = new FileUpload({
      projectName,
      uploadedBy,
      file: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      },
    });

    await newFile.save();
    res.status(201).json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
};

// Get all uploaded files (optionally filter by project or user)
export const getFiles = async (req, res) => {
  try {
    const { projectName, uploadedBy } = req.query;
    const filter = {};
    if (projectName) filter.projectName = projectName;
    if (uploadedBy) filter.uploadedBy = uploadedBy;

    const files = await FileUpload.find(filter).populate("uploadedBy", "fullName email");
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files", error: error.message });
  }
};

// Download a file by ID
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const fileDoc = await FileUpload.findById(id);
    if (!fileDoc || !fileDoc.file || !fileDoc.file.data) {
      return res.status(404).json({ message: "File not found" });
    }
    res.set('Content-Type', fileDoc.file.contentType);
    res.set('Content-Disposition', `inline; filename=\"${fileDoc.file.originalName}\"`);
    res.send(fileDoc.file.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to download file", error: error.message });
  }
};

// Delete a file by ID
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    await FileUpload.findByIdAndDelete(id);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete file", error: error.message });
  }
};

// Get files uploaded by a specific user (uploadedBy)
export const getFilesByUploadedBy = async (req, res) => {
  try {
    const { uploadedBy } = req.params;
    const files = await FileUpload.find({ uploadedBy }).populate("uploadedBy", "fullName email");
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files uploaded by user", error: error.message });
  }
};