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

const URL = `${BASE_URL}/carousel`;
const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];

// API functions
const fetchCarouselItems = async (setCarouselItems) => {
  try {
    setLoading(true); // Add this
    const response = await axios.get(URL);
    setCarouselItems(response.data.data.reverse());
  } catch (error) {
    console.error("Error fetching carousel items:", error);
  } finally {
    setLoading(false); // Add this
  }
};
const addCarouselItem = async (formData, onSuccess, onError) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    console.error("Error adding carousel item:", error);
    if (onError) onError(error);
  }
};
const updateCarouselItem = async (id, formData, onSuccess, onError) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${URL}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    console.error("Error updating carousel item:", error);
    if (onError) onError(error);
  }
};
const deleteCarouselItem = async (id, onSuccess, onError) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    console.error("Error deleting carousel item:", error);
    if (onError) onError(error);
  }
};

const Carousel = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    alignno: "",
    img: null,
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
  const fetchCarouselItems = async (setCarouselItems) => {
    try {
      setLoading(true); // Add this
      const response = await axios.get(URL);
      setCarouselItems(response.data.data.reverse());
    } catch (error) {
      console.error("Error fetching carousel items:", error);
    } finally {
      setLoading(false); // Add this
    }
  };

  useEffect(() => {
    fetchCarouselItems(setCarouselItems);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Form validation
  const validate = (isEdit = false) => {
    const errs = {};
    if (!String(formData.title).trim()) errs.title = "Title is required";
    if (!String(formData.alignno).trim())
      errs.alignno = "Align No. is required";
    if (!isEdit && !formData.img) errs.img = "Image file is required";
    if (formData.img && !allowedTypes.includes(formData.img.type)) {
      errs.img = "Only image files (jpg, png, gif) are allowed";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: name === "alignno" ? value : value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setErrors((e) => ({
          ...e,
          img: "Image size must not be greater than 1mb",
        }));
        return;
      }
      setFormData((f) => ({ ...f, img: file }));
      setErrors((e) => ({ ...e, img: undefined }));
    }
  };

  // Handle add/update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    if (!validate(isEdit)) return;
    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("alignno", formData.alignno);
    if (formData.img) formPayload.append("img", formData.img);
    setLoading(true);
    if (isEdit) {
      await updateCarouselItem(
        editingId,
        formPayload,
        () => {
          setMessage("Carousel item updated.");
          setFormData({ title: "", alignno: "", img: null });
          setEditingId(null);
          fileInputRef.current.value = "";
          fetchCarouselItems(setCarouselItems);
        },
        (err) => setMessage("Update failed.")
      );
    } else {
      await addCarouselItem(
        formPayload,
        () => {
          setMessage("Carousel item added.");
          setFormData({ title: "", alignno: "", img: null });
          setEditingId(null);
          fileInputRef.current.value = "";
          fetchCarouselItems(setCarouselItems);
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
      alignno: String(item.alignno),
      img: null,
    });
    setKeepExistingImage(true);
    // Use item.img.originalname if available (MongoDB structure)
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
    if (!window.confirm("Delete this carousel item?")) return;
    setLoading(true);
    await deleteCarouselItem(
      id,
      () => {
        setMessage("Carousel item deleted.");
        fetchCarouselItems(setCarouselItems);
      },
      (err) => setMessage("Delete failed.")
    );
    setLoading(false);
  };

  // Cancel edit
  const handleCancel = () => {
    setFormData({ title: "", alignno: "", img: null });
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

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Carousel Image" : "Add Carousel Image"}
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
      {/* Carousel Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              placeholder="Carousel Image Title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>
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
              placeholder="Carousel Align No."
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
            />
            {errors.alignno && (
              <p className="mt-1 text-sm text-red-500">{errors.alignno}</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="img"
            className="block text-gray-700 font-medium mb-1.5 text-sm"
          >
            Carousel Image (JPG, PNG, GIF)
          </label>
          <div className="flex items-center">
            <label className="flex flex-col items-center px-3 py-3 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 text-[#525B88] mb-1" />
              <span className="text-xs text-gray-600">
                {formData.img instanceof File
                  ? formData.img.name
                  : editingId && keepExistingImage && originalImgName
                  ? originalImgName
                  : "Choose an image"}
              </span>

              <input
                type="file"
                id="img"
                name="img"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
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
            Accepted formats: JPG, PNG (Image only, Max 1 MB)
          </p>
          {formData.img &&
            typeof window !== "undefined" &&
            typeof window.URL !== "undefined" && (
              <img
                src={window.URL.createObjectURL(formData.img)}
                alt="Preview"
                className="h-24 mt-2"
              />
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
                Update Carousel
              </>
            ) : (
              "Add Carousel"
            )}
          </button>
        </div>
      </form>
      {/* Carousel Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Carousel Images
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/5">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-2/5">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                    Align No
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider w-1/10">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {carouselItems.length > 0 ? (
                  carouselItems.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <button
                          onClick={() => handleView(item._id)}
                          className="px-3 py-1 bg-[#525b88] text-white rounded hover:bg-[#3a4166]"
                        >
                          View
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.alignno}
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
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No carousel images found. Add your first image!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for image preview */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-700 z-50">
          <div className=" rounded-lg p-4 max-w-lg w-full relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <img
              src={`${URL}/image/${modalImgId}`}
              alt="Carousel Preview"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
