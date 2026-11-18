const Models = require("../../models/certificationFee/FormModels");

const createHandler = (Model) => async (req, res) => {
  try {
    const doc = new Model(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllHandler = (Model) => async (req, res) => {
  try {
    const docs = await Model.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateHandler = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteHandler = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json({ message: "Document deleted successfully", data: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createExamFee: createHandler(Models.ExamFee),
  getExamFees: getAllHandler(Models.ExamFee),

  createHostelFee: createHandler(Models.HostelFee),
  getHostelFees: getAllHandler(Models.HostelFee),
  updateHostelFee: updateHandler(Models.HostelFee),
  deleteHostelFee: deleteHandler(Models.HostelFee),

  createSportsFee: createHandler(Models.SportsFee),
  getSportsFees: getAllHandler(Models.SportsFee),

  createAffiliationFee: createHandler(Models.AffiliationFee),
  getAffiliationFees: getAllHandler(Models.AffiliationFee),

  createAdmissionForm: createHandler(Models.AdmissionForm),
  getAdmissionForms: getAllHandler(Models.AdmissionForm),
};
