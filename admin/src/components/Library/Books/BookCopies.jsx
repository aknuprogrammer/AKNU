import React, { useEffect, useState, useMemo } from "react";
import { Search, Eye, Package, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { showSuccessMessage } from "../../../config/Toast";

const BookCopies = () => {
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState(null);

  const staticData = [
    { _id: "1", bookTitle: "Introduction to Computer Science", copyNumber: "CS001", barcode: "9780123456789-001", status: "available", condition: "good", location: "A-101", purchaseDate: "2023-01-15", price: 850 },
    { _id: "2", bookTitle: "Introduction to Computer Science", copyNumber: "CS002", barcode: "9780123456789-002", status: "issued", condition: "good", location: "A-101", purchaseDate: "2023-01-15", price: 850 },
    { _id: "3", bookTitle: "Data Structures and Algorithms", copyNumber: "DSA001", barcode: "9780123456790-001", status: "available", condition: "excellent", location: "A-102", purchaseDate: "2023-02-10", price: 1200 },
    { _id: "4", bookTitle: "Data Structures and Algorithms", copyNumber: "DSA002", barcode: "9780123456790-002", status: "damaged", condition: "poor", location: "A-102", purchaseDate: "2023-02-10", price: 1200 },
    { _id: "5", bookTitle: "Machine Learning Fundamentals", copyNumber: "ML001", barcode: "9780123456792-001", status: "available", condition: "good", location: "A-103", purchaseDate: "2023-03-05", price: 1800 },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCopies(staticData);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCopies = useMemo(() => {
    let filtered = [...copies];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.copyNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    return filtered;
  }, [copies, searchQuery, filterStatus]);

  const getStatusBadge = (status) => {
    const badges = {
      available: "bg-green-100 text-green-800",
      issued: "bg-blue-100 text-blue-800",
      damaged: "bg-red-100 text-red-800",
      lost: "bg-gray-100 text-gray-800",
      reserved: "bg-yellow-100 text-yellow-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getConditionBadge = (condition) => {
    const badges = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    };
    return badges[condition] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading book copies...</div>
      </div>
    );
  }

  return (
    <>
      <div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by book title, copy number, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="issued">Issued</option>
            <option value="damaged">Damaged</option>
            <option value="lost">Lost</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Book Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Copy Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Barcode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCopies.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.bookTitle}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.copyNumber}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{item.barcode}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getConditionBadge(item.condition)}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCopy(item);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="text-[#525b88] hover:text-[#3a4166]"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCopies.length === 0 && (
          <div className="text-center py-8 text-gray-500">No book copies found</div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedCopy && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Book Copy Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700">Book Title:</label><p className="text-sm text-gray-900 mt-1">{selectedCopy.bookTitle}</p></div>
                <div><label className="text-sm font-medium text-gray-700">Copy Number:</label><p className="text-sm text-gray-900 mt-1">{selectedCopy.copyNumber}</p></div>
                <div><label className="text-sm font-medium text-gray-700">Barcode:</label><p className="text-sm text-gray-900 mt-1 font-mono">{selectedCopy.barcode}</p></div>
                <div><label className="text-sm font-medium text-gray-700">Status:</label><span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedCopy.status)} mt-1 inline-block`}>{selectedCopy.status}</span></div>
                <div><label className="text-sm font-medium text-gray-700">Condition:</label><span className={`px-2 py-1 rounded-full text-xs ${getConditionBadge(selectedCopy.condition)} mt-1 inline-block`}>{selectedCopy.condition}</span></div>
                <div><label className="text-sm font-medium text-gray-700">Location:</label><p className="text-sm text-gray-900 mt-1">{selectedCopy.location}</p></div>
                <div><label className="text-sm font-medium text-gray-700">Purchase Date:</label><p className="text-sm text-gray-900 mt-1">{selectedCopy.purchaseDate}</p></div>
                <div><label className="text-sm font-medium text-gray-700">Price:</label><p className="text-sm text-gray-900 mt-1">₹{selectedCopy.price}</p></div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default BookCopies;

