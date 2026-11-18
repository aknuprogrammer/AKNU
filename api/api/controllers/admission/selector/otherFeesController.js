const OtherFee = require("../../../models/admission/selector/OtherFee");

// Get all fees
exports.getAllFees = async (req, res) => {
  try {
    const fees = await OtherFee.find().sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new fee
exports.createFee = async (req, res) => {
  try {
    const feeData = req.body;
console.log("_____feeData",feeData)
    // Auto-calculate tuition amount if courseType and subFees exist
    if (feeData.feeCategory === "Tuition" && feeData.subFees && feeData.subFees.length > 0) {
      feeData.amount = feeData.subFees.reduce((sum, sf) => sum + sf.amount, 0);
    }

    const newFee = new OtherFee(feeData);
    await newFee.save();
    res.status(201).json(newFee);
  } catch (err) {
    console.log("_____-error",err)
    res.status(400).json({ message: err.message });
  }
};

// Update an existing fee
exports.updateFee = async (req, res) => {
  try {
    const feeData = req.body;

    if (feeData.feeCategory === "Tuition" && feeData.subFees && feeData.subFees.length > 0) {
      feeData.amount = feeData.subFees.reduce((sum, sf) => sum + sf.amount, 0);
    }

    const updatedFee = await OtherFee.findByIdAndUpdate(req.params.id, feeData, { new: true });
    if (!updatedFee) return res.status(404).json({ message: "Fee not found" });

    res.json(updatedFee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a fee
exports.deleteFee = async (req, res) => {
  try {
    const deletedFee = await OtherFee.findByIdAndDelete(req.params.id);
    if (!deletedFee) return res.status(404).json({ message: "Fee not found" });

    res.json({ message: "Fee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
