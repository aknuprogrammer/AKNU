import React, { useEffect, useState } from "react";
import { Save, DollarSign, Clock, AlertCircle, Users, BookOpen, Settings, Edit2, Building2 } from "lucide-react";
import { showSuccessMessage, showAxiosError } from "../../config/Toast";
import { libraryRulesApi, libraryInfoApi } from "../../services/apiService";
import { createPortal } from "react-dom";
import { PencilIcon } from "@heroicons/react/24/outline";

const FineRules = () => {
  const [libraries, setLibraries] = useState([]);
  const [libraryRules, setLibraryRules] = useState({}); // Map of libraryId -> rules
  const [fetching, setFetching] = useState(true);
  const [editingLibrary, setEditingLibrary] = useState(null);
  const [editingRules, setEditingRules] = useState(null);
  const [saving, setSaving] = useState(false);

  // Default rules structure
  const getDefaultRules = () => ({
    issueDuration: {
      student: 14,
      faculty: 30,
    },
    finePerDay: {
      student: 5,
      faculty: 2,
    },
    maxRenewals: {
      student: 2,
      faculty: 3,
    },
    maxBooksLimit: {
      student: 3,
      faculty: 5,
    },
    lostBookCharge: {
      percentage: 150,
      fixedAmount: 500,
      usePercentage: true,
    },
    damagedBookCharge: {
      percentage: 50,
      fixedAmount: 200,
      usePercentage: true,
    },
    gracePeriod: 3,
    fineCap: 500,
  });

  // Fetch all libraries and their rules
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        
        // Fetch all libraries
        const librariesData = await libraryInfoApi.getAll();
        const librariesList = Array.isArray(librariesData) ? librariesData : [];
        setLibraries(librariesList);

        // Fetch rules for each library
        const rulesMap = {};
        const fetchPromises = librariesList.map(async (library) => {
          try {
            const rulesData = await libraryRulesApi.getActive({ library: library._id });
            // Remove staff if exists and isDefault flag
            if (rulesData.issueDuration?.staff) delete rulesData.issueDuration.staff;
            if (rulesData.finePerDay?.staff) delete rulesData.finePerDay.staff;
            if (rulesData.maxRenewals?.staff) delete rulesData.maxRenewals.staff;
            if (rulesData.maxBooksLimit?.staff) delete rulesData.maxBooksLimit.staff;
            if (rulesData.isDefault) delete rulesData.isDefault;
            
            rulesMap[library._id] = rulesData;
          } catch (err) {
            console.error(`Error fetching rules for library ${library._id}:`, err);
            // Use default rules if fetch fails
            rulesMap[library._id] = { ...getDefaultRules(), library: library._id, isDefault: true };
          }
        });

        await Promise.all(fetchPromises);
        setLibraryRules(rulesMap);
      } catch (err) {
        console.error("Error fetching data:", err);
        showAxiosError(err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (library) => {
    const rules = libraryRules[library._id] || { ...getDefaultRules(), library: library._id };
    setEditingLibrary(library);
    setEditingRules({ ...rules });
  };

  const handleChange = (path, value) => {
    const keys = path.split(".");
    setEditingRules((prev) => {
      const newRules = { ...prev };
      let current = newRules;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newRules;
    });
  };

  const handleSave = async () => {
    if (!editingLibrary || !editingRules) return;

    setSaving(true);
    try {
      await libraryRulesApi.createOrUpdate({
        ...editingRules,
        library: editingLibrary._id,
      });
      
      // Update local state
      setLibraryRules((prev) => ({
        ...prev,
        [editingLibrary._id]: editingRules,
      }));
      
      showSuccessMessage("Library rules updated successfully");
      setEditingLibrary(null);
      setEditingRules(null);
    } catch (err) {
      console.error("Error saving library rules:", err);
      showAxiosError(err);
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading library rules...</div>
      </div>
    );
  }

  if (libraries.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 mb-2">No libraries found</p>
          <p className="text-sm text-gray-500">
            Please create a library first before setting up rules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Library Rules & Fine Configuration
          </h2>
        </div>

        {/* Library Rules Cards */}
        <div className="space-y-6">
          {libraries.map((library) => {
            const rules = libraryRules[library._id] || getDefaultRules();
            const isDefault = !libraryRules[library._id] || libraryRules[library._id]?.isDefault;

            return (
              <div
                key={library._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Library Header */}
                <div className="bg-gradient-to-r from-[#525b88] to-[#3a4377] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-white" />
                    <div>
                      <h3 className="text-white font-semibold text-lg">{library.name}</h3>
                      <p className="text-white/80 text-sm">{library.libraryCode}</p>
                    </div>
                    {isDefault && (
                      <span className="ml-3 px-2 py-1 bg-yellow-500/20 text-yellow-200 text-xs rounded">
                        Using Default Rules
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEdit(library)}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                    title="Edit Rules"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">Edit Rules</span>
                  </button>
                </div>

                {/* Rules Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student Rules Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h4 className="text-md font-semibold text-blue-900">Student Rules</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Max Books:</span>
                          <span className="text-sm font-semibold text-gray-900">{rules.maxBooksLimit?.student || 3}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Issue Duration:</span>
                          <span className="text-sm font-semibold text-gray-900">{rules.issueDuration?.student || 14} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Max Renewals:</span>
                          <span className="text-sm font-semibold text-gray-900">{rules.maxRenewals?.student || 2}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                          <span className="text-sm text-gray-700">Fine Per Day:</span>
                          <span className="text-sm font-semibold text-blue-700">₹{rules.finePerDay?.student || 5}</span>
                        </div>
                      </div>
                    </div>

                    {/* Faculty Rules Section */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        <h4 className="text-md font-semibold text-purple-900">Faculty Rules</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Max Books:</span>
                          <span className="text-sm font-semibold text-gray-900">{rules.maxBooksLimit?.faculty || 5}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Issue Duration:</span>
                          <span className="text-sm font-semibold text-gray-900">{rules.issueDuration?.faculty || 30} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Max Renewals:</span>
                          <span className="text-sm font-semibold text-gray-900">{rules.maxRenewals?.faculty || 3}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-purple-200 pt-2">
                          <span className="text-sm text-gray-700">Fine Per Day:</span>
                          <span className="text-sm font-semibold text-purple-700">₹{rules.finePerDay?.faculty || 2}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Common Settings */}
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5 text-green-600" />
                      <h4 className="text-md font-semibold text-green-900">Common Settings</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Grace Period:</span>
                        <span className="text-sm font-semibold text-gray-900">{rules.gracePeriod || 3} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Fine Cap:</span>
                        <span className="text-sm font-semibold text-green-700">₹{rules.fineCap || 500}</span>
                      </div>
                      <div className="flex justify-between items-center col-span-2">
                        <span className="text-sm text-gray-700">Lost Book Charge:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {rules.lostBookCharge?.usePercentage !== false
                            ? `${rules.lostBookCharge?.percentage || 150}% of book price`
                            : `₹${rules.lostBookCharge?.fixedAmount || 500}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center col-span-2">
                        <span className="text-sm text-gray-700">Damaged Book Charge:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {rules.damagedBookCharge?.usePercentage !== false
                            ? `${rules.damagedBookCharge?.percentage || 50}% of book price`
                            : `₹${rules.damagedBookCharge?.fixedAmount || 200}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editingLibrary && editingRules && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525b88] to-[#3a4377]">
              <h3 className="text-lg font-semibold text-white">
                Edit Rules - {editingLibrary.name}
              </h3>
              <button
                onClick={() => {
                  setEditingLibrary(null);
                  setEditingRules(null);
                }}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Issue Limits Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Issue Limits</h4>
                
                {/* Student Limits */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#525b88]" />
                    <h5 className="text-sm font-semibold text-gray-700">Student Limits</h5>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Books</label>
                      <input
                        type="number"
                        value={editingRules.maxBooksLimit?.student || 3}
                        onChange={(e) => handleChange("maxBooksLimit.student", parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        value={editingRules.issueDuration?.student || 14}
                        onChange={(e) => handleChange("issueDuration.student", parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Renewals</label>
                      <input
                        type="number"
                        value={editingRules.maxRenewals?.student || 2}
                        onChange={(e) => handleChange("maxRenewals.student", parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Faculty Limits */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-[#525b88]" />
                    <h5 className="text-sm font-semibold text-gray-700">Faculty Limits</h5>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Books</label>
                      <input
                        type="number"
                        value={editingRules.maxBooksLimit?.faculty || 5}
                        onChange={(e) => handleChange("maxBooksLimit.faculty", parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        value={editingRules.issueDuration?.faculty || 30}
                        onChange={(e) => handleChange("issueDuration.faculty", parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Renewals</label>
                      <input
                        type="number"
                        value={editingRules.maxRenewals?.faculty || 3}
                        onChange={(e) => handleChange("maxRenewals.faculty", parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fine Configuration */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Fine Configuration</h4>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-[#525b88]" />
                    <h5 className="text-sm font-semibold text-gray-700">Fine Per Day (₹)</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Student</label>
                      <input
                        type="number"
                        value={editingRules.finePerDay?.student || 5}
                        onChange={(e) => handleChange("finePerDay.student", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Faculty</label>
                      <input
                        type="number"
                        value={editingRules.finePerDay?.faculty || 2}
                        onChange={(e) => handleChange("finePerDay.faculty", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Lost/Damaged Book Charges */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Lost / Damaged Book Charges</h5>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Lost Book Charge</label>
                      <div className="flex items-center gap-3 mb-2">
                        <label className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            checked={editingRules.lostBookCharge?.usePercentage !== false}
                            onChange={() => handleChange("lostBookCharge.usePercentage", true)}
                            className="text-[#525b88]"
                          />
                          <span className="text-xs">Percentage</span>
                        </label>
                        <label className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            checked={editingRules.lostBookCharge?.usePercentage === false}
                            onChange={() => handleChange("lostBookCharge.usePercentage", false)}
                            className="text-[#525b88]"
                          />
                          <span className="text-xs">Fixed Amount</span>
                        </label>
                      </div>
                      {editingRules.lostBookCharge?.usePercentage !== false ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingRules.lostBookCharge?.percentage || 150}
                            onChange={(e) => handleChange("lostBookCharge.percentage", parseFloat(e.target.value) || 0)}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-xs text-gray-600">% of book price</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">₹</span>
                          <input
                            type="number"
                            value={editingRules.lostBookCharge?.fixedAmount || 500}
                            onChange={(e) => handleChange("lostBookCharge.fixedAmount", parseFloat(e.target.value) || 0)}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Damaged Book Charge</label>
                      <div className="flex items-center gap-3 mb-2">
                        <label className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            checked={editingRules.damagedBookCharge?.usePercentage !== false}
                            onChange={() => handleChange("damagedBookCharge.usePercentage", true)}
                            className="text-[#525b88]"
                          />
                          <span className="text-xs">Percentage</span>
                        </label>
                        <label className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            checked={editingRules.damagedBookCharge?.usePercentage === false}
                            onChange={() => handleChange("damagedBookCharge.usePercentage", false)}
                            className="text-[#525b88]"
                          />
                          <span className="text-xs">Fixed Amount</span>
                        </label>
                      </div>
                      {editingRules.damagedBookCharge?.usePercentage !== false ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingRules.damagedBookCharge?.percentage || 50}
                            onChange={(e) => handleChange("damagedBookCharge.percentage", parseFloat(e.target.value) || 0)}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-xs text-gray-600">% of book price</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">₹</span>
                          <input
                            type="number"
                            value={editingRules.damagedBookCharge?.fixedAmount || 200}
                            onChange={(e) => handleChange("damagedBookCharge.fixedAmount", parseFloat(e.target.value) || 0)}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-[#525b88]" />
                    <h5 className="text-sm font-semibold text-gray-700">Additional Settings</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Grace Period (Days)</label>
                      <input
                        type="number"
                        value={editingRules.gracePeriod || 3}
                        onChange={(e) => handleChange("gracePeriod", parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fine Cap (₹)</label>
                      <input
                        type="number"
                        value={editingRules.fineCap || 500}
                        onChange={(e) => handleChange("fineCap", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => {
                  setEditingLibrary(null);
                  setEditingRules(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Rules"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FineRules;
