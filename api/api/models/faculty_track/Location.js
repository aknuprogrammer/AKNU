// models/Location.js
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'FacultyProfile', required: true },
//   tripId: { type: String, required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'FacultyTrackBatch' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number },
  speed: { type: Number },
  heading: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('FacultyTrackLocation', locationSchema);
