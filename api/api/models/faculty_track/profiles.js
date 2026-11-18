import mongoose from "mongoose";

const facultyProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed in real-world
}, { timestamps: true });

export default mongoose.model("FacultyProfile", facultyProfileSchema);
