import { useState, useEffect } from "react";
import { Filter, Award, TrendingUp, CheckCircle, Users } from "lucide-react";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    studentName: "",
    studentId: "",
    course: "",
    semester: "",
    examType: "",
    grade: "",
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setResults([
        {
          id: 1,
          studentName: "John Doe",
          studentId: "STU001",
          course: "Computer Science",
          semester: "3rd Semester",
          subject: "Data Structures",
          examType: "Mid-Term",
          marksObtained: 85,
          totalMarks: 100,
          grade: "A",
          percentage: "85%",
        },
        {
          id: 2,
          studentName: "Jane Smith",
          studentId: "STU002",
          course: "Mathematics",
          semester: "2nd Semester",
          subject: "Calculus",
          examType: "Final",
          marksObtained: 92,
          totalMarks: 100,
          grade: "A+",
          percentage: "92%",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Calculate statistics
  const stats = {
    total: results.length,
    passed: results.filter((r) => {
      const percentage = parseFloat(r.percentage);
      return percentage >= 40;
    }).length,
    distinction: results.filter((r) => {
      const percentage = parseFloat(r.percentage);
      return percentage >= 75;
    }).length,
    average: results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) /
            results.length
        )
      : 0,
  };

  // Filter results
  const filteredResults = results.filter((result) => {
    return (
      (searchFilters.studentName === "" ||
        result.studentName
          ?.toLowerCase()
          .includes(searchFilters.studentName.toLowerCase())) &&
      (searchFilters.studentId === "" ||
        result.studentId
          ?.toLowerCase()
          .includes(searchFilters.studentId.toLowerCase())) &&
      (searchFilters.course === "" ||
        result.course
          ?.toLowerCase()
          .includes(searchFilters.course.toLowerCase())) &&
      (searchFilters.semester === "" ||
        result.semester === searchFilters.semester) &&
      (searchFilters.examType === "" ||
        result.examType === searchFilters.examType) &&
      (searchFilters.grade === "" || result.grade === searchFilters.grade)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#525B88]">Student Results</h1>
        <p className="text-gray-600 mt-1">View student examination results</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Results</p>
              <p className="text-2xl font-bold text-[#525b88]">{stats.total}</p>
            </div>
            <Award className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Distinction</p>
              <p className="text-2xl font-bold text-purple-600">{stats.distinction}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average %</p>
              <p className="text-2xl font-bold text-blue-600">{stats.average}%</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="flex flex-col md:flex-row md:items-center gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-6"
      >
        <div className="flex-1 min-w-[120px]">
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={searchFilters.studentName}
            onChange={(e) =>
              setSearchFilters({
                ...searchFilters,
                studentName: e.target.value,
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <input
            type="text"
            name="studentId"
            placeholder="Student ID"
            value={searchFilters.studentId}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, studentId: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <input
            type="text"
            name="course"
            placeholder="Course"
            value={searchFilters.course}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, course: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <input
            type="text"
            name="semester"
            placeholder="Semester"
            value={searchFilters.semester}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, semester: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <select
            name="examType"
            value={searchFilters.examType}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, examType: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">All Exam Types</option>
            <option value="Mid-Term">Mid-Term</option>
            <option value="Final">Final</option>
            <option value="Assignment">Assignment</option>
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <select
            name="grade"
            value={searchFilters.grade}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, grade: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">All Grades</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="F">F</option>
          </select>
        </div>
        <div>
          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">Results Records</h2>
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
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Exam Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <tr
                      key={result.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {result.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.studentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.course}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.semester}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.examType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.marksObtained}/{result.totalMarks}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.grade === "A+"
                              ? "bg-green-100 text-green-800"
                              : result.grade === "A"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.percentage}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No results found
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

export default Results;

