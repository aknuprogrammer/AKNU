const DepartmentSeminar = require('../../../models/website/DepartmentSeminar');

exports.createSeminar = async (req, res) => {
  try {
    const { college, department, majorEvent, period, note } = req.body;
    const newSeminar = new DepartmentSeminar({ college, department, majorEvent, period, note });
    await newSeminar.save();
    res.status(201).json({ message: 'Seminar created successfully', data: newSeminar });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create seminar', error: error.message });
  }
};

exports.getSeminars = async (req, res) => {
  try {
    const { college, department } = req.query;
    const filter = {};
    if (college) filter.college = college;
    if (department) filter.department = department;

    const seminars = await DepartmentSeminar.find(filter).sort({ createdAt: -1 });
    res.status(200).json(seminars);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch seminars', error: error.message });
  }
};

exports.updateSeminar = async (req, res) => {
  try {
    const { id } = req.params;
    const { college, department, majorEvent, period, note } = req.body;
    const updatedSeminar = await DepartmentSeminar.findByIdAndUpdate(
      id,
      { college, department, majorEvent, period, note },
      { new: true, runValidators: true }
    );
    
    if (!updatedSeminar) {
      return res.status(404).json({ message: 'Seminar not found' });
    }
    res.status(200).json({ message: 'Seminar updated successfully', data: updatedSeminar });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update seminar', error: error.message });
  }
};

exports.deleteSeminar = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSeminar = await DepartmentSeminar.findByIdAndDelete(id);
    if (!deletedSeminar) {
      return res.status(404).json({ message: 'Seminar not found' });
    }
    res.status(200).json({ message: 'Seminar deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete seminar', error: error.message });
  }
};
