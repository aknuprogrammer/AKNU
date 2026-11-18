import React, { useEffect, useState, useMemo } from "react";
import { BookOpen, Calendar, AlertCircle, CheckCircle, Clock, Search } from "lucide-react";
import { issuedBooksApi } from "../../services/apiService";
import { showAxiosError } from "../../config/Toast";
import { getProfileHook } from "../../Hooks/GetProfileHook";
import { getUserFromToken } from "../../ProtectedRoute";
import { studentsApi, professorsApi } from "../../services/apiService";

const MyBooks = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [borrowerType, setBorrowerType] = useState(null);
  const [borrowerId, setBorrowerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get user profile
  const { data: profileData } = getProfileHook();

  useEffect(() => {
    const identifyUser = async () => {
      try {
        // Get user from token
        const tokenUser = getUserFromToken();
        
        // Get profile data
        if (profileData) {
          console.log("Profile data:", profileData);
          
          // Try to find if user is a student
          if (profileData.email || profileData.phone) {
            try {
              // Search for student by email or phone
              const students = await studentsApi.getAll();
              const student = Array.isArray(students) 
                ? students.find(s => 
                    s.email === profileData.email || 
                    s.phone === profileData.phone ||
                    s.email === tokenUser?.email
                  )
                : null;
              
              if (student) {
                setBorrowerType("student");
                setBorrowerId(student._id);
                setUserInfo({
                  name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ") || "Student",
                  id: student.hallTicketNo || student.referenceNumber || student._id,
                  email: student.email,
                  phone: student.phone || student.altPhone,
                });
                return;
              }
            } catch (err) {
              console.log("Not a student:", err);
            }
          }

          // Try to find if user is a professor
          try {
            const professors = await professorsApi.getAll();
            const professor = Array.isArray(professors)
              ? professors.find(p => 
                  p.email === profileData.email || 
                  p.contactNumber === profileData.phone ||
                  p.email === tokenUser?.email ||
                  p.professorId === profileData.facultyId
                )
              : null;
            
            if (professor) {
              setBorrowerType("faculty");
              setBorrowerId(professor._id);
              setUserInfo({
                name: professor.name || "Professor",
                id: professor.professorId || professor._id,
                email: professor.email,
                phone: professor.contactNumber || professor.alternateContactNumber,
              });
              return;
            }
          } catch (err) {
            console.log("Not a professor:", err);
          }

          // If not found, use profile data
          setUserInfo({
            name: profileData.name || profileData.fullName || "User",
            id: profileData.id || profileData._id,
            email: profileData.email,
            phone: profileData.phone || profileData.contactNumber,
          });
        }
      } catch (err) {
        console.error("Error identifying user:", err);
        showAxiosError(err);
      }
    };

    identifyUser();
  }, [profileData]);

  // Fetch user's issued books
  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!borrowerId || !borrowerType) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await issuedBooksApi.getAll({
          borrower: borrowerId,
          borrowerType: borrowerType,
        });
        setMyBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching my books:", err);
        showAxiosError(err);
        setMyBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, [borrowerId, borrowerType]);

  // Filter books by search query
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return myBooks;
    const query = searchQuery.toLowerCase();
    return myBooks.filter(
      (book) =>
        book.book?.bookTitle?.toLowerCase().includes(query) ||
        book.book?.isbn?.toLowerCase().includes(query) ||
        book.status?.toLowerCase().includes(query)
    );
  }, [myBooks, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const currentlyIssued = myBooks.filter(
      (book) => book.status === "issued" || book.status === "overdue" || book.status === "renewed"
    );
    const overdue = myBooks.filter((book) => {
      if (book.status === "returned") return false;
      const dueDate = new Date(book.dueDate);
      return dueDate < new Date();
    });
    const totalFine = myBooks.reduce((sum, book) => sum + (book.fineAmount || 0), 0);
    const returned = myBooks.filter((book) => book.status === "returned");

    return {
      currentlyIssued: currentlyIssued.length,
      overdue: overdue.length,
      totalFine,
      totalIssued: myBooks.length,
      totalReturned: returned.length,
    };
  }, [myBooks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading your books...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent mb-2">
          My Library Books
        </h2>
        {userInfo && (
          <div className="text-sm text-gray-600">
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>ID:</strong> {userInfo.id}</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Currently Issued</p>
              <p className="text-2xl font-bold text-blue-600">{stats.currentlyIssued}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fine</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.totalFine}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Returned</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalReturned}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search books by title, ISBN, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>
      </div>

      {/* Books Table */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 mb-2">No books found</p>
          <p className="text-sm text-gray-500">
            {myBooks.length === 0
              ? "You haven't borrowed any books yet."
              : "No books match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Book Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">ISBN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Return Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Fine (₹)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Renewals</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => {
                const dueDate = new Date(book.dueDate);
                const today = new Date();
                const isOverdue = !book.returnDate && dueDate < today;
                const daysOverdue = isOverdue
                  ? Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {book.book?.bookTitle || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {book.book?.isbn || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.issueDate
                        ? new Date(book.issueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span
                          className={
                            isOverdue
                              ? "text-red-600 font-semibold"
                              : "text-gray-900"
                          }
                        >
                          {book.dueDate
                            ? new Date(book.dueDate).toLocaleDateString()
                            : "-"}
                        </span>
                        {isOverdue && (
                          <span className="text-xs text-red-500">
                            ({daysOverdue} days overdue)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.returnDate
                        ? new Date(book.returnDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          book.status === "issued"
                            ? "bg-blue-100 text-blue-800"
                            : book.status === "returned"
                            ? "bg-green-100 text-green-800"
                            : book.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : book.status === "renewed"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {book.fineAmount > 0 ? (
                        <span className="text-red-600 font-semibold">
                          ₹{book.fineAmount}
                        </span>
                      ) : (
                        <span className="text-green-600">₹0</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.renewals || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBooks;

