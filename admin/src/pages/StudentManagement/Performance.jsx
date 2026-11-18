import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const Performance = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPerformances([
        {
          id: 1,
          studentName: "John Doe",
          studentId: "STU001",
          course: "Computer Science",
          semester: "3rd Semester",
          overallPercentage: "85%",
          cgpa: "8.5",
          rank: "5",
          totalSubjects: 6,
          passedSubjects: 6,
          attendancePercentage: "88%",
          performanceGrade: "Excellent",
        },
        {
          id: 2,
          studentName: "Jane Smith",
          studentId: "STU002",
          course: "Mathematics",
          semester: "2nd Semester",
          overallPercentage: "92%",
          cgpa: "9.2",
          rank: "1",
          totalSubjects: 5,
          passedSubjects: 5,
          attendancePercentage: "95%",
          performanceGrade: "Outstanding",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleEdit = (performance) => {
    console.log("Edit performance:", performance);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this performance record?")) {
      setPerformances(performances.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Performance</h1>
        <p className="text-gray-600 mt-1">View and analyze student academic performance</p>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">Performance Records</h2>
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
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Overall %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    CGPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Attendance %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {performances.length > 0 ? (
                  performances.map((performance) => (
                    <tr
                      key={performance.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {performance.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {performance.studentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {performance.course}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {performance.semester}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {performance.overallPercentage}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {performance.cgpa}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {performance.rank}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {performance.passedSubjects}/{performance.totalSubjects}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {performance.attendancePercentage}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            performance.performanceGrade === "Outstanding"
                              ? "bg-green-100 text-green-800"
                              : performance.performanceGrade === "Excellent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {performance.performanceGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(performance)}
                          className="text-[#525b88] hover:text-[#3a4166]"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(performance.id)}
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
                    <td colSpan="11" className="px-6 py-8 text-center text-gray-500">
                      No performance records found
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

export default Performance;

