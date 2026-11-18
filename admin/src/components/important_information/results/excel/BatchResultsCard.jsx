// BatchResultsCard.jsx
import React from "react";

const BatchResultsCard = ({
  selectedBatch,
  batchResults,
  loading,
  handleCloseResults,
  toTitleCase,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#525B88]">
          Results for: {selectedBatch.title} ({selectedBatch.level}) -{" "}
          {selectedBatch.type === "rv"
            ? "RV"
            : selectedBatch.type === "rANDb"
            ? "Regular & Backlog"
            : "Regular"}
        </h2>
        <button
          onClick={handleCloseResults}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Back to Batches
        </button>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600">
            Date: {new Date(selectedBatch.resultDate).toLocaleDateString()}
          </p>
          <p className="text-gray-600">Total Students: {batchResults.length}</p>
        </div>
        <div>
          <p className="text-gray-600">Batch ID: {selectedBatch._id}</p>
          <p className="text-gray-600">
            Type:{" "}
            {selectedBatch.type === "rv"
              ? "RV"
              : selectedBatch.type === "rANDb"
              ? "Regular & Backlog"
              : "Regular"}
          </p>
        </div>
      </div>

      {/* Loader / Empty / Table */}
      {loading.results ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#525B88]"></div>
        </div>
      ) : batchResults.length === 0 ? (
        <p className="text-gray-500 py-4">No results found for this batch</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "SN",
                  "Reg No",
                  "Student",
                  "Course",
                  "Subject",
                  "Sem",
                  "Grade",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batchResults.map((result, index) => {
                console.log("Result CourseName:", result);

                let courseName = "N/A";
                try {
                  if (
                    typeof result.CourseName === "string" &&
                    result.CourseName.startsWith("{")
                  ) {
                    const courseObj = JSON.parse(
                      result.CourseName.replace(/^\[object Object\]$/, "{}")
                    );
                    courseName =
                      courseObj.name || courseObj.CourseName || "N/A";
                  } else if (typeof result.CourseName === "object") {
                    courseName =
                      result.CourseName?.name ||
                      result.CourseName?.courseName ||
                      "N/A";
                  } else if (
                    typeof result.CourseName === "string" &&
                    !result.CourseName.startsWith("{")
                  ) {
                    courseName = result.CourseName;
                  }
                } catch (e) {
                  console.error("Error parsing CourseName:", e);
                }

                return (
                  <tr key={result._id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {result.RegisterNumber || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {toTitleCase(result.StudentName) || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {courseName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium">
                        {toTitleCase(result.SubjectName) || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {result.Semester || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          result.Grade === "A+"
                            ? "bg-green-100 text-green-800"
                            : result.Grade === "F"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {toTitleCase(result.Grade) || "N/A"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BatchResultsCard;
