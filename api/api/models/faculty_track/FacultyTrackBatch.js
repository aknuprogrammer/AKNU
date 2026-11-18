import mongoose from 'mongoose';

const facultyTrackBatchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'FacultyProfile', required: true },
  tripId: { type: String, required: true, unique: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  startLocation: {
    latitude: Number,
    longitude: Number,
  },
  endLocation: {
    latitude: Number,
    longitude: Number,
  },
}, { timestamps: true }); // automatically adds createdAt and updatedAt

export default mongoose.model('FacultyTrackBatch', facultyTrackBatchSchema);
