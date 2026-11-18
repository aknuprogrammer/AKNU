const ApplicationPurpose = require('../../models/certificationFee/applicationPurpose');

exports.getAllPurposes = async (req, res) => {
  try {
    const purposes = await ApplicationPurpose.find();
    res.json(purposes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPurposeById = async (req, res) => {
  try {
    const purpose = await ApplicationPurpose.findById(req.params.id);
    if (!purpose) {
      return res.status(404).json({ message: 'Purpose not found' });
    }
    res.json(purpose);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPurpose = async (req, res) => {
  const { purpose_code, purpose, fee, belated_fee, revised_rate_year, required_docs } = req.body;
  console.log("_____req.body", req.body);
  try {
    const newPurpose = new ApplicationPurpose({
      purpose_code,
      purpose,
      fee,
      belated_fee,
      revised_rate_year,
      required_docs
    });

    const savedPurpose = await newPurpose.save();
    console.log("_____savedPurpose", savedPurpose);
    res.status(201).json(savedPurpose);
  } catch (error) {
    console.log("_____error", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updatePurpose = async (req, res) => {
  try {
    const updatedPurpose = await ApplicationPurpose.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPurpose) {
      return res.status(404).json({ message: 'Purpose not found' });
    }
    
    res.json(updatedPurpose);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePurpose = async (req, res) => {
  try {
    const deletedPurpose = await ApplicationPurpose.findByIdAndDelete(req.params.id);
    
    if (!deletedPurpose) {
      return res.status(404).json({ message: 'Purpose not found' });
    }
    
    res.json({ message: 'Purpose deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};