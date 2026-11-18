import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const PracticalsSubmission = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSubmissions([
        {
          id: 1,
          studentName: "John Doe",
          studentId: "STU001",
          course: "Computer Science",
          subject: "Data Structures Lab",
          practicalTitle: "Binary Tree Implementation",
          submissionDate: "2025-01-15",
          dueDate: "2025-01-20",
          status: "Submitted",
          marks: "-",
        },
        {
          id: 2,
          studentName: "Jane Smith",
          studentId: "STU002",
          course: "Computer Science",
          subject: "Database Lab",
          practicalTitle: "SQL Queries",
          submissionDate: "2025-01-10",
          dueDate: "2025-01-15",
          status: "Evaluated",
          marks: "18/20",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleEdit = (submission) => {
    console.log("Edit submission:", submission);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this submission record?")) {
      setSubmissions(submissions.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Practicals Submission</h1>
        <p className="text-gray-600 mt-1">Manage student practical assignments and submissions</p>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">Submission Records</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Practical Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {submission.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.studentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.course}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.practicalTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.submissionDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.dueDate}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submission.status === "Evaluated"
                              ? "bg-green-100 text-green-800"
                              : submission.status === "Submitted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.marks}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(submission)}
                          className="text-[#525b88] hover:text-[#3a4166]"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      No submission records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticalsSubmission;

