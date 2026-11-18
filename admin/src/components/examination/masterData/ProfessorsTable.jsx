import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { professorsApi, subjectsApi } from "../../../services/apiService";

const availabilityLabelMap = {
  forenoon: "Forenoon (AM)",
  afternoon: "Afternoon (PM)",
  evening: "Evening",
};

const ProfessorsTable = () => {
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch professors and subjects from API
      const [professorsData, subjectsData] = await Promise.all([
        professorsApi.getAll().catch(() => []),
        subjectsApi.getAll().catch(() => []),
      ]);

      // Filter out inactive records for dropdowns
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          if (item.status !== undefined) {
            return item.status === 'Active';
          }
          return true;
        });
      };

      setProfessors(Array.isArray(professorsData) ? professorsData : []);
      setSubjects(filterActive(Array.isArray(subjectsData) ? subjectsData : []));
      setError(null);
    } catch (err) {
      console.error("Failed to load professors", err);
      setError("Failed to load professors");
      showErrorMessage("Failed to load professors");
      setProfessors([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const subjectLookup = useMemo(() => {
    const lookup = subjects.reduce((acc, subject) => {
      acc[subject._id] = subject;
      return acc;
    }, {});
    
    // Also add subjects from professors if they're populated
    professors.forEach((prof) => {
      if (Array.isArray(prof.subjectIds)) {
        prof.subjectIds.forEach((subj) => {
          if (typeof subj === 'object' && subj._id) {
            lookup[subj._id] = subj;
          }
        });
      }
    });
    
    return lookup;
  }, [subjects, professors]);


  const sanitizeProfessor = (data) => ({
    ...data,
    name: data.name?.trim() || "",
    professorId: data.professorId?.trim() || "",
    designation: data.designation?.trim() || "",
    department: data.department?.trim() || "",
    contactNumber: data.contactNumber?.trim() || "",
    email: data.email?.trim() || "",
    alternateContactNumber: data.alternateContactNumber?.trim() || "",
    experienceYears: data.experienceYears ?? "",
    subjectIds: Array.isArray(data.subjectIds) ? data.subjectIds : [],
    availability: Array.isArray(data.availability) ? data.availability : [],
    verifiedSetter: Boolean(data.verifiedSetter),
    maxPapersPerDay: Number(data.maxPapersPerDay) || 1,
    status: data.status || "Active",
    customSubjects: typeof data.customSubjects === "string" ? data.customSubjects : "",
    notes: data.notes?.trim() || "",
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this professor?")) {
      try {
        await professorsApi.delete(id);
        const updated = professors.filter((prof) => prof._id !== id);
        setProfessors(updated);
        showSuccessMessage("Professor deleted successfully");
      } catch (err) {
        console.error("Failed to delete professor", err);
        showErrorMessage("Failed to delete professor");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (!formData.subjectIds || !formData.subjectIds.length) {
        throw new Error("Select at least one subject");
      }

      const sanitized = sanitizeProfessor(formData);

      if (editingItem) {
        await professorsApi.update(editingItem._id, sanitized);
        const updated = professors.map((prof) =>
          prof._id === editingItem._id ? { ...sanitized, _id: editingItem._id } : prof
        );
        setProfessors(updated);
        showSuccessMessage("Professor updated successfully");
      } else {
        const newProfessor = await professorsApi.create(sanitized);
        const updated = [...professors, newProfessor];
        setProfessors(updated);
        showSuccessMessage("Professor added successfully");
      }

      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      showErrorMessage(err.message || "Failed to save professor");
    }
  };

  const filteredProfessors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return professors;
    return professors.filter((prof) => {
      const name = prof.name ? prof.name.toLowerCase() : "";
      const designation = prof.designation ? prof.designation.toLowerCase() : "";
      const empId = prof.professorId ? prof.professorId.toLowerCase() : "";
      const subjectsText = (prof.subjectIds || [])
        .map((subj) => {
          // Handle populated subject object or ObjectId
          if (typeof subj === 'object' && subj._id) {
            return subj.name?.toLowerCase() || "";
          }
          return subjectLookup[subj]?.name?.toLowerCase() || "";
        })
        .join(" ");
      return (
        name.includes(query) ||
        designation.includes(query) ||
        empId.includes(query) ||
        subjectsText.includes(query)
      );
    });
  }, [professors, searchQuery, subjectLookup]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Examination Professors</h3>
          <p className="text-sm text-gray-500 mt-1">
            Maintain the roster of verified professors for question paper preparation and evaluation
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, department, or subject"
            className="w-full md:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          /> */}
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddForm(true);
            }}
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            Add Professor
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Subjects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProfessors.length ? (
              filteredProfessors.map((professor, index) => (
                <tr key={professor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {professor.professorId || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {professor.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {professor.designation || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      {professor.email && (
                        <div className="text-xs">
                          <span className="font-medium">Email:</span> {professor.email}
                        </div>
                      )}
                      {professor.contactNumber && (
                        <div className="text-xs">
                          <span className="font-medium">Phone:</span> {professor.contactNumber}
                        </div>
                      )}
                      {professor.alternateContactNumber && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Alt:</span> {professor.alternateContactNumber}
                        </div>
                      )}
                      {!professor.email && !professor.contactNumber && !professor.alternateContactNumber && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {(professor.subjectIds || [])
                      .map((subj) => {
                        // Handle populated subject object or ObjectId
                        if (typeof subj === 'object' && subj._id) {
                          return subj.name;
                        }
                        return subjectLookup[subj]?.name;
                      })
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        professor.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {professor.status || "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingItem(professor);
                        setShowAddForm(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 mr-3 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                      title="Edit"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(professor._id)}
                      className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 11c.5304 0 1.0391-.2107 1.4142-.5858C13.7893 10.0391 14 9.5304 14 9s-.2107-1.0391-.5858-1.4142C13.0391 7.2107 12.5304 7 12 7s-1.0391.2107-1.4142.5858C10.2107 7.9609 10 8.4696 10 9s.2107 1.0391.5858 1.4142C10.9609 10.7893 11.4696 11 12 11zm0 2c-.7956 0-1.5587.3161-2.1213.8787C9.3161 14.4413 9 15.2044 9 16h6c0-.7956-.3161-1.5587-.8787-2.1213C13.5587 13.3161 12.7956 13 12 13z"
                      />
                    </svg>
                    <p className="text-gray-600">No professors added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Professor" to create one</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey="professors"
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default ProfessorsTable;
