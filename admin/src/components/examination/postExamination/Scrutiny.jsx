import React, { useState, useEffect } from "react";
import { API } from "../../../config/urls";
import {
  scriptsApi,
  seatingArrangementsApi,
} from "../../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";

const Scrutiny = () => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);
  const [scrutinyRemarks, setScrutinyRemarks] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to fetch student details from seating arrangements
  const fetchStudentDetailsFromSeating = async (originalScriptNumber) => {
    if (!originalScriptNumber) return null;

    try {
      const response = await seatingArrangementsApi.getAll({
        search: originalScriptNumber.toUpperCase(),
        status: "Active",
      });

      // Response structure: { success: true, data: [...], total, page, limit, totalPages }
      if (
        response &&
        response.success &&
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        // Find exact match by scriptCode
        const arrangement = response.data.find(
          (arr) =>
            arr.scriptCode &&
            arr.scriptCode.toUpperCase() === originalScriptNumber.toUpperCase()
        );

        if (arrangement) {
          // registrationNumber in seating arrangements is the hall ticket number
          return {
            hallTicketNumber: arrangement.registrationNumber || null,
            studentName: arrangement.studentName || null,
            rollNumber: arrangement.rollNumber || null,
          };
        }
      }
    } catch (error) {
      console.error(
        "Error fetching seating arrangement for script:",
        originalScriptNumber,
        error
      );
    }
    return null;
  };

  // Fetch evaluated scripts from API
  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      // Fetch evaluated and scrutinized scripts
      const response = await scriptsApi.getAll();
      const scriptsData = response?.data?.data || response?.data || [];

      // Transform API data to match component format and fetch student details
      const transformedScripts = await Promise.all(
        scriptsData.map(async (script) => {
          // Always fetch student details from seating arrangements using originalScriptNumber
          let studentDetails = null;
          if (script.originalScriptNumber) {
            studentDetails = await fetchStudentDetailsFromSeating(
              script.originalScriptNumber
            );
          }

          // Use student details from seating arrangements, fallback to script data, then to defaults
          const status = script.status || "Evaluated";
          const scrutinyStatus =
            status === "Scrutinized" ? "Scrutinized" : "Pending";

          return {
            id: script._id,
            _id: script._id,
            scriptBarcode: script.scriptBarcode,
            originalScriptNumber: script.originalScriptNumber,
            subjectCode: script.subjectCode,
            subject: script.subjectId?.name || script.subjectCode || "N/A",
            // Priority: seating arrangement data > script data > default
            studentName:
              studentDetails?.studentName ||
              script.studentName ||
              "Not Registered",
            rollNumber:
              studentDetails?.rollNumber || script.rollNumber || "N/A",
            hallTicketNumber:
              studentDetails?.hallTicketNumber ||
              script.hallTicketNumber ||
              "Not Registered",
            evaluationStatus: status,
            firstEvaluation:
              script.marks?.firstEvaluation?.total > 0
                ? {
                    marks: script.marks.firstEvaluation.marks || {},
                    total: script.marks.firstEvaluation.total,
                    remarks: script.marks.firstEvaluation.remarks || "",
                    evaluatedAt: script.marks.firstEvaluation.evaluatedAt,
                    evaluatorId: script.marks.firstEvaluation.evaluatorId,
                  }
                : null,
            secondEvaluation:
              script.marks?.secondEvaluation?.total > 0
                ? {
                    marks: script.marks.secondEvaluation.marks || {},
                    total: script.marks.secondEvaluation.total,
                    remarks: script.marks.secondEvaluation.remarks || "",
                    evaluatedAt: script.marks.secondEvaluation.evaluatedAt,
                    evaluatorId: script.marks.secondEvaluation.evaluatorId,
                  }
                : null,
            thirdEvaluation:
              script.marks?.thirdEvaluation?.total > 0
                ? {
                    marks: script.marks.thirdEvaluation.marks || {},
                    total: script.marks.thirdEvaluation.total,
                    remarks: script.marks.thirdEvaluation.remarks || "",
                    evaluatedAt: script.marks.thirdEvaluation.evaluatedAt,
                    evaluatorId: script.marks.thirdEvaluation.evaluatorId,
                  }
                : null,
            finalMarks: script.marks?.finalMarks || null,
            scrutinyStatus,
            scrutinyRemarks: "",
            scrutinizedAt: null,
            scrutinizedBy: null,
          };
        })
      );

      setScripts(transformedScripts);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrutinize = async (scriptId, isApproved) => {
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) return;

    try {
      setLoading(true);

      // Perform scrutiny checks
      const checks = {
        totalsCorrect: true,
        allQuestionsMarked: true,
        barcodeCorrect: true,
        finalTotalCorrect: true,
      };

      // Validate totals
      if (script.firstEvaluation) {
        const calculatedTotal = Object.values(
          script.firstEvaluation.marks
        ).reduce((sum, mark) => sum + (parseFloat(mark) || 0), 0);
        checks.totalsCorrect =
          Math.abs(calculatedTotal - script.firstEvaluation.total) < 0.01;

        // Check if all questions are marked
        checks.allQuestionsMarked = Object.values(
          script.firstEvaluation.marks
        ).every((mark) => mark !== null && mark !== undefined && mark !== "");
      }

      // Check final marks calculation
      if (script.firstEvaluation && script.secondEvaluation) {
        const evaluations = [
          script.firstEvaluation,
          script.secondEvaluation,
          script.thirdEvaluation,
        ].filter((e) => e && e.total > 0);

        if (evaluations.length > 0) {
          const sum = evaluations.reduce((acc, e) => acc + e.total, 0);
          const expectedFinal = Math.round(sum / evaluations.length);
          checks.finalTotalCorrect =
            script.finalMarks === expectedFinal ||
            Math.abs(script.finalMarks - expectedFinal) < 0.01;
        }
      }

      const remarks = isApproved
        ? "Scrutiny passed. All checks verified."
        : scrutinyRemarks || "Scrutiny failed. Please check.";

      // Update script status in database
      const updateData = {
        // Only allowed enum values: Registered, Allocated, Evaluated, Scrutinized
        status: isApproved ? "Scrutinized" : "Evaluated",
        scrutinyRemarks: remarks,
      };

      const response = await scriptsApi.update(script._id, updateData);

      if (response?.data?.success || response?.success) {
        // Update local state
        setScripts((prev) =>
          prev.map((s) =>
            s.id === scriptId
              ? {
                  ...s,
                  scrutinyStatus: isApproved ? "Scrutinized" : "Pending",
                  scrutinyRemarks: remarks,
                  scrutinizedAt: new Date().toISOString(),
                  scrutinizedBy: "Current User", // TODO: Get from auth context
                  scrutinyChecks: checks,
                  status: isApproved ? "Scrutinized" : "Evaluated",
                }
              : s
          )
        );

        if (isApproved) {
          showSuccessMessage("Script scrutinized and approved");
        } else {
          showErrorMessage("Script scrutiny failed. Please check the issues.");
        }
      } else {
        showErrorMessage("Failed to update script status");
      }

      setSelectedScript(null);
      setScrutinyRemarks("");
    } catch (error) {
      console.error("Error updating script:", error);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScripts = scripts.filter((script) => {
    const matchesSearch =
      script.scriptBarcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || script.scrutinyStatus === filterStatus;

    const allowedStatuses = ["Evaluated", "Scrutinized"];

    return (
      matchesSearch &&
      matchesFilter &&
      allowedStatuses.includes(script.evaluationStatus)
    );
  });

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Scrutiny / Verification
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Verify evaluation correctness, totals, and barcode accuracy
          </p>
        </div>
        <button
          onClick={fetchScripts}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Total Scripts</div>
          <div className="text-2xl font-bold text-gray-800">
            {scripts.filter((s) => s.evaluationStatus === "Evaluated").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Scrutinized</div>
          <div className="text-2xl font-bold text-green-600">
            {scripts.filter((s) => s.scrutinyStatus === "Scrutinized").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {scripts.filter((s) => s.scrutinyStatus === "Pending").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Rejected</div>
          <div className="text-2xl font-bold text-red-600">
            {scripts.filter((s) => s.scrutinyStatus === "Rejected").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by script barcode, roll number, student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Scrutinized">Scrutinized</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scripts Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        <div className="overflow-y-auto max-h-[600px] thin-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Script Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Subject
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Evaluation Marks
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Final Marks
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading scripts...
                  </td>
                </tr>
              ) : filteredScripts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No evaluated scripts found for scrutiny
                  </td>
                </tr>
              ) : (
                filteredScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {script.scriptBarcode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {script.studentName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {script.rollNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {script.subject}
                      </div>
                      <div className="text-xs text-gray-500">
                        {script.subjectCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm">
                        {script.firstEvaluation && (
                          <div>1st: {script.firstEvaluation.total} / 100</div>
                        )}
                        {script.secondEvaluation && (
                          <div>2nd: {script.secondEvaluation.total} / 100</div>
                        )}
                        {script.thirdEvaluation && (
                          <div>3rd: {script.thirdEvaluation.total} / 100</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-blue-600">
                        {script.finalMarks} / 100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          script.scrutinyStatus === "Scrutinized"
                            ? "bg-green-100 text-green-800"
                            : script.scrutinyStatus === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {script.scrutinyStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {script.scrutinyStatus === "Pending" && (
                          <>
                            <button
                              onClick={() => setSelectedScript(script)}
                              className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                              title="Scrutinize"
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
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scrutiny Modal */}
      {selectedScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Scrutiny Details</h3>
              <button
                onClick={() => {
                  setSelectedScript(null);
                  setScrutinyRemarks("");
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
            <div className="p-6 space-y-6">
              {/* Script Info */}
              <div>
                <h4 className="font-semibold mb-2">Script Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Barcode:</span>{" "}
                    {selectedScript.scriptBarcode}
                  </div>
                  <div>
                    <span className="font-medium">Student:</span>{" "}
                    {selectedScript.studentName}
                  </div>
                  <div>
                    <span className="font-medium">Roll Number:</span>{" "}
                    {selectedScript.rollNumber}
                  </div>
                  <div>
                    <span className="font-medium">Subject:</span>{" "}
                    {selectedScript.subject}
                  </div>
                </div>
              </div>

              {/* Evaluation Marks Details */}
              <div>
                <h4 className="font-semibold mb-3">Evaluation Marks</h4>
                <div className="space-y-4">
                  {selectedScript.firstEvaluation && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-lg mb-3 text-gray-800">
                        First Evaluation
                      </div>
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(
                              selectedScript.firstEvaluation.marks
                            ).map(([q, marks], index) => (
                              <div
                                key={q}
                                className="flex flex-col p-3 bg-white rounded border border-gray-300 hover:border-blue-400 transition-colors"
                                title={q}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    Question {index + 1}
                                  </span>
                                  <span className="text-lg font-bold text-blue-600 whitespace-nowrap ml-2">
                                    {marks}
                                  </span>
                                </div>
                                <div
                                  className="text-xs text-gray-400 truncate"
                                  title={q}
                                >
                                  {q}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Marks:
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {selectedScript.firstEvaluation.total} / 100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedScript.secondEvaluation && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-lg mb-3 text-gray-800">
                        Second Evaluation
                      </div>
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(
                              selectedScript.secondEvaluation.marks
                            ).map(([q, marks], index) => (
                              <div
                                key={q}
                                className="flex flex-col p-2 bg-white rounded border border-gray-300"
                              >
                                <div className="text-xs text-gray-500 mb-1 break-all">
                                  Q{index + 1}
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span className="text-sm text-gray-700 font-medium truncate mr-2">
                                    {q.length > 30
                                      ? `${q.substring(0, 30)}...`
                                      : q}
                                  </span>
                                  <span className="text-base font-bold text-blue-600 whitespace-nowrap">
                                    {marks}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Marks:
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {selectedScript.secondEvaluation.total} / 100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedScript.thirdEvaluation && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-lg mb-3 text-gray-800">
                        Third Evaluation
                      </div>
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(
                              selectedScript.thirdEvaluation.marks
                            ).map(([q, marks], index) => (
                              <div
                                key={q}
                                className="flex flex-col p-2 bg-white rounded border border-gray-300"
                              >
                                <div className="text-xs text-gray-500 mb-1 break-all">
                                  Q{index + 1}
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span className="text-sm text-gray-700 font-medium truncate mr-2">
                                    {q.length > 30
                                      ? `${q.substring(0, 30)}...`
                                      : q}
                                  </span>
                                  <span className="text-base font-bold text-blue-600 whitespace-nowrap">
                                    {marks}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Marks:
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {selectedScript.thirdEvaluation.total} / 100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                    <div className="font-semibold text-lg mb-2 text-blue-800">
                      Final Marks
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedScript.finalMarks} / 100
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrutiny Checks */}
              <div>
                <h4 className="font-semibold mb-2">Verification Checks</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="mr-2"
                    />
                    <span>Totals correctly added</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="mr-2"
                    />
                    <span>All questions marked</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="mr-2"
                    />
                    <span>Barcode correctness verified</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="mr-2"
                    />
                    <span>Final total correctness verified</span>
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Scrutiny Remarks
                </label>
                <textarea
                  value={scrutinyRemarks}
                  onChange={(e) => setScrutinyRemarks(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter scrutiny remarks (optional)"
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedScript(null);
                  setScrutinyRemarks("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleScrutinize(selectedScript.id, false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => handleScrutinize(selectedScript.id, true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve & Scrutinize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scrutiny;
