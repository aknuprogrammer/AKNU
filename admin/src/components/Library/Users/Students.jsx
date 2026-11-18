import React, { useEffect, useState, useMemo } from "react";
import { Search, User, BookOpen, AlertCircle, Eye } from "lucide-react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";
import { studentsApi, issuedBooksApi } from "../../../services/apiService";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentIssuedBooks, setStudentIssuedBooks] = useState({}); // Map of studentId -> issued books

  // Fetch students and their issued books
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all students
        const studentsData = await studentsApi.getAll();
        const studentsList = Array.isArray(studentsData) ? studentsData : [];
        
        // Fetch issued books for all students in parallel
        const issuedBooksMap = {};
        const fetchPromises = studentsList.map(async (student) => {
          try {
            const issuedBooks = await issuedBooksApi.getAll({ 
              borrower: student._id, 
              borrowerType: "student" 
            });
            issuedBooksMap[student._id] = Array.isArray(issuedBooks) ? issuedBooks : [];
          } catch (err) {
            console.error(`Error fetching issued books for student ${student._id}:`, err);
            issuedBooksMap[student._id] = [];
          }
        });
        
        await Promise.all(fetchPromises);
        
        setStudents(studentsList);
        setStudentIssuedBooks(issuedBooksMap);
      } catch (err) {
        console.error("Error fetching students:", err);
        showAxiosError(err);
        setStudents([]);
        setStudentIssuedBooks({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics for each student
  const studentsWithStats = useMemo(() => {
    return students.map((student) => {
      const issuedBooks = studentIssuedBooks[student._id] || [];
      const currentlyIssued = issuedBooks.filter(
        (book) => book.status === "issued" || book.status === "overdue" || book.status === "renewed"
      );
      const returned = issuedBooks.filter((book) => book.status === "returned");
      const totalFine = issuedBooks.reduce((sum, book) => sum + (book.fineAmount || 0), 0);
      const lastIssueDate = issuedBooks.length > 0 
        ? issuedBooks.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))[0]?.issueDate 
        : null;

      // Get student name from firstName, middleName, lastName
      const fullName = [student.firstName, student.middleName, student.lastName]
        .filter(Boolean)
        .join(" ");

      // Get course information from courseStreamMappingId
      const courseMapping = student.courseStreamMappingId;
      const courseName = courseMapping?.courseId?.name || "N/A";
      const courseCode = courseMapping?.courseId?.code || "";
      const streamName = courseMapping?.streamId?.name || "";
      const semesterNumber = courseMapping?.semesterNumber || null;
      
      // Format course display: "Course Name (Code)" or "Course Name - Stream (Code)"
      let courseDisplay = courseName;
      if (streamName) {
        courseDisplay = `${courseName} - ${streamName}`;
      }
      if (courseCode) {
        courseDisplay += ` (${courseCode})`;
      }
      
      // Format year/semester: "1st Year - 1st Semester" or batch name
      let yearDisplay = student.batch?.code || student.batch?.name || "N/A";
      if (semesterNumber) {
        const year = Math.ceil(semesterNumber / 2);
        const semesterInYear = ((semesterNumber - 1) % 2) + 1;
        const yearOrdinal = year === 1 ? "1st" : year === 2 ? "2nd" : year === 3 ? "3rd" : `${year}th`;
        const semesterOrdinal = semesterInYear === 1 ? "1st" : semesterInYear === 2 ? "2nd" : `${semesterInYear}th`;
        yearDisplay = `${yearOrdinal} Year - ${semesterOrdinal} Semester`;
      }

      return {
        ...student,
        name: fullName || "N/A",
        studentId: student.hallTicketNo || student.referenceNumber || student._id,
        email: student.email || "N/A",
        phone: student.phone || student.altPhone || "N/A",
        course: courseDisplay,
        courseName: courseName,
        courseCode: courseCode,
        streamName: streamName,
        semesterNumber: semesterNumber,
        year: yearDisplay,
        booksIssued: currentlyIssued.length,
        maxBooks: 3, // Default max books for students
        fineAmount: totalFine,
        totalIssued: issuedBooks.length,
        totalReturned: returned.length,
        currentlyIssued: currentlyIssued.length,
        lastIssueDate: lastIssueDate,
        history: issuedBooks.map((book) => ({
          _id: book._id,
          bookTitle: book.book?.bookTitle || "N/A",
          isbn: book.book?.isbn || "N/A",
          issueDate: book.issueDate,
          dueDate: book.dueDate,
          returnDate: book.returnDate || null,
          status: book.status,
          fineAmount: book.fineAmount || 0,
          renewals: book.renewals || 0,
        })),
      };
    });
  }, [students, studentIssuedBooks]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return studentsWithStats;
    return studentsWithStats.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentsWithStats, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading students...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Students Management
          </h2>
        </div>

        <div className="flex gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Books Issued</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Issued</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Fine (₹)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.studentId}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.course}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.year}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.booksIssued >= item.maxBooks ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                      {item.booksIssued}/{item.maxBooks}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalIssued || 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.fineAmount > 0 ? (
                      <span className="text-red-600 font-semibold">₹{item.fineAmount}</span>
                    ) : (
                      <span className="text-green-600">₹0</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(item);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedStudent && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Student Details & History</h3>
              <button onClick={() => setShowViewModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Student Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Student Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-gray-700">Student ID:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.studentId}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Name:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.name}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Email:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.email}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Phone:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.phone}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Course:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.course}</p></div>
                  {selectedStudent.streamName && (
                    <div><label className="text-sm font-medium text-gray-700">Stream:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.streamName}</p></div>
                  )}
                  <div><label className="text-sm font-medium text-gray-700">Year/Semester:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.year}</p></div>
                  {selectedStudent.courseCode && (
                    <div><label className="text-sm font-medium text-gray-700">Course Code:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.courseCode}</p></div>
                  )}
                </div>
              </div>

              {/* Library Statistics */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Library Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-gray-700">Currently Issued:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.booksIssued}/{selectedStudent.maxBooks}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Total Books Issued:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.totalIssued || 0}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Total Books Returned:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.totalReturned || 0}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Total Fine:</label><p className="text-sm text-gray-900 mt-1">₹{selectedStudent.fineAmount || 0}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Last Issue Date:</label><p className="text-sm text-gray-900 mt-1">{selectedStudent.lastIssueDate ? new Date(selectedStudent.lastIssueDate).toLocaleDateString() : "-"}</p></div>
                </div>
              </div>

              {/* Borrowing History */}
              {selectedStudent.history && selectedStudent.history.length > 0 ? (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Borrowing History ({selectedStudent.history.length} books)</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Book Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">ISBN</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Issue Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Due Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Return Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fine (₹)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Renewals</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedStudent.history.map((record) => {
                          const dueDate = new Date(record.dueDate);
                          const today = new Date();
                          const isOverdue = !record.returnDate && dueDate < today;
                          const daysOverdue = isOverdue ? Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)) : 0;
                          
                          return (
                            <tr key={record._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">{record.bookTitle}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{record.isbn}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {record.issueDate ? new Date(record.issueDate).toLocaleDateString() : "-"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <div className="flex flex-col">
                                  <span className={isOverdue ? "text-red-600 font-semibold" : "text-gray-900"}>
                                    {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "-"}
                                  </span>
                                  {isOverdue && (
                                    <span className="text-xs text-red-500">({daysOverdue} days overdue)</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : "-"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  record.status === "issued" ? "bg-blue-100 text-blue-800" :
                                  record.status === "returned" ? "bg-green-100 text-green-800" :
                                  record.status === "overdue" ? "bg-red-100 text-red-800" :
                                  record.status === "renewed" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {record.fineAmount > 0 ? (
                                  <span className="text-red-600 font-semibold">₹{record.fineAmount}</span>
                                ) : (
                                  <span className="text-green-600">₹0</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.renewals || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No borrowing history available</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Students;

