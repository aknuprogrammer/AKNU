import React, { useState } from "react";
import { BookOpen, User, Search, Scan, Calendar } from "lucide-react";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

const IssueBook = () => {
  const [formData, setFormData] = useState({
    borrowerId: "",
    borrowerType: "student",
    bookBarcode: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
  });

  const [borrowerInfo, setBorrowerInfo] = useState(null);
  const [bookInfo, setBookInfo] = useState(null);

  const handleBorrowerSearch = () => {
    // In real app, this would search from API
    if (formData.borrowerId) {
      setBorrowerInfo({
        id: formData.borrowerId,
        name: "Sample Borrower",
        type: formData.borrowerType,
        booksIssued: 2,
        maxBooks: formData.borrowerType === "student" ? 3 : 5,
      });
    }
  };

  const handleBookSearch = () => {
    // In real app, this would search by barcode/ISBN
    if (formData.bookBarcode) {
      setBookInfo({
        title: "Sample Book",
        author: "Sample Author",
        isbn: formData.bookBarcode,
        available: true,
      });
    }
  };

  const calculateDueDate = (issueDate, borrowerType) => {
    const date = new Date(issueDate);
    const days = borrowerType === "student" ? 14 : borrowerType === "faculty" ? 30 : 21;
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const handleIssueDateChange = (e) => {
    const newIssueDate = e.target.value;
    setFormData({
      ...formData,
      issueDate: newIssueDate,
      dueDate: calculateDueDate(newIssueDate, formData.borrowerType),
    });
  };

  const handleBorrowerTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({
      ...formData,
      borrowerType: newType,
      dueDate: calculateDueDate(formData.issueDate, newType),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!borrowerInfo) {
      showErrorMessage("Please search and select a borrower");
      return;
    }
    if (!bookInfo) {
      showErrorMessage("Please search and select a book");
      return;
    }
    if (borrowerInfo.booksIssued >= borrowerInfo.maxBooks) {
      showErrorMessage("Borrower has reached maximum book limit");
      return;
    }
    if (!bookInfo.available) {
      showErrorMessage("Book is not available");
      return;
    }
    // In real app, this would call API
    showSuccessMessage("Book issued successfully!");
    setFormData({
      borrowerId: "",
      borrowerType: "student",
      bookBarcode: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
    });
    setBorrowerInfo(null);
    setBookInfo(null);
  };

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Issue Book
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          {/* Borrower Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#525b88]" />
              <h3 className="text-lg font-semibold text-gray-800">Borrower Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Borrower Type</label>
                <select
                  value={formData.borrowerType}
                  onChange={handleBorrowerTypeChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Borrower ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.borrowerId}
                    onChange={(e) => setFormData({ ...formData, borrowerId: e.target.value })}
                    placeholder="Enter borrower ID"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleBorrowerSearch}
                    className="px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {borrowerInfo && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm"><strong>Name:</strong> {borrowerInfo.name}</p>
                <p className="text-sm"><strong>Books Issued:</strong> {borrowerInfo.booksIssued}/{borrowerInfo.maxBooks}</p>
              </div>
            )}
          </div>

          {/* Book Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[#525b88]" />
              <h3 className="text-lg font-semibold text-gray-800">Book Information</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Book Barcode / ISBN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.bookBarcode}
                  onChange={(e) => setFormData({ ...formData, bookBarcode: e.target.value })}
                  placeholder="Scan or enter barcode/ISBN"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
                <button
                  type="button"
                  onClick={handleBookSearch}
                  className="px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
                >
                  <Scan className="w-4 h-4" />
                </button>
              </div>
            </div>
            {bookInfo && (
              <div className={`mt-4 p-4 border rounded-md ${bookInfo.available ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <p className="text-sm"><strong>Title:</strong> {bookInfo.title}</p>
                <p className="text-sm"><strong>Author:</strong> {bookInfo.author}</p>
                <p className="text-sm"><strong>Status:</strong> {bookInfo.available ? "Available" : "Not Available"}</p>
              </div>
            )}
          </div>

          {/* Date Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#525b88]" />
              <h3 className="text-lg font-semibold text-gray-800">Issue Dates</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={handleIssueDateChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Issue Book
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default IssueBook;

