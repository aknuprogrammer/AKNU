import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Plus, Filter, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    studentName: "",
    studentId: "",
    inquiryType: "",
    status: "",
    date: "",
  });
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    inquiryType: "",
    subject: "",
    message: "",
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
  });

  // Sample data - replace with actual API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const today = new Date().toISOString().split("T")[0];
      setInquiries([
        {
          id: 1,
          studentName: "John Doe",
          studentId: "STU001",
          inquiryType: "Admission",
          subject: "Course Information",
          message: "I would like to know about the admission process for Computer Science program. What are the eligibility criteria?",
          status: "Pending",
          date: today,
        },
        {
          id: 2,
          studentName: "Jane Smith",
          studentId: "STU002",
          inquiryType: "Fee",
          subject: "Fee Structure",
          message: "Can you provide details about fee payment schedule and available payment methods?",
          status: "Resolved",
          date: today,
        },
        {
          id: 3,
          studentName: "Rajesh Kumar",
          studentId: "STU003",
          inquiryType: "Course",
          subject: "Syllabus Details",
          message: "I need information about the Mathematics course syllabus for the upcoming semester.",
          status: "Pending",
          date: today,
        },
        {
          id: 4,
          studentName: "Priya Sharma",
          studentId: "STU004",
          inquiryType: "Admission",
          subject: "Document Requirements",
          message: "What documents are required for admission? I have completed my 12th standard.",
          status: "Resolved",
          date: today,
        },
        {
          id: 5,
          studentName: "Amit Patel",
          studentId: "STU005",
          inquiryType: "Fee",
          subject: "Scholarship Information",
          message: "I would like to know about available scholarships and how to apply for them.",
          status: "Pending",
          date: today,
        },
        {
          id: 6,
          studentName: "Sneha Reddy",
          studentId: "STU006",
          inquiryType: "Course",
          subject: "Elective Subjects",
          message: "Can you provide a list of elective subjects available for Computer Science students?",
          status: "Resolved",
          date: today,
        },
        {
          id: 7,
          studentName: "Karan Singh",
          studentId: "STU007",
          inquiryType: "Other",
          subject: "Hostel Facilities",
          message: "I am interested in hostel accommodation. Please provide details about hostel facilities and fees.",
          status: "Pending",
          date: today,
        },
        {
          id: 8,
          studentName: "Anjali Verma",
          studentId: "STU008",
          inquiryType: "Admission",
          subject: "Entrance Exam",
          message: "When is the next entrance exam scheduled? What is the application deadline?",
          status: "Resolved",
          date: today,
        },
        {
          id: 9,
          studentName: "Vikram Mehta",
          studentId: "STU009",
          inquiryType: "Fee",
          subject: "Installment Plan",
          message: "Is there an option to pay fees in installments? What are the terms and conditions?",
          status: "Pending",
          date: today,
        },
        {
          id: 10,
          studentName: "Deepika Nair",
          studentId: "STU010",
          inquiryType: "Course",
          subject: "Internship Opportunities",
          message: "What internship opportunities are available for students? How can I apply?",
          status: "Resolved",
          date: today,
        },
        {
          id: 11,
          studentName: "Rahul Gupta",
          studentId: "STU011",
          inquiryType: "Other",
          subject: "Library Membership",
          message: "I want to know about library membership for external students. What are the charges?",
          status: "Pending",
          date: today,
        },
        {
          id: 12,
          studentName: "Meera Joshi",
          studentId: "STU012",
          inquiryType: "Admission",
          subject: "Transfer Certificate",
          message: "I need to submit my transfer certificate. What is the procedure and deadline?",
          status: "Resolved",
          date: today,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleEdit = (inquiry) => {
    setEditingInquiry(inquiry);
    setFormData(inquiry);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      setInquiries(inquiries.filter((item) => item.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingInquiry) {
      setInquiries(
        inquiries.map((item) =>
          item.id === editingInquiry.id ? { ...formData, id: editingInquiry.id } : item
        )
      );
    } else {
      const newInquiry = {
        ...formData,
        id: Date.now(),
      };
      setInquiries([...inquiries, newInquiry]);
    }
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInquiry(null);
    setFormData({
      studentName: "",
      studentId: "",
      inquiryType: "",
      subject: "",
      message: "",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Calculate statistics
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "Pending").length,
    resolved: inquiries.filter((i) => i.status === "Resolved").length,
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inquiry) => {
    return (
      (searchFilters.studentName === "" ||
        inquiry.studentName
          ?.toLowerCase()
          .includes(searchFilters.studentName.toLowerCase())) &&
      (searchFilters.studentId === "" ||
        inquiry.studentId
          ?.toLowerCase()
          .includes(searchFilters.studentId.toLowerCase())) &&
      (searchFilters.inquiryType === "" ||
        inquiry.inquiryType === searchFilters.inquiryType) &&
      (searchFilters.status === "" || inquiry.status === searchFilters.status) &&
      (searchFilters.date === "" || inquiry.date === searchFilters.date)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">Student Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage and respond to student inquiries</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#525B88] text-white px-4 py-2 rounded-md hover:bg-[#3a4166] transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Inquiry
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-[#525b88]">{stats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
            name="inquiryType"
            value={searchFilters.inquiryType}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, inquiryType: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">All Types</option>
            <option value="Admission">Admission</option>
            <option value="Fee">Fee</option>
            <option value="Course">Course</option>
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
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
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
                {editingInquiry ? "Edit Inquiry" : "Add Inquiry"}
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
                    Inquiry Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                  >
                    <option value="">Select Type</option>
                    <option value="Admission">Admission</option>
                    <option value="Fee">Fee</option>
                    <option value="Course">Course</option>
                    <option value="Other">Other</option>
                  </select>
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
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
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
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                    placeholder="Enter message"
                  />
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
                  {editingInquiry ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiries Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">Inquiries List</h2>
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
                    Inquiry Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Message
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
                {filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {inquiry.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {inquiry.studentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {inquiry.inquiryType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {inquiry.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {inquiry.message}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inquiry.status === "Resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {inquiry.date}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(inquiry)}
                          className="text-[#525b88] hover:text-[#3a4166]"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry.id)}
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
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No inquiries found
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

export default Inquiries;

