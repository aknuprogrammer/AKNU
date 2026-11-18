import React, { useState, useEffect } from "react";
import { useFormHook } from "../../Hooks/FormHook";
import { z } from "zod";

// Validation schemas for different form types
const formSchemas = {
  query: z.object({
    employeeName: z.string().min(1, "Employee Name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    email: z.string().email("Please enter a valid email address"),
    contactNumber: z
      .string()
      .min(10, "Contact Number must be at least 10 digits")
      .max(10, "Contact Number must be 10 digits")
      .regex(/^\d+$/, "Contact Number must contain only digits"),
    department: z.string().min(1, "Department is required"),
    queryType: z.string().min(1, "Query Type is required"),
    subject: z.string().min(1, "Subject is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    priority: z.enum(["low", "medium", "high"], {
      errorMap: () => ({ message: "Priority is required" }),
    }),
    attachments: z.any().optional(),
  }),
  bills: z.object({
    employeeName: z.string().min(1, "Employee Name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    email: z.string().email("Please enter a valid email address"),
    contactNumber: z
      .string()
      .min(10, "Contact Number must be at least 10 digits")
      .max(10, "Contact Number must be 10 digits")
      .regex(/^\d+$/, "Contact Number must contain only digits"),
    department: z.string().min(1, "Department is required"),
    billType: z.string().min(1, "Bill Type is required"),
    billAmount: z
      .string()
      .min(1, "Bill Amount is required")
      .regex(/^\d+(\.\d{1,2})?$/, "Bill Amount must be a valid number"),
    billDate: z.string().min(1, "Bill Date is required"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    attachments: z.any().optional(),
  }),
  resignation: z.object({
    employeeName: z.string().min(1, "Employee Name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    email: z.string().email("Please enter a valid email address"),
    contactNumber: z
      .string()
      .min(10, "Contact Number must be at least 10 digits")
      .max(10, "Contact Number must be 10 digits")
      .regex(/^\d+$/, "Contact Number must contain only digits"),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
    resignationDate: z.string().min(1, "Resignation Date is required"),
    lastWorkingDate: z.string().min(1, "Last Working Date is required"),
    reason: z.string().min(1, "Reason is required"),
    reasonDetails: z.string().min(10, "Reason Details must be at least 10 characters"),
    noticePeriodDays: z
      .string()
      .min(1, "Notice Period Days is required")
      .regex(/^\d+$/, "Notice Period Days must be a valid number"),
    handoverNotes: z.string().optional(),
    handoverTo: z.string().optional(),
    attachments: z.any().optional(),
  }),
  // Add more form types here as needed
  // leave: z.object({ ... }),
  // timesheet: z.object({ ... }),
};

const AddFormModal = ({ 
  formType = "query", 
  initialData = null, 
  departments = [], 
  userEmployeeId = null,
  userEmployeeName = null,
  userRole = null,
  onSubmit, 
  onClose 
}) => {
  const schema = formSchemas[formType];
  const { FormWrapper, errors, register, reset, setValue } = useFormHook({
    validation: schema,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Get form title based on form type
  const getFormTitle = () => {
    const action = initialData ? "Edit" : "Add";
    const titles = {
      query: "Query",
      bills: "Bill",
      leave: "Leave",
      timesheet: "Timesheet",
      resignation: "Resignation",
      // Add more types as needed
    };
    return `${action} ${titles[formType] || "Form"}`;
  };

  // Pre-fill form if editing or auto-populate with logged-in employee details
  useEffect(() => {
    if (initialData) {
      // When editing, use logged-in user's details for employee fields
      const formData = { ...initialData };
      if (userEmployeeId) {
        formData.employeeId = userEmployeeId;
      }
      if (userEmployeeName) {
        formData.employeeName = userEmployeeName;
      }
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          setValue(key, formData[key]);
        }
      });
    } else {
      // When adding new, auto-populate with logged-in employee details
      if (userEmployeeId && userEmployeeName) {
        setValue("employeeId", userEmployeeId);
        setValue("employeeName", userEmployeeName);
      }
    }
  }, [initialData, userEmployeeId, userEmployeeName, setValue]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Create FormData for consistency (even though we're not using API)
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "attachments" && data[key] && data[key].length > 0) {
          Array.from(data[key]).forEach((file) => {
            formData.append("attachments", file);
          });
        } else if (key !== "attachments") {
          formData.append(key, data[key]);
        }
      });

      await onSubmit(formData);
    } catch (error) {
      setError(error.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form fields based on form type
  const renderFormFields = () => {
    switch (formType) {
      case "query":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("employeeName")}
                  readOnly={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  disabled={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.employeeName ? "border-red-500" : "border-gray-200"
                  } ${userEmployeeId && userRole !== "super_admin" && userRole !== "admin" ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter employee name"
                />
                {errors.employeeName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.employeeName.message}
                  </p>
                )}
              </div>

              {/* Employee ID */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("employeeId")}
                  readOnly={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  disabled={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.employeeId ? "border-red-500" : "border-gray-200"
                  } ${userEmployeeId && userRole !== "super_admin" && userRole !== "admin" ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter employee ID"
                />
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register("contactNumber")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter contact number"
                  maxLength={10}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("department")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.department ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Query Type */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Query Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("queryType")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.queryType ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select Query Type</option>
                  <option value="technical">Technical Issue</option>
                  <option value="administrative">Administrative</option>
                  <option value="hr">HR Related</option>
                  <option value="leave">Leave Related</option>
                  <option value="payroll">Payroll Related</option>
                  <option value="general">General Inquiry</option>
                  <option value="other">Other</option>
                </select>
                {errors.queryType && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.queryType.message}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register("priority")}
                      value="low"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Low</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register("priority")}
                      value="medium"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Medium</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register("priority")}
                      value="high"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">High</span>
                  </label>
                </div>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.priority.message}
                  </p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("subject")}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.subject ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Enter query subject"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={5}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.description ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Please describe your query in detail (minimum 10 characters)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Attachments (Optional)
              </label>
              <input
                type="file"
                {...register("attachments")}
                multiple
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 5MB per file)
              </p>
            </div>
          </>
        );
      case "bills":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("employeeName")}
                  readOnly={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  disabled={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.employeeName ? "border-red-500" : "border-gray-200"
                  } ${userEmployeeId && userRole !== "super_admin" && userRole !== "admin" ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter employee name"
                />
                {errors.employeeName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.employeeName.message}
                  </p>
                )}
              </div>

              {/* Employee ID */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("employeeId")}
                  readOnly={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  disabled={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.employeeId ? "border-red-500" : "border-gray-200"
                  } ${userEmployeeId && userRole !== "super_admin" && userRole !== "admin" ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter employee ID"
                />
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register("contactNumber")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter contact number"
                  maxLength={10}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("department")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.department ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Bill Type */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Bill Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("billType")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.billType ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select Bill Type</option>
                  <option value="travel">Travel Expenses</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="food">Food & Beverages</option>
                  <option value="stationery">Stationery & Supplies</option>
                  <option value="medical">Medical Expenses</option>
                  <option value="utility">Utility Bills</option>
                  <option value="other">Other Expenses</option>
                </select>
                {errors.billType && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.billType.message}
                  </p>
                )}
              </div>

              {/* Bill Amount */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Bill Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("billAmount")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.billAmount ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter bill amount"
                />
                {errors.billAmount && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.billAmount.message}
                  </p>
                )}
              </div>

              {/* Bill Date */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Bill Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("billDate")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.billDate ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.billDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.billDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.description ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Please provide details about the bill (minimum 5 characters)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Bill Receipt/Documents <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                {...register("attachments")}
                multiple
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 5MB per file)
              </p>
            </div>
          </>
        );
      case "resignation":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("employeeName")}
                  readOnly={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  disabled={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.employeeName ? "border-red-500" : "border-gray-200"
                  } ${userEmployeeId && userRole !== "super_admin" && userRole !== "admin" ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter employee name"
                />
                {errors.employeeName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.employeeName.message}
                  </p>
                )}
              </div>

              {/* Employee ID */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("employeeId")}
                  readOnly={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  disabled={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.employeeId ? "border-red-500" : "border-gray-200"
                  } ${userEmployeeId && userRole !== "super_admin" && userRole !== "admin" ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter employee ID"
                />
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register("contactNumber")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter contact number"
                  maxLength={10}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("department")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.department ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("designation")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.designation ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter designation"
                />
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.designation.message}
                  </p>
                )}
              </div>

              {/* Resignation Date */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Resignation Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("resignationDate")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.resignationDate ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.resignationDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.resignationDate.message}
                  </p>
                )}
              </div>

              {/* Last Working Date */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Last Working Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("lastWorkingDate")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.lastWorkingDate ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.lastWorkingDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lastWorkingDate.message}
                  </p>
                )}
              </div>

              {/* Notice Period Days */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Notice Period (Days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("noticePeriodDays")}
                  min="0"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.noticePeriodDays ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter notice period in days"
                />
                {errors.noticePeriodDays && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.noticePeriodDays.message}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("reason")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    errors.reason ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select Reason</option>
                  <option value="personal">Personal Reasons</option>
                  <option value="career_growth">Career Growth</option>
                  <option value="better_opportunity">Better Opportunity</option>
                  <option value="relocation">Relocation</option>
                  <option value="health">Health Issues</option>
                  <option value="family">Family Reasons</option>
                  <option value="other">Other</option>
                </select>
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.reason.message}
                  </p>
                )}
              </div>
            </div>

            {/* Reason Details */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Reason Details <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("reasonDetails")}
                rows={4}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.reasonDetails ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Please provide detailed reason for resignation (minimum 10 characters)"
              />
              {errors.reasonDetails && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.reasonDetails.message}
                </p>
              )}
            </div>

            {/* Handover To */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Handover To (Optional)
              </label>
              <input
                type="text"
                {...register("handoverTo")}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.handoverTo ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Enter employee name for handover"
              />
              {errors.handoverTo && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.handoverTo.message}
                </p>
              )}
            </div>

            {/* Handover Notes */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Handover Notes (Optional)
              </label>
              <textarea
                {...register("handoverNotes")}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.handoverNotes ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Enter any handover notes or instructions"
              />
              {errors.handoverNotes && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.handoverNotes.message}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Attachments (Optional)
              </label>
              <input
                type="file"
                {...register("attachments")}
                multiple
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB per file)
              </p>
            </div>
          </>
        );
      default:
        return <p className="text-gray-500">Form type not supported</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
      <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
          <h3 className="text-lg font-semibold text-white">
            {getFormTitle()}
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

        {/* Form Body */}
        <FormWrapper
          submitFn={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {renderFormFields()}

          {/* Footer Buttons */}
          <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-[#525B88]/20 bg-gradient-to-r from-[#525B88] to-[#3a4166] hover:from-[#3a4166] hover:to-[#2d3450] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88] disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting..."
                : initialData
                ? "Update"
                : "Create"}
            </button>
          </div>
        </FormWrapper>
      </div>
    </div>
  );
};

export default AddFormModal;

