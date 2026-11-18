import { useState, useEffect } from "react";

const AddFormModal = ({ tabKey, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    college_code: "",
    college_name: "",
    location: "",
    type: "",
    coursecode: "",
    coursename: "",
    duration: "",
    fee_code: "",
    purpose_code: "",
    purpose: "",
    fee: "",
    belated_fee: "",
    revised_rate_year: "",
    required_docs: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        college_code: "",
        college_name: "",
        location: "",
        type: "",
        coursecode: "",
        coursename: "",
        duration: "",
        fee_code: "",
        purpose_code: "",
        purpose: "",
        fee: "",
        belated_fee: "",
        revised_rate_year: "",
        required_docs: ""
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    const action = initialData ? "Edit" : "Add New";
    let type = "";
    switch(tabKey) {
      case "collegeSelector":
        type = "College";
        break;
      case "courseSelector":
        type = "Course";
        break;
      case "applicationPurpose":
        type = "Application Purpose";
        break;
      default:
        type = "Item";
    }
    return `${action} ${type}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
      <div className="flex flex-col w-full max-w-md border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <h3 className="text-lg font-semibold text-white">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {tabKey === "collegeSelector" ? (
              <>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    College Code*
                  </label>
                  <input
                    type="text"
                    name="college_code"
                    value={formData.college_code || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    maxLength="15"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    College Name*
                  </label>
                  <input
                    type="text"
                    name="college_name"
                    value={formData.college_name || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    maxLength="205"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Location*
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    maxLength="325"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Type (e.g., Technical, Arts)"
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </>
            ) : tabKey === "courseSelector" ? (
              <>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Course Code*
                  </label>
                  <input
                    type="text"
                    name="coursecode"
                    value={formData.coursecode || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    maxLength="15"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Course Name*
                  </label>
                  <input
                    type="text"
                    name="coursename"
                    value={formData.coursename || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    maxLength="155"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <select
                    name="duration"
                    value={formData.duration || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select Duration</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="2 years">2 years</option>
                    <option value="4 years">4 years</option>
                  </select>
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Fee Code
                  </label>
                  <input
                    type="text"
                    name="fee_code"
                    value={formData.fee_code || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    maxLength="45"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Purpose Code*
                  </label>
                  <input
                    type="text"
                    name="purpose_code"
                    value={formData.purpose_code || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    maxLength="15"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Purpose*
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Fee*
                  </label>
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Belated Fee*
                  </label>
                  <input
                    type="number"
                    name="belated_fee"
                    value={formData.belated_fee || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Revised Rate Year
                  </label>
                  <input
                    type="number"
                    name="revised_rate_year"
                    value={formData.revised_rate_year || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Required Docs
                  </label>
                  <textarea
                    name="required_docs"
                    value={formData.required_docs || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 transition-all border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-emerald-100 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFormModal;