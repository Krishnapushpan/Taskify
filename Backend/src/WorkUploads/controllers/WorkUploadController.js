import WorkUpload from "../Model/WorkUploadModel.js";

// Upload a file
export const uploadWorkFile = async (req, res) => {
  try {
    const { projectName, uploadedBy, teamlead, description } = req.body;
    if (!projectName) return res.status(400).json({ message: "projectName is required" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newWorkUpload = new WorkUpload({
      projectName,
      description,
      uploadedBy,
      teamlead,
      file: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      },
    });

    await newWorkUpload.save();
    res.status(201).json({ message: "Work file uploaded successfully", workUpload: newWorkUpload });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload work file", error: error.message });
  }
};

// Get all uploaded work files (optionally filter by project, user, or teamlead)
export const getWorkUploads = async (req, res) => {
  try {
    const { projectName, uploadedBy, teamlead } = req.query;
    const filter = {};
    if (projectName) filter.projectName = projectName;
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    if (teamlead) filter.teamlead = teamlead;

    const files = await WorkUpload.find(filter).populate("uploadedBy", "fullName email");
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch work uploads", error: error.message });
  }
};

// Download a work file by ID
export const downloadWorkFile = async (req, res) => {
  try {
    const { id } = req.params;
    const fileDoc = await WorkUpload.findById(id);
    if (!fileDoc || !fileDoc.file || !fileDoc.file.data) {
      return res.status(404).json({ message: "File not found" });
    }
    res.set('Content-Type', fileDoc.file.contentType);
    res.set('Content-Disposition', `inline; filename="${fileDoc.file.originalName}"`);
    res.send(fileDoc.file.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to download file", error: error.message });
  }
};

// Delete a work file by ID
export const deleteWorkFile = async (req, res) => {
  try {
    const { id } = req.params;
    await WorkUpload.findByIdAndDelete(id);
    res.status(200).json({ message: "Work file deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete work file", error: error.message });
  }
};

// Get work uploads for a specific user (uploadedBy)
export const getWorkUploadsByUser = async (req, res) => {
  try {
    const { uploadedBy } = req.params;
    const files = await WorkUpload.find({ uploadedBy }).populate("uploadedBy", "fullName email");
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch work uploads for user", error: error.message });
  }
};

// Get work uploads for a specific team lead
export const getWorkUploadsByTeamLead = async (req, res) => {
  try {
    const { teamlead } = req.params;
    const files = await WorkUpload.find({ teamlead }).populate("uploadedBy", "fullName email");
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch work uploads for team lead", error: error.message });
  }
};
