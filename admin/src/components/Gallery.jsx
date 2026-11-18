import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { BASE_URL } from "../config/urls";

const GALLERY_URL = `${BASE_URL}/gallery`;
const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];

// API functions

const addGalleryItem = async (formData, onSuccess, onError) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(GALLERY_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    console.error("Error adding gallery item:", error);
    if (onError) onError(error);
  }
};

const updateGalleryItem = async (id, formData, onSuccess, onError) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${GALLERY_URL}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    console.error("Error updating gallery item:", error);
    if (onError) onError(error);
  }
};

const deleteGalleryItem = async (id, onSuccess, onError) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${GALLERY_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    if (onError) onError(error);
  }
};

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    alignno: "",
    img: null,
    mediatype: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepExistingImage, setKeepExistingImage] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalImgId, setModalImgId] = useState(null);
  const [originalImgName, setOriginalImgName] = useState("");

  const fileInputRef = useRef();

  const fetchGalleryItems = async (setGalleryItems) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(GALLERY_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGalleryItems(response.data.data);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems(setGalleryItems);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Form validation
  const validate = (isEdit = false) => {
    const errs = {};
    if (!String(formData.title).trim()) errs.title = "Title is required";
    if (!String(formData.description).trim())
      errs.description = "Description is required";
    if (!String(formData.alignno).trim())
      errs.alignno = "Align number is required";
    if (!isEdit && !formData.img) errs.img = "file is required";
    if (!formData.mediatype) errs.mediatype = "file type is required";
    // if (formData.img && !allowedTypes.includes(formData.img.type)) {
    //   errs.img = "Only image files (jpg, png, gif) are allowed";
    // }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 102400) {
        // 100KB limit
        setErrors((prev) => ({
          ...prev,
          img: "Image size must be less than 100KB",
        }));
        setFormData((prev) => ({ ...prev, img: null }));
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }
    setFormData((f) => ({ ...f, img: file }));
    setErrors((e) => ({ ...e, img: undefined }));
  };

  // Handle add/update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    if (!validate(isEdit)) return;
    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    formPayload.append("alignno", formData.alignno);
    formPayload.append("mediatype", formData.mediatype);
    if (formData.img) formPayload.append("img", formData.img);
    setLoading(true);
    if (isEdit) {
      await updateGalleryItem(
        editingId,
        formPayload,
        () => {
          setMessage("Gallery item updated.");
          setFormData({ title: "", description: "", alignno: "", img: null });
          setEditingId(null);
          fileInputRef.current.value = "";
          fetchGalleryItems(setGalleryItems);
        },
        (err) => setMessage("Update failed.")
      );
    } else {
      await addGalleryItem(
        formPayload,
        () => {
          setMessage("Gallery item added.");
          setFormData({ title: "", description: "", alignno: "", img: null });
          setEditingId(null);
          fileInputRef.current.value = "";
          fetchGalleryItems(setGalleryItems);
        },
        (err) => setMessage("Add failed.")
      );
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description || "",
      alignno: item.alignno || "",
      mediatype: item.mediatype || "image",
      img: null,
    });
    setKeepExistingImage(true);
    let fileName =
      item.img && item.img.originalname ? item.img.originalname : "";
    setOriginalImgName(fileName);
    setEditingId(item._id);
    setErrors({});
    setMessage("");
    fileInputRef.current.value = "";
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery item?")) return;
    setLoading(true);
    await deleteGalleryItem(
      id,
      () => {
        setMessage("Gallery item deleted.");
        fetchGalleryItems(setGalleryItems);
      },
      (err) => setMessage("Delete failed.")
    );
    setLoading(false);
  };

  // Cancel edit
  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      alignno: "",
      img: null,
      mediatype: "",
    });
    setOriginalImgName("");
    setEditingId(null);
    setErrors({});
    setMessage("");
    fileInputRef.current.value = "";
  };

  const handleView = (id) => {
    setModalImgId(id);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setModalImgId(null);
  };

  // console.log(galleryItems);
  console.log("modalImgId", modalImgId);
  console.log("modalImgId._id", modalImgId?._id);
  console.log("url", `${GALLERY_URL}/media/${modalImgId?._id}`);

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Gallery Image" : "Add Gallery Image"}
      </h1>
      {message && (
        <div
          className={`mb-6 p-4 border rounded ${
            message.toLowerCase().includes("fail") ||
            message.toLowerCase().includes("error")
              ? "bg-red-100 border-red-400 text-red-700"
              : "bg-green-100 border-green-400 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
      {/* Gallery Form */}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Title Input */}
          <div>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              placeholder="Gallery Image Title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Align Number Input */}
          <div>
            <input
              type="number"
              id="alignno"
              name="alignno"
              value={formData.alignno}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.alignno
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Align Number"
            />
            {errors.alignno && (
              <p className="mt-1 text-sm text-red-500">{errors.alignno}</p>
            )}
          </div>

          {/* Media Type Select */}
          <div>
            <select
              id="mediatype"
              name="mediatype"
              value={formData.mediatype}
              onChange={handleChange}
              className={` placeholder-gray-400 w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                errors.mediatype
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            >
              <option value="">Select Media Type</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            {errors.mediatype && (
              <p className="mt-1 text-sm text-red-500">{errors.mediatype}</p>
            )}
          </div>
        </div>

        <div>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.description
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            maxLength={200}
            placeholder="Description ( Max 200 Characters)"
            rows={2}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="img"
            className="block text-gray-700 font-medium mb-1.5 text-sm"
          >
            {formData.mediatype === "video"
              ? "Gallery Video (MP4, MOV, AVI)"
              : "Gallery Image (JPG, PNG, GIF)"}
          </label>

          <div className="flex items-center">
            <label className="flex flex-col items-center px-3 py-3 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 text-[#525B88] mb-1" />
              <span className="text-xs text-gray-600">
                {formData.img instanceof File
                  ? formData.img.name
                  : editingId && keepExistingImage && originalImgName
                  ? originalImgName
                  : formData.mediatype === "video"
                  ? "Choose a video"
                  : "Choose an image"}
              </span>

              <input
                type="file"
                id="img"
                name="img"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const maxImageSize = 100 * 1024; // 100 KB
                  const maxVideoSize = 10 * 1024 * 1024; // 10 MB

                  if (
                    formData.mediatype === "image" &&
                    file.size > maxImageSize
                  ) {
                    setErrors({
                      ...errors,
                      img: "Image size should not exceed 100 KB",
                    });
                    e.target.value = "";
                    return;
                  }

                  if (
                    formData.mediatype === "video" &&
                    file.size > maxVideoSize
                  ) {
                    setErrors({
                      ...errors,
                      img: "Video size should not exceed 10 MB",
                    });
                    e.target.value = "";
                    return;
                  }

                  setErrors({ ...errors, img: "" });
                  setFormData({ ...formData, img: file });
                }}
                className="hidden"
                accept={formData.mediatype === "video" ? "video/*" : "image/*"}
                ref={fileInputRef}
              />
            </label>

            {(formData.img ||
              (editingId && keepExistingImage && originalImgName)) && (
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, img: null });
                  setKeepExistingImage(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-3 p-1.5 text-red-500 hover:text-red-700"
                title="Remove file"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {errors.img && (
            <p className="mt-1 text-sm text-red-500">{errors.img}</p>
          )}

          <p className="mt-1 text-xs text-gray-500">
            {formData.mediatype === "video"
              ? "Accepted formats: MP4, MOV, AVI (Max 10MB)"
              : "Accepted formats: JPG, PNG, GIF (Max 100KB)"}
          </p>

          {/* Preview */}
          {formData.img && (
            <>
              {formData.mediatype === "video" ? (
                <video
                  src={URL.createObjectURL(formData.img)}
                  controls
                  className="h-24 mt-2 rounded"
                />
              ) : (
                <img
                  src={URL.createObjectURL(formData.img)}
                  alt="Preview"
                  className="h-24 mt-2 rounded"
                />
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
            disabled={loading}
          >
            {editingId ? (
              <>
                <CheckIcon className="h-4 w-4 inline mr-1.5" />
                Update Gallery
              </>
            ) : (
              "Add Gallery"
            )}
          </button>
        </div>
      </form>
      {/* Gallery Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Gallery Images
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525b88]"></div>
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/3">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                  Align No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                  Image
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider w-1/6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {galleryItems.length > 0 ? (
                galleryItems.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.alignno}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <button
                        // onClick={() => handleView(item._id)}
                        onClick={() => handleView(item)}
                        className="px-3 py-1 bg-[#525b88] text-white rounded hover:bg-[#3a4166]"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-[#525b88] hover:text-[#3a4166]"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No gallery images found. Add your first image!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal for image preview */}
      {/* {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-700 z-50">
          <div className=" rounded-lg p-4 max-w-lg w-full relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <img
              src={`${GALLERY_URL}/image/${modalImgId}`}
              alt="Gallery Preview"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )} */}
      {showModal && modalImgId && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-70 z-50">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full relative shadow-lg">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {modalImgId.mediatype === "video" ? (
              <video
                src={`${GALLERY_URL}/image/${modalImgId._id}`}
                controls
                autoPlay
                className="w-full h-auto rounded"
              />
            ) : (
              <img
                src={`${GALLERY_URL}/image/${modalImgId._id}`}
                alt={modalImgId.title}
                className="w-full h-auto rounded"
              />
            )}

            <div className="mt-3">
              <h3 className="text-lg font-semibold text-[#525b88]">
                {modalImgId.title}
              </h3>
              {modalImgId.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {modalImgId.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
