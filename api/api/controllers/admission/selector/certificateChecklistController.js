const CertificateChecklist = require("../../../models/admission/selector/CertificateChecklist");

// @desc Get all checklist items
exports.getAllChecklists = async (req, res) => {
  try {
    const items = await CertificateChecklist.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Get single checklist item by ID
exports.getChecklistById = async (req, res) => {
  try {
    const item = await CertificateChecklist.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Checklist item not found" });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Create new checklist item
exports.createChecklist = async (req, res) => {
  try {
    const { title, required, description, check } = req.body;

    const newItem = new CertificateChecklist({
      title,
      required,
      description,
      check,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Get all checklist items where check is true
exports.getCheckedChecklists = async (req, res) => {
  try {
    const items = await CertificateChecklist.find({ check: true });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc Update checklist item
exports.updateChecklist = async (req, res) => {
  try {
    const updatedItem = await CertificateChecklist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) return res.status(404).json({ message: "Checklist item not found" });

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Delete checklist item
exports.deleteChecklist = async (req, res) => {
  try {
    const deletedItem = await CertificateChecklist.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Checklist item not found" });
    res.status(200).json({ message: "Checklist item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
