import React, { useState, useEffect } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const InternalMarksMasterData = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showView, setShowView] = useState(false);

  const [formData, setFormData] = useState({
    courseId: "",
    courseName: "",
    subjectId: "",
    subjectName: "",
    maxMarks: "",
    passMarks: "",
    numberOfInternals: "",
    internalComponents: [], // Array of component names like ["Mid Term 1", "Mid Term 2", "Assignment"]
    status: "Active",
  });

  const courses = [
    { id: "course-1", name: "B.Tech CSE" },
    { id: "course-2", name: "B.Com" },
    { id: "course-3", name: "B.Sc" },
  ];

  const allSubjects = [
    { id: "sub-1", code: "DSA", name: "Data Structures", courseId: "course-1" },
    { id: "sub-2", code: "DBMS", name: "Database Systems", courseId: "course-1" },
    { id: "sub-3", code: "CN", name: "Computer Networks", courseId: "course-1" },
    { id: "sub-4", code: "FA", name: "Financial Accounting", courseId: "course-2" },
    { id: "sub-5", code: "ECO", name: "Economics", courseId: "course-2" },
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const storedData = localStorage.getItem("internal_marks_master_data");
      if (storedData) {
        setConfigs(JSON.parse(storedData));
      } else {
        setConfigs([]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load internal marks configurations");
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (data) => {
    localStorage.setItem("internal_marks_master_data", JSON.stringify(data));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-populate course name
      if (name === "courseId") {
        const course = courses.find((c) => c.id === value);
        updated.courseName = course?.name || "";
        // Reset subject when course changes
        updated.subjectId = "";
        updated.subjectName = "";
      }

      // Auto-populate subject name
      if (name === "subjectId") {
        const subject = allSubjects.find((s) => s.id === value);
        updated.subjectName = subject?.name || "";
      }

      // When numberOfInternals changes, update internalComponents array
      if (name === "numberOfInternals") {
        const num = parseInt(value) || 0;
        const defaultComponents = Array.from({ length: num }, (_, i) => {
          if (num === 2) return i === 0 ? "Mid Term 1" : "Mid Term 2";
          if (num === 3) return i === 0 ? "Mid Term 1" : i === 1 ? "Mid Term 2" : "Assignment";
          return `Internal ${i + 1}`;
        });
        updated.internalComponents = defaultComponents;
      }

      return updated;
    });
  };

  const handleComponentNameChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.internalComponents];
      updated[index] = value;
      return { ...prev, internalComponents: updated };
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.courseId || !formData.subjectId || !formData.maxMarks || !formData.passMarks || !formData.numberOfInternals) {
      showErrorMessage("Please fill all required fields");
      return;
    }

    if (parseFloat(formData.passMarks) > parseFloat(formData.maxMarks)) {
      showErrorMessage("Pass marks cannot be greater than maximum marks");
      return;
    }

    try {
      if (editingItem) {
        const updated = configs.map((item) =>
          item._id === editingItem._id
            ? { ...formData, _id: editingItem._id, updatedAt: new Date().toISOString() }
            : item
        );
        setConfigs(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Internal marks configuration updated successfully");
      } else {
        // Check for duplicate
        const exists = configs.find(
          (c) => c.courseId === formData.courseId && c.subjectId === formData.subjectId
        );
        if (exists) {
          showErrorMessage("Configuration already exists for this course and subject");
          return;
        }

        const newItem = {
          ...formData,
          _id: `imc_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [...configs, newItem];
        setConfigs(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Internal marks configuration created successfully");
      }
      handleResetForm();
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      showErrorMessage("Failed to save configuration");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      courseId: item.courseId || "",
      courseName: item.courseName || "",
      subjectId: item.subjectId || "",
      subjectName: item.subjectName || "",
      maxMarks: item.maxMarks || "",
      passMarks: item.passMarks || "",
      numberOfInternals: item.numberOfInternals || "",
      internalComponents: item.internalComponents || [],
      status: item.status || "Active",
    });
    setShowForm(true);
  };

  const handleView = (item) => {
    setViewItem(item);
    setShowView(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        const updated = configs.filter((item) => item._id !== id);
        setConfigs(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Configuration deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete configuration");
      }
    }
  };

  const handleResetForm = () => {
    setFormData({
      courseId: "",
      courseName: "",
      subjectId: "",
      subjectName: "",
      maxMarks: "",
      passMarks: "",
      numberOfInternals: "",
      internalComponents: [],
      status: "Active",
    });
    setEditingItem(null);
  };

  const getFilteredSubjects = () => {
    if (!formData.courseId) return allSubjects;
    return allSubjects.filter((s) => s.courseId === formData.courseId);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Internal Marks Master Data</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure maximum marks, pass marks, and number of internals for each course-subject combination
          </p>
        </div>
        <button
          onClick={() => {
            handleResetForm();
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Configuration
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Max Marks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Pass Marks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                No. of Internals
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Internal Components
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configs.length > 0 ? (
              configs.map((config, index) => (
                <tr key={config._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {config.courseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {config.subjectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {config.maxMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {config.passMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {config.numberOfInternals}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {config.internalComponents?.map((comp, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        config.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {config.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(config)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(config)}
                        className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                        title="Edit"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(config._id)}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  No configurations found. Click "Add Configuration" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">
                {editingItem ? "Edit Internal Marks Configuration" : "Add Internal Marks Configuration"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  handleResetForm();
                }}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Course*
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Subject*
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    disabled={!formData.courseId}
                  >
                    <option value="">Select subject</option>
                    {getFilteredSubjects().map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Maximum Marks*
                  </label>
                  <input
                    type="number"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., 100"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Pass Marks*
                  </label>
                  <input
                    type="number"
                    name="passMarks"
                    value={formData.passMarks}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., 40"
                    min="0"
                    max={formData.maxMarks || 100}
                    required
                  />
                  {formData.maxMarks && formData.passMarks && parseFloat(formData.passMarks) > parseFloat(formData.maxMarks) && (
                    <p className="mt-1 text-xs text-red-600">Pass marks cannot exceed maximum marks</p>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Number of Internals*
                </label>
                <input
                  type="number"
                  name="numberOfInternals"
                  value={formData.numberOfInternals}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., 2 or 3"
                  min="1"
                  max="10"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the number of internal assessments (e.g., 2 for Mid Term 1 & 2, 3 for Mid Term 1, 2 & Assignment)
                </p>
              </div>

              {/* Display Marks Information */}
              {formData.maxMarks && formData.numberOfInternals && parseInt(formData.numberOfInternals) > 0 && (
                <div className="mb-5 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-3">Marks Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Total Maximum Marks</label>
                      <div className="px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 font-semibold text-lg">
                        {formData.maxMarks}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Pass Marks</label>
                      <div className="px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 font-semibold text-lg">
                        {formData.passMarks || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Number of Internals</label>
                      <div className="px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 font-semibold text-lg">
                        {formData.numberOfInternals}
                      </div>
                    </div>
                  </div>
                  {formData.maxMarks && formData.numberOfInternals && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="text-xs font-medium text-emerald-800 mb-2">Marks Per Internal Component:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.internalComponents.map((comp, idx) => {
                          const marksPerComponent = Math.floor(parseFloat(formData.maxMarks) / parseInt(formData.numberOfInternals));
                          const remainder = parseFloat(formData.maxMarks) % parseInt(formData.numberOfInternals);
                          const marksForThis = marksPerComponent + (idx < remainder ? 1 : 0);
                          return (
                            <div key={idx} className="px-3 py-2 bg-white border border-emerald-200 rounded-lg">
                              <div className="text-xs text-emerald-600 mb-1">{comp || `Internal ${idx + 1}`}</div>
                              <div className="text-sm font-bold text-emerald-900">{marksForThis} marks</div>
                            </div>
                          );
                        })}
                      </div>
                      {formData.passMarks && (
                        <p className="mt-2 text-xs text-emerald-700">
                          Pass percentage: {((parseFloat(formData.passMarks) / parseFloat(formData.maxMarks)) * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {formData.numberOfInternals && parseInt(formData.numberOfInternals) > 0 && (
                <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block mb-3 text-sm font-medium text-gray-700">
                    Internal Component Names
                  </label>
                  <div className="space-y-2">
                    {formData.internalComponents.map((comp, index) => (
                      <div key={index}>
                        <label className="block mb-1 text-xs font-medium text-gray-600">
                          Component {index + 1}
                        </label>
                        <input
                          type="text"
                          value={comp}
                          onChange={(e) => handleComponentNameChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder={`e.g., Mid Term ${index + 1}, Assignment, Quiz`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Status*
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Footer Buttons */}
              <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    handleResetForm();
                  }}
                  className="px-5 py-2.5 transition-all border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 transition-all bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {editingItem ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-3xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Internal Marks Configuration - View</h3>
              <button
                onClick={() => setShowView(false)}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* View Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Course</label>
                  <input
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    value={viewItem.courseName || "-"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
                  <input
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    value={viewItem.subjectName || "-"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Maximum Marks</label>
                  <input
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    value={viewItem.maxMarks || "-"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pass Marks</label>
                  <input
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    value={viewItem.passMarks || "-"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Internals</label>
                  <input
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    value={viewItem.numberOfInternals || "-"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <input
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    value={viewItem.status || "-"}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Internal Components</label>
                  <div className="flex flex-wrap gap-2">
                    {viewItem.internalComponents?.map((comp, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {comp}
                      </span>
                    ))}
                    {(!viewItem.internalComponents || viewItem.internalComponents.length === 0) && (
                      <span className="text-gray-500 text-sm">No components defined</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-end p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowView(false)}
                className="px-5 py-2.5 transition-all border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalMarksMasterData;

