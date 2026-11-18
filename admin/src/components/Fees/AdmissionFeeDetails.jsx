import { useRef, useState, useEffect } from "react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { BASE_URL } from "../../config/urls";

const initialFormData = {
  campus: "",
  programType: "",
  specialization: "",
  name: "",
  abbreviation: "",
  duration: "",
  eligibility: [""],
  programLevel: "ug",
  detailedEligibility: [""],
  examPattern: [""],
  syllabus: [""],
  fees: "",
  semester1Fees: "",
  semester2Fees: "",
  note: "",
};

const AdmissionFeeDetails = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const formRef = useRef();

  useEffect(() => {
    fetchItems();
  }, []);
  const token = localStorage.getItem("token"); // Get the token from localStorage

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admission-fees/`, {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 Proper placement bro!
        },
      });
      setItems(response.data.data || []);
    } catch (error) {
      setItems([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  // For array fields
  const handleArrayChange = (field, idx, value) => {
    const arr = [...formData[field]];
    arr[idx] = value;
    setFormData({ ...formData, [field]: arr });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayField = (field, idx) => {
    const arr = [...formData[field]];
    arr.splice(idx, 1);
    setFormData({ ...formData, [field]: arr });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.campus.trim()) newErrors.campus = "Campus is required";
    if (!formData.programType.trim())
      newErrors.programType = "Program type is required";
    if (!formData.specialization.trim())
      newErrors.specialization = "Specialization is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.abbreviation.trim())
      newErrors.abbreviation = "Abbreviation is required";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required";
    if (!formData.fees.trim()) newErrors.fees = "Fees is required";
    if (!formData.semester1Fees.trim())
      newErrors.semester1Fees = "Semester 1 Fees is required";
    if (!formData.semester2Fees.trim())
      newErrors.semester2Fees = "Semester 2 Fees is required";
    if (!formData.programLevel.trim())
      newErrors.programLevel = "Program level is required";
    // Validate arrays
    ["eligibility", "detailedEligibility", "examPattern", "syllabus"].forEach(
      (field) => {
        if (
          !formData[field] ||
          !formData[field].length ||
          formData[field].some((v) => !v.trim())
        ) {
          newErrors[field] = `At least one valid ${field} is required`;
        }
      }
    );
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/admission-fees/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Proper placement bro!
          },
        });
        setSubmitMessage("Details updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/admission-fees/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Proper placement bro!
          },
        });
        setSubmitMessage("Details added successfully!");
      }
      await fetchItems();
      setFormData(initialFormData);
      setEditingId(null);
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      setSubmitMessage("Failed to submit. Please try again.");
      setTimeout(() => setSubmitMessage(""), 3000);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      eligibility:
        item.eligibility && item.eligibility.length ? item.eligibility : [""],
      detailedEligibility:
        item.detailedEligibility && item.detailedEligibility.length
          ? item.detailedEligibility
          : [""],
      examPattern:
        item.examPattern && item.examPattern.length ? item.examPattern : [""],
      syllabus: item.syllabus && item.syllabus.length ? item.syllabus : [""],
    });
    setEditingId(item._id);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/admission-fees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmitMessage("Entry deleted successfully!");
        await fetchItems();
        setTimeout(() => setSubmitMessage(""), 3000);
      } catch (error) {
        setSubmitMessage("Failed to delete entry.");
        setTimeout(() => setSubmitMessage(""), 3000);
      }
    }
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={formRef} className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId
          ? "Edit Admission Fee Details"
          : "Create New Admission Fee Details"}
      </h1>
      {submitMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {submitMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label
              htmlFor="campus"
              className="block text-sm font-medium text-gray-700"
            >
              Campus *
            </label>
            <select
              id="campus"
              name="campus"
              value={formData.campus}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.campus
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            >
              <option value="">Select campus</option>
              <option value="Rajamahendravaram">Rajamahendravaram</option>
              <option value="Tadepalligudem">Tadepalligudem</option>
              <option value="Kakinada">Kakinada</option>
            </select>
            {errors.campus && (
              <p className="mt-1 text-sm text-red-500">{errors.campus}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Program Level *
            </label>
            <div className="flex gap-6">
              <label className="inline-flex  items-center">
                <input
                  type="radio"
                  name="programLevel"
                  value="ug"
                  checked={formData.programLevel === "ug"}
                  onChange={handleChange}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">UG</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="programLevel"
                  value="pg"
                  checked={formData.programLevel === "pg"}
                  onChange={handleChange}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">PG</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="programLevel"
                  value="others"
                  checked={formData.programLevel === "others"}
                  onChange={handleChange}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Others</span>
              </label>
            </div>
            {errors.programLevel && (
              <p className="mt-1 text-sm text-red-500">{errors.programLevel}</p>
            )}
          </div>
        </div>
        {/* Program Type, Specialization, Duration in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label
              htmlFor="programType"
              className="block text-xs font-medium text-gray-700"
            >
              Program Type *
            </label>
            <input
              type="text"
              id="programType"
              name="programType"
              value={formData.programType}
              onChange={handleChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.programType
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Program type"
            />
            {errors.programType && (
              <p className="mt-1 text-xs text-red-500">{errors.programType}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="specialization"
              className="block text-xs font-medium text-gray-700"
            >
              Specialization *
            </label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              value={formData.specialization}
              onChange={(e) => {
                handleChange(e);
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                  abbreviation: e.target.value,
                }));
              }}
              className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.specialization
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Specialization"
            />
            {errors.specialization && (
              <p className="mt-1 text-xs text-red-500">
                {errors.specialization}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="duration"
              className="block text-xs font-medium text-gray-700"
            >
              Duration *
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.duration
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Duration"
            />
            {errors.duration && (
              <p className="mt-1 text-xs text-red-500">{errors.duration}</p>
            )}
          </div>
        </div>

        {/* Array fields with add/remove */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eligibility *
            </label>
            {formData.eligibility.map((val, idx) => (
              <div key={idx} className="flex items-center  mb-2">
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    handleArrayChange("eligibility", idx, e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                  placeholder="Enter eligibility"
                />
                {formData.eligibility.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("eligibility", idx)}
                    className="text-red-500 px-4"
                  >
                    -
                  </button>
                )}
                {idx === formData.eligibility.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayField("eligibility")}
                    className="text-green-500 px-4"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
            {errors.eligibility && (
              <p className="mt-1 text-sm text-red-500">{errors.eligibility}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Eligibility *
            </label>
            {formData.detailedEligibility.map((val, idx) => (
              <div key={idx} className="flex items-center  mb-2">
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    handleArrayChange(
                      "detailedEligibility",
                      idx,
                      e.target.value
                    )
                  }
                  className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                  placeholder="Enter detailed eligibility"
                />
                {formData.detailedEligibility.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("detailedEligibility", idx)}
                    className="text-red-500 px-2"
                  >
                    -
                  </button>
                )}
                {idx === formData.detailedEligibility.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayField("detailedEligibility")}
                    className="text-green-500 px-2"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
            {errors.detailedEligibility && (
              <p className="mt-1 text-sm text-red-500">
                {errors.detailedEligibility}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Pattern *
            </label>
            {formData.examPattern.map((val, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    handleArrayChange("examPattern", idx, e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                  placeholder="Enter exam pattern"
                />
                {formData.examPattern.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("examPattern", idx)}
                    className="text-red-500 px-2"
                  >
                    -
                  </button>
                )}
                {idx === formData.examPattern.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayField("examPattern")}
                    className="text-green-500 px-2"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
            {errors.examPattern && (
              <p className="mt-1 text-sm text-red-500">{errors.examPattern}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Syllabus *
            </label>
            {formData.syllabus.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    handleArrayChange("syllabus", idx, e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                  placeholder="Enter syllabus topic"
                />
                {formData.syllabus.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("syllabus", idx)}
                    className="text-red-500 px-2"
                  >
                    -
                  </button>
                )}
                {idx === formData.syllabus.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayField("syllabus")}
                    className="text-green-500 px-2"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
            {errors.syllabus && (
              <p className="mt-1 text-sm text-red-500">{errors.syllabus}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label
              htmlFor="fees"
              className="block text-sm font-medium text-gray-700"
            >
              Fees *
            </label>
            <input
              type="text"
              id="fees"
              name="fees"
              value={formData.fees}
              onChange={handleChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              className={`w-[95%] px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.fees
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter fees"
            />
            {errors.fees && (
              <p className="mt-1 text-sm text-red-500">{errors.fees}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="semester1Fees"
              className="block text-sm font-medium text-gray-700"
            >
              Semester 1 Fees *
            </label>
            <input
              type="text"
              id="semester1Fees"
              name="semester1Fees"
              value={formData.semester1Fees}
              onChange={handleChange}
              className={`w-[95%] px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.semester1Fees
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter semester 1 fees"
            />
            {errors.semester1Fees && (
              <p className="mt-1 text-sm text-red-500">
                {errors.semester1Fees}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label
              htmlFor="semester2Fees"
              className="block text-sm font-medium text-gray-700"
            >
              Semester 2 Fees *
            </label>
            <input
              type="text"
              id="semester2Fees"
              name="semester2Fees"
              value={formData.semester2Fees}
              onChange={handleChange}
              className={`w-[95%] px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.semester2Fees
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter semester 2 fees"
            />
            {errors.semester2Fees && (
              <p className="mt-1 text-sm text-red-500">
                {errors.semester2Fees}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700"
            >
              Note
            </label>
            <input
              type="text"
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-[95%] px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
              placeholder="Enter note (optional)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormData);
                setEditingId(null);
                setErrors({});
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {editingId ? "Update Details" : "Create Details"}
          </button>
        </div>
      </form>
      {/* Table */}
      <div className="bg-white w-full shadow-md rounded-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Admission Fee Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Campus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Program Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Fees
                </th>
                <th className="py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Semester 1
                </th>
                <th className="py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Semester 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Program Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Note
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Created At
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.campus}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.programType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.specialization}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.duration}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.fees}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.semester1Fees}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.semester2Fees}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.programLevel && item.programLevel.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.note}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4 inline" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short", // Use 'long' for full month name
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="12"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No details found. Create your first entry!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionFeeDetails;
