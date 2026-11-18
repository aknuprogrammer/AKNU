import React, { useState, useEffect } from "react";
import { admissionFeesApi } from "../../../services/apiService";
import AddFormModal from "./AddFormModal";

const AdmissionFees = () => {
  const [fees, setFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({
    campusId: "",
    courseId: "",
    mode: "",
    years: [
      {
        year: 1,
        fees: [{ feeType: "", feeAmount: 0, remarks: "" }],
      },
    ],
  });

  // 🔍 Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [expandedRow, setExpandedRow] = useState(null);

  // 🔍 Reusable fetch
  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesData, coursesData] = await Promise.all([
        admissionFeesApi.getAll(),
        Promise.resolve([
          { _id: "1", name: "Computer Science", code: "CS101" },
        ]),
      ]);
      setFees(feesData);
      setCourses(coursesData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this fee structure?")) {
      try {
        await admissionFeesApi.delete(id);
        await fetchData(); // ✅ refresh after delete
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    // e.preventDefault();
    try {
      // Clean empty fee entries
      const cleanedFormData = {
        ...formData,
        years: formData.years.map((year) => ({
          ...year,
          fees: year.fees.filter(
            (f) =>
              f.feeType?.trim() !== "" || // keep if feeType entered
              Number(f.feeAmount) > 0 || // OR feeAmount > 0
              f.remarks?.trim() !== "" // OR remarks entered
          ),
        })),
      };

      if (editingFee) {
        const updatedFee = await admissionFeesApi.update(
          editingFee._id,
          formData
        );
        await fetchData();
      } else {
        const newFee = await admissionFeesApi.create(formData);
        setFees([...fees, newFee]);
      }
      await fetchData();
      setShowAddForm(false);
      setEditingFee(null);
      // Reset form
      setFormData({
        courseId: "",
        campusId: "",
        mode: "",
        years: [
          {
            year: 1,
            fees: [{ feeType: "", feeAmount: 0, remarks: "" }],
          },
        ],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Apply filters
  const filteredFees = Array.isArray(fees)
    ? fees.filter((fee) => {
        const matchesSearch =
          searchQuery === "" ||
          fee.courseName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          categoryFilter === "All" || fee.category === categoryFilter;

        const matchesMode = modeFilter === "All" || fee.mode === modeFilter;

        return matchesSearch && matchesCategory && matchesMode;
      })
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mx-auto mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admission Fee Structures
            </h1>
            {/* <p className="text-gray-600 mt-1">
              Manage and view all course fee structures
            </p> */}
          </div>
          <button
            onClick={() => {
              setEditingFee(null);
              setShowAddForm(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Fee Structure
          </button>
        </div>

        {/* 🔍 Filters */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Course
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="All">All Categories</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode
            </label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="All">All Modes</option>
              <option value="Regular">Regular</option>
              <option value="Self-Finance">Self-Finance</option>
            </select>
          </div>
        </div> */}
      </div>

      {/* Results Counter */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 text-sm">
          Showing <span className="font-semibold">{filteredFees.length}</span>{" "}
          of <span className="font-semibold">{fees.length}</span> fee structures
        </p>
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Campus
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Course
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mode
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Fees
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <React.Fragment key={fee._id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setExpandedRow(
                          expandedRow === fee._id ? null : fee._id
                        );
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold text-gray-800">
                          {fee.campusId?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {fee.courseName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {fee.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹
                        {(fee.years?.[0]?.fees || []).reduce(
                          (sum, f) => sum + (f.feeAmount || 0),
                          0
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-emerald-600 hover:text-emerald-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFee(fee);
                              setFormData({
                                courseId: fee.courseId,
                                category: fee.category,
                                mode: fee.mode,
                                years: fee.years,
                              });
                              setShowAddForm(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(fee._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedRow === fee._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {fee.years.map((y) => (
                              <div
                                key={y.year}
                                className="bg-white p-4 rounded-lg border border-gray-200"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <h5 className="font-medium text-gray-800">
                                    Year {y.year}
                                  </h5>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    ₹
                                    {(y.fees || [])
                                      .filter(
                                        (f) => f.feeType && f.feeAmount > 0
                                      )
                                      .reduce(
                                        (sum, f) => sum + (f.feeAmount || 0),
                                        0
                                      )}
                                  </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                  {(y.fees || [])
                                    .filter((f) => f.feeType && f.feeAmount > 0) // ✅ only valid fees
                                    .map((f) => (
                                      <div
                                        key={f._id || f.feeType}
                                        className="flex justify-between"
                                      >
                                        <span className="text-gray-600">
                                          {f.feeType}:
                                        </span>
                                        <span className="font-medium">
                                          ₹{f.feeAmount}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    {/* Empty state */}
                    No fee structures found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <>
          <AddFormModal
            tabKey="admissionFees"
            initialData={editingFee}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setShowAddForm(false);
              setEditingAllotment(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default AdmissionFees;
