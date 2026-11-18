import { useState, useEffect } from "react";
import AddFormModal from "./AddFormModal";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";
import StreamsTable from "./StreamsTable";
import AcademicYearsTable from "./AcademicYearsTable";
import SemestersTable from "./SemestersTable";
import SubjectsTable from "./SubjectsTable";
import StreamSubjectMapping from "./StreamSubjectMapping";
import ExaminationFees from "./ExaminationFees";
import ProfessorsTable from "./ProfessorsTable";
import { collegeTypesApi, collegeCategoriesApi, collegeOtherCategoriesApi, examCategoriesApi, examTypesApi } from "../../../services/apiService";

const STORAGE_KEYS = {
  collegeType: "exam_college_types",
  collegeCategory: "exam_college_categories",
  courseCategory: "exam_course_categories",
  examType: "exam_examination_types",
  examCategory: "exam_exam_categories",
};

const CategoryTypesTable = ({ tabKey }) => {
  const [activeSection, setActiveSection] = useState("streams");
  const [collegeTypes, setCollegeTypes] = useState([]);
  const [collegeCategories, setCollegeCategories] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [examCategories, setExamCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch College Types from API
      try {
        const collegeTypesData = await collegeTypesApi.getAll();
        setCollegeTypes(Array.isArray(collegeTypesData) ? collegeTypesData : []);
      } catch (err) {
        console.error("Error fetching college types:", err);
        setCollegeTypes([]);
      }
      
      // Fetch College Categories from API
      try {
        const collegeCategoriesData = await collegeCategoriesApi.getAll();
        setCollegeCategories(Array.isArray(collegeCategoriesData) ? collegeCategoriesData : []);
      } catch (err) {
        console.error("Error fetching college categories:", err);
        setCollegeCategories([]);
      }
      
      // Fetch College Other Categories (Course Categories) from API
      try {
        const courseCategoriesData = await collegeOtherCategoriesApi.getAll();
        setCourseCategories(Array.isArray(courseCategoriesData) ? courseCategoriesData : []);
      } catch (err) {
        console.error("Error fetching college other categories:", err);
        setCourseCategories([]);
      }
      
      // Fetch Examination Types from API
      try {
        const examTypesData = await examTypesApi.getAll();
        setExamTypes(Array.isArray(examTypesData) ? examTypesData : []);
      } catch (err) {
        console.error("Error fetching exam types:", err);
        setExamTypes([]);
      }
      
      // Fetch Exam Categories from API
      try {
        const examCategoriesData = await examCategoriesApi.getAll();
        setExamCategories(Array.isArray(examCategoriesData) ? examCategoriesData : []);
      } catch (err) {
        console.error("Error fetching exam categories:", err);
        setExamCategories([]);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const getCurrentData = () => {
    switch (activeSection) {
      case "collegeType":
        return collegeTypes;
      case "collegeCategory":
        return collegeCategories;
      case "courseCategory":
        return courseCategories;
      case "examType":
        return examTypes;
      case "examCategory":
        return examCategories;
      default:
        return [];
    }
  };

  const setCurrentData = (data) => {
    switch (activeSection) {
      case "collegeType":
        setCollegeTypes(data);
        // No longer saving to localStorage for college types
        break;
      case "collegeCategory":
        setCollegeCategories(data);
        // No longer saving to localStorage for college categories
        break;
      case "courseCategory":
        setCourseCategories(data);
        // No longer saving to localStorage for college other categories
        break;
      case "examType":
        setExamTypes(data);
        // No longer saving to localStorage for exam types
        break;
      case "examCategory":
        setExamCategories(data);
        // No longer saving to localStorage for exam categories
        break;
    }
  };

  const getSectionName = () => {
    switch (activeSection) {
      case "streams":
        return "Stream of Education";
      case "academicYears":
        return "Academic Years";
      case "semesters":
        return "Semesters";
      case "subjects":
        return "Subjects";
      case "streamSubjectMapping":
        return "Stream-Subject Mapping";
      case "examinationFees":
        return "Examination Fees";
      case "professors":
        return "Professors";
      case "collegeType":
        return "College Type";
      case "collegeCategory":
        return "College Category";
      case "courseCategory":
        return "College Other Category";
      case "examType":
        return "Examination Type";
      case "examCategory":
        return "Exam Category";
      default:
        return "";
    }
  };

  const renderComponent = () => {
    const commonProps = { tabKey: activeSection };
    
    switch (activeSection) {
      case "streams":
        return <StreamsTable {...commonProps} />;
      case "academicYears":
        return <AcademicYearsTable {...commonProps} />;
      case "semesters":
        return <SemestersTable {...commonProps} />;
      case "subjects":
        return <SubjectsTable {...commonProps} />;
      case "streamSubjectMapping":
        return <StreamSubjectMapping {...commonProps} />;
      case "examinationFees":
        return <ExaminationFees {...commonProps} />;
      case "professors":
        return <ProfessorsTable {...commonProps} />;
      default:
        return null;
    }
  };

  const isComponentSection = () => {
    return ["streams", "academicYears", "semesters", "subjects", "streamSubjectMapping", "examinationFees", "professors"].includes(activeSection);
  };

  const handleDelete = async (id) => {
    const sectionName = getSectionName();
    if (window.confirm(`Are you sure you want to delete this ${sectionName}?`)) {
      try {
        if (activeSection === "collegeType") {
          // Use API for college types
          await collegeTypesApi.delete(id);
          const currentData = getCurrentData();
          const updated = currentData.filter((item) => item._id !== id);
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} deleted successfully`);
        } else if (activeSection === "collegeCategory") {
          // Use API for college categories
          await collegeCategoriesApi.delete(id);
          const currentData = getCurrentData();
          const updated = currentData.filter((item) => item._id !== id);
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} deleted successfully`);
        } else if (activeSection === "courseCategory") {
          // Use API for college other categories
          await collegeOtherCategoriesApi.delete(id);
          const currentData = getCurrentData();
          const updated = currentData.filter((item) => item._id !== id);
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} deleted successfully`);
        } else if (activeSection === "examCategory") {
          // Use API for exam categories
          await examCategoriesApi.delete(id);
          const currentData = getCurrentData();
          const updated = currentData.filter((item) => item._id !== id);
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} deleted successfully`);
        } else if (activeSection === "examType") {
          // Use API for exam types
          await examTypesApi.delete(id);
          const currentData = getCurrentData();
          const updated = currentData.filter((item) => item._id !== id);
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} deleted successfully`);
        } else {
          // Use localStorage for other sections (for now)
          const currentData = getCurrentData();
          const updated = currentData.filter((item) => item._id !== id);
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} deleted successfully`);
        }
      } catch (err) {
        showErrorMessage(`Failed to delete ${sectionName}`);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const sectionName = getSectionName();
      
      if (activeSection === "collegeType") {
        // Use API for college types
        if (editingItem) {
          await collegeTypesApi.update(editingItem._id, formData);
          const currentData = getCurrentData();
          const updated = currentData.map((item) =>
            item._id === editingItem._id ? { ...formData, _id: editingItem._id } : item
          );
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} updated successfully`);
        } else {
          const newItem = await collegeTypesApi.create(formData);
          const currentData = getCurrentData();
          const updated = [...currentData, newItem];
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} created successfully`);
        }
        } else if (activeSection === "collegeCategory") {
        // Use API for college categories
        if (editingItem) {
          await collegeCategoriesApi.update(editingItem._id, formData);
          const currentData = getCurrentData();
          const updated = currentData.map((item) =>
            item._id === editingItem._id ? { ...formData, _id: editingItem._id } : item
          );
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} updated successfully`);
        } else {
          const newItem = await collegeCategoriesApi.create(formData);
          const currentData = getCurrentData();
          const updated = [...currentData, newItem];
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} created successfully`);
        }
      } else if (activeSection === "courseCategory") {
        // Use API for college other categories
        if (editingItem) {
          await collegeOtherCategoriesApi.update(editingItem._id, formData);
          const currentData = getCurrentData();
          const updated = currentData.map((item) =>
            item._id === editingItem._id ? { ...formData, _id: editingItem._id } : item
          );
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} updated successfully`);
        } else {
          const newItem = await collegeOtherCategoriesApi.create(formData);
          const currentData = getCurrentData();
          const updated = [...currentData, newItem];
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} created successfully`);
        }
      } else if (activeSection === "examCategory") {
        // Use API for exam categories
        if (editingItem) {
          await examCategoriesApi.update(editingItem._id, formData);
          const currentData = getCurrentData();
          const updated = currentData.map((item) =>
            item._id === editingItem._id ? { ...formData, _id: editingItem._id } : item
          );
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} updated successfully`);
        } else {
          const newItem = await examCategoriesApi.create(formData);
          const currentData = getCurrentData();
          const updated = [...currentData, newItem];
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} created successfully`);
        }
      } else if (activeSection === "examType") {
        // Use API for exam types
        if (editingItem) {
          await examTypesApi.update(editingItem._id, formData);
          const currentData = getCurrentData();
          const updated = currentData.map((item) =>
            item._id === editingItem._id ? { ...formData, _id: editingItem._id } : item
          );
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} updated successfully`);
        } else {
          const newItem = await examTypesApi.create(formData);
          const currentData = getCurrentData();
          const updated = [...currentData, newItem];
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} created successfully`);
        }
      } else {
        // Use localStorage for other sections (for now)
        const currentData = getCurrentData();
        if (editingItem) {
          const updated = currentData.map((item) =>
            item._id === editingItem._id ? { ...formData, _id: editingItem._id } : item
          );
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} updated successfully`);
        } else {
          const newItem = {
            ...formData,
            _id: `${activeSection}_${Date.now()}`,
          };
          const updated = [...currentData, newItem];
          setCurrentData(updated);
          showSuccessMessage(`${sectionName} created successfully`);
        }
      }
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      const sectionName = getSectionName();
      showErrorMessage(`Failed to save ${sectionName}`);
    }
  };

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

  const currentData = getCurrentData();
  const sectionName = getSectionName();

  // If it's a component section, render the component directly
  if (isComponentSection()) {
    return (
      <div className="mt-6">
        {/* Section Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
            {/* Configuration/Category Types */}
            <button
              onClick={() => setActiveSection("collegeType")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "collegeType"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              College Type
            </button>
            <button
              onClick={() => setActiveSection("collegeCategory")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "collegeCategory"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              College Category
            </button>
            <button
              onClick={() => setActiveSection("courseCategory")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "courseCategory"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              College Other Category
            </button>
            <button
              onClick={() => setActiveSection("examType")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "examType"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Examination Type
            </button>
            <button
              onClick={() => setActiveSection("examCategory")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "examCategory"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Exam Category
            </button>
            {/* Academic Structure */}
            <button
              onClick={() => setActiveSection("academicYears")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "academicYears"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Academic Years
            </button>
            <button
              onClick={() => setActiveSection("semesters")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "semesters"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Semesters
            </button>
            {/* Educational Content */}
            <button
              onClick={() => setActiveSection("streams")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "streams"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Stream of Education
            </button>
            <button
              onClick={() => setActiveSection("subjects")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "subjects"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Subjects
            </button>
            <button
              onClick={() => setActiveSection("streamSubjectMapping")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "streamSubjectMapping"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Stream-Subject Mapping
            </button>
            {/* Resources */}
            <button
              onClick={() => setActiveSection("professors")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "professors"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Professors
            </button>
            {/* Financial */}
            <button
              onClick={() => setActiveSection("examinationFees")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeSection === "examinationFees"
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Examination Fees
            </button>
          </div>
        </div>
        {renderComponent()}
      </div>
    );
  }

  // Otherwise render the standard table for category types
  return (
    <div className="mt-6">
      {/* Section Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
          {/* Configuration/Category Types */}
          <button
            onClick={() => setActiveSection("collegeType")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "collegeType"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            College Type
          </button>
          <button
            onClick={() => setActiveSection("collegeCategory")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "collegeCategory"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            College Category
          </button>
          <button
            onClick={() => setActiveSection("courseCategory")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "courseCategory"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            College Other Category
          </button>
          <button
            onClick={() => setActiveSection("examType")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "examType"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Examination Type
          </button>
          <button
            onClick={() => setActiveSection("examCategory")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "examCategory"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Exam Category
          </button>
          {/* Academic Structure */}
          <button
            onClick={() => setActiveSection("academicYears")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "academicYears"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Academic Years
          </button>
          <button
            onClick={() => setActiveSection("semesters")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "semesters"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Semesters
          </button>
          {/* Educational Content */}
          <button
            onClick={() => setActiveSection("streams")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "streams"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Stream of Education
          </button>
          <button
            onClick={() => setActiveSection("subjects")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "subjects"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setActiveSection("streamSubjectMapping")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "streamSubjectMapping"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Stream-Subject Mapping
          </button>
          {/* Resources */}
          <button
            onClick={() => setActiveSection("professors")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "professors"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Professors
          </button>
          {/* Financial */}
          <button
            onClick={() => setActiveSection("examinationFees")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeSection === "examinationFees"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Examination Fees
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{sectionName}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage {sectionName.toLowerCase()} configurations
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddForm(true);
          }}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add {sectionName}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Description
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
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.code || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status || "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingItem(item);
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
                      onClick={() => handleDelete(item._id)}
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
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-600">No {sectionName.toLowerCase()} found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add {sectionName}" to create one
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey={activeSection}
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

export default CategoryTypesTable;

