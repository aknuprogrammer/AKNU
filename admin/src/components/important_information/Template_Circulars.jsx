import { useEffect, useRef, useState } from "react";
import {
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { BASE_URL } from "../../config/urls";

export default function Template_Circulars({
  title,
  itemName = "Circular",
  sampleItems = [],
  resourceName = "circulars",
}) {
  const [formData, setFormData] = useState({ title: "", date: "", file: null });
  const [events, setEvents] = useState(sampleItems);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef();
  const fileInputRef = useRef();
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  // Load all circulars
  useEffect(() => {
    (async () => {
      const res = await circularsAPI({ action: "read_all", resourceName });
      setEvents(res.data ? res.data.slice().reverse() : []);
    })();
  }, [resourceName]);

  // ---------------- Handlers ----------------
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setErrors({ ...errors, file: "File size must be less than 500kb" });
        return;
      }
      setFormData({ ...formData, file });
      setErrors({ ...errors, file: null });
    } else {
      setFormData({ ...formData, file: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title required";
    if (!formData.date) newErrors.date = "Date required";
    if (!formData.file) newErrors.file = "File required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const action = editingId ? "update" : "create";
    const res = await circularsAPI({
      action,
      resourceName,
      dbid: editingId,
      doc: formData,
    });

    if (res?.success) {
      const refreshed = await circularsAPI({ action: "read_all", resourceName });
      setEvents(refreshed.data ? refreshed.data.slice().reverse() : []);
      setSubmitMessage(`${itemName} ${editingId ? "updated" : "added"} successfully!`);
      setFormData({ title: "", date: "", file: null });
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSubmitMessage(""), 3000);
    }
  };

  const handleEdit = (event) => {
    setFormData({ title: event.title, date: event.date, file: event.file });
    setEditingId(event._id);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (_id) => {
    if (window.confirm(`Delete this ${itemName.toLowerCase()}?`)) {
      const res = await circularsAPI({ action: "delete", resourceName, dbid: _id });
      if (res?.success) setEvents(events.filter((e) => e._id !== _id));
    }
  };

  // ---------------- UI ----------------
  return (
    <main className="max-w-5xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">{title}</h1>

      {submitMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {submitMessage}
        </div>
      )}

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-lg p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter Circular Title"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date.split("T")[0] || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Upload File *</label>
          <div className="flex items-center">
            <label className="flex flex-col items-center px-4 py-3 border border-dashed rounded-md cursor-pointer hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 mb-1 text-[#525B88]" />
              <span className="text-xs">
                {formData.file ? formData.file.name || formData.file.originalname : "Choose File"}
              </span>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </label>
            {formData.file && (
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, file: null });
                  fileInputRef.current.value = "";
                }}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
          <p className="text-xs text-gray-500 mt-1">PDF only, Max 500kb</p>
        </div>

        <div className="flex justify-end">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ title: "", date: "", file: null });
                setEditingId(null);
              }}
              className="px-4 py-2 border rounded-lg mr-2"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="px-6 py-2 bg-[#525B88] text-white rounded-lg">
            {editingId ? (
              <>
                <CheckIcon className="h-4 w-4 inline mr-2" /> Update
              </>
            ) : (
              "Create"
            )}{" "}
            {itemName}
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#525B88]">All {itemName}s</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#525B88] text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">File</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.length > 0 ? (
              events.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{c.title}</td>
                  <td className="px-6 py-4">{new Date(c.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {c.file ? (
                      <a
                        href={`${BASE_URL}/info/${resourceName}/file/view/${c._id}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {c.file.originalname}
                      </a>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 mr-3">
                      <PencilIcon className="h-4 w-4 inline" />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="text-red-600">
                      <TrashIcon className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No {itemName.toLowerCase()}s found. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
