import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { syllabusApi } from "../../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";
import SyllabusTable from "./SyllabusTable";
import SyllabusModal from "./SyllabusModal";

export default function SyllabusManager() {
  const tabs = [
    { id: "UG", name: "UG Syllabus" },
    { id: "PG", name: "PG Syllabus" },
    { id: "Pre-PhD", name: "Pre-PhD Syllabus" },
  ];

  const [activeTab, setActiveTab] = useState("UG");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syllabuses, setSyllabuses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  // NESTED DYNAMIC FORM STATE
  const initialFormState = {
    effectiveYear: "",
    category: "",
    departments: [
      {
        name: "",
        subjects: [
          { 
            title: "", 
            syllabuses: [{ label: "", file: null }] 
          }
        ]
      }
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchSyllabuses();
  }, [activeTab]);

  const fetchSyllabuses = async () => {
    setLoading(true);
    try {
      const data = await syllabusApi.getAll(activeTab);
      setSyllabuses(data || []);
    } catch (err) {
      showErrorMessage("Failed to fetch syllabuses");
    } finally {
      setLoading(false);
    }
  };

  // --- DYNAMIC FORM HANDLERS ---
  const addDepartment = () => {
    setFormData({
      ...formData,
      departments: [...formData.departments, { 
        name: "", 
        subjects: [{ title: "", syllabuses: [{ label: "Syllabus", file: null }] }] 
      }]
    });
  };

  const removeDepartment = (depIndex) => {
    if (formData.departments.length > 1) {
      const newDeps = formData.departments.filter((_, i) => i !== depIndex);
      setFormData({ ...formData, departments: newDeps });
    }
  };

  const updateDepartmentName = (depIndex, name) => {
    const newDeps = [...formData.departments];
    newDeps[depIndex].name = name;
    setFormData({ ...formData, departments: newDeps });
  };

  const addSubject = (depIndex) => {
    const newDeps = [...formData.departments];
    newDeps[depIndex].subjects.push({ 
      title: "", 
      syllabuses: [{ label: "Syllabus", file: null }] 
    });
    setFormData({ ...formData, departments: newDeps });
  };

  const removeSubject = (depIndex, subIndex) => {
    const newDeps = [...formData.departments];
    if (newDeps[depIndex].subjects.length > 1) {
      newDeps[depIndex].subjects = newDeps[depIndex].subjects.filter((_, i) => i !== subIndex);
      setFormData({ ...formData, departments: newDeps });
    }
  };

  const addSyllabusFile = (depIndex, subIndex) => {
    const newDeps = [...formData.departments];
    newDeps[depIndex].subjects[subIndex].syllabuses.push({ label: "", file: null });
    setFormData({ ...formData, departments: newDeps });
  };

  const removeSyllabusFile = (depIndex, subIndex, fileIndex) => {
    const newDeps = [...formData.departments];
    if (newDeps[depIndex].subjects[subIndex].syllabuses.length > 1) {
      newDeps[depIndex].subjects[subIndex].syllabuses = newDeps[depIndex].subjects[subIndex].syllabuses.filter((_, i) => i !== fileIndex);
      setFormData({ ...formData, departments: newDeps });
    }
  };

  const updateSubjectField = (depIndex, subIndex, field, value) => {
    const newDeps = [...formData.departments];
    newDeps[depIndex].subjects[subIndex][field] = value;
    setFormData({ ...formData, departments: newDeps });
  };

  const updateSyllabusField = (depIndex, subIndex, fileIndex, field, value) => {
    const newDeps = [...formData.departments];
    newDeps[depIndex].subjects[subIndex].syllabuses[fileIndex][field] = value;
    setFormData({ ...formData, departments: newDeps });
  };

  const handleFileChange = (depIndex, subIndex, fileIndex, e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      updateSyllabusField(depIndex, subIndex, fileIndex, 'file', file);
    } else {
      showErrorMessage("Please upload a valid PDF file");
    }
  };

  const openModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditItemId(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      effectiveYear: item.effectiveYear,
      category: item.category,
      departments: [
        {
          name: item.department,
          subjects: [
            { 
              title: item.title, 
              syllabuses: item.files.map(f => ({
                label: f.title,
                file: null,
                existingFileName: f.fileName,
                _id: f._id // Keep ID for updates if needed
              }))
            }
          ]
        }
      ]
    });
    setEditItemId(item._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // UPDATE record (Multiple files supported)
        const data = new FormData();
        data.append("program", activeTab);
        data.append("effectiveYear", formData.effectiveYear);
        data.append("category", formData.category);
        data.append("department", formData.departments[0].name);
        data.append("title", formData.departments[0].subjects[0].title);
        
        // Structure for existing/new files
        const fileMetadata = formData.departments[0].subjects[0].syllabuses.map((s, idx) => ({
          label: s.label,
          _id: s._id
        }));
        data.append("fileMetadata", JSON.stringify(fileMetadata));

        formData.departments[0].subjects[0].syllabuses.forEach((s, idx) => {
          if (s.file) {
            data.append(`file_${idx}`, s.file);
          }
        });

        await syllabusApi.update(editItemId, data);
        showSuccessMessage("Syllabus updated successfully!");
      } else {
        // BULK CREATE
        const data = new FormData();
        data.append("program", activeTab);
        data.append("effectiveYear", formData.effectiveYear);
        data.append("category", formData.category);
        
        const structure = formData.departments.map(dep => ({
          name: dep.name,
          subjects: dep.subjects.map(sub => ({ 
            title: sub.title,
            syllabuses: sub.syllabuses.map(s => ({ label: s.label }))
          }))
        }));
        data.append("structure", JSON.stringify(structure));

        formData.departments.forEach((dep, dIdx) => {
          dep.subjects.forEach((sub, sIdx) => {
            sub.syllabuses.forEach((s, fIdx) => {
              if (s.file) {
                data.append(`file_${dIdx}_${sIdx}_${fIdx}`, s.file);
              }
            });
          });
        });

        await syllabusApi.bulkCreate(data);
        showSuccessMessage("Syllabus structure uploaded successfully!");
      }
      
      setShowModal(false);
      fetchSyllabuses();
    } catch (err) {
      showErrorMessage(err.message || (isEditing ? "Update failed" : "Bulk upload failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this syllabus?")) {
      try {
        await syllabusApi.delete(id);
        showSuccessMessage("Syllabus deleted successfully");
        fetchSyllabuses();
      } catch (err) {
        showErrorMessage("Delete failed");
      }
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">Syllabus Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Course → Department → Subject structure</p>
        </div>
        <button
          onClick={openModal}
          className="flex cursor-pointer items-center px-4 py-1.5 bg-[#525B88] text-white hover:bg-[#434b70] transition-all shadow-md"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Syllabus
        </button>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-semibold cursor-pointer transition-all ${
              activeTab === tab.id
                ? "border-b-2 border-[#525B88] text-[#525B88]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <SyllabusTable 
        syllabuses={syllabuses} 
        loading={loading} 
        activeTab={activeTab} 
        onDelete={handleDelete} 
        onEdit={handleEdit}
      />

      {/* MODAL */}
      <SyllabusModal 
        showModal={showModal}
        setShowModal={setShowModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
        isEditing={isEditing}
        addDepartment={addDepartment}
        removeDepartment={removeDepartment}
        updateDepartmentName={updateDepartmentName}
        addSubject={addSubject}
        removeSubject={removeSubject}
        addSyllabusFile={addSyllabusFile}
        removeSyllabusFile={removeSyllabusFile}
        updateSubjectField={updateSubjectField}
        updateSyllabusField={updateSyllabusField}
        handleFileChange={handleFileChange}
      />
    </main>
  );
}
