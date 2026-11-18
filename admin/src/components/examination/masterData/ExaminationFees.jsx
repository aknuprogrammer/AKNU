import React, { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { collegesApi, coursesApi, academicYearsApi, semestersApi, streamsApi, subjectsApi } from "../../../services/apiService";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";

const STORAGE_KEY = "exam_examinationFees";

const ExaminationFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Helper function to extract data from API response
        const extractData = (response) => {
          if (!response) return [];
          if (Array.isArray(response)) return response;
          if (response?.data && Array.isArray(response.data)) return response.data;
          if (response?.success && response?.data && Array.isArray(response.data)) return response.data;
          if (response?.statusCode === 200 && response?.data && Array.isArray(response.data)) return response.data;
          return [];
        };

        const [collegesResponse, coursesResponse, academicYearsResponse, semestersResponse, streamsResponse, subjectsResponse] = await Promise.all([
          collegesApi.getAll().catch((err) => {
            console.error("Error fetching colleges:", err);
            return [];
          }),
          coursesApi.getAll().catch((err) => {
            console.error("Error fetching courses:", err);
            return [];
          }),
          academicYearsApi.getAll().catch((err) => {
            console.error("Error fetching academic years:", err);
            return [];
          }),
          semestersApi.getAll().catch((err) => {
            console.error("Error fetching semesters:", err);
            return [];
          }),
          streamsApi.getAll().catch((err) => {
            console.error("Error fetching streams:", err);
            return [];
          }),
          subjectsApi.getAll().catch((err) => {
            console.error("Error fetching subjects:", err);
            return [];
          }),
        ]);
        
        // Extract data arrays from responses
        const collegesData = extractData(collegesResponse);
        const coursesData = extractData(coursesResponse);
        const academicYearsData = extractData(academicYearsResponse);
        const semestersData = extractData(semestersResponse);
        const streamsData = extractData(streamsResponse);
        const subjectsData = extractData(subjectsResponse);
        
        // Filter out inactive records for dropdowns
        const filterActive = (data) => {
          if (!Array.isArray(data)) return [];
          return data.filter(item => {
            if (item.status !== undefined) {
              return item.status === 'Active';
            }
            return true;
          });
        };
        
        setColleges(filterActive(collegesData));
        setCourses(filterActive(coursesData));
        setAcademicYears(filterActive(academicYearsData));
        setSemesters(filterActive(semestersData));
        setStreams(filterActive(streamsData));
        // Sort subjects by code
        const sortedSubjects = filterActive(subjectsData).sort((a, b) => {
          const codeA = (a.code || "").toUpperCase();
          const codeB = (b.code || "").toUpperCase();
          return codeA.localeCompare(codeB);
        });
        setSubjects(sortedSubjects);

        const storedFees = localStorage.getItem(STORAGE_KEY);
        let parsedFees = [];
        try {
          parsedFees = storedFees ? JSON.parse(storedFees) : [];
          if (!Array.isArray(parsedFees)) {
            parsedFees = [];
          }
        } catch (parseErr) {
          console.error("Failed to parse stored fees:", parseErr);
          parsedFees = [];
        }

        const enrichedFees = parsedFees.map((fee) => {
          const campus = collegesData.find(
            (college) => college._id === fee.campusId || college.id === fee.campusId
          );
          const course = coursesData.find(
            (courseItem) => courseItem._id === fee.courseId || courseItem.id === fee.courseId
          );
          const stream = streamsData.find((streamItem) => streamItem._id === fee.streamId);
          const academicYear = academicYearsData.find(
            (yearItem) => yearItem._id === fee.academicYearId
          );
          const semester = semestersData.find(
            (semesterItem) => semesterItem._id === fee.semesterId
          );
          const subject = subjectsData.find(
            (subjectItem) => subjectItem._id === fee.subjectId
          );

          return {
            ...fee,
            campusName: fee.campusName || campus?.name || "",
            campusCode: fee.campusCode || campus?.code || "",
            courseName: fee.courseName || course?.name || "",
            courseCode: fee.courseCode || course?.code || "",
            streamName: fee.streamName || stream?.name || "",
            streamCode: fee.streamCode || stream?.code || "",
            academicYearName: fee.academicYearName || academicYear?.name || "",
            academicYearCode: fee.academicYearCode || academicYear?.code || "",
            semesterName: fee.semesterName || semester?.name || "",
            semesterCode: fee.semesterCode || semester?.code || "",
            subjectName: fee.subjectName || subject?.name || "",
            subjectCode: fee.subjectCode || subject?.code || "",
            years: (fee.years || []).map((year, index) => ({
              year: year.year || index + 1,
              fees: (year.fees || []).map((item) => ({
                feeType: item.feeType || "",
                feeAmount: Number(item.feeAmount) || 0,
                remarks: item.remarks || "",
              })),
            })),
          };
        });

        setFees(enrichedFees);
        setError(null);
      } catch (err) {
        console.error("Error loading examination fees:", err);
        const errorMessage = err?.message || "Failed to load examination fees";
        setError(errorMessage);
        showErrorMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const saveFees = (data) => {
    setFees(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const enhanceFeeStructure = (data) => {
    const campus = colleges.find((college) => college._id === data.campusId);
    const course = courses.find((courseItem) => courseItem._id === data.courseId);
    const stream = streams.find((streamItem) => streamItem._id === data.streamId);
    const academicYear = academicYears.find(
      (yearItem) => yearItem._id === data.academicYearId
    );
    const semester = semesters.find(
      (semesterItem) => semesterItem._id === data.semesterId
    );
    const subject = subjects.find((subjectItem) => subjectItem._id === data.subjectId);

    return {
      ...data,
      campusId: data.campusId,
      courseId: data.courseId,
      streamId: data.streamId,
      academicYearId: data.academicYearId,
      semesterId: data.semesterId,
      subjectId: data.subjectId,
      campusName: campus?.name || "",
      campusCode: campus?.code || "",
      courseName: course?.name || "",
      courseCode: course?.code || "",
      streamName: stream?.name || "",
      streamCode: stream?.code || "",
      academicYearName: academicYear?.name || "",
      academicYearCode: academicYear?.code || "",
      semesterName: semester?.name || "",
      semesterCode: semester?.code || "",
      subjectName: subject?.name || "",
      subjectCode: subject?.code || "",
      mode: data.mode,
      years: (data.years || []).map((year, index) => ({
        year: year.year || index + 1,
        fees: (year.fees || []).map((fee) => ({
          feeType: fee.feeType || "",
          feeAmount: Number(fee.feeAmount) || 0,
          remarks: fee.remarks || "",
        })),
      })),
    };
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this fee structure?")) {
      const updated = fees.filter((fee) => fee._id !== id);
      saveFees(updated);
      showSuccessMessage("Fee structure deleted successfully");
    }
  };

  const handleFormSubmit = (formData) => {
    try {
      const enriched = enhanceFeeStructure(formData);
      if (editingFee) {
        const updated = fees.map((fee) =>
          fee._id === editingFee._id ? { ...enriched, _id: editingFee._id } : fee
        );
        saveFees(updated);
        showSuccessMessage("Fee structure updated successfully");
      } else {
        const newFee = { ...enriched, _id: `exam_fee_${Date.now()}` };
        saveFees([...fees, newFee]);
        showSuccessMessage("Fee structure created successfully");
      }
      setShowAddForm(false);
      setEditingFee(null);
    } catch (err) {
      showErrorMessage("Failed to save fee structure");
    }
  };

  const filteredFees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return fees.filter((fee) => {
      const matchesSearch =
        !query ||
        fee.courseName?.toLowerCase().includes(query) ||
        fee.courseCode?.toLowerCase().includes(query) ||
        fee.campusName?.toLowerCase().includes(query) ||
        fee.campusCode?.toLowerCase().includes(query) ||
        fee.streamName?.toLowerCase().includes(query) ||
        fee.streamCode?.toLowerCase().includes(query) ||
        fee.academicYearName?.toLowerCase().includes(query) ||
        fee.academicYearCode?.toLowerCase().includes(query) ||
        fee.semesterName?.toLowerCase().includes(query) ||
        fee.semesterCode?.toLowerCase().includes(query) ||
        fee.subjectName?.toLowerCase().includes(query) ||
        fee.subjectCode?.toLowerCase().includes(query);

      const matchesMode = modeFilter === "All" || fee.mode === modeFilter;

      return matchesSearch && matchesMode;
    });
  }, [fees, searchQuery, modeFilter]);

  const computeYearTotal = (yearFees = []) =>
    yearFees.reduce((sum, fee) => sum + (Number(fee.feeAmount) || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Examination Fee Structures
          </h1>
          <p className="text-gray-600 mt-1">
            Configure and manage year-wise fee structures for examination processing.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingFee(null);
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Fee Structure
        </button>
      </div>

       {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course or campus..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
          />
        </div> 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mode
          </label>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
          >
            <option value="All">All Modes</option>
            <option value="Regular">Regular</option>
            <option value="Self-Finance">Self-Finance</option>
            <option value="Supplementary">Supplementary</option>
            <option value="Revaluation">Revaluation</option>
          </select>
        </div>
      </div>  */}

      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 text-sm">
          Showing <span className="font-semibold">{filteredFees.length}</span> of{" "}
          <span className="font-semibold">{fees.length}</span> fee structures
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Fees (Year 1)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <React.Fragment key={fee._id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setExpandedRow(expandedRow === fee._id ? null : fee._id)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="text-sm font-medium text-gray-900">
                          {fee.campusName || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {fee.campusCode || ""}
                        </div>
                        {(fee.academicYearName || fee.semesterName) && (
                          <div className="text-xs text-gray-500 mt-2 space-y-1">
                            {fee.academicYearName && (
                              <div>
                                Academic Year:{" "}
                                <span className="font-medium text-gray-700">
                                  {fee.academicYearCode
                                    ? `${fee.academicYearCode} - ${fee.academicYearName}`
                                    : fee.academicYearName}
                                </span>
                              </div>
                            )}
                            {fee.semesterName && (
                              <div>
                                Semester:{" "}
                                <span className="font-medium text-gray-700">
                                  {fee.semesterCode
                                    ? `${fee.semesterCode} - ${fee.semesterName}`
                                    : fee.semesterName}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="text-sm font-medium text-gray-900">
                          {fee.courseName || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {fee.courseCode || ""}
                        </div>
                        {(fee.streamName || fee.subjectName) && (
                          <div className="text-xs text-gray-500 mt-2 space-y-1">
                            {fee.streamName && (
                              <div>
                                Stream:{" "}
                                <span className="font-medium text-gray-700">
                                  {fee.streamCode
                                    ? `${fee.streamCode} - ${fee.streamName}`
                                    : fee.streamName}
                                </span>
                              </div>
                            )}
                            {fee.subjectName && (
                              <div>
                                Subject:{" "}
                                <span className="font-medium text-gray-700">
                                  {fee.subjectCode
                                    ? `${fee.subjectCode} - ${fee.subjectName}`
                                    : fee.subjectName}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          {fee.mode || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹
                        {computeYearTotal(fee.years?.[0]?.fees || []).toLocaleString(
                          "en-IN"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-emerald-600 hover:text-emerald-900 mr-3 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFee(fee);
                            setShowAddForm(true);
                          }}
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
                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(fee._id);
                          }}
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
                      </td>
                    </tr>
                    {expandedRow === fee._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              {
                                label: "Campus",
                                value: fee.campusName,
                                code: fee.campusCode,
                              },
                              {
                                label: "Course",
                                value: fee.courseName,
                                code: fee.courseCode,
                              },
                              {
                                label: "Stream",
                                value: fee.streamName,
                                code: fee.streamCode,
                              },
                              {
                                label: "Academic Year",
                                value: fee.academicYearName,
                                code: fee.academicYearCode,
                              },
                              {
                                label: "Semester",
                                value: fee.semesterName,
                                code: fee.semesterCode,
                              },
                              {
                                label: "Subject",
                                value: fee.subjectName,
                                code: fee.subjectCode,
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                              >
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                  {item.label}
                                </p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {item.value
                                    ? item.code
                                      ? `${item.code} - ${item.value}`
                                      : item.value
                                    : "—"}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(fee.years || []).map((year) => (
                              <div
                                key={year.year}
                                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <h5 className="font-medium text-gray-800">
                                    Year {year.year}
                                  </h5>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    ₹{computeYearTotal(year.fees).toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {(year.fees || []).map((item, idx) => (
                                    <div
                                      key={`${year.year}-${idx}`}
                                      className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded-lg"
                                    >
                                      <div>
                                        <div className="font-medium text-gray-800">
                                          {item.feeType || "—"}
                                        </div>
                                        {item.remarks && (
                                          <div className="text-xs text-gray-500">
                                            {item.remarks}
                                          </div>
                                        )}
                                      </div>
                                      <div className="font-semibold text-gray-900">
                                        ₹{Number(item.feeAmount || 0).toLocaleString("en-IN")}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-600">No examination fee structures found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add Fee Structure" to create one.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey="examinationFees"
          initialData={editingFee}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingFee(null);
          }}
        />
      )}
    </div>
  );
};

export default ExaminationFees;
