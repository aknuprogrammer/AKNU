import { useState, useEffect } from "react";
import { collegesApi, coursesApi } from "../../../services/apiService";
import { BASE_URL } from "../../../config/urls";
import axios from "axios";

const AddFormModal = ({ tabKey, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Fee categories and subcategories
  const feeCategories = [
    "Tuition",
    "Admission",
    "Exam",
    "Library",
    "Hostel",
    "Transport",
    "Miscellaneous",
  ];
  const courseTypes = [
    "Arts",
    "Science",
    "Commerce",
    "Engineering",
    "MBA",
    "Medical",
  ];
  const frequencies = ["One-time", "Annual", "Semester", "Monthly"];

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const data = await collegesApi.getAll();
        // Ensure data is an array
        const collegesArray = Array.isArray(data) ? data : (data?.data || []);
        setColleges(collegesArray);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await coursesApi.getAll();
        // Ensure data is an array
        const coursesArray = Array.isArray(data) ? data : (data?.data || data?.courses || []);
        setCourses(coursesArray);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      switch (tabKey) {
        case "collegeCourseMapping":
          setFormData({
            collegeId: "",
            courseIds: [],
          });
          break;
        case "colleges":
          setFormData({ 
            code: "", 
            name: "", 
            address: "",
            collegeType: "",
            collegeCategory: "",
            courseCategory: "",
            comments: "" 
          });
          break;
        case "courses":
          setFormData({ code: "", name: "", comments: "" });
          break;
        case "admissionFees":
          setFormData({
            courseId: "",
            campusId: "",
            mode: "",
            years: [
              {
                year: 1,
                fees: [{ feeType: "", feeAmount: 0, remarks: "" }],
              },
            ],
          });
          break;
        case "otherFees":
          setFormData({
            collegeId: "",
            feeCategory: "",
            courseType: "",
            subCategory: "",
            amount: "",
            frequency: "One-time",
            subFees: [],
          });
          break;

        case "apscheAllotments":
          setFormData({
            title: "",
            date: "",
            file: null, // will hold the Excel/CSV file
          });
          break;
        case "certificateChecklist":
          setFormData({
            title: "",
            required: true, // Default to "Yes"
            description: "",
          });
          break;
        case "datePicker":
          setFormData({
            title: "",
            startDate: "",
            startTime: "",
            endDate: "",
            endTime: "",
            description: "",
          });
          break;
        default:
          setFormData({});
      }
    }
  }, [initialData, tabKey]);

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle course checkbox toggle
  const handleCourseToggle = (courseId) => {
    setFormData((prev) => {
      const currentCourseIds = prev.courseIds || [];
      if (currentCourseIds.includes(courseId)) {
        return {
          ...prev,
          courseIds: currentCourseIds.filter((id) => id !== courseId),
        };
      } else {
        return {
          ...prev,
          courseIds: [...currentCourseIds, courseId],
        };
      }
    });
  };

  // Handle sub fee changes for tuition fees
  const handleSubFeeChange = (index, field, value) => {
    setFormData((prev) => {
      const newSubFees = [...prev.subFees];
      newSubFees[index] = {
        ...newSubFees[index],
        [field]: field === "amount" ? parseFloat(value || 0) : value,
      };

      // Recalculate total amount with rounding
      const totalAmount = newSubFees.reduce(
        (sum, sf) => sum + (sf.amount || 0),
        0
      );

      return {
        ...prev,
        subFees: newSubFees,
        amount: parseFloat(totalAmount.toFixed(2)), // ✅ ensures 2 decimals
      };
    });
  };

  // Add a new sub fee
  const addSubFee = () => {
    setFormData((prev) => ({
      ...prev,
      subFees: [...(prev.subFees || []), { name: "", amount: 0 }],
    }));
  };

  // Remove a sub fee
  const removeSubFee = (index) => {
    setFormData((prev) => {
      const newSubFees = [...prev.subFees];
      newSubFees.splice(index, 1);

      // Recalculate total amount
      const totalAmount = newSubFees.reduce(
        (sum, sf) => sum + (sf.amount || 0),
        0
      );

      return {
        ...prev,
        subFees: newSubFees,
        amount: totalAmount,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this useEffect to filter courses based on search
  useEffect(() => {
    if (!Array.isArray(courses)) {
      setFilteredCourses([]);
      return;
    }
    const filtered = courses.filter(
      (course) =>
        course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  const selectAllCourses = () => {
    setFormData((prev) => ({
      ...prev,
      courseIds: filteredCourses.map((course) => course._id),
    }));
  };

  const deselectAllCourses = () => {
    setFormData((prev) => ({
      ...prev,
      courseIds: (prev.courseIds || []).filter(
        (id) => !filteredCourses.some((course) => course._id === id)
      ),
    }));
  };

  const [collegesWithCourses, setCollegesWithCourses] = useState([]);
  // Fetch colleges from API
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/mappings`);
        setCollegesWithCourses(res.data || []);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, [initialData]);

  // Find the selected campus object
  const selectedCampus = collegesWithCourses?.find(
    (c) => c?.college?._id === formData?.campusId
  );

  const getModalTitle = () => {
    const action = initialData ? "Edit" : "Add New";
    let type = "";
    switch (tabKey) {
      case "colleges":
        type = "College";
        break;
      case "courses":
        type = "Course";
        break;
      case "collegeCourseMapping":
        type = "College-Course Mapping";
        break;
      case "otherFees":
        type = "Fee";
        break;
      default:
        type = "Item";
    }
    return `${action} ${type}`;
  };

  const renderFormFields = () => {
    switch (tabKey) {
      case "collegeCourseMapping":
        return (
          <>
            {/* Select College */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select College*
              </label>

              <select
                name="collegeId"
                value={
                  formData.collegeId ||
                  (initialData && initialData?.college?._id)
                }
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                required
              >
                <option value="">Choose a college</option>
                {Array.isArray(colleges) && colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name} ({college.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Multiple Courses */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Courses*
                </label>
                <div className="text-xs text-emerald-600">
                  {(formData.courseIds || []).length} selected
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={selectAllCourses}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAllCourses}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Deselect All
                </button>
              </div>

              {/* Courses Grid with Virtual Scrolling */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <label
                        key={course._id}
                        className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.courseIds || []).includes(
                            course._id
                          )}
                          onChange={() => handleCourseToggle(course._id)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {course.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Code: {course.code}
                          </div>
                          {course.duration && (
                            <div className="text-xs text-gray-500">
                              Duration: {course.duration}
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {searchTerm
                        ? "No courses match your search"
                        : "No courses available"}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Courses Summary */}
              {((formData.courseIds && formData.courseIds.length > 0) ||
                (initialData?.courses && initialData.courses.length > 0)) && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h4 className="text-sm font-medium text-emerald-800 mb-2">
                    Selected Courses (
                    {(Array.isArray(formData.courseIds) ? formData.courseIds.length : 0) ||
                      (Array.isArray(initialData?.courses) ? initialData.courses.length : 0) ||
                      0}
                    )
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(courses) && courses.length > 0
                      ? courses.filter((course) =>
                          (Array.isArray(formData.courseIds) && formData.courseIds.length > 0
                            ? formData.courseIds
                            : initialData?.courses?.map((c) => c._id) || []
                          ).includes(course._id)
                        )
                      : initialData?.courses || []
                    ).map((course) => (
                      <span
                        key={course._id}
                        className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                      >
                        {course.code}
                        <button
                          type="button"
                          onClick={() => handleCourseToggle(course._id)}
                          className="ml-1 text-emerald-600 hover:text-emerald-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        );

      case "colleges":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter college code"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter college name"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Address*
              </label>
              <textarea
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter address"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Type*
              </label>
              <select
                name="collegeType"
                value={formData.collegeType || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select College Type</option>
                <option value="Autonomous">Autonomous</option>
                <option value="Non-Autonomous">Non-Autonomous</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Category*
              </label>
              <select
                name="collegeCategory"
                value={formData.collegeCategory || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select College Category</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course Category*
              </label>
              <select
                name="courseCategory"
                value={formData.courseCategory || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Course Category</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
                <option value="Law">Law</option>
                <option value="University">University</option>
              </select>
            </div>
            {/* Comments Section */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows="3"
                placeholder="Enter any remarks or additional details"
              />
            </div>
          </>
        );

      case "courses":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter course code"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter course name"
              />
            </div>

            {/* <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College*
              </label>
              <select
                name="collegeId"
                value={formData.collegeId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select a college</option>
                {colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name} ({college.code})
                  </option>
                ))}
              </select>
            </div> */}

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments || ""}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter any remarks or additional details"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </>
        );
      case "admissionFees":
        return (
          <>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Course Fee Structure
              </h2>
              <p className="text-gray-600 mb-6">
                Configure the fee details for your course
              </p>

              <div className="space-y-6">
                {/* Campus Selector */}
                {loading ? (
                  <div>Loading campuses...</div>
                ) : (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Campus*
                    </label>
                    <select
                      name="campusId"
                      value={formData.campusId || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                      required
                    >
                      <option value="">Select Campus</option>
                      {Array.isArray(collegesWithCourses) &&
                        collegesWithCourses.map((campus, idx) => {
                          const college = campus?.college;
                          if (!college) {
                            console.warn(
                              "Skipping invalid campus entry:",
                              campus
                            );
                            return null; // skip null colleges
                          }

                          const collegeId = college._id || `fallback-${idx}`;
                          const collegeName = college.name
                            ? college.name.charAt(0).toUpperCase() +
                              college.name.slice(1)
                            : "Unnamed College";

                          return (
                            <option key={collegeId} value={college._id || ""}>
                              {college.code || "CODE"} - {collegeName}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                )}

                {/* Course Selector */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Select Course*
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                    required
                  >
                    <option value="">Choose a course</option>
                    {selectedCampus?.courses?.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode Selector */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mode*
                  </label>
                  <select
                    name="mode"
                    value={formData.mode || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                    required
                  >
                    <option value="">Choose mode</option>
                    <option value="Regular">Regular</option>
                    <option value="Self-Finance">Self-Finance</option>
                    <option value="Scholarship">Scholarship Holder</option>
                  </select>
                </div>

      

                {/* Year-wise Fees */}
                <div className="pt-4">
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Year-wise Fees
                  </label>

                  <div className="space-y-5">
                    {formData.years?.map((year, yIdx) => (
                      <div
                        key={yIdx}
                        className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Year Header */}
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                          <span className="font-semibold text-gray-700">
                            Year {year.year}
                          </span>
                          {formData.years.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  years: prev.years.filter(
                                    (_, i) => i !== yIdx
                                  ),
                                }))
                              }
                              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                            >
                              Remove Year
                            </button>
                          )}
                        </div>

                        {/* Fee Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  S.No
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Fee Type
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Fee Amount (₹)
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Remarks
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {year.fees?.map((fee, fIdx) => (
                                <tr key={fIdx}>
                                  <td className="px-4 py-2">{fIdx + 1}</td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      value={fee.feeType || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const years = [...prev.years];
                                          years[yIdx].fees[fIdx].feeType = val;
                                          return { ...prev, years };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      value={fee.feeAmount || 0}
                                      onChange={(e) => {
                                        const val =
                                          parseFloat(e.target.value) || 0;
                                        setFormData((prev) => {
                                          const years = [...prev.years];
                                          years[yIdx].fees[fIdx].feeAmount =
                                            val;
                                          return { ...prev, years };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      value={fee.remarks || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const years = [...prev.years];
                                          years[yIdx].fees[fIdx].remarks = val;
                                          return { ...prev, years };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData((prev) => {
                                          const years = [...prev.years];
                                          years[yIdx].fees = years[
                                            yIdx
                                          ].fees.filter((_, i) => i !== fIdx);
                                          return { ...prev, years };
                                        });
                                      }}
                                      className="text-red-500 hover:text-red-700 font-medium"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>

                            {/* Total Row */}
                            <tfoot>
                              <tr className="bg-gray-50 font-semibold">
                                <td
                                  colSpan={2}
                                  className="px-4 py-2 text-right"
                                >
                                  Total
                                </td>
                                <td className="px-4 py-2">
                                  ₹
                                  {year.fees
                                    ?.reduce(
                                      (sum, f) => sum + (f.feeAmount || 0),
                                      0
                                    )
                                    .toLocaleString("en-IN")}
                                </td>
                                <td colSpan={2}></td>
                              </tr>
                            </tfoot>
                          </table>

                          {/* Add Fee Row */}
                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => {
                                  const years = [...prev.years];
                                  years[yIdx].fees = [
                                    ...(years[yIdx].fees || []),
                                    { feeType: "", feeAmount: 0, remarks: "" },
                                  ];
                                  return { ...prev, years };
                                })
                              }
                              className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add Fee
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Year */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          years: [
                            ...prev.years,
                            {
                              year: prev.years.length + 1,
                              fees: [
                                { feeType: "", feeAmount: 0, remarks: "" },
                              ],
                            },
                          ],
                        }))
                      }
                      className="flex items-center justify-center w-full py-3 bg-emerald-50 text-emerald-700 rounded-lg border border-dashed border-emerald-300 hover:bg-emerald-100 transition-colors duration-200 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Another Year
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "apscheAllotments":
        return (
          <>
            {/* Title */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter allotment title"
                required
              />
            </div>

            {/* Date */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Date*
              </label>
              <input
                type="date"
                name="date"
                value={formData.date || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {/* File Upload */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Upload Excel/CSV*
              </label>
              <input
                type="file"
                name="file"
                accept=".xls,.xlsx,.csv"
                onChange={handleFileChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Only Excel or CSV files are allowed.
              </p>
            </div>
          </>
        );

      case "certificateChecklist":
        return (
          <>
            {/* Title */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter checklist item title"
                required
              />
            </div>

            {/* Required */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Required*
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="required"
                    value="true"
                    checked={
                      formData.required === true || formData.required === "true"
                    }
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="required"
                    value="false"
                    checked={
                      formData.required === false ||
                      formData.required === "false"
                    }
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mark whether this document is required for certificate
                processing.
              </p>
            </div>

            {/* Description (Optional) */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter optional description or instructions"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Add any specific instructions or details about this
                requirement.
              </p>
            </div>
          </>
        );
      case "otherFees":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College*
              </label>
              <select
                name="collegeId"
                value={formData.collegeId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select a college</option>
                {Array.isArray(colleges) && colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name} ({college.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Fee Category*
              </label>
              <input
                type="text"
                name="feeCategory"
                value={formData.feeCategory || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter fee category (e.g., Tuition, Admission, Special Fees, etc.)"
                list="feeCategories"
              />
              <datalist id="feeCategories">
                {Array.isArray(feeCategories) && feeCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            {/* Show course type only for Tuition fees */}
            {formData.feeCategory === "Tuition" && (
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Course Type*
                </label>
                <input
                  type="text"
                  name="courseType"
                  value={formData.courseType || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="Enter course type (e.g., UG, PHD, PG, Diploma,, etc.)"
                  list="courseTypes"
                />
                <datalist id="courseTypes">
                  {Array.isArray(courseTypes) && courseTypes.map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </div>
            )}

            {/* Sub Category for non-Tuition fees */}
            {formData.feeCategory && formData.feeCategory !== "Tuition" && (
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Sub Category
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter sub category (optional)"
                />
              </div>
            )}

            {/* Special Fee Type for Special Fees */}
            {formData.feeCategory === "Special Fees" && (
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Special Fee Type
                </label>
                <input
                  type="text"
                  name="specialFeeType"
                  value={formData.specialFeeType || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter special fee type (e.g., Development Fee, Sports Fee, etc.)"
                />
              </div>
            )}

            {/* Description for any fee type */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter fee description (optional)"
                rows="2"
              />
            </div>

            {/* Sub Fees for Tuition fees */}
            {formData.feeCategory === "Tuition" && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub Fees
                  </label>
                  <button
                    type="button"
                    onClick={addSubFee}
                    className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                  >
                    + Add Sub Fee
                  </button>
                </div>

                {formData.subFees && formData.subFees.length > 0 ? (
                  <div className="space-y-3">
                    {formData.subFees.map((subFee, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Fee name"
                          value={subFee.name || ""}
                          onChange={(e) =>
                            handleSubFeeChange(index, "name", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={subFee.amount || ""}
                          onChange={(e) =>
                            handleSubFeeChange(index, "amount", e.target.value)
                          }
                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubFee(index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No sub fees added yet</p>
                )}
              </div>
            )}

            {/* Amount input for non-Tuition fees */}
            {formData.feeCategory && formData.feeCategory !== "Tuition" && (
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Amount*
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>
            )}

            {/* Total amount display for Tuition fees */}
            {formData.feeCategory === "Tuition" &&
              formData.subFees &&
              formData.subFees.length > 0 && (
                <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-sm font-medium text-emerald-800">
                    Total Amount: ₹{formData.amount || 0}
                  </div>
                </div>
              )}

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Frequency*
              </label>
              <input
                type="text"
                name="frequency"
                value={formData.frequency || "One-time"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter frequency (e.g., One-time, Annual, Semester, Monthly)"
                list="frequencies"
              />
              <datalist id="frequencies">
                {frequencies.map((freq) => (
                  <option key={freq} value={freq} />
                ))}
              </datalist>
            </div>
          </>
        );
      default:
      case "datePicker":
        return (
          <>
            {/* Title */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Event Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Start Date*
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Start Time*
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* End Date & Time */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  End Date*
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  End Time*
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Description (Optional) */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter event description (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Add details about the event, location, or special
                notes.
              </p>
            </div>
          </>
        );

        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
      <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <h3 className="text-lg font-semibold text-white">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {renderFormFields()}
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-white rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : initialData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFormModal;
