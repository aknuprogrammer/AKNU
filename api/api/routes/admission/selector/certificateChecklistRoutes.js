const express = require("express");
const {
  getAllChecklists,
  createChecklist,
  getChecklistById,
  updateChecklist,
  deleteChecklist,
  getCheckedChecklists,
} = require("../../../controllers/admission/selector/certificateChecklistController");

const router = express.Router();

// GET all | POST new
router.route("/").get(getAllChecklists).post(createChecklist);

router.get("/checked", getCheckedChecklists);
// GET one | PUT update | DELETE
router
  .route("/:id")
  .get(getChecklistById)
  .put(updateChecklist)
  .delete(deleteChecklist);

module.exports = router;
