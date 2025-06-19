import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  projectCreator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String },
  projectName: { type: String, required: true },
  dueDate: { type: Date, required: true },
  meetingDateTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;

