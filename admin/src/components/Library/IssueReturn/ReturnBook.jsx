import React, { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Calendar,
  DollarSign,
  AlertCircle,
  User,
  Eye,
  CheckCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

const ReturnBook = () => {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    borrowerType: "",
    overdue: "",
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [fineAmount, setFineAmount] = useState(0);
  const [returningId, setReturningId] = useState(null);

  // Fine calculation rules (should come from FineRules config)
  const finePerDay = 5;
  const maxFine = 500;

  // Static data for issued books that can be returned
  const staticData = [
    {
      _id: "1",
      bookTitle: "Introduction to Computer Science",
      author: "John Smith",
      isbn: "978-0123456789",
      bookId: "LIB001",
      borrowerName: "Rajesh Kumar",
      borrowerId: "STU2024001",
      borrowerType: "student",
      borrowerEmail: "rajesh.kumar@student.aknu.edu",
      issueDate: "2024-01-15",
      dueDate: "2024-02-15",
      status: "issued",
      daysOverdue: 0,
      fineAmount: 0,
    },
    {
      _id: "2",
      bookTitle: "Data Structures and Algorithms",
      author: "Jane Doe",
      isbn: "978-0123456790",
      bookId: "LIB002",
      borrowerName: "Priya Sharma",
      borrowerId: "STU2024002",
      borrowerType: "student",
      borrowerEmail: "priya.sharma@student.aknu.edu",
      issueDate: "2024-01-10",
      dueDate: "2024-02-10",
      status: "overdue",
      daysOverdue: 5,
      fineAmount: 25,
    },
    {
      _id: "3",
      bookTitle: "The Art of Programming",
      author: "Robert Martin",
      isbn: "978-0123456791",
      bookId: "LIB003",
      borrowerName: "Dr. Anil Patel",
      borrowerId: "FAC2024001",
      borrowerType: "faculty",
      borrowerEmail: "anil.patel@aknu.edu",
      issueDate: "2024-01-20",
      dueDate: "2024-03-20",
      status: "issued",
      daysOverdue: 0,
      fineAmount: 0,
    },
    {
      _id: "4",
      bookTitle: "Machine Learning Fundamentals",
      author: "Andrew Ng",
      isbn: "978-0123456792",
      bookId: "LIB004",
      borrowerName: "Amit Singh",
      borrowerId: "STU2024003",
      borrowerType: "student",
      borrowerEmail: "amit.singh@student.aknu.edu",
      issueDate: "2024-01-05",
      dueDate: "2024-02-05",
      status: "overdue",
      daysOverdue: 10,
      fineAmount: 50,
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
          item.isbn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.bookId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Borrower type filter
    if (filters.borrowerType) {
      filtered = filtered.filter((item) => item.borrowerType === filters.borrowerType);
    }

    // Overdue filter
    if (filters.overdue === "overdue") {
      filtered = filtered.filter((item) => item.daysOverdue > 0);
    } else if (filters.overdue === "on_time") {
      filtered = filtered.filter((item) => item.daysOverdue <= 0);
    }

    return filtered;
  }, [issuedBooks, searchQuery, filters]);

  const returnStats = useMemo(() => {
    const total = issuedBooks.length;
    const overdue = issuedBooks.filter((item) => item.daysOverdue > 0).length;
    const onTime = issuedBooks.filter((item) => item.daysOverdue <= 0).length;
    const totalFine = issuedBooks.reduce((sum, item) => sum + (item.fineAmount || 0), 0);

    return { total, overdue, onTime, totalFine };
  }, [issuedBooks]);

  const calculateFine = (book, returnDateValue) => {
    const dueDate = new Date(book.dueDate);
    const returnDateObj = new Date(returnDateValue);
    const diffTime = returnDateObj - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const calculatedFine = diffDays * finePerDay;
      return Math.min(calculatedFine, maxFine);
    }
    return 0;
  };

  const handleReturnClick = (book) => {
    setSelectedBook(book);
    setReturnDate(new Date().toISOString().split("T")[0]);
    const fine = calculateFine(book, new Date().toISOString().split("T")[0]);
    setFineAmount(fine);
    setShowReturnModal(true);
  };

  const handleReturnDateChange = (e) => {
    const newReturnDate = e.target.value;
    setReturnDate(newReturnDate);
    if (selectedBook) {
      const fine = calculateFine(selectedBook, newReturnDate);
      setFineAmount(fine);
    }
  };

  const handleReturn = async () => {
    if (!selectedBook) {
      showErrorMessage("Please select a book to return");
      return;
    }

    setReturningId(selectedBook._id);
    try {
      // In real app, this would call API
      setIssuedBooks(issuedBooks.filter((item) => item._id !== selectedBook._id));

      showSuccessMessage(
        `Book returned successfully!${fineAmount > 0 ? ` Fine amount: ₹${fineAmount}` : ""}`
      );
      setShowReturnModal(false);
      setSelectedBook(null);
      setFineAmount(0);
    } catch (error) {
      showErrorMessage("Failed to return book. Please try again.");
    } finally {
      setReturningId(null);
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
            Return Book
          </h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Issued</p>
                <p className="text-2xl font-bold text-[#525b88]">{returnStats.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-[#525b88]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Time</p>
                <p className="text-2xl font-bold text-green-600">{returnStats.onTime}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{returnStats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fine</p>
                <p className="text-2xl font-bold text-orange-600">₹{returnStats.totalFine}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
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
                placeholder="Search by book title, borrower name, ID, ISBN, or Book ID..."
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
                <option value="on_time">On Time</option>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Days Overdue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Fine (₹)</th>
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
                  const isOverdue = item.daysOverdue > 0;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.bookTitle}</div>
                        <div className="text-xs text-gray-500">{item.author}</div>
                        <div className="text-xs text-gray-400 mt-1">ID: {item.bookId}</div>
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
                        {isOverdue ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {item.daysOverdue} days
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            On time
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {item.fineAmount > 0 ? (
                          <span className="font-semibold text-red-600">₹{item.fineAmount}</span>
                        ) : (
                          <span className="text-green-600">₹0</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status === "issued"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "overdue"
                              ? "bg-red-100 text-red-800"
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
                          <button
                            onClick={() => handleReturnClick(item)}
                            disabled={returningId === item._id}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                            title="Return Book"
                          >
                            <BookOpen className="w-5 h-5" />
                          </button>
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
              <h3 className="text-lg font-semibold text-white">Book Return Details</h3>
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
                  <label className="text-sm font-medium text-gray-700">Book ID:</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedBook.bookId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Borrower:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedBook.borrowerName} ({selectedBook.borrowerId})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Borrower Type:</label>
                  <p className="text-sm text-gray-900 mt-1 capitalize">{selectedBook.borrowerType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Issue Date:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedBook.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Due Date:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedBook.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Days Overdue:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedBook.daysOverdue > 0 ? `${selectedBook.daysOverdue} days` : "On time"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fine Amount:</label>
                  <p className="text-sm font-semibold text-red-600 mt-1">₹{selectedBook.fineAmount || 0}</p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleReturnClick(selectedBook);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors"
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Return Book
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Return Confirmation Modal */}
      {showReturnModal && selectedBook && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Return Book</h3>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedBook(null);
                  setFineAmount(0);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Book Details */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-3">Book Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Book Title:</span>
                    <p className="font-medium text-gray-900">{selectedBook.bookTitle}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Author:</span>
                    <p className="font-medium text-gray-900">{selectedBook.author}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Book ID:</span>
                    <p className="font-medium text-gray-900">{selectedBook.bookId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ISBN:</span>
                    <p className="font-medium text-gray-900">{selectedBook.isbn}</p>
                  </div>
                </div>
              </div>

              {/* Borrower Details */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-3">Borrower Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">{selectedBook.borrowerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <p className="font-medium text-gray-900">{selectedBook.borrowerId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Issue Date:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBook.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBook.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={handleReturnDateChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              {/* Fine Calculation */}
              {fineAmount > 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-800">Fine Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">₹{fineAmount}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Fine calculated: {Math.ceil((new Date(returnDate) - new Date(selectedBook.dueDate)) / (1000 * 60 * 60 * 24))} days × ₹{finePerDay}/day
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">No fine applicable</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">Book is being returned on or before due date.</p>
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedBook(null);
                  setFineAmount(0);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={returningId === selectedBook._id}
                className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors disabled:opacity-50"
              >
                {returningId === selectedBook._id ? (
                  "Processing..."
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Confirm Return
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ReturnBook;
