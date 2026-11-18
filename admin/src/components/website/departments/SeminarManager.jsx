import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
import { departmentSeminarApi } from "../../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

// Initial list of COLLEGES and DEPARTMENTS
const INITIAL_COLLEGES = {
  "University College of Arts & Commerce": [
    "Commerce & Management Studies", "Economics", "English", "Political Science", "Social Work", "Telugu"
  ],
  "University College of Science & Technology": [
    "Aquaculture", "Biochemistry", "Biotechnology", "Botany", "Chemistry", "Food Science and Technology", "Geo Sciences", "Mathematics", "Physics", "Zoology"
  ],
  "University College of Engineering": [
    "Civil Engineering", "Computer Science and Engineering", "Electronics and Communication Engineering", "Electronics and Instrumentation Engineering", "Mechanical Engineering", "Science and Humanities"
  ],
  "University College of Education": [
    "Education"
  ],
  "Tadepalligudem Campus": [
    "Commerce and Management", "Chemistry", "Physics", "Pharmaceutical Sciences"
  ],
  "Kakinada Campus": [
    "English", "Political Science & Public Administration", "Commerce & Management Studies", "Computer Science", "Economics", "Mathematics"
  ]
};

// Searchable and Creatable Dropdown Component
function SearchableCreatableSelect({ label, options = [], value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setSearch(value || "");
    }
  }, [value, isFocused]);

  const filteredOptions = options.filter(opt =>
    (opt || "").toLowerCase().includes(search.toLowerCase())
  );

  const showCreateOption = search && !options.some(opt => (opt || "").toLowerCase() === search.toLowerCase());

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-300 rounded p-2 pr-8 focus:ring-[#525B88] focus:border-[#525B88] text-sm"
          value={search}
          placeholder={placeholder}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
              setIsOpen(false);
            }, 250);
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
          }}
        />
        <div className="absolute right-2 top-2.5 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 block"
              onMouseDown={() => {
                onChange(opt);
                setSearch(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
          {showCreateOption && (
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-100 block"
              onMouseDown={() => {
                onChange(search);
                setIsOpen(false);
              }}
            >
              + Add custom: "{search}"
            </button>
          )}
          {filteredOptions.length === 0 && !showCreateOption && (
            <div className="px-4 py-2 text-sm text-gray-500">No options found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SeminarManager() {
  const [dynamicColleges, setDynamicColleges] = useState(INITIAL_COLLEGES);
  const [seminars, setSeminars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const initialFormState = { majorEvent: "", period: "", note: "" };
  const [formData, setFormData] = useState(initialFormState);
  
  // Separate college/department state for the modal form
  const [formCollege, setFormCollege] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const data = await departmentSeminarApi.getAll(); // fetch all seminars
      setSeminars(data || []);

      // Rebuild college options + metadata dynamically
      const merged = { ...INITIAL_COLLEGES };
      data.forEach(s => {
        if (s.college) {
          if (!merged[s.college]) {
            merged[s.college] = [];
          }
          if (s.department && !merged[s.college].includes(s.department)) {
            merged[s.college].push(s.department);
          }
        }
      });
      setDynamicColleges(merged);
    } catch (err) {
      showErrorMessage("Failed to fetch seminars");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setFormData(initialFormState);
    setFormCollege("");
    setFormDepartment("");
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({ majorEvent: item.majorEvent, period: item.period, note: item.note || "" });
    setFormCollege(item.college || "");
    setFormDepartment(item.department || "");
    setEditId(item._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await departmentSeminarApi.delete(id);
        showSuccessMessage("Event deleted successfully");
        fetchSeminars();
      } catch (err) {
        showErrorMessage("Failed to delete event");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formCollege || !formDepartment) {
      showErrorMessage("College and Department are required!");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData, college: formCollege, department: formDepartment };
      
      if (isEditing) {
        await departmentSeminarApi.update(editId, payload);
        showSuccessMessage("Event updated successfully!");
      } else {
        await departmentSeminarApi.create(payload);
        showSuccessMessage("Event added successfully!");
      }
      
      setShowModal(false);
      fetchSeminars();
    } catch (err) {
      showErrorMessage(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const safeIncludes = (value, search) => {
    if (!value || !search) return false;
    return String(value).toLowerCase().includes(search.toLowerCase());
  };

  const filteredSeminars = seminars.filter((s) => {
    if (!searchTerm) return true;
    return (
      safeIncludes(s.college, searchTerm) ||
      safeIncludes(s.department, searchTerm) ||
      safeIncludes(s.majorEvent, searchTerm) ||
      safeIncludes(s.period, searchTerm) ||
      safeIncludes(s.note, searchTerm)
    );
  });

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">Seminars / Workshops / Conferences</h1>
          <p className="text-sm text-gray-500 mt-1">Manage departmental events</p>
        </div>
        <button
          onClick={openModal}
          className="flex cursor-pointer items-center px-4 py-1.5 bg-[#525B88] text-white hover:bg-[#434b70] transition-all shadow-md"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Event
        </button>
      </div>

      {/* SEARCH FIELD */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by College, Department, Event / Programmes or Period"
            className="w-[45%] pl-10 border-2 border-gray-100 p-2 focus:outline-none focus:border-teal-500 transition-colors rounded-md shadow-sm text-sm"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-[#f5f5f5]">
            <tr>
              <th className="px-6 py-3 border-b text-sm font-semibold text-gray-700">S. No</th>
              <th className="px-6 py-3 border-b text-sm font-semibold text-gray-700">College</th>
              <th className="px-6 py-3 border-b text-sm font-semibold text-gray-700">Department</th>
              <th className="px-6 py-3 border-b text-sm font-semibold text-gray-700">Major Event / Programmes</th>
              <th className="px-6 py-3 border-b text-sm font-semibold text-gray-700">Period / Date</th>
              <th className="px-6 py-3 border-b text-sm font-semibold text-gray-700">Note</th>
              <th className="px-6 py-3 border-b text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && filteredSeminars.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : filteredSeminars.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No events found.</td></tr>
            ) : (
              filteredSeminars.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b text-sm">{index + 1}</td>
                  <td className="px-6 py-4 border-b text-sm max-w-[200px] truncate" title={item.college}>{item.college}</td>
                  <td className="px-6 py-4 border-b text-sm max-w-[200px] truncate" title={item.department}>{item.department}</td>
                  <td className="px-6 py-4 border-b text-sm max-w-[250px] truncate" title={item.majorEvent}>{item.majorEvent}</td>
                  <td className="px-6 py-4 border-b text-sm whitespace-nowrap">{item.period}</td>
                  <td className="px-6 py-4 border-b text-sm text-gray-500 max-w-[150px] truncate" title={item.note || '-'}>{item.note || '-'}</td>
                  <td className="px-6 py-4 border-b text-sm">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setViewingItem(item)} 
                        className="text-gray-500 cursor-pointer hover:text-gray-800 transition-colors p-1"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors p-1"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        className="text-red-500 cursor-pointer hover:text-red-700 transition-colors p-1"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#525B88]">{isEditing ? "Edit Event" : "Add New Event"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <SearchableCreatableSelect
                    label="College / Campus"
                    options={Object.keys(dynamicColleges)}
                    value={formCollege}
                    onChange={(val) => {
                      setFormCollege(val);
                      if (dynamicColleges[val] && dynamicColleges[val].length > 0) {
                        setFormDepartment(dynamicColleges[val][0]);
                      } else {
                        setFormDepartment("");
                      }
                    }}
                    placeholder="Select or type College"
                  />
                </div>
                <div>
                  <SearchableCreatableSelect
                    label="Department"
                    options={dynamicColleges[formCollege] || []}
                    value={formDepartment}
                    onChange={(val) => setFormDepartment(val)}
                    placeholder="Select or type Department"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Major Event / Programmes *</label>
                <textarea
                  required
                  className="w-full border border-gray-300 rounded p-2 focus:ring-[#525B88] focus:border-[#525B88] text-sm"
                  value={formData.majorEvent}
                  onChange={(e) => setFormData({ ...formData, majorEvent: e.target.value })}
                  rows={3}
                  placeholder="e.g. National Seminar on AI"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Period / Date *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded p-2 focus:ring-[#525B88] focus:border-[#525B88] text-sm"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="e.g. 10th - 12th Aug 2024"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 focus:ring-[#525B88] focus:border-[#525B88] text-sm"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  placeholder="Any additional details..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#525B88] text-white rounded hover:bg-[#434b70] disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAIL MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#525B88]">Event Details</h2>
              <button 
                onClick={() => setViewingItem(null)} 
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="border-b pb-2 mb-3 text-md  text-gray-700">Department Details</h3>
                <p className="text-sm text-gray-600 mb-2">College / Campus: {viewingItem.college}</p>
                <p className="text-sm text-gray-600">Department: {viewingItem.department}</p>
              </div>
              <div>
                <h3 className="border-b pb-2 mb-3 text-md font-semibold text-gray-700">Event Info</h3>
                <p className="text-sm text-gray-600">Period / Date: {viewingItem.period}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="border-b pb-2 mb-3 text-md font-semibold text-gray-700">Major Event / Programmes</h3>
              <p className="bg-gray-50 p-4 rounded text-sm text-gray-600 whitespace-pre-wrap border border-gray-100">
                {viewingItem.majorEvent}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="border-b pb-2 mb-3 text-md font-semibold text-gray-700">Note</h3>
              <p className="bg-gray-50 p-4 rounded text-sm text-gray-600 whitespace-pre-wrap border border-gray-100">
                {viewingItem.note || "No notes added."}
              </p>
            </div>

            <div className="flex justify-end mt-8 pt-4 border-t">
              <button
                onClick={() => setViewingItem(null)}
                className="px-6 cursor-pointer py-2 bg-[#525B88] text-white rounded hover:bg-[#434b70] transition-colors shadow-sm font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
