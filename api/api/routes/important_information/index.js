const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB);

const resultsRouter = require("./1_Results");
const circularRouter = require("./2_Circular");
const jobsRouter = require("./3_Jobs");
const tendersRouter = require("./4_Tenders");
const examApplicationsRouter = require("./5_Exam_Applications");
const examNotificationsRouter = require("./5_Exam_Notifications");
const examTimeTableRouter = require("./5_Exam_TimeTable");
const examJumblingCentersRouter = require("./5_Exam_JumblingCenters");
const allCiculars = require("./7_all_circulars");
const cdcCirculars = require("./6_cdc_circulars");
const curcular_proceedings = require("./8_curcular_proceedings");
const doa_circulars = require("./9_doa_circulars");
const academic_circulars = require("./10_academic_circulars");
const circulars_applications = require("./11_circulars_applications");
const academic_calendar = require("./12_Academic_Calendar");
const gosRouter = require("./13_GOs");
// Mount all under /info
router.use("/", resultsRouter);
router.use("/", circularRouter);
router.use("/", jobsRouter);
router.use("/", tendersRouter);
router.use("/", examApplicationsRouter);
router.use("/", examNotificationsRouter);
router.use("/", examTimeTableRouter);
router.use("/", examJumblingCentersRouter);
router.use("/", allCiculars);
router.use("/", cdcCirculars);
router.use("/", curcular_proceedings);
router.use("/", doa_circulars);
router.use("/", academic_circulars);
router.use("/", circulars_applications);
router.use("/", academic_calendar);
router.use("/", gosRouter);
router.get("/", (req, res) => {
  console.log("Important_Information---GET");
  res.json({ message: "This is Important Inforamation" });
});

module.exports = router;
