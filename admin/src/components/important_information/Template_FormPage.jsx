import { useEffect, useRef, useState } from "react";
import {
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { BASE_URL } from "../../config/urls";
import infoAPI from "./Api";

export default function Template_FormPage({
  title,
  itemName = "",
  sampleItems = [],
  resourceName = "",
  isModal = false,
  noRadius = false,
  buttonText = "",
  hideIcon = false,
  maxFileSize = 500 * 1024,
}) {
  /**
   * - [ ] CREATING
   * - [ ] READING_ALL
   * - [ ] DELETING
   * - [ ] UPDATING
   */
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    file: null,
    note: "",
  });

  const [events, setEvents] = useState(sampleItems);
  const [editingId, setEditingId] = useState(null);
  // Program types for searchable dynamic dropdown (when resourceName === "academic_calendar")
  const defaultProgramTypes = [
    "UG Programs",
    "PG Programs",
    "Professional Programs",
    "Diploma Programs",
    "Certificate Programs",
    "General",
  ];
  const [programTypes, setProgramTypes] = useState(defaultProgramTypes);
  const [programSearch, setProgramSearch] = useState("");
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  //
  const formRef = useRef();
  const fileInputRef = useRef();
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: "", date: "", file: null, note: "" });
    setProgramSearch("");
    setIsProgramDropdownOpen(false);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    (async () => {
      const res = await infoAPI({ action: "read_all", resourceName });
      if (res.data) {
        // Collect existing program types if any
        if (resourceName === "academic_calendar") {
          const customTypes = new Set(defaultProgramTypes);
          res.data.forEach((item) => {
            if (item.note && item.note.trim()) {
              customTypes.add(item.note.trim());
            }
          });
          setProgramTypes(Array.from(customTypes));
        }

        const sorted = res.data.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        setEvents(sorted);
      } else {
        setEvents([]);
      }
    })();
  }, [resourceName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProgramDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================================================ 1
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // ============================================================================================ 2
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          file: "Only PDF, Word, or image files are allowed",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > maxFileSize) {
        setErrors({
          ...errors,
          file: `File size must be less than ${Math.round(maxFileSize / 1024)}kb`,
        });
        return;
      }

      setFormData({ ...formData, file });
      setErrors({ ...errors, file: null });
    }
  };

  // ============================================================================================ 3
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = itemName + " title is required";
    }

    if (!formData.date) {
      newErrors.date = itemName + " date is required";
    }
    // else if (new Date(formData.date) < new Date()) {
    //   newErrors.date = itemName + " date must be in the futusdfre";
    // }
    if (!formData.file) {
      newErrors.file = itemName + " file is required";
    }
    if (resourceName === "academic_calendar" && (!formData.note || !formData.note.trim())) {
      newErrors.note = "Program / Course Type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================================ 4
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If new program type, ensure it is on top of programTypes list
    if (resourceName === "academic_calendar" && formData.note?.trim()) {
      const selectedType = formData.note.trim();
      setProgramTypes((prev) => [selectedType, ...prev.filter((p) => p !== selectedType)]);
    }

    if (editingId) {
      // Update
      const res = await infoAPI({
        resourceName,
        action: "update",
        dbid: editingId,
        doc: formData,
      });
      if (res?.success) {
        const refreshed = await infoAPI({ action: "read_all", resourceName });
        const sorted = (refreshed.data || []).sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        setEvents(sorted);
        setSubmitMessage(itemName + " updated successfully!");
      }
    } else {
      // Create
      const res = await infoAPI({
        resourceName,
        action: "create",
        doc: formData,
      });
      // After create
      if (res?.success) {
        const refreshed = await infoAPI({ action: "read_all", resourceName });
        const sorted = (refreshed.data || []).sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        setEvents(sorted);
        setSubmitMessage(itemName + " added successfully!");
      }
    }

    // Reset form
    if (isModal) {
      closeForm();
    } else {
      setFormData({
        title: "",
        date: "",
        file: null,
        note: "",
      });
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // Clear message after 3 seconds
    setTimeout(() => setSubmitMessage(""), 3000);
  };

  // ============================================================================================ 5
  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date,
      file: event.file,
      note: event.note || "",
    });
    setEditingId(event._id);
    if (isModal) {
      setIsModalOpen(true);
    } else {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ============================================================================================ 6
  const handleDelete = async (_id) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${itemName.toLowerCase()}?`
      )
    ) {
      const res = await infoAPI({ action: "delete", resourceName, dbid: _id });
      if (res?.success) {
        const refreshed = await infoAPI({ action: "read_all", resourceName });
        setEvents(refreshed.data ? refreshed.data.slice().reverse() : []);
        if (editingId === _id) {
          setFormData({
            title: "",
            date: "",
            file: null,
            note: "",
          });
          setEditingId(null);
        }
      }
    }
  };
  const renderForm = () => (
    <form ref={formRef} onSubmit={handleSubmit} className={`${isModal ? "space-y-6" : `bg-white ${noRadius ? "rounded-none" : "rounded-lg"} p-6 mb-8`}`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6`}>
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            {itemName} Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${noRadius ? "rounded-none" : "rounded-lg"} focus:outline-none focus:ring-2 ${
              errors.title
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            placeholder={`Enter ${itemName} title`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
            {itemName} Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date ? formData.date.split("T")[0] : ""}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${noRadius ? "rounded-none" : "rounded-lg"} focus:outline-none focus:ring-2 ${
              errors.date
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>
      </div>
      {resourceName === "academic_calendar" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div ref={dropdownRef}>
            <label className="block text-gray-700 font-medium mb-2">
              Program / Course Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.note}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, note: val });
                  setProgramSearch(val);
                  setIsProgramDropdownOpen(true);
                  if (errors.note) setErrors({ ...errors, note: null });
                }}
                onFocus={() => setIsProgramDropdownOpen(true)}
                placeholder="Search or enter Program Type (e.g. UG Programs, PG Programs...)"
                className={`w-full px-4 py-2 border ${noRadius ? "rounded-none" : "rounded-lg"} focus:outline-none focus:ring-2 ${
                  errors.note
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
              />
              {isProgramDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-y-auto">
                  {programTypes
                    .filter((pt) =>
                      pt.toLowerCase().includes((programSearch || "").toLowerCase())
                    )
                    .map((pt) => (
                      <div
                        key={pt}
                        onClick={() => {
                          setFormData({ ...formData, note: pt });
                          setProgramSearch("");
                          setIsProgramDropdownOpen(false);
                          if (errors.note) setErrors({ ...errors, note: null });
                        }}
                        className="px-4 py-2 hover:bg-teal-50 hover:text-teal-800 cursor-pointer text-sm text-gray-700 font-medium"
                      >
                        {pt}
                      </div>
                    ))}
                  {programSearch.trim() &&
                    !programTypes.some(
                      (pt) => pt.toLowerCase() === programSearch.trim().toLowerCase()
                    ) && (
                      <div
                        onClick={() => {
                          const newType = programSearch.trim();
                          setProgramTypes((prev) => [newType, ...prev.filter((p) => p !== newType)]);
                          setFormData({ ...formData, note: newType });
                          setProgramSearch("");
                          setIsProgramDropdownOpen(false);
                          if (errors.note) setErrors({ ...errors, note: null });
                        }}
                        className="px-4 py-2 bg-teal-50 border-t border-teal-100 hover:bg-teal-100 text-teal-800 cursor-pointer text-sm font-semibold flex items-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add &quot;{programSearch.trim()}&quot; as new Program Type
                      </div>
                    )}
                </div>
              )}
            </div>
            {errors.note && <p className="mt-1 text-sm text-red-500">{errors.note}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Select or type a program type for course-wise accordion.
            </p>
          </div>

          <div>
            <label htmlFor="file" className="block text-gray-700 font-medium mb-2">
              {itemName} Document (PDF) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <label className={`flex flex-col items-center gap-3 px-4 py-2 bg-white ${noRadius ? "rounded-none" : "rounded-md"} border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-all w-fit min-w-[100px]`}>
                <DocumentTextIcon className="h-5 w-5 text-[#525B88]" />
                <span className="text-xs text-gray-600 truncate max-w-[200px]">
                  {formData.file
                    ? (formData.file.name || formData.file.originalname)
                    : "Choose a file"}
                </span>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                  ref={fileInputRef}
                />
              </label>
              {formData.file && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, file: null });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 bg-red-50 rounded-full"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
            <p className="mt-2 text-xs text-gray-500 italic">Max size: 5 MB</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label htmlFor="note" className="block text-gray-700 font-medium mb-2">
              {itemName} Note / Description
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="3"
              className={`w-full px-4 py-2 border ${noRadius ? "rounded-none" : "rounded-lg"} focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200`}
              placeholder={`Enter any additional notes or description for this ${itemName}`}
            ></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="file" className="block text-gray-700 font-medium mb-2">
              {itemName} Document (PDF)
            </label>
            <div className="flex items-center">
              <label className={`flex flex-col items-center gap-3 px-4 py-2 bg-white ${noRadius ? "rounded-none" : "rounded-md"} border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-all w-fit min-w-[100px]`}>
                <DocumentTextIcon className="h-5 w-5 text-[#525B88]" />
                <span className="text-xs text-gray-600">
                  {formData.file
                    ? (formData.file.name || formData.file.originalname)
                    : "Choose a file"}
                </span>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                  ref={fileInputRef}
                />
              </label>
              {formData.file && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, file: null });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 bg-red-50 rounded-full"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
            <p className="mt-2 text-xs text-gray-500 italic">Max size: 5 MB</p>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-4">
        {(editingId || isModal) && (
          <button
            type="button"
            onClick={closeForm}
            className={`px-4 py-2 border border-gray-300 ${noRadius ? "rounded-none" : "rounded-lg"} text-gray-700 hover:bg-gray-50 font-medium`}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`px-6 py-2 bg-[#525B88] text-white ${noRadius ? "rounded-none" : "rounded-lg"} hover:bg-[#3a4166] transition-all font-medium shadow-sm`}
        >
          {editingId ? (
            <>
              <CheckIcon className="h-5 w-5 inline mr-2" />
              Update {itemName}
            </>
          ) : (
            <>Create {itemName}</>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <main className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">{title}</h1>
          <p className="text-gray-600 mt-1">Manage {itemName.toLowerCase()} records</p>
        </div>
        {isModal && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ title: "", date: "", file: null });
              setIsModalOpen(true);
            }}
            className={`flex cursor-pointer items-center gap-2 bg-[#525B88] text-white px-5 py-2.5 ${noRadius ? "rounded-none" : "rounded-lg"} hover:bg-[#3a4166] transition-all font-medium shadow-md`}
          >
            {<PlusIcon className="h-5 w-5" />}
            {buttonText || `New ${itemName}`}
          </button>
        )}
      </div>

      {/* Success message */}
      {submitMessage && (
        <div className={`mb-6 p-4 bg-green-100 border border-green-400 text-green-700 ${noRadius ? "rounded-none" : "rounded-lg"} shadow-sm animate-pulse`}>
          {submitMessage}
        </div>
      )}

      {/* DIRECT FORM (only if not isModal) */}
      {!isModal && renderForm()}

      {/* MODAL (only if isModal) */}
      {isModal && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className={`bg-white w-full max-w-2xl ${noRadius ? "rounded-none" : "rounded-2xl"} shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}>
            <div className="px-6 py-4 bg-[#525B88] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {editingId ? `Edit ${itemName}` : `Add New ${itemName}`}
              </h3>
              <button onClick={closeForm} className="text-white/80 hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {renderForm()}
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className={`bg-white w-full shadow-md ${noRadius ? "rounded-none" : "rounded-lg"} overflow-hidden`}>
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Upcoming {itemName}s
          </h2>
        </div>
        <div className="overflow-y-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Document
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  {resourceName === "academic_calendar" ? "Program Type" : "Note"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <tbody className="bg-white divide-y divide-gray-200">
              {events && events.length > 0 ? (
                events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.file ? (
                        <a
                          href={
                            BASE_URL +
                            `/info/${resourceName}/file/view/${event._id}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {event.file.originalname}
                        </a>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic truncate max-w-[200px]">
                      {event.note || "-"}
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <PencilIcon className="h-4 w-4 inline mr-1" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4 inline mr-1" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No {itemName.toLowerCase()}s found. Create your first{" "}
                    {itemName.toLowerCase()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
