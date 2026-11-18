import React, { useEffect, useState, useMemo } from "react";
import {
  Filter,
  Package,
  BookOpen,
  Hash,
  Calendar,
  DollarSign,
  Eye,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import {
  bookCategoriesApi,
  authorsApi,
  publishersApi,
  racksApi,
  booksApi,
} from "../../services/apiService";
import { exportToCSV } from "../../utils/exportUtils";
import { Download } from "lucide-react";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    bookTitle: "",
    author: "",
    category: "",
    isbn: "",
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

      {/* Author */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={filters.author}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Category */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Categories</option>
          <option value="textbook">Textbook</option>
          <option value="reference">Reference</option>
          <option value="fiction">Fiction</option>
          <option value="non-fiction">Non-Fiction</option>
          <option value="journal">Journal</option>
          <option value="magazine">Magazine</option>
          <option value="research">Research</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* ISBN */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="isbn"
          placeholder="ISBN"
          value={filters.isbn}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
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
          <option value="available">Available</option>
          <option value="issued">Issued</option>
          <option value="reserved">Reserved</option>
          <option value="damaged">Damaged</option>
          <option value="lost">Lost</option>
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

const InventoryTable = ({
  inventory,
  onView,
  onEdit,
  onDelete,
  sortConfig,
  requestSort,
}) => {
  const getCategoryName = (category) => {
    const categories = {
      textbook: "Textbook",
      reference: "Reference",
      fiction: "Fiction",
      "non-fiction": "Non-Fiction",
      journal: "Journal",
      magazine: "Magazine",
      research: "Research",
      other: "Other",
    };
    return categories[category] || category;
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
              onClick={() => requestSort("author")}
            >
              <div className="flex items-center">
                Author
                {sortConfig.key === "author" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("totalCopies")}
            >
              <div className="flex items-center">
                Total Copies
                {sortConfig.key === "totalCopies" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("availableCopies")}
            >
              <div className="flex items-center">
                Available
                {sortConfig.key === "availableCopies" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortConfig.key === "status" && (
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
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inventory.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {item.bookTitle || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.author || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.totalCopies || 0}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.availableCopies || 0}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    item.status === "available"
                      ? "bg-green-100 text-green-800"
                      : item.status === "issued"
                      ? "bg-blue-100 text-blue-800"
                      : item.status === "reserved"
                      ? "bg-yellow-100 text-yellow-800"
                      : item.status === "damaged"
                      ? "bg-red-100 text-red-800"
                      : item.status === "lost"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.status || "available"}
                </span>
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

const LibraryInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    bookTitle: "",
    author: "",
    category: "",
    isbn: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [masterData, setMasterData] = useState({
    categories: [],
    authors: [],
    publishers: [],
    racks: [],
  });

  // Transform API book data to frontend format
  const transformBookData = (book) => {
    return {
      _id: book._id,
      bookTitle: book.bookTitle,
      author: typeof book.author === "object" ? book.author.name : book.author,
      authorId: typeof book.author === "object" ? book.author._id : book.author,
      category: typeof book.category === "object" ? book.category.name : book.category,
      categoryId: typeof book.category === "object" ? book.category._id : book.category,
      isbn: book.isbn,
      publisher: typeof book.publisher === "object" ? book.publisher.name : book.publisher,
      publisherId: typeof book.publisher === "object" ? book.publisher._id : book.publisher,
      publicationYear: book.publicationYear,
      edition: book.edition || "",
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      issuedCopies: book.issuedCopies || (book.totalCopies - book.availableCopies),
      shelfLocation: typeof book.shelfLocation === "object" 
        ? book.shelfLocation.rackNumber || book.shelfLocation.rackName 
        : book.shelfLocation,
      shelfLocationId: typeof book.shelfLocation === "object" ? book.shelfLocation._id : book.shelfLocation,
      price: book.price,
      status: book.status,
      description: book.description || "",
      bookImage: book.bookImage || "",
    };
  };

  // Fetch books from API
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params from filters
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.isbn) params.isbn = filters.isbn;
      if (filters.bookTitle) params.search = filters.bookTitle;
      if (filters.author) params.author = filters.author;
      if (filters.category) params.category = filters.category;

      const books = await booksApi.getAll(params);
      const transformedBooks = Array.isArray(books) 
        ? books.map(transformBookData)
        : [];
      
      setInventory(transformedBooks);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(err.message || "Failed to fetch books");
      showAxiosError(err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch master data from APIs
  const fetchMasterData = async () => {
    try {
      const [categories, authors, publishers, racks] = await Promise.all([
        bookCategoriesApi.getAll(),
        authorsApi.getAll(),
        publishersApi.getAll(),
        racksApi.getAll(),
      ]);

      setMasterData({
        categories: Array.isArray(categories) ? categories : [],
        authors: Array.isArray(authors) ? authors : [],
        publishers: Array.isArray(publishers) ? publishers : [],
        racks: Array.isArray(racks) ? racks : [],
      });
    } catch (err) {
      console.error("Error fetching master data:", err);
      showAxiosError(err);
      setMasterData({
        categories: [],
        authors: [],
        publishers: [],
        racks: [],
      });
    }
  };

  useEffect(() => {
    // Fetch both books and master data
    fetchMasterData();
    fetchBooks();
  }, []);

  // Refetch books when filters change (but debounce to avoid too many calls)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 300); // Debounce for 300ms
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredInventory = useMemo(() => {
    let filtered = [...inventory];

    if (filters.bookTitle) {
      filtered = filtered.filter((item) =>
        item.bookTitle?.toLowerCase().includes(filters.bookTitle.toLowerCase())
      );
    }

    if (filters.author) {
      filtered = filtered.filter((item) =>
        item.author?.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    if (filters.isbn) {
      filtered = filtered.filter((item) =>
        item.isbn?.toLowerCase().includes(filters.isbn.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    return filtered;
  }, [inventory, filters]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedInventory = useMemo(() => {
    let sortableItems = [...filteredInventory];
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
  }, [filteredInventory, sortConfig]);

  const handleView = (id) => {
    const item = inventory.find((i) => i._id === id);
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleAdd = () => {
    console.log("Add button clicked, opening modal");
    setShowAddModal(true);
  };

  const handleAddSubmit = async (formData) => {
    try {
      setLoading(true);
      
      console.log("📝 Form data received:", formData);
      
      // Validate required fields
      if (!formData.bookTitle || !formData.author || !formData.publisher || !formData.category || !formData.isbn || !formData.shelfLocation) {
        showAxiosError(new Error("Please fill all required fields: Book Title, Author, Publisher, Category, ISBN, and Rack Location"));
        return;
      }

      // Validate ObjectIds are not empty strings
      if (!formData.author || formData.author === "" || !formData.publisher || formData.publisher === "" || !formData.category || formData.category === "" || !formData.shelfLocation || formData.shelfLocation === "") {
        showAxiosError(new Error("Please select Author, Publisher, Category, and Rack Location from the dropdowns"));
        return;
      }
      
      // Prepare data for API (use IDs from formData)
      const bookData = {
        bookTitle: formData.bookTitle.trim(),
        author: formData.author, // Should be ObjectId
        publisher: formData.publisher, // Should be ObjectId
        category: formData.category, // Should be ObjectId
        isbn: formData.isbn.trim(),
        edition: formData.edition ? formData.edition.trim() : "",
        shelfLocation: formData.shelfLocation, // Should be ObjectId
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : null,
        bookImage: formData.bookImage ? formData.bookImage.trim() : "",
        price: formData.price ? parseFloat(formData.price) : 0,
        totalCopies: parseInt(formData.totalCopies) || 0,
        availableCopies: formData.availableCopies !== undefined ? parseInt(formData.availableCopies) : (parseInt(formData.totalCopies) || 0),
        status: formData.status || "available",
        description: formData.description ? formData.description.trim() : "",
      };

      console.log("📤 Sending book data to API:", bookData);

      const newBook = await booksApi.create(bookData);
      const transformedBook = transformBookData(newBook);
      
      setInventory([...inventory, transformedBook]);
      setShowAddModal(false);
      showSuccessMessage("Book added successfully!");
      
      // Refresh the list
      fetchBooks();
    } catch (err) {
      console.error("❌ Error adding book:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        errorData: err.errorData,
      });
      
      // Show more detailed error message
      if (err.errorData && err.errorData.errors) {
        const errorMessages = err.errorData.errors.map(e => `${e.field}: ${e.message}`).join(", ");
        showAxiosError(new Error(`Validation failed: ${errorMessages}`));
      } else {
        showAxiosError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const book = await booksApi.getById(id);
      const transformedBook = transformBookData(book);
      
      // Prepare for edit form (use IDs for dropdowns)
      setEditFormData({
        ...transformedBook,
        author: transformedBook.authorId,
        publisher: transformedBook.publisherId,
        category: transformedBook.categoryId,
        shelfLocation: transformedBook.shelfLocationId,
      });
      setShowEditModal(true);
    } catch (err) {
      console.error("Error fetching book:", err);
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        setLoading(true);
        await booksApi.delete(id);
        setInventory(inventory.filter((item) => item._id !== id));
        showSuccessMessage("Book deleted successfully!");
      } catch (err) {
        console.error("Error deleting book:", err);
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
      
      // Prepare data for API (use IDs from editFormData)
      const bookData = {
        bookTitle: editFormData.bookTitle,
        author: editFormData.author, // Should be ObjectId
        publisher: editFormData.publisher, // Should be ObjectId
        category: editFormData.category, // Should be ObjectId
        isbn: editFormData.isbn,
        edition: editFormData.edition || "",
        shelfLocation: editFormData.shelfLocation, // Should be ObjectId
        publicationYear: editFormData.publicationYear || null,
        bookImage: editFormData.bookImage || "",
        price: editFormData.price || 0,
        totalCopies: editFormData.totalCopies || 0,
        availableCopies: editFormData.availableCopies || 0,
        status: editFormData.status || "available",
        description: editFormData.description || "",
      };

      const updatedBook = await booksApi.update(editFormData._id, bookData);
      const transformedBook = transformBookData(updatedBook);
      
      setInventory(
        inventory.map((item) =>
          item._id === editFormData._id ? transformedBook : item
        )
      );
      setShowEditModal(false);
      setEditFormData(null);
      showSuccessMessage("Book updated successfully!");
    } catch (err) {
      console.error("Error updating book:", err);
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const summaryStats = useMemo(() => {
    return {
      totalBooks: inventory.length,
      totalCopies: inventory.reduce((sum, item) => sum + (item.totalCopies || 0), 0),
      availableCopies: inventory.reduce((sum, item) => sum + (item.availableCopies || 0), 0),
      issuedCopies: inventory.reduce((sum, item) => sum + (item.issuedCopies || 0), 0),
    };
  }, [inventory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading inventory...</div>
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
            Library Inventory Management
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (sortedInventory.length === 0) {
                  showAxiosError(new Error("No data to export"));
                  return;
                }
                const columns = [
                  { key: "bookTitle", label: "Book Title" },
                  { key: "author", label: "Author" },
                  { key: "category", label: "Category" },
                  { key: "isbn", label: "ISBN" },
                  { key: "publisher", label: "Publisher" },
                  { key: "publicationYear", label: "Publication Year" },
                  { key: "edition", label: "Edition" },
                  { key: "totalCopies", label: "Total Copies" },
                  { key: "availableCopies", label: "Available Copies" },
                  { key: "issuedCopies", label: "Issued Copies" },
                  { key: "shelfLocation", label: "Shelf Location" },
                  { key: "price", label: "Price (₹)", format: (val) => val || 0 },
                  { key: "status", label: "Status" },
                ];
                exportToCSV(sortedInventory, columns, "library_inventory");
                showSuccessMessage("Inventory exported successfully!");
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              title="Export Inventory"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
              title="Add New Book"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-[#525b88]">
                  {summaryStats.totalBooks}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-[#525b88]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Copies</p>
                <p className="text-2xl font-bold text-[#525b88]">
                  {summaryStats.totalCopies}
                </p>
              </div>
              <Package className="w-8 h-8 text-[#525b88]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {summaryStats.availableCopies}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Issued</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summaryStats.issuedCopies}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar onFilter={handleFilter} />

        {/* Table */}
        <InventoryTable
          inventory={sortedInventory}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
                <h3 className="text-lg font-semibold text-white">Edit Book</h3>
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
                    {/* Book Title */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Book Title:
                      </label>
                      <input
                        type="text"
                        name="bookTitle"
                        value={editFormData.bookTitle || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>

                    {/* Author */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author:
                      </label>
                      <select
                        name="author"
                        value={editFormData.author || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Author</option>
                        {masterData.authors.map((author) => (
                          <option key={author._id} value={author._id}>
                            {author.name} {author.authorCode ? `(${author.authorCode})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Publisher */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publisher:
                      </label>
                      <select
                        name="publisher"
                        value={editFormData.publisher || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Publisher</option>
                        {masterData.publishers.map((publisher) => (
                          <option key={publisher._id} value={publisher._id}>
                            {publisher.name} {publisher.publisherCode ? `(${publisher.publisherCode})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category:
                      </label>
                      <select
                        name="category"
                        value={editFormData.category || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Category</option>
                        {masterData.categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name} {category.code ? `(${category.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rack Location */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rack Location:
                      </label>
                      <select
                        name="shelfLocation"
                        value={editFormData.shelfLocation || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Rack</option>
                        {masterData.racks.map((rack) => {
                          const library = typeof rack.library === "object" ? rack.library : null;
                          return (
                            <option key={rack._id} value={rack._id}>
                              {rack.rackNumber} - {rack.rackName}
                              {library ? ` [${library.name}]` : ""} ({rack.location})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Total Copies */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Copies:
                      </label>
                      <input
                        type="number"
                        name="totalCopies"
                        value={editFormData.totalCopies || 0}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>

                    {/* Available Copies */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Copies:
                      </label>
                      <input
                        type="number"
                        name="availableCopies"
                        value={editFormData.availableCopies || 0}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
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
                        value={editFormData.status || "available"}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="available">Available</option>
                        <option value="issued">Issued</option>
                        <option value="reserved">Reserved</option>
                        <option value="damaged">Damaged</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div className="mb-5 col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description:
                      </label>
                      <textarea
                        name="description"
                        value={editFormData.description || ""}
                        onChange={handleEditChange}
                        rows="3"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
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
                <h3 className="text-lg font-semibold text-white">Book Details</h3>
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
                  {/* Book Image */}
                  {selectedItem.bookImage && (
                    <div className="mb-5 flex justify-center">
                      <img
                        src={selectedItem.bookImage}
                        alt={selectedItem.bookTitle}
                        className="h-48 w-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Book Title */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Book Title:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.bookTitle || "-"}</p>
                    </div>

                    {/* Author */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Author:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.author || "-"}</p>
                    </div>

                    {/* Publisher */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Publisher:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.publisher || "-"}</p>
                    </div>

                    {/* Category */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Category:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.category
                          ? selectedItem.category.charAt(0).toUpperCase() +
                            selectedItem.category.slice(1).replace("-", " ")
                          : "-"}
                      </p>
                    </div>

                    {/* ISBN Number */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        ISBN Number:
                      </label>
                      <p className="text-sm text-gray-900 font-mono">{selectedItem.isbn || "-"}</p>
                    </div>

                    {/* Edition */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Edition:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.edition || "-"}</p>
                    </div>

                    {/* Rack Location */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Rack Location:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.shelfLocation || "-"}</p>
                    </div>

                    {/* Publication Year */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Publication Year:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.publicationYear || "-"}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Price:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.price ? `₹${selectedItem.price}` : "-"}
                      </p>
                    </div>

                    {/* Total Copies */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Total Copies:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.totalCopies || 0}</p>
                    </div>

                    {/* Available Copies */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Available Copies:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.availableCopies || 0}</p>
                    </div>

                    {/* Issued Copies */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Issued Copies:
                      </label>
                      <p className="text-sm text-gray-900">
                        {(selectedItem.totalCopies || 0) - (selectedItem.availableCopies || 0)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Status:
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedItem.status === "available"
                            ? "bg-green-100 text-green-800"
                            : selectedItem.status === "issued"
                            ? "bg-blue-100 text-blue-800"
                            : selectedItem.status === "reserved"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedItem.status === "damaged"
                            ? "bg-red-100 text-red-800"
                            : selectedItem.status === "lost"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedItem.status || "available"}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mb-5 flex items-start gap-3 col-span-2">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Description:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.description || "-"}</p>
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
          formType="libraryInventory"
          initialData={null}
          onSubmit={handleAddSubmit}
          onClose={() => {
            console.log("Closing modal");
            setShowAddModal(false);
          }}
          masterData={masterData}
        />
      )}
    </>
  );
};

export default LibraryInventory;

