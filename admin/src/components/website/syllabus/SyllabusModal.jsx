import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  CheckIcon,
  FolderPlusIcon,
  DocumentPlusIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const EFFECTIVE_YEARS = Array.from({ length: 16 }, (_, i) => {
  const year = 2015 + i;
  return `${year}-${(year + 1).toString().slice(-2)}`;
});

const MAIN_DEPARTMENTS = [
  "B. Tech",
  "M. Tech",
  "B. Pharmacy",
  "M. Pharmacy",
  "B. Ed",
  "M. Ed",
  "B.Sc",
  "M.Sc",
  "B.Com",
  "M.Com",
  "B.A",
  "M.A",
  "MCA",
  "Pre-PhD",
];

const DEPARTMENT_OPTIONS = [
  "B.Tech",
  "M.Tech",
  "B.Com",
  "B.Sc",
  "B.A",
  "MCA",
  "MBA",
  "B.Ed",
  "M.Ed",
  "B.Pharmacy",
  "M.Pharmacy",
  "Pre-PhD",
];

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  required,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        if (dropdownRef.current && dropdownRef.current.contains(event.target))
          return;
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        ref={triggerRef}
        className={`flex items-center border rounded bg-white focus-within:ring-1 focus-within:ring-[#525B88] transition-all ${error ? "border-red-500 focus-within:ring-red-500" : "border-gray-300"} ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          value={isOpen ? search : value || ""}
          onChange={handleInputChange}
          onFocus={() => {
            setSearch(value || "");
            setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required && !value}
          className="w-full px-3 py-2 text-sm outline-none bg-transparent"
        />
        <ChevronDownIcon
          className={`w-4 h-4 mr-2 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-white border border-gray-200 shadow-xl rounded max-h-60 overflow-y-auto scrollbar-thin"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
          >
            {/* Custom Scrollbar Styles */}
            <style>{`
            .scrollbar-thin::-webkit-scrollbar {
              width: 5px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 10px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background: #a1a1a1;
            }
          `}</style>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${value === opt ? "bg-gray-50 font-semibold text-[#525B88]" : "text-gray-700"}`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {opt}
                </div>
              ))
            ) : search.trim() !== "" ? (
              <div
                className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-[#525B88] font-medium"
                onClick={() => setIsOpen(false)}
              >
                Add New {placeholder.split(" ")[1]}: "{search}"
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400 italic">
                Start typing...
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

const SyllabusModal = ({
  showModal,
  setShowModal,
  formData,
  setFormData,
  handleSubmit,
  loading,
  isEditing,
  addDepartment,
  removeDepartment,
  updateDepartmentName,
  addSubject,
  removeSubject,
  addSyllabusFile,
  removeSyllabusFile,
  updateSubjectField,
  updateSyllabusField,
  handleFileChange,
}) => {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!showModal) {
      setErrors({});
    }
  }, [showModal]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.effectiveYear || !formData.effectiveYear.trim()) {
      newErrors.effectiveYear = "Effective Year is required";
    }

    if (!formData.category || !formData.category.trim()) {
      newErrors.category = "Education is required";
    }

    formData.departments.forEach((dep, depIndex) => {
      if (!dep.name || !dep.name.trim()) {
        newErrors[`dep_${depIndex}`] = "Program Name is required";
      }

      dep.subjects.forEach((sub, subIndex) => {
        if (!sub.title || !sub.title.trim()) {
          newErrors[`sub_${depIndex}_${subIndex}`] = "Course Name is required";
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorEl = document.getElementById(`err-${firstErrorKey}`);
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    handleSubmit(e);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-[#525B88]">
              {isEditing ? "Edit Syllabus" : "Upload Syllabus"}
            </h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="p-1 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form
          id="syllabus-modal-form"
          onSubmit={handleFormSubmit}
          noValidate
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {/* Global Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-6 relative z-30">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-600">
                Effective Year <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={EFFECTIVE_YEARS}
                value={formData.effectiveYear}
                onChange={(val) => {
                  setFormData({ ...formData, effectiveYear: val });
                  if (errors.effectiveYear) {
                    setErrors((prev) => ({ ...prev, effectiveYear: null }));
                  }
                }}
                placeholder="Select Effective Year"
                error={errors.effectiveYear}
              />
              {errors.effectiveYear && (
                <p id="err-effectiveYear" className="text-xs text-red-500 mt-1">
                  {errors.effectiveYear}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-600">
                Education <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: null }));
                  }
                }}
                placeholder="Enter Education (e.g. Conventional UG or Conventional PG or Integrated, etc.)"
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-[#525B88] outline-none ${errors.category ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
              />
              {errors.category && (
                <p id="err-category" className="text-xs text-red-500 mt-1">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Departments Loop */}
          <div className="space-y-4 relative z-20">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700  flex items-center">
                {/* <FolderPlusIcon className="w-4 h-4 mr-2" /> */}
                Program
              </h3>
              <button
                type="button"
                onClick={addDepartment}
                className="text-xs cursor-pointer font-bold flex items-center px-3 py-1.5 bg-[#525B88] text-white hover:bg-[#434b70] transition-all"
              >
                <PlusIcon className="w-3.5 h-3.5 mr-1" />
                Add Program
              </button>
            </div>

            {formData.departments.map((dep, depIndex) => (
              <div
                key={depIndex}
                className="border border-gray-200 rounded relative"
                style={{ zIndex: formData.departments.length - depIndex }}
              >
                {/* Dept Header */}
                <div className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-100">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center space-x-3">
                      <label className="text-[12px] font-semibold text-gray-600 whitespace-nowrap">
                        Program Name <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={DEPARTMENT_OPTIONS}
                        value={dep.name}
                        onChange={(val) => {
                          updateDepartmentName(depIndex, val);
                          if (errors[`dep_${depIndex}`]) {
                            setErrors((prev) => ({ ...prev, [`dep_${depIndex}`]: null }));
                          }
                        }}
                        placeholder="Select Program"
                        className="flex-1"
                        error={errors[`dep_${depIndex}`]}
                      />
                    </div>
                    {errors[`dep_${depIndex}`] && (
                      <p id={`err-dep_${depIndex}`} className="text-xs text-red-500 mt-1 pl-[95px]">
                        {errors[`dep_${depIndex}`]}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDepartment(depIndex)}
                    className="ml-2 p-1 cursor-pointer text-red-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Subjects for this Dept */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-[12px] font-bold text-gray-700">
                      Course
                    </span>
                    <button
                      type="button"
                      onClick={() => addSubject(depIndex)}
                      className="text-xs font-bold cursor-pointer hover:bg-[#434b70] p-1.5  bg-[#525B88] text-white  flex items-center transition-colors"
                    >
                      <PlusIcon className="w-3 h-3 mr-1" />
                      Add Course
                    </button>
                  </div>

                  <div className="space-y-4">
                    {dep.subjects.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className="bg-gray-50 p-3 border border-gray-100 relative group"
                      >
                        <div className="flex flex-col mb-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={sub.title}
                              onChange={(e) => {
                                updateSubjectField(
                                  depIndex,
                                  subIndex,
                                  "title",
                                  e.target.value,
                                );
                                if (errors[`sub_${depIndex}_${subIndex}`]) {
                                  setErrors((prev) => ({ ...prev, [`sub_${depIndex}_${subIndex}`]: null }));
                                }
                              }}
                              placeholder="Course Name (e.g. Computer Science)"
                              className={`flex-1 px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-[#525B88] outline-none ${errors[`sub_${depIndex}_${subIndex}`] ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeSubject(depIndex, subIndex)}
                              className="p-1 text-red-400 hover:text-red-600 cursor-pointer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          {errors[`sub_${depIndex}_${subIndex}`] && (
                            <p id={`err-sub_${depIndex}_${subIndex}`} className="text-xs text-red-500 mt-1">
                              {errors[`sub_${depIndex}_${subIndex}`]}
                            </p>
                          )}
                        </div>

                        {/* Files for this Subject */}
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                          {sub.syllabuses.map((syl, sylIdx) => (
                            <div
                              key={sylIdx}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={syl.label}
                                onChange={(e) =>
                                  updateSyllabusField(
                                    depIndex,
                                    subIndex,
                                    sylIdx,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                placeholder="File Label (e.g. Theory)"
                                className="w-32 px-2 py-1.5 text-[11px] border border-gray-200 rounded focus:ring-1 focus:ring-[#525B88] outline-none"
                              />

                              <div className="relative flex-1">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) =>
                                    handleFileChange(
                                      depIndex,
                                      subIndex,
                                      sylIdx,
                                      e,
                                    )
                                  }
                                  className="hidden"
                                  id={`file-${depIndex}-${subIndex}-${sylIdx}`}
                                />
                                <label
                                  htmlFor={`file-${depIndex}-${subIndex}-${sylIdx}`}
                                  className={`flex items-center px-3 py-1.5 border rounded cursor-pointer transition-all ${syl.file ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-400 hover:border-[#525B88]"}`}
                                >
                                  <DocumentTextIcon className="w-3.5 h-3.5 mr-1.5" />
                                  <span className="text-[11px] font-semibold truncate max-w-[150px]">
                                    {syl.file
                                      ? syl.file.name
                                      : syl.existingFileName ||
                                        (isEditing
                                          ? "Update PDF"
                                          : "Choose PDF")}
                                  </span>
                                </label>
                              </div>

                              {sub.syllabuses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSyllabusFile(
                                      depIndex,
                                      subIndex,
                                      sylIdx,
                                    )
                                  }
                                  className="text-red-400 hover:text-red-600 p-1"
                                >
                                  <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addSyllabusFile(depIndex, subIndex)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center mt-1"
                          >
                            <PlusIcon className="w-3 h-3 mr-1" />
                            Add More Files for this Subject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 cursor-pointer text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            form="syllabus-modal-form"
            className="px-6 py-2 cursor-pointer bg-[#525B88] text-white  text-sm font-semibold hover:bg-[#434b70] transition-all shadow-sm flex items-center disabled:opacity-50"
          >
            {loading ? (
              isEditing ? (
                "Updating..."
              ) : (
                "Uploading..."
              )
            ) : (
              <>
                <CheckIcon className="w-4 h-4 mr-1.5" />
                {isEditing ? "Update Syllabus" : "Upload Syllabus"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyllabusModal;
