import React, { useState } from "react";
import { TrendingUp, Download, BookOpen } from "lucide-react";
import { exportToCSV } from "../../../utils/exportUtils";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";

const MostDemandedReport = () => {
  const [mostDemanded, setMostDemanded] = useState([
    { _id: "1", bookTitle: "Introduction to Computer Science", author: "John Smith", totalIssues: 45, currentlyIssued: 7, available: 3 },
    { _id: "2", bookTitle: "Data Structures and Algorithms", author: "Jane Doe", totalIssues: 38, currentlyIssued: 5, available: 3 },
    { _id: "3", bookTitle: "Machine Learning Fundamentals", author: "Sarah Williams", totalIssues: 32, currentlyIssued: 4, available: 8 },
  ]);

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Most Demanded Books Report
        </h2>
        <button 
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          onClick={() => {
            if (mostDemanded.length === 0) {
              showAxiosError(new Error("No data to export"));
              return;
            }
            const columns = [
              { key: "bookTitle", label: "Book Title" },
              { key: "author", label: "Author" },
              { key: "totalIssues", label: "Total Issues" },
              { key: "currentlyIssued", label: "Currently Issued" },
              { key: "available", label: "Available" },
            ];
            exportToCSV(mostDemanded, columns, "most_demanded_books");
            showSuccessMessage("Report exported successfully!");
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-[#525b88]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Book Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Author</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Issues</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Currently Issued</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Available</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mostDemanded.map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${index === 0 ? "bg-yellow-100 text-yellow-800" : index === 1 ? "bg-gray-100 text-gray-800" : index === 2 ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}>
                    #{index + 1}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.bookTitle}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{item.author}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalIssues}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentlyIssued}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MostDemandedReport;

