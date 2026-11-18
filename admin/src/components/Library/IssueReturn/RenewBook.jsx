import React, { useEffect, useState, useMemo } from "react";
import {
  RotateCw,
  Search,
  Calendar,
  AlertCircle,
  BookOpen,
  User,
  Clock,
  Eye,
  Filter,
} from "lucide-react";
import { createPortal } from "react-dom";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

const RenewBook = () => {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    borrowerType: "",
    status: "",
    overdue: "",
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [renewingId, setRenewingId] = useState(null);

  // Static data for issued books that can be renewed
  const staticData = [
    {
      _id: "1",
      bookTitle: "Introduction to Computer Science",
      author: "John Smith",
      isbn: "978-0123456789",
      borrowerName: "Rajesh Kumar",
      borrowerId: "STU2024001",
      borrowerType: "student",
      issueDate: "2024-01-15",
      dueDate: "2024-02-15",
      renewals: 0,
      maxRenewals: 2,
      status: "issued",
      daysRemaining: 5,
    },
    {
      _id: "2",
      bookTitle: "Data Structures and Algorithms",
      author: "Jane Doe",
      isbn: "978-0123456790",
      borrowerName: "Priya Sharma",
      borrowerId: "STU2024002",
      borrowerType: "student",
      issueDate: "2024-01-10",
      dueDate: "2024-02-10",
      renewals: 1,
      maxRenewals: 2,
      status: "issued",
      daysRemaining: 0,
    },
    {
      _id: "3",
      bookTitle: "The Art of Programming",
      author: "Robert Martin",
      isbn: "978-0123456791",
      borrowerName: "Dr. Anil Patel",
      borrowerId: "FAC2024001",
      borrowerType: "faculty",
      issueDate: "2024-01-20",
      dueDate: "2024-03-20",
      renewals: 0,
      maxRenewals: 3,
      status: "issued",
      daysRemaining: 45,
    },
    {
      _id: "4",
      bookTitle: "Machine Learning Fundamentals",
      author: "Andrew Ng",
      isbn: "978-0123456792",
      borrowerName: "Amit Singh",
      borrowerId: "STU2024003",
      borrowerType: "student",
      issueDate: "2024-01-18",
      dueDate: "2024-02-18",
      renewals: 2,
      maxRenewals: 2,
      status: "issued",
      daysRemaining: 3,
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setIssuedBooks(staticData);
      setLoading(false);
    }, 500);
  }, []);

  const filteredBooks = useMemo(() => {
    let filtered = [...issuedBooks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.borrowerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.borrowerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Borrower type filter
    if (filters.borrowerType) {
      filtered = filtered.filter((item) => item.borrowerType === filters.borrowerType);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Overdue filter
    if (filters.overdue === "overdue") {
      filtered = filtered.filter((item) => item.daysRemaining < 0);
    } else if (filters.overdue === "due_soon") {
      filtered = filtered.filter((item) => item.daysRemaining >= 0 && item.daysRemaining <= 3);
    }

    return filtered;
  }, [issuedBooks, searchQuery, filters]);

  const renewStats = useMemo(() => {
    const total = issuedBooks.length;
    const canRenew = issuedBooks.filter((item) => item.renewals < item.maxRenewals).length;
    const cannotRenew = issuedBooks.filter((item) => item.renewals >= item.maxRenewals).length;
    const overdue = issuedBooks.filter((item) => item.daysRemaining < 0).length;

    return { total, canRenew, cannotRenew, overdue };
  }, [issuedBooks]);

  const calculateNewDueDate = (book) => {
    const currentDueDate = new Date(book.dueDate);
    const extensionDays = book.borrowerType === "student" ? 14 : 30;
    currentDueDate.setDate(currentDueDate.getDate() + extensionDays);
    return currentDueDate.toISOString().split("T")[0];
  };

  const handleRenew = async (book) => {
    if (book.renewals >= book.maxRenewals) {
      showErrorMessage(`Maximum renewals (${book.maxRenewals}) reached for this book`);
      return;
    }

    setRenewingId(book._id);
    try {
      // In real app, this would call API
      const newDueDate = calculateNewDueDate(book);
      
      setIssuedBooks(
        issuedBooks.map((item) =>
          item._id === book._id
            ? {
                ...item,
                renewals: item.renewals + 1,
                dueDate: newDueDate,
                status: "renewed",
                daysRemaining: Math.ceil(
                  (new Date(newDueDate) - new Date()) / (1000 * 60 * 60 * 24)
                ),
              }
            : item
        )
      );

      showSuccessMessage(
        `Book renewed successfully! New due date: ${new Date(newDueDate).toLocaleDateString()}`
      );
    } catch (error) {
      showErrorMessage("Failed to renew book. Please try again.");
    } finally {
      setRenewingId(null);
    }
  };

  const handleView = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading books...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Renew Book
          </h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Issued</p>
                <p className="text-2xl font-bold text-[#525b88]">{renewStats.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-[#525b88]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Can Renew</p>
                <p className="text-2xl font-bold text-green-600">{renewStats.canRenew}</p>
              </div>
              <RotateCw className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Max Renewals</p>
                <p className="text-2xl font-bold text-orange-600">{renewStats.cannotRenew}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{renewStats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by book title, borrower name, ID, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filters.borrowerType}
                onChange={(e) => setFilters({ ...filters, borrowerType: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              >
                <option value="">All Types</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
              </select>

              <select
                value={filters.overdue}
                onChange={(e) => setFilters({ ...filters, overdue: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              >
                <option value="">All Books</option>
                <option value="overdue">Overdue</option>
                <option value="due_soon">Due Soon (≤3 days)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Book Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Borrower</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Renewals</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Days Remaining</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No books found
                  </td>
                </tr>
              ) : (
                filteredBooks.map((item) => {
                  const canRenew = item.renewals < item.maxRenewals;
                  const isOverdue = item.daysRemaining < 0;
                  const newDueDate = canRenew ? calculateNewDueDate(item) : null;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.bookTitle}</div>
                        <div className="text-xs text-gray-500">{item.author}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{item.borrowerName}</div>
                        <div className="text-xs text-gray-500">{item.borrowerId}</div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                            item.borrowerType === "student"
                              ? "bg-blue-100 text-blue-800"
                              : item.borrowerType === "faculty"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.borrowerType}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            canRenew ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.renewals}/{item.maxRenewals}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isOverdue
                              ? "bg-red-100 text-red-800"
                              : item.daysRemaining <= 3
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isOverdue ? `${Math.abs(item.daysRemaining)} days overdue` : `${item.daysRemaining} days`}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status === "issued"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "renewed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {canRenew ? (
                            <button
                              onClick={() => handleRenew(item)}
                              disabled={renewingId === item._id}
                              className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Renew Book"
                            >
                              <RotateCw className="w-5 h-5" />
                            </button>
                          ) : (
                            <span
                              className="text-gray-400 p-1.5 rounded cursor-not-allowed"
                              title="Maximum renewals reached"
                            >
                              <RotateCw className="w-5 h-5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedBook && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Book Renewal Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Book Title:</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedBook.bookTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Author:</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedBook.author}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ISBN:</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedBook.isbn}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Borrower:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedBook.borrowerName} ({selectedBook.borrowerId})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Issue Date:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedBook.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Due Date:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedBook.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Renewals:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedBook.renewals}/{selectedBook.maxRenewals}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Days Remaining:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedBook.daysRemaining < 0
                      ? `${Math.abs(selectedBook.daysRemaining)} days overdue`
                      : `${selectedBook.daysRemaining} days`}
                  </p>
                </div>
                {selectedBook.renewals < selectedBook.maxRenewals && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">New Due Date (if renewed):</label>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      {new Date(calculateNewDueDate(selectedBook)).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {selectedBook.renewals >= selectedBook.maxRenewals && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Maximum renewals reached</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">This book cannot be renewed further.</p>
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedBook.renewals < selectedBook.maxRenewals && (
                <button
                  onClick={() => {
                    handleRenew(selectedBook);
                    setShowViewModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors"
                >
                  <RotateCw className="w-4 h-4 inline mr-2" />
                  Renew Book
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default RenewBook;
