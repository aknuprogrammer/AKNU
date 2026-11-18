import React, { useState } from "react";

const Results = () => {
  const [results, setResults] = useState([
    {
      id: "R001",
      rollNumber: "AKNU2024001",
      studentName: "Rajesh Kumar",
      hallTicketNumber: "HT-2024-001",
      course: "B.Tech",
      semester: "4",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      internalMarks: 25,
      externalMarks: 87.5,
      totalMarks: 112.5,
      grade: "A",
      resultStatus: "PASS",
      published: true,
      publishedAt: "2024-01-20 10:00",
    },
    {
      id: "R002",
      rollNumber: "AKNU2024002",
      studentName: "Priya Sharma",
      hallTicketNumber: "HT-2024-002",
      course: "B.Tech",
      semester: "4",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      internalMarks: 28,
      externalMarks: 92,
      totalMarks: 120,
      grade: "O",
      resultStatus: "PASS",
      published: true,
      publishedAt: "2024-01-20 10:00",
    },
    {
      id: "R003",
      rollNumber: "AKNU2024003",
      studentName: "Amit Patel",
      hallTicketNumber: "HT-2024-003",
      course: "B.Tech",
      semester: "4",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      internalMarks: 20,
      externalMarks: 35,
      totalMarks: 55,
      grade: "F",
      resultStatus: "FAIL",
      published: false,
      publishedAt: null,
    },
  ]);

  const [syncStatus, setSyncStatus] = useState({
    lastSync: "2024-01-20 09:00",
    status: "synced",
    totalRecords: 150,
    syncedRecords: 145,
    failedRecords: 5,
  });

  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSync = async () => {
    setSyncStatus((prev) => ({ ...prev, status: "syncing" }));
    
    // Simulate API call
    setTimeout(() => {
      setSyncStatus({
        lastSync: new Date().toISOString(),
        status: "synced",
        totalRecords: 150,
        syncedRecords: 150,
        failedRecords: 0,
      });
      alert("Results synced successfully to University database!");
    }, 2000);
  };

  const handlePublish = () => {
    const unpublishedResults = results.filter((r) => !r.published);
    if (unpublishedResults.length === 0) {
      alert("All results are already published");
      return;
    }

    if (
      window.confirm(
        `Publish ${unpublishedResults.length} results? This will make them visible to students.`
      )
    ) {
      setResults((prev) =>
        prev.map((r) =>
          !r.published
            ? {
                ...r,
                published: true,
                publishedAt: new Date().toISOString(),
              }
            : r
        )
      );
      alert("Results published successfully!");
    }
  };

  const calculateSGPA = (studentResults) => {
    // Simplified SGPA calculation
    const gradePoints = {
      O: 10,
      A: 9,
      B: 8,
      C: 7,
      D: 6,
      F: 0,
    };

    const totalPoints = studentResults.reduce(
      (sum, r) => sum + (gradePoints[r.grade] || 0),
      0
    );
    return (totalPoints / studentResults.length).toFixed(2);
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.hallTicketNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = filterCourse === "all" || result.course === filterCourse;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && result.published) ||
      (filterStatus === "unpublished" && !result.published);
    const matchesResult =
      filterResult === "all" || result.resultStatus === filterResult;

    return matchesSearch && matchesCourse && matchesStatus && matchesResult;
  });

  const groupedByStudent = filteredResults.reduce((acc, result) => {
    if (!acc[result.rollNumber]) {
      acc[result.rollNumber] = [];
    }
    acc[result.rollNumber].push(result);
    return acc;
  }, {});

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Results Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            View, sync, and publish examination results
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncStatus.status === "syncing"}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {syncStatus.status === "syncing" ? "Syncing..." : "Sync to University DB"}
          </button>
          <button
            onClick={handlePublish}
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
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
            Publish Results
          </button>
        </div>
      </div>

      {/* Sync Status Card */}
      <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4">Sync Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Last Sync</div>
            <div className="text-lg font-medium">
              {new Date(syncStatus.lastSync).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-lg font-medium">
              <span
                className={`px-2 py-1 rounded text-sm ${
                  syncStatus.status === "synced"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {syncStatus.status === "synced" ? "Synced" : "Syncing..."}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Records</div>
            <div className="text-lg font-medium">{syncStatus.totalRecords}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Synced / Failed</div>
            <div className="text-lg font-medium">
              <span className="text-green-600">{syncStatus.syncedRecords}</span> /{" "}
              <span className="text-red-600">{syncStatus.failedRecords}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Total Results</div>
          <div className="text-2xl font-bold text-gray-800">{results.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Passed</div>
          <div className="text-2xl font-bold text-green-600">
            {results.filter((r) => r.resultStatus === "PASS").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600">
            {results.filter((r) => r.resultStatus === "FAIL").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Published</div>
          <div className="text-2xl font-bold text-blue-600">
            {results.filter((r) => r.published).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by roll number, student name, hall ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-48">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="B.Tech">B.Tech</option>
              <option value="B.Com">B.Com</option>
              <option value="B.A">B.A</option>
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Results</option>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        <div className="overflow-y-auto max-h-[600px] thin-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Subject
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Internal
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  External
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Grade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Result
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No results found
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.studentName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.rollNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.hallTicketNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.subject}</div>
                      <div className="text-xs text-gray-500">
                        {result.subjectCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium">{result.internalMarks}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium">
                        {result.externalMarks}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-blue-600">
                        {result.totalMarks}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.grade === "O"
                            ? "bg-purple-100 text-purple-800"
                            : result.grade === "A"
                            ? "bg-green-100 text-green-800"
                            : result.grade === "F"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.resultStatus === "PASS"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.resultStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {result.published ? "Published" : "Unpublished"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Results;

