const DepartmentModal = require("../models/departmentModal");

// ✅ Create Department
const addDepartment = async (req, res) => {
  const { title, shortCode } = req.body;

  if (!title || !shortCode) {
    return res
      .status(400)
      .send({ message: "Title and ShortCode are required" });
  }

  try {
    const newDept = await DepartmentModal.create({ shortCode, title });
    return res
      .status(201)
      .send({ message: "Department added successfully", data: newDept });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error", error });
  }
};

// ✅ Get All Departments
const getDepartments = async (req, res) => {
  try {
    const departments = await DepartmentModal.find();
    return res.status(200).send(departments);
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error", error });
  }
};

// ✅ Edit / Update Department
const editDepartment = async (req, res) => {
  const { id } = req.params;
  const { title, shortCode } = req.body;

  try {
    const updatedDept = await DepartmentModal.findByIdAndUpdate(
      id,
      { title, shortCode },
      { new: true, runValidators: true }
    );

    if (!updatedDept) {
      return res.status(404).send({ message: "Department not found" });
    }

    return res
      .status(200)
      .send({ message: "Department updated successfully", data: updatedDept });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error", error });
  }
};

// ✅ Delete Department
const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDept = await DepartmentModal.findByIdAndDelete(id);

    if (!deletedDept) {
      return res.status(404).send({ message: "Department not found" });
    }

    return res.status(200).send({ message: "Department deleted successfully" });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error", error });
  }
};

module.exports = {
  addDepartment,
  getDepartments,
  editDepartment,
  deleteDepartment,
};
