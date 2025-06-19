import mongoose from 'mongoose';
import AssignTeam from './src/AssignTeam/models/AssignTeamModel.js';
import WorkUpload from './src/WorkUploads/Model/WorkUploadModel.js';

// Connect to MongoDB (update with your connection string)
const MONGODB_URI = 'your_mongodb_connection_string_here';

async function migrateData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Migrate AssignTeam records
    const assignTeamRecords = await AssignTeam.find({ projectId: { $exists: false } });
    console.log(`Found ${assignTeamRecords.length} AssignTeam records without projectId`);

    for (const record of assignTeamRecords) {
      if (record.project) {
        record.projectId = record.project;
        await record.save();
        console.log(`Updated AssignTeam record ${record._id} with projectId: ${record.project}`);
      }
    }

    // Migrate WorkUpload records (if any exist without projectId)
    const workUploadRecords = await WorkUpload.find({ projectId: { $exists: false } });
    console.log(`Found ${workUploadRecords.length} WorkUpload records without projectId`);

    // Note: WorkUpload records without projectId will need manual review
    // as we can't determine the projectId from other fields

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateData(); 