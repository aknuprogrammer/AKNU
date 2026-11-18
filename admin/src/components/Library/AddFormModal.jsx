import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { libraryRulesApi, booksApi } from "../../services/apiService";

const AddFormModal = ({ formType, initialData, onSubmit, onClose, masterData }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [libraryRules, setLibraryRules] = useState(null);
  const [loadingRules, setLoadingRules] = useState(false);
  
  // Extract master data with defaults
  const categories = masterData?.categories || [];
  const authors = masterData?.authors || [];
  const publishers = masterData?.publishers || [];
  const racks = masterData?.racks || [];
  const books = masterData?.books || [];
  const professors = masterData?.professors || [];
  const students = masterData?.students || [];

  // Debug logging - verify data is received
  useEffect(() => {
    if (formType === "libraryInventory") {
      console.log("🔍 AddFormModal - Master Data Received:", {
        masterDataProp: masterData,
        categoriesCount: categories.length,
        authorsCount: authors.length,
        publishersCount: publishers.length,
        racksCount: racks.length,
        categories: categories,
        authors: authors,
        publishers: publishers,
        racks: racks,
        isCategoriesArray: Array.isArray(categories),
        isAuthorsArray: Array.isArray(authors),
        firstAuthor: authors[0],
        firstCategory: categories[0],
      });
      
      // Warn if data is empty
      if (authors.length === 0 && categories.length === 0) {
        console.warn("⚠️ WARNING: No data received in AddFormModal! Check if APIs are working.");
      }
    }
  }, [masterData, formType]);

  // Fetch book details and library rules when book is selected
  const fetchBookAndRules = async (bookId) => {
    try {
      setLoadingRules(true);
      const book = await booksApi.getById(bookId);
      
      // Get library from book's shelfLocation
      let libraryId = null;
      if (book.shelfLocation && typeof book.shelfLocation === "object" && book.shelfLocation.library) {
        libraryId = book.shelfLocation.library._id || book.shelfLocation.library;
      }
      
      if (libraryId) {
        const rules = await libraryRulesApi.getActive({ library: libraryId });
        setLibraryRules(rules);
        
        // Auto-calculate due date if issue date and borrower type are set
        if (formData.issueDate && formData.borrowerType) {
          const issueDuration = rules.issueDuration?.[formData.borrowerType] || (formData.borrowerType === "student" ? 14 : 30);
          const issueDateObj = new Date(formData.issueDate);
          const calculatedDueDate = new Date(issueDateObj);
          calculatedDueDate.setDate(calculatedDueDate.getDate() + issueDuration);
          
          setFormData((prev) => ({
            ...prev,
            dueDate: calculatedDueDate.toISOString().split("T")[0],
          }));
        }
      } else {
        setLibraryRules(null);
      }
    } catch (err) {
      console.error("Error fetching book and rules:", err);
      setLibraryRules(null);
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Initialize form based on formType
      switch (formType) {
        case "libraryInventory":
          setFormData({
            bookTitle: "",
            author: "",
            publisher: "",
            category: "",
            isbn: "",
            edition: "",
            shelfLocation: "",
            publicationYear: "",
            bookImage: "",
            price: "",
            totalCopies: 0,
            availableCopies: 0,
            status: "available",
            description: "",
          });
          break;
        case "issuedBooks":
          const today = new Date();
          const dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() + 14); // 14 days from today
          setFormData({
            book: "",
            borrowerType: "student",
            borrower: "",
            borrowerName: "",
            borrowerEmail: "",
            borrowerPhone: "",
            issueDate: today.toISOString().split("T")[0],
            dueDate: dueDate.toISOString().split("T")[0],
            status: "issued",
          });
          break;
        default:
          setFormData({});
      }
    }
  }, [initialData, formType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle borrower selection - auto-fill email and phone
    if (name === "borrower") {
      const borrowerType = formData.borrowerType || "student";
      let selectedBorrower = null;
      
      if (borrowerType === "faculty") {
        selectedBorrower = professors.find(p => p._id === value);
        if (selectedBorrower) {
          console.log("Selected professor:", selectedBorrower);
          // Use contactNumber if available, otherwise use alternateContactNumber
          const phoneNumber = selectedBorrower.contactNumber || selectedBorrower.alternateContactNumber || "";
          setFormData((prev) => ({
            ...prev,
            borrower: value,
            borrowerName: selectedBorrower.name || "",
            borrowerEmail: selectedBorrower.email || "",
            borrowerPhone: phoneNumber,
          }));
          return;
        }
      } else if (borrowerType === "student") {
        selectedBorrower = students.find(s => s._id === value);
        if (selectedBorrower) {
          const fullName = `${selectedBorrower.firstName || ""} ${selectedBorrower.middleName || ""} ${selectedBorrower.lastName || ""}`.trim();
          setFormData((prev) => ({
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
    
    // Handle book selection - fetch library and rules
    if (name === "book" && value && formType === "issuedBooks") {
      fetchBookAndRules(value);
    }
    
    // Handle borrower type change - reset borrower selection and recalculate due date
    if (name === "borrowerType") {
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: value,
          borrower: "",
          borrowerName: "",
          borrowerEmail: "",
          borrowerPhone: "",
        };
        // Recalculate due date if issue date and rules are available
        if (newData.issueDate && libraryRules) {
          const issueDuration = libraryRules.issueDuration?.[value] || (value === "student" ? 14 : 30);
          const issueDateObj = new Date(newData.issueDate);
          const calculatedDueDate = new Date(issueDateObj);
          calculatedDueDate.setDate(calculatedDueDate.getDate() + issueDuration);
          newData.dueDate = calculatedDueDate.toISOString().split("T")[0];
        }
        return newData;
      });
      return;
    }
    
    // Handle issue date change - recalculate due date
    if (name === "issueDate" && formType === "issuedBooks" && libraryRules && formData.borrowerType) {
      const issueDuration = libraryRules.issueDuration?.[formData.borrowerType] || (formData.borrowerType === "student" ? 14 : 30);
      const issueDateObj = new Date(value);
      const calculatedDueDate = new Date(issueDateObj);
      calculatedDueDate.setDate(calculatedDueDate.getDate() + issueDuration);
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        dueDate: calculatedDueDate.toISOString().split("T")[0],
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalCopies" || name === "availableCopies" 
        ? parseInt(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    const action = initialData ? "Edit" : "Add New";
    const titles = {
      libraryInventory: "Book",
      issuedBooks: "Issued Book",
    };
    return `${action} ${titles[formType] || "Item"}`;
  };

  const renderFormFields = () => {
    switch (formType) {
      case "libraryInventory":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Title: *
                </label>
                <input
                  type="text"
                  name="bookTitle"
                  value={formData.bookTitle || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author: *
                </label>
                <select
                  name="author"
                  value={formData.author || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                  disabled={authors.length === 0}
                >
                  <option value="">
                    {authors.length === 0
                      ? "No authors available. Please add authors first."
                      : "Select Author"}
                  </option>
                  {authors.map((author) => (
                    <option key={author._id} value={author._id}>
                      {author.name} {author.authorCode ? `(${author.authorCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publisher: *
                </label>
                <select
                  name="publisher"
                  value={formData.publisher || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                  disabled={publishers.length === 0}
                >
                  <option value="">
                    {publishers.length === 0
                      ? "No publishers available. Please add publishers first."
                      : "Select Publisher"}
                  </option>
                  {publishers.map((publisher) => (
                    <option key={publisher._id} value={publisher._id}>
                      {publisher.name} {publisher.publisherCode ? `(${publisher.publisherCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category: *
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                  disabled={categories.length === 0}
                >
                  <option value="">
                    {categories.length === 0
                      ? "No categories available. Please add categories first."
                      : "Select Category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name} {category.code ? `(${category.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN Number: *
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edition:
                </label>
                <input
                  type="text"
                  name="edition"
                  value={formData.edition || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 5th, 2023"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rack Location: *
                </label>
                <select
                  name="shelfLocation"
                  value={formData.shelfLocation || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                  disabled={racks.length === 0}
                >
                  <option value="">
                    {racks.length === 0
                      ? "No racks available. Please add racks first."
                      : "Select Rack"}
                  </option>
                  {racks.map((rack) => {
                    const library =
                      typeof rack.library === "object"
                        ? rack.library
                        : null;
                    return (
                      <option key={rack._id} value={rack._id}>
                        {rack.rackNumber} - {rack.rackName}
                        {library ? ` [${library.name}]` : ""} ({rack.location})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publication Year:
                </label>
                <input
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear || ""}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Image:
                </label>
                <input
                  type="file"
                  name="bookImage"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (max 2MB)
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Image size should be less than 2MB. Please choose a smaller image.");
                        e.target.value = ""; // Clear the input
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, bookImage: reader.result, bookImageFile: file });
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setFormData({ ...formData, bookImage: "" });
                    }
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
                {formData.bookImage && (
                  <img src={formData.bookImage} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
                )}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹):
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Copies: *
                </label>
                <input
                  type="number"
                  name="totalCopies"
                  value={formData.totalCopies || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Copies: *
                </label>
                <input
                  type="number"
                  name="availableCopies"
                  value={formData.availableCopies || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status: *
                </label>
                <select
                  name="status"
                  value={formData.status || "available"}
                  onChange={handleInputChange}
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

              <div className="mb-5 col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description:
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
            </div>
          </>
        );

      case "issuedBooks":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              {/* Book Selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book: *
                </label>
                <select
                  name="book"
                  value={formData.book || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                  disabled={books.length === 0}
                >
                  <option value="">
                    {books.length === 0
                      ? "No books available. Please add books first."
                      : "Select Book"}
                  </option>
                  {books.map((book) => (
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
                  value={formData.borrowerType || "student"}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              {/* Borrower Selection - Dynamic based on borrowerType */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrower: *
                </label>
                <select
                  name="borrower"
                  value={formData.borrower || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                  disabled={
                    (formData.borrowerType === "faculty" && professors.length === 0) ||
                    (formData.borrowerType === "student" && students.length === 0)
                  }
                >
                  <option value="">
                    {formData.borrowerType === "faculty"
                      ? professors.length === 0
                        ? "No professors available"
                        : "Select Professor"
                      : students.length === 0
                      ? "No students available"
                      : "Select Student"}
                  </option>
                  {formData.borrowerType === "faculty"
                    ? professors.map((professor) => (
                        <option key={professor._id} value={professor._id}>
                          {professor.name}
                          {professor.professorId ? ` (${professor.professorId})` : ""}
                          {professor.designation ? ` - ${professor.designation}` : ""}
                        </option>
                      ))
                    : students.map((student) => {
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

              {/* Borrower Name - Auto-filled but editable */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrower Name: *
                </label>
                <input
                  type="text"
                  name="borrowerName"
                  value={formData.borrowerName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              {/* Borrower Email - Auto-filled */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrower Email:
                </label>
                <input
                  type="email"
                  name="borrowerEmail"
                  value={formData.borrowerEmail || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] bg-gray-50"
                  readOnly
                />
              </div>

              {/* Borrower Phone - Auto-filled */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrower Phone:
                </label>
                <input
                  type="text"
                  name="borrowerPhone"
                  value={formData.borrowerPhone || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] bg-gray-50"
                  readOnly
                />
              </div>

              {/* Issue Date */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date: *
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              {/* Due Date */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date: *
                  {libraryRules && formData.borrowerType && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Auto-calculated: {libraryRules.issueDuration?.[formData.borrowerType] || (formData.borrowerType === "student" ? 14 : 30)} days)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
                {libraryRules && (
                  <p className="text-xs text-gray-500 mt-1">
                    Issue Duration: {libraryRules.issueDuration?.[formData.borrowerType] || (formData.borrowerType === "student" ? 14 : 30)} days | 
                    Max Books: {libraryRules.maxBooksLimit?.[formData.borrowerType] || (formData.borrowerType === "student" ? 3 : 5)} | 
                    Max Renewals: {libraryRules.maxRenewals?.[formData.borrowerType] || (formData.borrowerType === "student" ? 2 : 3)}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status: *
                </label>
                <select
                  name="status"
                  value={formData.status || "issued"}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="issued">Issued</option>
                  <option value="returned">Returned</option>
                  <option value="overdue">Overdue</option>
                  <option value="renewed">Renewed</option>
                </select>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!formType) {
    console.error("AddFormModal: formType is required");
    return null;
  }

  const formFields = renderFormFields();
  if (!formFields) {
    console.error("AddFormModal: No form fields rendered for formType:", formType);
    return null;
  }

  console.log("AddFormModal rendering with formType:", formType, "formData:", formData);

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <h3 className="text-lg font-semibold text-white">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {formFields}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddFormModal;

