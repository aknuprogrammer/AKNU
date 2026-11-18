import React, { useEffect, useState, useMemo } from "react";
import {
  Filter,
  BookOpen,
  User,
  Calendar,
  Hash,
  Eye,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Plus,
  Download,
} from "lucide-react";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import { booksApi, professorsApi, studentsApi, issuedBooksApi } from "../../services/apiService";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import { exportToCSV } from "../../utils/exportUtils";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    bookTitle: "",
    borrowerName: "",
    borrowerId: "",
    borrowerType: "",
    status: "",
  });

  const handleChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row md:items-center gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4"
    >
      {/* Book Title */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="bookTitle"
          placeholder="Book Title"
          value={filters.bookTitle}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Borrower Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="borrowerName"
          placeholder="Borrower Name"
          value={filters.borrowerName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Borrower ID */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="borrowerId"
          placeholder="Borrower ID"
          value={filters.borrowerId}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Borrower Type */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="borrowerType"
          value={filters.borrowerType}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="faculty">Faculty</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Status</option>
          <option value="issued">Issued</option>
          <option value="overdue">Overdue</option>
          <option value="returned">Returned</option>
          <option value="renewed">Renewed</option>
        </select>
      </div>

      {/* Apply Filter Button */}
      <div>
        <button
          type="submit"
          className={`flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

const IssuedBooksTable = ({
  issuedBooks,
  onView,
  onEdit,
  onDelete,
  onReturn,
  onRenew,
  sortConfig,
  requestSort,
}) => {
  const getStatusBadge = (status, dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < today && status === "issued";

    if (isOverdue) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
          Overdue
        </span>
      );
    }

    switch (status) {
      case "issued":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Issued
          </span>
        );
      case "returned":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            Returned
          </span>
        );
      case "renewed":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Renewed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-[#525b88]">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("bookTitle")}
            >
              <div className="flex items-center">
                Book Title
                {sortConfig.key === "bookTitle" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("borrowerName")}
            >
              <div className="flex items-center">
                Borrower
                {sortConfig.key === "borrowerName" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("issueDate")}
            >
              <div className="flex items-center">
                Issue Date
                {sortConfig.key === "issueDate" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("dueDate")}
            >
              <div className="flex items-center">
                Due Date
                {sortConfig.key === "dueDate" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {issuedBooks.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {typeof item.book === "object" && item.book ? item.book.bookTitle : item.bookTitle || "-"}
                {typeof item.book === "object" && item.book && item.book.isbn && (
                  <span className="text-xs text-gray-500 block">ISBN: {item.book.isbn}</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.borrowerName || "-"}
                {item.borrowerType && (
                  <span className="text-xs text-gray-500 block">
                    {item.borrowerType === "faculty" ? "Faculty" : "Student"}
                  </span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.issueDate
                  ? new Date(item.issueDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.dueDate
                  ? new Date(item.dueDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {getStatusBadge(item.status, item.dueDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(item._id)}
                    className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {item.status === "issued" && (
                    <>
                      <button
                        onClick={() => onRenew(item._id)}
                        className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded hover:bg-yellow-50 transition-colors"
                        title="Renew"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onReturn(item._id)}
                        className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                        title="Return"
                      >
                        <BookOpen className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onEdit(item._id)}
                    className="text-[#525b88] hover:text-[#3a4166]"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const IssuedBooks = () => {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    bookTitle: "",
    borrowerName: "",
    borrowerId: "",
    borrowerType: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // Master data state
  const [masterData, setMasterData] = useState({
    books: [],
    professors: [],
    students: [],
  });
  const [loadingMasterData, setLoadingMasterData] = useState(false);

  // Static data for Issued Books
  const staticData = [
    {
      _id: "1",
      bookTitle: "Introduction to Computer Science",
      bookId: "LIB001",
      isbn: "978-0123456789",
      borrowerName: "Rajesh Kumar",
      borrowerId: "STU2024001",
      borrowerType: "student",
      borrowerEmail: "rajesh.kumar@student.aknu.edu",
      borrowerPhone: "9876543210",
      issueDate: "2024-01-15",
      dueDate: "2024-02-15",
      returnDate: null,
      status: "issued",
      fineAmount: 0,
      renewals: 0,
      maxRenewals: 2,
      issuedBy: "Librarian Name",
    },
    {
      _id: "2",
      bookTitle: "Data Structures and Algorithms",
      bookId: "LIB002",
      isbn: "978-0123456790",
      borrowerName: "Priya Sharma",
      borrowerId: "STU2024002",
      borrowerType: "student",
      borrowerEmail: "priya.sharma@student.aknu.edu",
      borrowerPhone: "9876543211",
      issueDate: "2024-01-10",
      dueDate: "2024-02-10",
      returnDate: null,
      status: "overdue",
      fineAmount: 50,
      renewals: 1,
      maxRenewals: 2,
      issuedBy: "Librarian Name",
    },
    {
      _id: "3",
      bookTitle: "The Art of Programming",
      bookId: "LIB003",
      isbn: "978-0123456791",
      borrowerName: "Dr. Anil Patel",
      borrowerId: "FAC2024001",
      borrowerType: "faculty",
      borrowerEmail: "anil.patel@aknu.edu",
      borrowerPhone: "9876543212",
      issueDate: "2024-01-20",
      dueDate: "2024-03-20",
      returnDate: null,
      status: "issued",
      fineAmount: 0,
      renewals: 0,
      maxRenewals: 3,
      issuedBy: "Librarian Name",
    },
    {
      _id: "4",
      bookTitle: "Machine Learning Fundamentals",
      bookId: "LIB004",
      isbn: "978-0123456792",
      borrowerName: "Amit Singh",
      borrowerId: "STU2024003",
      borrowerType: "student",
      borrowerEmail: "amit.singh@student.aknu.edu",
      borrowerPhone: "9876543213",
      issueDate: "2023-12-01",
      dueDate: "2024-01-01",
      returnDate: "2024-01-05",
      status: "returned",
      fineAmount: 20,
      renewals: 0,
      maxRenewals: 2,
      issuedBy: "Librarian Name",
    },
    {
      _id: "5",
      bookTitle: "Database Systems",
      bookId: "LIB005",
      isbn: "978-0123456793",
      borrowerName: "Sneha Reddy",
      borrowerId: "STU2024004",
      borrowerType: "student",
      borrowerEmail: "sneha.reddy@student.aknu.edu",
      borrowerPhone: "9876543214",
      issueDate: "2024-01-18",
      dueDate: "2024-02-18",
      returnDate: null,
      status: "issued",
      fineAmount: 0,
      renewals: 0,
      maxRenewals: 2,
      issuedBy: "Librarian Name",
    },
    {
      _id: "6",
      bookTitle: "Research Methodology",
      bookId: "LIB006",
      isbn: "978-0123456794",
      borrowerName: "Prof. Meera Nair",
      borrowerId: "FAC2024002",
      borrowerType: "faculty",
      borrowerEmail: "meera.nair@aknu.edu",
      borrowerPhone: "9876543215",
      issueDate: "2024-01-12",
      dueDate: "2024-03-12",
      returnDate: null,
      status: "issued",
      fineAmount: 0,
      renewals: 1,
      maxRenewals: 3,
      issuedBy: "Librarian Name",
    },
    {
      _id: "7",
      bookTitle: "Software Engineering Principles",
      bookId: "LIB007",
      isbn: "978-0123456795",
      borrowerName: "Vikram Rao",
      borrowerId: "STU2024005",
      borrowerType: "student",
      borrowerEmail: "vikram.rao@student.aknu.edu",
      borrowerPhone: "9876543216",
      issueDate: "2023-11-20",
      dueDate: "2023-12-20",
      returnDate: "2023-12-25",
      status: "returned",
      fineAmount: 25,
      renewals: 0,
      maxRenewals: 2,
      issuedBy: "Librarian Name",
    },
    {
      _id: "8",
      bookTitle: "Network Security",
      bookId: "LIB008",
      isbn: "978-0123456796",
      borrowerName: "Ravi Verma",
      borrowerId: "STU2024006",
      borrowerType: "student",
      borrowerEmail: "ravi.verma@student.aknu.edu",
      borrowerPhone: "9876543217",
      issueDate: "2024-01-22",
      dueDate: "2024-02-22",
      returnDate: null,
      status: "issued",
      fineAmount: 0,
      renewals: 0,
      maxRenewals: 2,
      issuedBy: "Librarian Name",
    },
  ];

  // Fetch master data (books, professors, students)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoadingMasterData(true);
        // Fetch books with populated shelfLocation to get library info
        const [booksRes, professorsRes, studentsRes] = await Promise.all([
          booksApi.getAll(), // Fetch all books, we'll filter available ones in the dropdown
          professorsApi.getAll(),
          studentsApi.getAll(),
        ]);

        setMasterData({
          books: Array.isArray(booksRes) ? booksRes : [],
          professors: Array.isArray(professorsRes) ? professorsRes : [],
          students: Array.isArray(studentsRes) ? studentsRes : [],
        });
      } catch (err) {
        console.error("Error fetching master data:", err);
        showAxiosError(err);
        setMasterData({
          books: [],
          professors: [],
          students: [],
        });
      } finally {
        setLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, []);

  // Fetch issued books from API
  const fetchIssuedBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.bookTitle) params.search = filters.bookTitle;
      if (filters.borrowerName) params.search = filters.borrowerName;
      if (filters.borrowerType) params.borrowerType = filters.borrowerType;
      if (filters.status) params.status = filters.status;

      const data = await issuedBooksApi.getAll(params);
      setIssuedBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching issued books:", err);
      setError(err.message || "Failed to fetch issued books");
      showAxiosError(err);
      setIssuedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  // Refetch when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchIssuedBooks();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredIssuedBooks = useMemo(() => {
    let filtered = [...issuedBooks];

    if (filters.bookTitle) {
      filtered = filtered.filter((item) =>
        item.bookTitle?.toLowerCase().includes(filters.bookTitle.toLowerCase())
      );
    }

    if (filters.borrowerName) {
      filtered = filtered.filter((item) =>
        item.borrowerName?.toLowerCase().includes(filters.borrowerName.toLowerCase())
      );
    }

    if (filters.borrowerId) {
      filtered = filtered.filter((item) =>
        item.borrowerId?.toLowerCase().includes(filters.borrowerId.toLowerCase())
      );
    }

    if (filters.borrowerType) {
      filtered = filtered.filter((item) => item.borrowerType === filters.borrowerType);
    }

    if (filters.status) {
      filtered = filtered.filter((item) => {
        if (filters.status === "overdue") {
          const today = new Date();
          const due = new Date(item.dueDate);
          return due < today && item.status === "issued";
        }
        return item.status === filters.status;
      });
    }

    return filtered;
  }, [issuedBooks, filters]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedIssuedBooks = useMemo(() => {
    let sortableItems = [...filteredIssuedBooks];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredIssuedBooks, sortConfig]);

  const handleView = async (id) => {
    try {
      setLoading(true);
      const item = await issuedBooksApi.getById(id);
      setSelectedItem(item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching issued book:", err);
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Prepare data for API
      const bookData = {
        book: formData.book,
        borrowerType: formData.borrowerType,
        borrower: formData.borrower,
        borrowerName: formData.borrowerName.trim(),
        borrowerEmail: formData.borrowerEmail ? formData.borrowerEmail.trim() : "",
        borrowerPhone: formData.borrowerPhone ? formData.borrowerPhone.trim() : "",
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        status: formData.status || "issued",
        notes: formData.notes ? formData.notes.trim() : "",
      };

      const newIssuedBook = await issuedBooksApi.create(bookData);
      showSuccessMessage("Book issued successfully!");
      setShowAddModal(false);
      fetchIssuedBooks(); // Refresh the list
    } catch (err) {
      console.error("Error issuing book:", err);
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const issuedBook = await issuedBooksApi.getById(id);
      
      // Transform API response to form format
      setEditFormData({
        ...issuedBook,
        book: typeof issuedBook.book === "object" ? issuedBook.book._id : issuedBook.book,
        borrower: typeof issuedBook.borrower === "object" ? issuedBook.borrower._id : issuedBook.borrower,
        issueDate: issuedBook.issueDate ? new Date(issuedBook.issueDate).toISOString().split("T")[0] : "",
        dueDate: issuedBook.dueDate ? new Date(issuedBook.dueDate).toISOString().split("T")[0] : "",
        returnDate: issuedBook.returnDate ? new Date(issuedBook.returnDate).toISOString().split("T")[0] : "",
      });
      setShowEditModal(true);
    } catch (err) {
      console.error("Error fetching issued book:", err);
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setLoading(true);
        await issuedBooksApi.delete(id);
        showSuccessMessage("Issued book record deleted successfully!");
        fetchIssuedBooks(); // Refresh the list
      } catch (err) {
        console.error("Error deleting issued book:", err);
        showAxiosError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData) return;

    try {
      setLoading(true);
      
      // Prepare data for API
      const updateData = {
        book: editFormData.book,
        borrowerType: editFormData.borrowerType,
        borrower: editFormData.borrower,
        borrowerName: editFormData.borrowerName.trim(),
        borrowerEmail: editFormData.borrowerEmail ? editFormData.borrowerEmail.trim() : "",
        borrowerPhone: editFormData.borrowerPhone ? editFormData.borrowerPhone.trim() : "",
        issueDate: editFormData.issueDate,
        dueDate: editFormData.dueDate,
        returnDate: editFormData.returnDate || null,
        status: editFormData.status,
        fineAmount: editFormData.fineAmount || 0,
        notes: editFormData.notes ? editFormData.notes.trim() : "",
      };

      await issuedBooksApi.update(editFormData._id, updateData);
      showSuccessMessage("Issued book updated successfully!");
      setShowEditModal(false);
      setEditFormData(null);
      fetchIssuedBooks(); // Refresh the list
    } catch (err) {
      console.error("Error updating issued book:", err);
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // Handle borrower selection - auto-fill email and phone
    if (name === "borrower") {
      const borrowerType = editFormData.borrowerType || "student";
      let selectedBorrower = null;
      
      if (borrowerType === "faculty") {
        selectedBorrower = masterData.professors.find(p => p._id === value);
        if (selectedBorrower) {
          const phoneNumber = selectedBorrower.contactNumber || selectedBorrower.alternateContactNumber || "";
          setEditFormData((prev) => ({
            ...prev,
            borrower: value,
            borrowerName: selectedBorrower.name || "",
            borrowerEmail: selectedBorrower.email || "",
            borrowerPhone: phoneNumber,
          }));
          return;
        }
      } else if (borrowerType === "student") {
        selectedBorrower = masterData.students.find(s => s._id === value);
        if (selectedBorrower) {
          const fullName = `${selectedBorrower.firstName || ""} ${selectedBorrower.middleName || ""} ${selectedBorrower.lastName || ""}`.trim();
          setEditFormData((prev) => ({
            ...prev,
            borrower: value,
            borrowerName: fullName || selectedBorrower.name || "",
            borrowerEmail: selectedBorrower.email || "",
            borrowerPhone: selectedBorrower.phone || "",
          }));
          return;
        }
      }
    }
    
    // Handle borrower type change - reset borrower selection
    if (name === "borrowerType") {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
        borrower: "",
        borrowerName: "",
        borrowerEmail: "",
        borrowerPhone: "",
      }));
      return;
    }
    
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReturn = async (id) => {
    const item = issuedBooks.find((i) => i._id === id);
    if (!item) return;
    
    const confirmMessage = item.fineAmount > 0 
      ? `Mark this book as returned? Fine amount: ₹${item.fineAmount}`
      : "Mark this book as returned?";
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const result = await issuedBooksApi.return(id, {
          returnDate: new Date().toISOString().split("T")[0],
        });
        
        // Show fine information if calculated
        if (result.calculatedFine !== undefined && result.calculatedFine > 0) {
          showSuccessMessage(`Book returned successfully! Fine: ₹${result.calculatedFine}`);
        } else {
          showSuccessMessage("Book marked as returned successfully!");
        }
        fetchIssuedBooks(); // Refresh the list
      } catch (err) {
        console.error("Error returning book:", err);
        showAxiosError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRenew = async (id) => {
    const item = issuedBooks.find((i) => i._id === id);
    if (!item) return;
    
    const currentRenewals = item.renewals || 0;
    const maxRenewals = item.maxRenewals || (item.borrowerType === "student" ? 2 : 3);
    
    if (currentRenewals >= maxRenewals) {
      showAxiosError(new Error(`Maximum renewal limit reached (${maxRenewals} renewals allowed)`));
      return;
    }
    
    if (window.confirm(`Renew this book for another period? (${currentRenewals + 1}/${maxRenewals} renewals)`)) {
      try {
        setLoading(true);
        // Let backend calculate the new due date based on rules
        await issuedBooksApi.renew(id, {});
        showSuccessMessage("Book renewed successfully!");
        fetchIssuedBooks(); // Refresh the list
      } catch (err) {
        console.error("Error renewing book:", err);
        showAxiosError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const summaryStats = useMemo(() => {
    const today = new Date();
    return {
      totalIssued: issuedBooks.filter((item) => item.status === "issued" || item.status === "renewed").length,
      overdue: issuedBooks.filter((item) => {
        const due = new Date(item.dueDate);
        return due < today && (item.status === "issued" || item.status === "renewed");
      }).length,
      returned: issuedBooks.filter((item) => item.status === "returned").length,
      totalFine: issuedBooks.reduce((sum, item) => sum + (item.fineAmount || 0), 0),
    };
  }, [issuedBooks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading issued books...</div>
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
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Issued Books Management
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (sortedIssuedBooks.length === 0) {
                  showAxiosError(new Error("No data to export"));
                  return;
                }
                const columns = [
                  { key: "book.bookTitle", label: "Book Title" },
                  { key: "book.isbn", label: "ISBN" },
                  { key: "borrowerName", label: "Borrower Name" },
                  { key: "borrowerType", label: "Borrower Type", format: (val) => val === "student" ? "Student" : "Faculty" },
                  { key: "borrowerEmail", label: "Borrower Email" },
                  { key: "borrowerPhone", label: "Borrower Phone" },
                  { key: "issueDate", label: "Issue Date", format: (val) => val ? new Date(val).toLocaleDateString() : "" },
                  { key: "dueDate", label: "Due Date", format: (val) => val ? new Date(val).toLocaleDateString() : "" },
                  { key: "returnDate", label: "Return Date", format: (val) => val ? new Date(val).toLocaleDateString() : "" },
                  { key: "status", label: "Status" },
                  { key: "fineAmount", label: "Fine Amount (₹)", format: (val) => (val || 0).toFixed(2) },
                  { key: "renewals", label: "Renewals" },
                ];
                exportToCSV(sortedIssuedBooks, columns, "issued_books");
                showSuccessMessage("Issued books exported successfully!");
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              title="Export Issued Books"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
              title="Issue New Book"
            >
              <Plus className="w-4 h-4 mr-2" />
              Issue Book
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Currently Issued</p>
                <p className="text-2xl font-bold text-[#525b88]">
                  {summaryStats.totalIssued}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-[#525b88]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {summaryStats.overdue}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Returned</p>
                <p className="text-2xl font-bold text-green-600">
                  {summaryStats.returned}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fine</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{summaryStats.totalFine}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar onFilter={handleFilter} />

        {/* Table */}
        <IssuedBooksTable
          issuedBooks={sortedIssuedBooks}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReturn={handleReturn}
          onRenew={handleRenew}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
      </div>

      {/* Edit Modal */}
      {showEditModal &&
        editFormData &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Edit Issued Book</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditFormData(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Book Selection */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Book: *
                      </label>
                      <select
                        name="book"
                        value={editFormData.book || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                        disabled={masterData.books.length === 0}
                      >
                        <option value="">
                          {masterData.books.length === 0
                            ? "No books available"
                            : "Select Book"}
                        </option>
                        {masterData.books.map((book) => (
                          <option key={book._id} value={book._id}>
                            {book.bookTitle} {book.isbn ? `(ISBN: ${book.isbn})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Borrower Type */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Borrower Type: *
                      </label>
                      <select
                        name="borrowerType"
                        value={editFormData.borrowerType || "student"}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    </div>

                    {/* Borrower Selection */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Borrower: *
                      </label>
                      <select
                        name="borrower"
                        value={editFormData.borrower || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                        disabled={
                          (editFormData.borrowerType === "faculty" && masterData.professors.length === 0) ||
                          (editFormData.borrowerType === "student" && masterData.students.length === 0)
                        }
                      >
                        <option value="">
                          {editFormData.borrowerType === "faculty"
                            ? masterData.professors.length === 0
                              ? "No professors available"
                              : "Select Professor"
                            : masterData.students.length === 0
                            ? "No students available"
                            : "Select Student"}
                        </option>
                        {editFormData.borrowerType === "faculty"
                          ? masterData.professors.map((professor) => (
                              <option key={professor._id} value={professor._id}>
                                {professor.name}
                                {professor.professorId ? ` (${professor.professorId})` : ""}
                                {professor.designation ? ` - ${professor.designation}` : ""}
                              </option>
                            ))
                          : masterData.students.map((student) => {
                              const fullName = `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim();
                              return (
                                <option key={student._id} value={student._id}>
                                  {fullName || student.name || "Unknown"}
                                  {student.registrationNumber ? ` (${student.registrationNumber})` : ""}
                                  {student.hallTicketNo ? ` - ${student.hallTicketNo}` : ""}
                                </option>
                              );
                            })}
                      </select>
                    </div>

                    {/* Borrower Name */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Borrower Name: *
                      </label>
                      <input
                        type="text"
                        name="borrowerName"
                        value={editFormData.borrowerName || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>

                    {/* Borrower Email */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Borrower Email:
                      </label>
                      <input
                        type="email"
                        name="borrowerEmail"
                        value={editFormData.borrowerEmail || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>

                    {/* Borrower Phone */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Borrower Phone:
                      </label>
                      <input
                        type="text"
                        name="borrowerPhone"
                        value={editFormData.borrowerPhone || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>

                    {/* Issue Date */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Date:
                      </label>
                      <input
                        type="date"
                        name="issueDate"
                        value={editFormData.issueDate || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>

                    {/* Due Date */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date:
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={editFormData.dueDate || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status:
                      </label>
                      <select
                        name="status"
                        value={editFormData.status || "issued"}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="issued">Issued</option>
                        <option value="returned">Returned</option>
                        <option value="renewed">Renewed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditFormData(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* View Details Modal */}
      {showViewModal &&
        selectedItem &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Issued Book Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
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
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
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
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Borrower Name:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.borrowerName || "-"}</p>
                    </div>

                    {/* Issue Date */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Issue Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.issueDate
                          ? new Date(selectedItem.issueDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    {/* Due Date */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Due Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.dueDate
                          ? new Date(selectedItem.dueDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Status:
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedItem.status === "issued"
                            ? "bg-blue-100 text-blue-800"
                            : selectedItem.status === "returned"
                            ? "bg-green-100 text-green-800"
                            : selectedItem.status === "renewed"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedItem.status || "-"}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Add Modal */}
      {showAddModal && (
        <AddFormModal
          formType="issuedBooks"
          initialData={null}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
          masterData={masterData}
        />
      )}
    </>
  );
};

export default IssuedBooks;

