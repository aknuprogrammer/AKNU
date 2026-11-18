const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/certificationFee/formControllers");
const hostelFeeCtrl = require("../../controllers/certificationFee/hostelFeeController");

router.post("/exam", ctrl.createExamFee);
router.get("/exam", ctrl.getExamFees);

router.post("/hostel-fee", hostelFeeCtrl.createHostelFee);
router.get("/hostel-fee", hostelFeeCtrl.getHostelFees);
router.put("/hostel-fee/:id", hostelFeeCtrl.updateHostelFee);
router.delete("/hostel-fee/:id", hostelFeeCtrl.deleteHostelFee);

router.post("/sports", ctrl.createSportsFee);
router.get("/sports", ctrl.getSportsFees);

router.post("/affiliation", ctrl.createAffiliationFee);
router.get("/affiliation", ctrl.getAffiliationFees);

router.post("/admission", ctrl.createAdmissionForm);
router.get("/admission", ctrl.getAdmissionForms);

module.exports = router;