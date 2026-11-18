import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const AddFormModal = ({ formType, initialData, onSubmit, onClose, activeTab }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Initialize form based on formType
      switch (formType) {
        case "hostels":
          setFormData({
            registrationNumber: "",
            employeeId: "",
            studentName: "",
            employeeName: "",
            name: "",
            course: "",
            department: "",
            hostelName: "",
            roomType: "",
            joiningDate: new Date().toISOString().split("T")[0],
            duration: 12,
            feePerMonth: 0,
            status: "active",
            remarks: "",
          });
          break;
        case "inventory":
          setFormData({
            itemName: "",
            category: "",
            hostelName: "",
            location: "",
            quantity: 0,
            purchaseDate: new Date().toISOString().split("T")[0],
            purchasePrice: 0,
            supplier: "",
            warrantyExpiry: "",
            status: "available",
            description: "",
            condition: "Good",
          });
          break;
        case "spend":
          setFormData({
            itemName: "",
            category: "",
            hostelName: "",
            location: "",
            initialQuantity: 0,
            usedQuantity: 0,
            remainingQuantity: 0,
            requiredQuantity: 0,
            unit: "",
            lastUsedDate: new Date().toISOString().split("T")[0],
            description: "",
          });
          break;
        default:
          setFormData({});
      }
    }
  }, [initialData, formType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: 
        name === "quantity" || name === "initialQuantity" || name === "usedQuantity" || 
        name === "remainingQuantity" || name === "requiredQuantity" || name === "feePerMonth" ||
        name === "purchasePrice" || name === "duration"
          ? parseFloat(value) || 0 
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    const action = initialData ? "Edit" : "Add New";
    const titles = {
      hostels: "Hostel Application",
      inventory: "Inventory Item",
      spend: "Spend Item",
    };
    return `${action} ${titles[formType] || "Item"}`;
  };

  const renderFormFields = () => {
    switch (formType) {
      case "hostels":
        const isStaff = activeTab === "staff";
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              {isStaff ? (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID: *
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Name: *
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={formData.employeeName || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department: *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number: *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name: *
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course: *
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                </>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name: *
                </label>
                <input
                  type="text"
                  name="hostelName"
                  value={formData.hostelName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type: *
                </label>
                <select
                  name="roomType"
                  value={formData.roomType || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="">Select Room Type</option>
                  <option value="AC">AC</option>
                  <option value="non-AC">Non-AC</option>
                  <option value="attached">Attached</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Date: *
                </label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Months): *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration || 12}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="1"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Per Month (₹): *
                </label>
                <input
                  type="number"
                  name="feePerMonth"
                  value={formData.feePerMonth || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status: *
                </label>
                <select
                  name="status"
                  value={formData.status || "active"}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="mb-5 col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks:
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
            </div>
          </>
        );

      case "inventory":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name: *
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category: *
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="furniture">Furniture</option>
                  <option value="appliances">Appliances</option>
                  <option value="electronics">Electronics</option>
                  <option value="bedding">Bedding</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="consumables">Consumables</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name: *
                </label>
                <input
                  type="text"
                  name="hostelName"
                  value={formData.hostelName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Room: *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity: *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date: *
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price (₹): *
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier: *
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Expiry:
                </label>
                <input
                  type="date"
                  name="warrantyExpiry"
                  value={formData.warrantyExpiry || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition: *
                </label>
                <select
                  name="condition"
                  value={formData.condition || "Good"}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Needs Repair">Needs Repair</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status: *
                </label>
                <select
                  name="status"
                  value={formData.status || "available"}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damaged">Damaged</option>
                  <option value="disposed">Disposed</option>
                </select>
              </div>

              <div className="mb-5 col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description:
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
            </div>
          </>
        );

      case "spend":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name: *
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category: *
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="consumables">Consumables</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name: *
                </label>
                <input
                  type="text"
                  name="hostelName"
                  value={formData.hostelName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location: *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Quantity: *
                </label>
                <input
                  type="number"
                  name="initialQuantity"
                  value={formData.initialQuantity || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Used Quantity: *
                </label>
                <input
                  type="number"
                  name="usedQuantity"
                  value={formData.usedQuantity || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remaining Quantity: *
                </label>
                <input
                  type="number"
                  name="remainingQuantity"
                  value={formData.remainingQuantity || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Quantity: *
                </label>
                <input
                  type="number"
                  name="requiredQuantity"
                  value={formData.requiredQuantity || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit: *
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  placeholder="e.g., kg, liters, pieces"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Used Date: *
                </label>
                <input
                  type="date"
                  name="lastUsedDate"
                  value={formData.lastUsedDate || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div className="mb-5 col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description:
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
      <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <h3 className="text-lg font-semibold text-white">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {renderFormFields()}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddFormModal;

