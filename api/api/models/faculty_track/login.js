import mongoose from "mongoose";

const facultyLoginSchema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyProfile" },
  email: { type: String, required: true },
  password: { type: String, required: true }, // hash later
  createdAt: { type: Date, default: Date.now },
  loggedInAt: { type: Date },
  loggedOutAt: { type: Date },
});

export default mongoose.model("FacultyLogin", facultyLoginSchema);
