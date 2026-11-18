// models/platformResources.js
const mongoose = require("mongoose");

const commonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 500,
    },
    date: {
      type: Date,
    },
    file: {
      fieldname: String,
      originalname: String,
      encoding: String,
      mimetype: String,
      buffer: mongoose.Schema.Types.Buffer,
      size: Number,
    },
    link: {
      type: String,
    },
    note: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const Model_Results = mongoose.model(
  "Model_Results",
  commonSchema,
  "Model_Results"
);
const Model_Circulars = mongoose.model(
  "Model_Circulars",
  commonSchema,
  "Model_Circulars"
);
const Model_Jobs = mongoose.model("Model_Jobs", commonSchema, "Model_Jobs");
const Model_Tenders = mongoose.model(
  "Model_Tenders",
  commonSchema,
  "Model_Tenders"
);
const Model_ExamApplications = mongoose.model(
  "Model_ExamApplications",
  commonSchema,
  "Model_ExamApplications"
);
const Model_ExamNotifications = mongoose.model(
  "Model_ExamNotifications",
  commonSchema,
  "Model_ExamNotifications"
);
const Model_ExamTimeTables = mongoose.model(
  "Model_ExamTimeTables",
  commonSchema,
  "Model_ExamTimeTables"
);
const Model_ExamJumblingCenters = mongoose.model(
  "Model_ExamJumblingCenters",
  commonSchema,
  "Model_ExamJumblingCenters"
);

// ✅ New Models
const Model_AllCirculars = mongoose.model(
  "Model_AllCirculars",
  commonSchema,
  "Model_AllCirculars"
);

const Model_CdcCirculars = mongoose.model(
  "Model_CdcCirculars",
  commonSchema,
  "Model_CdcCirculars"
);

const Model_DoaCirculars = mongoose.model(
  "Model_DoaCirculars",
  commonSchema,
  "Model_DoaCirculars"
);
const Model_AcademicCirculars = mongoose.model(
  "Model_AcademicCirculars",
  commonSchema,
  "Model_AcademicCirculars"
);

const Model_CurcularProceedings = mongoose.model(
  "Model_CurcularProceedings",
  commonSchema,
  "Model_CurcularProceedings"
);


const Model_CircularsApplications = mongoose.model(
  "Model_CircularsApplications",
  commonSchema,
  "Model_CircularsApplications"
);

const Model_AcademicCalendar = mongoose.model(
  "Model_AcademicCalendar",
  commonSchema,
  "Model_AcademicCalendar"
);

const Model_GOs = mongoose.model(
  "Model_GOs",
  commonSchema,
  "Model_GOs"
);

module.exports = {
  Model_Results,
  Model_Circulars,
  Model_Jobs,
  Model_Tenders,
  Model_ExamApplications,
  Model_ExamNotifications,
  Model_ExamTimeTables,
  Model_ExamJumblingCenters,
  Model_AllCirculars,
  Model_CdcCirculars,
  Model_CurcularProceedings,
  Model_DoaCirculars,
  Model_AcademicCirculars,
  Model_CircularsApplications,
  Model_AcademicCalendar,
  Model_GOs
};
