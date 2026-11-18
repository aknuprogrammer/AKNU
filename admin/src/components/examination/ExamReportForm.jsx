import React, { useState, useEffect } from "react";
import { API } from "../../config/urls";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import {
  subjectsApi,
  examinationCentersApi,
  invigilatorsApi,
  examReportsApi,
} from "../../services/apiService";

const ExamReportForm = () => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [examinationCenters, setExaminationCenters] = useState([]);
  const [invigilators, setInvigilators] = useState([]);
  const [reports, setReports] = useState([]);
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
    invigilatorId: "",
    invigilatorEmployeeId: "",
    incidentType: "",
    description: "",
  });

  useEffect(() => {
    fetchSubjects();
    fetchExaminationCenters();
    fetchInvigilators();
  }, []);

  useEffect(() => {
    fetchReports();
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

  const fetchReports = async () => {
    try {
      const data = await examReportsApi.getAll({});
      let reportsData = Array.isArray(data?.data) ? data.data : data || [];
      setReports(reportsData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching reports:", error);
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

    if (
      !formData.subjectId ||
      !formData.examinationCenterId ||
      !formData.rollNumber ||
      !formData.invigilatorId ||
      !formData.invigilatorEmployeeId ||
      !formData.description ||
      !formData.examDate
    ) {
      showErrorMessage("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const selectedSubject = subjects.find(
        (s) => s._id === formData.subjectId
      );
      const selectedCenter = examinationCenters.find(
        (c) => c._id === formData.examinationCenterId
      );
      const selectedInvigilator = invigilators.find(
        (inv) => inv._id === formData.invigilatorId
      );

      // Validate that required data exists
      if (!selectedSubject || !selectedSubject.code) {
        showErrorMessage("Invalid subject selected");
        setLoading(false);
        return;
      }

      if (!selectedCenter) {
        showErrorMessage("Invalid examination center selected");
        setLoading(false);
        return;
      }

      if (!selectedInvigilator || !selectedInvigilator.name) {
        showErrorMessage("Invalid invigilator selected");
        setLoading(false);
        return;
      }

      const reportData = {
        examDate: formData.examDate,
        subjectId: formData.subjectId,
        examinationCenterId: formData.examinationCenterId,
        incidentType: formData.incidentType ? formData.incidentType.trim() : "",
        rollNumber: formData.rollNumber.trim(),
        studentName: formData.studentName ? formData.studentName.trim() : "",
        invigilatorId: formData.invigilatorId,
        invigilatorEmployeeId: formData.invigilatorEmployeeId.trim(),
        description: formData.description.trim(),
      };

      console.log(
        "Submitting report data:",
        JSON.stringify(reportData, null, 2)
      );
      const response = await examReportsApi.create(reportData);

      if (response.success) {
        showSuccessMessage("Report submitted successfully");
        setFormData({
          examDate: new Date().toISOString().split("T")[0],
          subjectId: "",
          examinationCenterId: "",
          rollNumber: "",
          studentName: "",
          invigilatorId: "",
          invigilatorEmployeeId: "",
          incidentType: "",
          description: "",
        });
        setShowModal(false);
        fetchReports();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      let errorMessage = "Failed to submit report";

      // Try to get error from errorData (already parsed in apiService)
      if (error.errorData) {
        errorMessage =
          error.errorData.error ||
          error.errorData.message ||
          error.message ||
          errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Error details:", error.errorData || error.message);
      showErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search query
  const filteredReports = reports.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.reportNumber?.toLowerCase().includes(query) ||
      report.rollNumber?.toLowerCase().includes(query) ||
      report.studentName?.toLowerCase().includes(query) ||
      report.invigilatorName?.toLowerCase().includes(query) ||
      report.invigilatorEmployeeId?.toLowerCase().includes(query) ||
      report.examinationCenterName?.toLowerCase().includes(query) ||
      report.subjectName?.toLowerCase().includes(query) ||
      report.incidentType?.toLowerCase().includes(query) ||
      report.description?.toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetForm = () => {
    setFormData({
      examDate: new Date().toISOString().split("T")[0],
      subjectId: "",
      examinationCenterId: "",
      rollNumber: "",
      studentName: "",
      invigilatorId: "",
      invigilatorEmployeeId: "",
      incidentType: "",
      description: "",
    });
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Exam Reports</h3>
          <p className="text-sm text-gray-500 mt-1">
            Record and manage examination incident reports
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
          Add Report
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Incident Reports</h3>
            <input
              type="text"
              placeholder="Search by report number, roll number, student name..."
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
          {filteredReports.length > 0 ? (
            <>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Report No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Incident Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Invigilator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.reportNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.studentName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.rollNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.incidentType || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.invigilatorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.invigilatorEmployeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.examDate).toLocaleDateString()}
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
                      <span className="font-medium">{startIndex + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredReports.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredReports.length}
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
                  {reports.length === 0
                    ? "No reports found"
                    : searchQuery
                    ? "No reports match your search"
                    : "No reports found"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Add Report" to submit a new incident report
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-800">
                Submit Exam Report
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
                        setFormData({
                          ...formData,
                          examinationCenterId: e.target.value,
                        })
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
                      Incident Type
                    </label>
                    <input
                      type="text"
                      value={formData.incidentType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incidentType: e.target.value,
                        })
                      }
                      placeholder="Enter incident type"
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
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                          {invigilator.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
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
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the incident or report in detail..."
                      required
                    />
                  </div>
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
                    {loading ? "Submitting..." : "Submit Report"}
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

export default ExamReportForm;
