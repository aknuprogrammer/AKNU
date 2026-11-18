const express = require("express");
const {
    getAllMappings,
    createMapping,
    updateMapping,
    deleteMapping,
} = require("../../../controllers/examination/selector/courseAcademicYearMappingController");
const router = express.Router();

router.get("/", getAllMappings);
router.post("/", createMapping);
router.put("/:id", updateMapping);
router.delete("/:id", deleteMapping);

module.exports = router;
