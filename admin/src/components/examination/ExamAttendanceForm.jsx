import React, { useState, useEffect } from "react";
import {
  showSuccessMessage,
  showErrorMessage,
} from "../../config/Toast";
import {
  subjectsApi,
  examinationCentersApi,
  invigilatorsApi,
  examAttendanceApi,
} from "../../services/apiService";

const ExamAttendanceForm = () => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [examinationCenters, setExaminationCenters] = useState([]);
  const [invigilators, setInvigilators] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    examDate: new Date().toISOString().split("T")[0],
    subjectId: "",
    examinationCenterId: "",
    rollNumber: "",
    studentName: "",
    attendanceStatus: "Present",
    invigilatorId: "",
    invigilatorEmployeeId: "",
  });

  useEffect(() => {
    fetchSubjects();
    fetchExaminationCenters();
    fetchInvigilators();
  }, []);


  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectsApi.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchExaminationCenters = async () => {
    try {
      const data = await examinationCentersApi.getAll();
      setExaminationCenters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching examination centers:", error);
    }
  };

  const fetchInvigilators = async () => {
    try {
      const data = await invigilatorsApi.getAll();
      setInvigilators(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching invigilators:", error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const data = await examAttendanceApi.getAll({});
      setAttendanceRecords(Array.isArray(data?.data) ? data.data : data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  const handleInvigilatorSelect = (invigilatorId) => {
    const invigilator = invigilators.find((inv) => inv._id === invigilatorId);
    setFormData({
      ...formData,
      invigilatorId: invigilatorId,
      invigilatorEmployeeId: invigilator?.employeeId || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subjectId || !formData.examinationCenterId || !formData.rollNumber || !formData.examDate) {
      showErrorMessage("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const selectedSubject = subjects.find((s) => s._id === formData.subjectId);
      const selectedCenter = examinationCenters.find((c) => c._id === formData.examinationCenterId);
      const selectedInvigilator = invigilators.find((inv) => inv._id === formData.invigilatorId);

      const attendanceData = {
        examinationCenterId: formData.examinationCenterId,
        examinationCenterName: selectedCenter?.name || "",
        examinationCenterCode: selectedCenter?.code || "",
        subjectId: formData.subjectId,
        subjectCode: selectedSubject?.code || "",
        subjectName: selectedSubject?.name || "",
        examDate: formData.examDate,
        semester: formData.semester,
        rollNumber: formData.rollNumber,
        studentName: formData.studentName,
        attendanceStatus: formData.attendanceStatus,
        invigilatorId: formData.invigilatorId,
        invigilatorName: selectedInvigilator?.name || "",
        invigilatorEmployeeId: formData.invigilatorEmployeeId,
        markedBy: localStorage.getItem("name") || "Admin",
      };

      const response = await examAttendanceApi.create(attendanceData);
      
      if (response.success) {
        showSuccessMessage("Attendance recorded successfully");
        setFormData({
          examDate: new Date().toISOString().split("T")[0],
          subjectId: "",
          examinationCenterId: "",
          semester: "",
          rollNumber: "",
          studentName: "",
          attendanceStatus: "Present",
          invigilatorId: "",
          invigilatorEmployeeId: "",
        });
        setShowModal(false);
        fetchAttendanceRecords();
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      showErrorMessage(
        error.response?.data?.message || "Failed to record attendance"
      );
    } finally {
      setLoading(false);
    }
  };


  // Filter records based on search query
  const filteredRecords = attendanceRecords.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.rollNumber?.toLowerCase().includes(query) ||
      record.studentName?.toLowerCase().includes(query) ||
      record.invigilatorName?.toLowerCase().includes(query) ||
      record.invigilatorEmployeeId?.toLowerCase().includes(query) ||
      record.examinationCenterName?.toLowerCase().includes(query) ||
      record.subjectName?.toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetForm = () => {
    setFormData({
      examDate: new Date().toISOString().split("T")[0],
      subjectId: "",
      examinationCenterId: "",
      semester: "",
      rollNumber: "",
      studentName: "",
      attendanceStatus: "Present",
      invigilatorId: "",
      invigilatorEmployeeId: "",
    });
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Exam Attendance
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Record and manage student attendance for examinations
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
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
              d="M12 6v12m6-6H6"
            />
          </svg>
          Add Attendance
        </button>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Attendance Records</h3>
            <input
              type="text"
              placeholder="Search by roll number, student name, invigilator..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm w-64"
            />
          </div>
        </div>

        <div className="p-6">
          {filteredRecords.length > 0 ? (
            <>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Invigilator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Exam Center
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.rollNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              record.attendanceStatus === "Present"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.attendanceStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.invigilatorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.invigilatorEmployeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.examinationCenterName || record.examinationCenterCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.examDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {startIndex + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredRecords.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredRecords.length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === page
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span
                                key={page}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600">
                  {attendanceRecords.length === 0
                    ? "No attendance records found"
                    : searchQuery
                    ? "No records match your search"
                    : "No attendance records found"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Add Attendance" to record attendance
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-800">
                Record Exam Attendance
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
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
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Date *
                    </label>
                    <input
                      type="date"
                      value={formData.examDate}
                      onChange={(e) =>
                        setFormData({ ...formData, examDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) =>
                        setFormData({ ...formData, subjectId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.code} - {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Examination Center *
                    </label>
                    <select
                      value={formData.examinationCenterId}
                      onChange={(e) =>
                        setFormData({ ...formData, examinationCenterId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Center</option>
                      {examinationCenters.map((center) => (
                        <option key={center._id} value={center._id}>
                          {center.code} - {center.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                      placeholder="e.g., 1, 2, 3..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, rollNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={(e) =>
                        setFormData({ ...formData, studentName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attendance Status *
                    </label>
                    <select
                      value={formData.attendanceStatus}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attendanceStatus: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invigilator *
                    </label>
                    <select
                      value={formData.invigilatorId}
                      onChange={(e) => handleInvigilatorSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Invigilator</option>
                      {invigilators.map((invigilator) => (
                        <option key={invigilator._id} value={invigilator._id}>
                          {invigilator.name} ({invigilator.invigilatorCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invigilator Employee ID *
                    </label>
                    <input
                      type="text"
                      value={formData.invigilatorEmployeeId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invigilatorEmployeeId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div> */}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Recording..." : "Record Attendance"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAttendanceForm;

