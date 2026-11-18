import React, { useState } from "react";
import { Save, BookOpen, Users } from "lucide-react";
import { showSuccessMessage } from "../../../config/Toast";

const IssueLimits = () => {
  const [limits, setLimits] = useState({
    student: {
      maxBooks: 3,
      issueDuration: 14,
      maxRenewals: 2,
    },
    faculty: {
      maxBooks: 5,
      issueDuration: 30,
      maxRenewals: 3,
    },
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (userType, field, value) => {
    setLimits((prev) => ({
      ...prev,
      [userType]: {
        ...prev[userType],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Save to localStorage (in real app, save to API)
    localStorage.setItem("libraryIssueLimits", JSON.stringify(limits));
    setTimeout(() => {
      setLoading(false);
      showSuccessMessage("Issue limits updated successfully");
    }, 500);
  };

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Issue Limits & Rules
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Limits */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#525b88]" />
            <h3 className="text-lg font-semibold text-gray-800">Student Limits</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Books</label>
              <input
                type="number"
                value={limits.student.maxBooks}
                onChange={(e) => handleChange("student", "maxBooks", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Duration (Days)</label>
              <input
                type="number"
                value={limits.student.issueDuration}
                onChange={(e) => handleChange("student", "issueDuration", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Renewals</label>
              <input
                type="number"
                value={limits.student.maxRenewals}
                onChange={(e) => handleChange("student", "maxRenewals", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Faculty Limits */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[#525b88]" />
            <h3 className="text-lg font-semibold text-gray-800">Faculty Limits</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Books</label>
              <input
                type="number"
                value={limits.faculty.maxBooks}
                onChange={(e) => handleChange("faculty", "maxBooks", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Duration (Days)</label>
              <input
                type="number"
                value={limits.faculty.issueDuration}
                onChange={(e) => handleChange("faculty", "issueDuration", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Renewals</label>
              <input
                type="number"
                value={limits.faculty.maxRenewals}
                onChange={(e) => handleChange("faculty", "maxRenewals", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Limits"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueLimits;

