const express = require("express");
const { seedSampleData, migrateData, inspectStudent, debugDuplicates, fixOrphanedCourses, fixOrphanedStreams } = require("../controllers/seedDataController");

const router = express.Router();

router.post("/", seedSampleData);
router.post("/migrate", migrateData);
router.get("/inspect-student", inspectStudent);
router.get("/fix-orphaned", fixOrphanedCourses);
router.get("/fix-orphaned-streams", fixOrphanedStreams);
router.get("/debug-duplicates", debugDuplicates);

module.exports = router;
