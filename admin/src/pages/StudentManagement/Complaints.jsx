import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Plus, Filter, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    studentName: "",
    studentId: "",
    complaintType: "",
    status: "",
    priority: "",
    date: "",
  });
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    complaintType: "",
    subject: "",
    description: "",
    status: "Under Review",
    priority: "Medium",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const today = new Date().toISOString().split("T")[0];
      setComplaints([
        {
          id: 1,
          studentName: "John Doe",
          studentId: "STU001",
          complaintType: "Academic",
          subject: "Grade Discrepancy",
          description: "I believe there is an error in my grade calculation for Data Structures exam. My marks don't match the answer sheet.",
          status: "Under Review",
          priority: "High",
          date: today,
        },
        {
          id: 2,
          studentName: "Jane Smith",
          studentId: "STU002",
          complaintType: "Infrastructure",
          subject: "Library Facilities",
          description: "The library computers are not working properly. Many systems are showing errors and need immediate attention.",
          status: "Resolved",
          priority: "Medium",
          date: today,
        },
        {
          id: 3,
          studentName: "Rajesh Kumar",
          studentId: "STU003",
          complaintType: "Academic",
          subject: "Assignment Submission Issue",
          description: "I submitted my assignment on time but it shows as not submitted in the portal. Please check and update.",
          status: "Under Review",
          priority: "High",
          date: today,
        },
        {
          id: 4,
          studentName: "Priya Sharma",
          studentId: "STU004",
          complaintType: "Infrastructure",
          subject: "Classroom AC Not Working",
          description: "The air conditioning in Room 205 is not working properly. It's very difficult to concentrate in the heat.",
          status: "Pending",
          priority: "Medium",
          date: today,
        },
        {
          id: 5,
          studentName: "Amit Patel",
          studentId: "STU005",
          complaintType: "Administrative",
          subject: "ID Card Issue",
          description: "I lost my student ID card last week. I have applied for a duplicate but haven't received it yet. It's been 2 weeks.",
          status: "Under Review",
          priority: "Low",
          date: today,
        },
        {
          id: 6,
          studentName: "Sneha Reddy",
          studentId: "STU006",
          complaintType: "Infrastructure",
          subject: "WiFi Connectivity",
          description: "The WiFi connection in the hostel is very poor. It keeps disconnecting and the speed is very slow.",
          status: "Resolved",
          priority: "High",
          date: today,
        },
        {
          id: 7,
          studentName: "Karan Singh",
          studentId: "STU007",
          complaintType: "Academic",
          subject: "Exam Hall Issue",
          description: "During the exam, there was a lot of noise from outside which disturbed our concentration. Please ensure better exam environment.",
          status: "Under Review",
          priority: "High",
          date: today,
        },
        {
          id: 8,
          studentName: "Anjali Verma",
          studentId: "STU008",
          complaintType: "Infrastructure",
          subject: "Laboratory Equipment",
          description: "Many equipment in Chemistry Lab are outdated and not functioning properly. We need updated equipment for practical sessions.",
          status: "Pending",
          priority: "Medium",
          date: today,
        },
        {
          id: 9,
          studentName: "Vikram Mehta",
          studentId: "STU009",
          complaintType: "Administrative",
          subject: "Fee Receipt Not Received",
          description: "I paid my fees online 3 weeks ago but haven't received the receipt yet. Please issue the receipt.",
          status: "Resolved",
          priority: "Medium",
          date: today,
        },
        {
          id: 10,
          studentName: "Deepika Nair",
          studentId: "STU010",
          complaintType: "Academic",
          subject: "Course Material Not Available",
          description: "The course material for Advanced Algorithms is not available in the library. Please arrange for the required books.",
          status: "Under Review",
          priority: "Low",
          date: today,
        },
        {
          id: 11,
          studentName: "Rahul Gupta",
          studentId: "STU011",
          complaintType: "Infrastructure",
          subject: "Parking Space Issue",
          description: "There is insufficient parking space for students. Many students have to park outside which is unsafe.",
          status: "Pending",
          priority: "Medium",
          date: today,
        },
        {
          id: 12,
          studentName: "Meera Joshi",
          studentId: "STU012",
          complaintType: "Other",
          subject: "Canteen Food Quality",
          description: "The food quality in the canteen has deteriorated. Many students are facing health issues. Please improve the food quality.",
          status: "Under Review",
          priority: "High",
          date: today,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleEdit = (complaint) => {
    setEditingComplaint(complaint);
    setFormData(complaint);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      setComplaints(complaints.filter((item) => item.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingComplaint) {
      setComplaints(
        complaints.map((item) =>
          item.id === editingComplaint.id ? { ...formData, id: editingComplaint.id } : item
        )
      );
    } else {
      const newComplaint = { ...formData, id: Date.now() };
      setComplaints([...complaints, newComplaint]);
    }
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingComplaint(null);
    setFormData({
      studentName: "",
      studentId: "",
      complaintType: "",
      subject: "",
      description: "",
      status: "Under Review",
      priority: "Medium",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Calculate statistics
  const stats = {
    total: complaints.length,
    underReview: complaints.filter((c) => c.status === "Under Review").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
    pending: complaints.filter((c) => c.status === "Pending").length,
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    return (
      (searchFilters.studentName === "" ||
        complaint.studentName
          ?.toLowerCase()
          .includes(searchFilters.studentName.toLowerCase())) &&
      (searchFilters.studentId === "" ||
        complaint.studentId
          ?.toLowerCase()
          .includes(searchFilters.studentId.toLowerCase())) &&
      (searchFilters.complaintType === "" ||
        complaint.complaintType === searchFilters.complaintType) &&
      (searchFilters.status === "" || complaint.status === searchFilters.status) &&
      (searchFilters.priority === "" || complaint.priority === searchFilters.priority) &&
      (searchFilters.date === "" || complaint.date === searchFilters.date)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">Student Complaints</h1>
          <p className="text-gray-600 mt-1">Manage and resolve student complaints</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#525B88] text-white px-4 py-2 rounded-md hover:bg-[#3a4166] transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Complaint
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-[#525b88]">{stats.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.underReview}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
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
          <select
            name="complaintType"
            value={searchFilters.complaintType}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, complaintType: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">All Types</option>
            <option value="Academic">Academic</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Administrative">Administrative</option>
            <option value="Other">Other</option>
          </select>
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
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <select
            name="priority"
            value={searchFilters.priority}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, priority: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
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
                {editingComplaint ? "Edit Complaint" : "Add Complaint"}
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
                    Complaint Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="complaintType"
                    value={formData.complaintType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                  >
                    <option value="">Select Type</option>
                    <option value="Academic">Academic</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                    placeholder="Enter subject"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                    placeholder="Enter description"
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
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
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
                  {editingComplaint ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">Complaints List</h2>
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {complaint.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complaint.studentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complaint.complaintType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complaint.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {complaint.description}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            complaint.priority === "High"
                              ? "bg-red-100 text-red-800"
                              : complaint.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            complaint.status === "Resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complaint.date}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(complaint)}
                          className="text-[#525b88] hover:text-[#3a4166]"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(complaint.id)}
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
                      No complaints found
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

export default Complaints;
