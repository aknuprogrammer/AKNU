import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Plus, Filter, ClipboardList, CheckCircle, XCircle, Clock } from "lucide-react";

const OnboardingExam = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    studentName: "",
    studentId: "",
    examName: "",
    status: "",
    date: "",
  });
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    examName: "",
    examDate: "",
    examTime: "",
    venue: "",
    status: "Scheduled",
    score: "-",
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const today = new Date().toISOString().split("T")[0];
      setExams([
        {
          id: 1,
          studentName: "John Doe",
          studentId: "STU001",
          examName: "Entrance Test",
          examDate: "2025-02-15",
          examTime: "10:00",
          venue: "Main Hall",
          status: "Scheduled",
          score: "-",
        },
        {
          id: 2,
          studentName: "Jane Smith",
          studentId: "STU002",
          examName: "Placement Test",
          examDate: "2025-01-20",
          examTime: "14:00",
          venue: "Lab 101",
          status: "Completed",
          score: "85/100",
        },
        {
          id: 3,
          studentName: "Rajesh Kumar",
          studentId: "STU003",
          examName: "Aptitude Test",
          examDate: "2025-02-20",
          examTime: "09:00",
          venue: "Auditorium",
          status: "Scheduled",
          score: "-",
        },
        {
          id: 4,
          studentName: "Priya Sharma",
          studentId: "STU004",
          examName: "English Proficiency Test",
          examDate: "2025-01-18",
          examTime: "11:00",
          venue: "Room 301",
          status: "Completed",
          score: "92/100",
        },
        {
          id: 5,
          studentName: "Amit Patel",
          studentId: "STU005",
          examName: "Technical Assessment",
          examDate: "2025-02-25",
          examTime: "10:00",
          venue: "Computer Lab 1",
          status: "Scheduled",
          score: "-",
        },
        {
          id: 6,
          studentName: "Sneha Reddy",
          studentId: "STU006",
          examName: "Mathematics Test",
          examDate: "2025-01-22",
          examTime: "14:00",
          venue: "Room 205",
          status: "Completed",
          score: "78/100",
        },
        {
          id: 7,
          studentName: "Karan Singh",
          studentId: "STU007",
          examName: "Entrance Test",
          examDate: "2025-02-15",
          examTime: "10:00",
          venue: "Main Hall",
          status: "Scheduled",
          score: "-",
        },
        {
          id: 8,
          studentName: "Anjali Verma",
          studentId: "STU008",
          examName: "Logical Reasoning Test",
          examDate: "2025-01-25",
          examTime: "15:00",
          venue: "Room 402",
          status: "Completed",
          score: "88/100",
        },
        {
          id: 9,
          studentName: "Vikram Mehta",
          studentId: "STU009",
          examName: "Placement Test",
          examDate: "2025-02-18",
          examTime: "13:00",
          venue: "Lab 102",
          status: "Scheduled",
          score: "-",
        },
        {
          id: 10,
          studentName: "Deepika Nair",
          studentId: "STU010",
          examName: "Aptitude Test",
          examDate: "2025-01-19",
          examTime: "09:00",
          venue: "Auditorium",
          status: "Completed",
          score: "95/100",
        },
        {
          id: 11,
          studentName: "Rahul Gupta",
          studentId: "STU011",
          examName: "Technical Assessment",
          examDate: "2025-02-22",
          examTime: "10:00",
          venue: "Computer Lab 2",
          status: "Scheduled",
          score: "-",
        },
        {
          id: 12,
          studentName: "Meera Joshi",
          studentId: "STU012",
          examName: "English Proficiency Test",
          examDate: "2025-01-21",
          examTime: "11:00",
          venue: "Room 301",
          status: "Cancelled",
          score: "-",
        },
        {
          id: 13,
          studentName: "Arjun Desai",
          studentId: "STU013",
          examName: "Mathematics Test",
          examDate: "2025-02-12",
          examTime: "14:00",
          venue: "Room 205",
          status: "Scheduled",
          score: "-",
        },
        {
          id: 14,
          studentName: "Kavita Rao",
          studentId: "STU014",
          examName: "Logical Reasoning Test",
          examDate: "2025-01-23",
          examTime: "15:00",
          venue: "Room 402",
          status: "Completed",
          score: "82/100",
        },
        {
          id: 15,
          studentName: "Suresh Iyer",
          studentId: "STU015",
          examName: "Entrance Test",
          examDate: "2025-02-15",
          examTime: "10:00",
          venue: "Main Hall",
          status: "Scheduled",
          score: "-",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData(exam);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this exam record?")) {
      setExams(exams.filter((item) => item.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExam) {
      setExams(
        exams.map((item) =>
          item.id === editingExam.id ? { ...formData, id: editingExam.id } : item
        )
      );
    } else {
      const newExam = { ...formData, id: Date.now() };
      setExams([...exams, newExam]);
    }
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExam(null);
    setFormData({
      studentName: "",
      studentId: "",
      examName: "",
      examDate: "",
      examTime: "",
      venue: "",
      status: "Scheduled",
      score: "-",
    });
  };

  // Calculate statistics
  const stats = {
    total: exams.length,
    scheduled: exams.filter((e) => e.status === "Scheduled").length,
    completed: exams.filter((e) => e.status === "Completed").length,
    cancelled: exams.filter((e) => e.status === "Cancelled").length,
  };

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    return (
      (searchFilters.studentName === "" ||
        exam.studentName
          ?.toLowerCase()
          .includes(searchFilters.studentName.toLowerCase())) &&
      (searchFilters.studentId === "" ||
        exam.studentId
          ?.toLowerCase()
          .includes(searchFilters.studentId.toLowerCase())) &&
      (searchFilters.examName === "" ||
        exam.examName
          ?.toLowerCase()
          .includes(searchFilters.examName.toLowerCase())) &&
      (searchFilters.status === "" || exam.status === searchFilters.status) &&
      (searchFilters.date === "" || exam.examDate === searchFilters.date)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">Onboarding Exams</h1>
          <p className="text-gray-600 mt-1">Manage student onboarding examination records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#525B88] text-white px-4 py-2 rounded-md hover:bg-[#3a4166] transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Exam
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-[#525b88]">{stats.total}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
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
            name="examName"
            placeholder="Exam Name"
            value={searchFilters.examName}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, examName: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <select
            name="status"
            value={searchFilters.status}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, status: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <input
            type="date"
            name="date"
            value={searchFilters.date}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, date: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                {editingExam ? "Edit Exam" : "Add Exam"}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
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

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                    placeholder="Enter student ID"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Exam Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="examName"
                    value={formData.examName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                    placeholder="Enter exam name"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Exam Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="examTime"
                    value={formData.examTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                    placeholder="Enter venue"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Score
                  </label>
                  <input
                    type="text"
                    name="score"
                    value={formData.score}
                    onChange={handleInputChange}
                    placeholder="e.g., 85/100"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-[#525B88]/20 bg-gradient-to-r from-[#525B88] to-[#3a4166] hover:from-[#3a4166] hover:to-[#2d3450] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
                >
                  {editingExam ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">Exam Records</h2>
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
                    Exam Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Exam Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Exam Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {exam.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.studentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.examName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.examDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.examTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.venue}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            exam.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : exam.status === "Scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.score}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="text-[#525b88] hover:text-[#3a4166]"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
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
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No exam records found
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

export default OnboardingExam;

