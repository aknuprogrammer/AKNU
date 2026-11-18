import React, { useState, useMemo, useEffect } from "react";
import { AlertCircle, Download, Calendar, Eye, Search, Filter } from "lucide-react";
import { createPortal } from "react-dom";
import { issuedBooksApi, libraryRulesApi, booksApi } from "../../../services/apiService";
import { showAxiosError, showSuccessMessage } from "../../../config/Toast";
import { exportToCSV, exportToExcel } from "../../../utils/exportUtils";

const OverdueBooksReport = () => {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    borrowerType: "",
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [libraryRulesMap, setLibraryRulesMap] = useState({}); // Map of libraryId -> rules

  // Fetch overdue books from API
  const fetchOverdueBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all issued books (not returned)
      const allIssuedBooks = await issuedBooksApi.getAll();
      
      // Filter to get only non-returned books
      const nonReturnedBooks = Array.isArray(allIssuedBooks) 
        ? allIssuedBooks.filter(book => book.status !== "returned")
        : [];
      
      // Filter to get only overdue books
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      
      const overdue = nonReturnedBooks.filter((book) => {
        if (book.status === "returned") return false;
        const dueDate = new Date(book.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      });
      
      // Fetch library rules for each unique library
      const libraryIds = new Set();
      overdue.forEach((book) => {
        // Handle both populated and non-populated book references
        if (book.book) {
          let library = null;
          if (typeof book.book === "object") {
            if (book.book.shelfLocation) {
              library = book.book.shelfLocation.library;
            }
          }
          if (library) {
            const libraryId = library._id || library;
            if (libraryId) {
              libraryIds.add(libraryId.toString());
            }
          }
        }
      });
      
      // Fetch rules for all libraries
      const rulesPromises = Array.from(libraryIds).map(async (libraryId) => {
        try {
          const rules = await libraryRulesApi.getActive({ library: libraryId });
          return { libraryId, rules };
        } catch (err) {
          console.error(`Error fetching rules for library ${libraryId}:`, err);
          return { libraryId, rules: null };
        }
      });
      
      const rulesResults = await Promise.all(rulesPromises);
      const rulesMap = {};
      rulesResults.forEach(({ libraryId, rules }) => {
        rulesMap[libraryId] = rules;
      });
      setLibraryRulesMap(rulesMap);
      
      // Calculate days overdue and fine for each book
      const overdueWithCalculations = overdue.map((book) => {
        const dueDate = new Date(book.dueDate);
        const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
        
        // Get library and rules
        let libraryId = null;
        if (book.book && typeof book.book === "object" && book.book.shelfLocation) {
          const library = book.book.shelfLocation.library;
          libraryId = library?._id || library;
        }
        
        const rules = libraryId ? rulesMap[libraryId] : null;
        
        // Calculate fine based on rules
        let calculatedFine = book.fineAmount || 0;
        if (rules && daysOverdue > 0) {
          const gracePeriod = rules.gracePeriod || 3;
          const daysAfterGrace = daysOverdue - gracePeriod;
          
          if (daysAfterGrace > 0) {
            const finePerDay = rules.finePerDay?.[book.borrowerType] || (book.borrowerType === "student" ? 5 : 2);
            let fine = daysAfterGrace * finePerDay;
            const fineCap = rules.fineCap || 500;
            if (fine > fineCap) {
              fine = fineCap;
            }
            calculatedFine = Math.round(fine * 100) / 100;
          } else {
            calculatedFine = 0;
          }
        }
        
        return {
          ...book,
          daysOverdue,
          calculatedFine,
        };
      });
      
      setOverdueBooks(overdueWithCalculations);
    } catch (err) {
      console.error("Error fetching overdue books:", err);
      setError(err.message || "Failed to fetch overdue books");
      showAxiosError(err);
      setOverdueBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueBooks();
  }, []);

  // Filter overdue books
  const filteredOverdueBooks = useMemo(() => {
    let filtered = [...overdueBooks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (typeof item.book === "object" && item.book?.bookTitle?.toLowerCase().includes(query)) ||
          item.borrowerName?.toLowerCase().includes(query) ||
          item.borrowerEmail?.toLowerCase().includes(query) ||
          (typeof item.book === "object" && item.book?.isbn?.toLowerCase().includes(query))
      );
    }

    // Borrower type filter
    if (filters.borrowerType) {
      filtered = filtered.filter((item) => item.borrowerType === filters.borrowerType);
    }

    return filtered;
  }, [overdueBooks, searchQuery, filters]);

  const totalFine = useMemo(() => {
    return filteredOverdueBooks.reduce((sum, book) => sum + (book.calculatedFine || book.fineAmount || 0), 0);
  }, [filteredOverdueBooks]);

  const handleView = async (id) => {
    try {
      const item = await issuedBooksApi.getById(id);
      setSelectedItem(item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching book details:", err);
      showAxiosError(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading overdue books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Overdue Books Report</h3>
        <button 
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          onClick={() => {
            if (filteredOverdueBooks.length === 0) {
              showAxiosError(new Error("No data to export"));
              return;
            }
            const columns = [
              { key: "book.bookTitle", label: "Book Title" },
              { key: "book.isbn", label: "ISBN" },
              { key: "borrowerName", label: "Borrower Name" },
              { key: "borrowerType", label: "Borrower Type", format: (val) => val === "student" ? "Student" : "Faculty" },
              { key: "dueDate", label: "Due Date", format: (val) => val ? new Date(val).toLocaleDateString() : "" },
              { key: "daysOverdue", label: "Days Overdue" },
              { key: "calculatedFine", label: "Fine Amount (₹)", format: (val) => (val || 0).toFixed(2) },
              { key: "borrowerEmail", label: "Borrower Email" },
              { key: "borrowerPhone", label: "Borrower Phone" },
            ];
            exportToCSV(filteredOverdueBooks, columns, "overdue_books_report");
            showSuccessMessage("Report exported successfully!");
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by book title, borrower name, ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filters.borrowerType}
            onChange={(e) => setFilters({ ...filters, borrowerType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">All Types</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Overdue</p>
              <p className="text-2xl font-bold text-red-600">{filteredOverdueBooks.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fine</p>
              <p className="text-2xl font-bold text-orange-600">₹{totalFine.toFixed(2)}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Days Overdue</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredOverdueBooks.length > 0
                  ? Math.round(
                      filteredOverdueBooks.reduce((sum, book) => sum + (book.daysOverdue || 0), 0) /
                        filteredOverdueBooks.length
                    )
                  : 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredOverdueBooks.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No overdue books found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Book Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Borrower</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Days Overdue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Fine (₹)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOverdueBooks.map((item) => {
                const bookTitle = typeof item.book === "object" && item.book ? item.book.bookTitle : item.bookTitle || "-";
                const isbn = typeof item.book === "object" && item.book ? item.book.isbn : item.isbn || "";
                const borrowerId = item.borrowerType === "student" 
                  ? (item.borrower?.hallTicketNo || item.borrower?.referenceNumber || "")
                  : (item.borrower?.professorId || "");
                
                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {bookTitle}
                      {isbn && <span className="text-xs text-gray-500 block">ISBN: {isbn}</span>}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.borrowerName}
                      {borrowerId && <span className="text-xs text-gray-500 block">({borrowerId})</span>}
                      <span className="text-xs text-gray-500 block">
                        {item.borrowerType === "student" ? "Student" : "Faculty"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {item.daysOverdue} days
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      ₹{(item.calculatedFine || item.fineAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleView(item._id)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedItem && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-red-600 to-red-500">
              <h3 className="text-lg font-semibold text-white">Overdue Book Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedItem(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Book Title */}
                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Book Title:
                    </label>
                    <p className="text-sm text-gray-900">
                      {typeof selectedItem.book === "object" && selectedItem.book
                        ? selectedItem.book.bookTitle
                        : selectedItem.bookTitle || "-"}
                      {typeof selectedItem.book === "object" && selectedItem.book && selectedItem.book.isbn && (
                        <span className="text-xs text-gray-500 block">ISBN: {selectedItem.book.isbn}</span>
                      )}
                    </p>
                  </div>

                  {/* Borrower Name */}
                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Borrower:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.borrowerName || "-"}</p>
                    <p className="text-xs text-gray-500">
                      {selectedItem.borrowerType === "student" ? "Student" : "Faculty"}
                    </p>
                  </div>

                  {/* Issue Date */}
                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Issue Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedItem.issueDate
                        ? new Date(selectedItem.issueDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  {/* Due Date */}
                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Due Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedItem.dueDate
                        ? new Date(selectedItem.dueDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  {/* Days Overdue */}
                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Days Overdue:
                    </label>
                    <p className="text-sm font-semibold text-red-600">
                      {selectedItem.daysOverdue || 0} days
                    </p>
                  </div>

                  {/* Fine Amount */}
                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Fine Amount:
                    </label>
                    <p className="text-sm font-semibold text-red-600">
                      ₹{(selectedItem.calculatedFine || selectedItem.fineAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Borrower Email */}
                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Borrower Email:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.borrowerEmail || "-"}</p>
                  </div>

                  {/* Borrower Phone */}
                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Borrower Phone:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.borrowerPhone || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default OverdueBooksReport;

