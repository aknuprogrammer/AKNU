import React, { useState, useMemo } from "react";
import { Download, Search, Eye } from "lucide-react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { exportToCSV } from "../../../utils/exportUtils";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";

const StudentHistoryReport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [studentHistory, setStudentHistory] = useState([
    {
      _id: "1",
      studentId: "STU2024001",
      studentName: "Rajesh Kumar",
      totalIssued: 5,
      totalReturned: 3,
      currentlyIssued: 2,
      totalFine: 0,
      lastIssueDate: "2024-01-15",
    },
  ]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return studentHistory;
    return studentHistory.filter(
      (item) =>
        item.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentHistory, searchQuery]);

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Student History Report
        </h2>
        <button 
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          onClick={() => {
            if (filteredHistory.length === 0) {
              showAxiosError(new Error("No data to export"));
              return;
            }
            const columns = [
              { key: "studentId", label: "Student ID" },
              { key: "studentName", label: "Student Name" },
              { key: "totalIssued", label: "Total Issued" },
              { key: "totalReturned", label: "Total Returned" },
              { key: "currentlyIssued", label: "Currently Issued" },
              { key: "totalFine", label: "Total Fine (₹)", format: (val) => val || 0 },
              { key: "lastIssueDate", label: "Last Issue Date", format: (val) => val ? new Date(val).toLocaleDateString() : "" },
            ];
            exportToCSV(filteredHistory, columns, "student_history");
            showSuccessMessage("Report exported successfully!");
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      <div className="flex gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
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
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Student Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Issued</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Returned</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Currently Issued</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Fine</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Last Issue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistory.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.studentId}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.studentName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalIssued}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalReturned}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentlyIssued}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.totalFine}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.lastIssueDate).toLocaleDateString()}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50">
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentHistoryReport;

