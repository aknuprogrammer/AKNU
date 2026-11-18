import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { useFormHook } from "../../Hooks/FormHook";
import { API } from "../../config/urls";
import {
  showAxiosError,
  showSuccessMessage,
  showErrorMessage,
} from "../../config/Toast";
import {
  CheckIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { z } from "zod";

// Validation schema for upload pay slip form
const uploadPaySlipSchema = z.object({
  employeeName: z.string().min(1, "Employee Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  payPeriod: z.string().min(1, "Pay Period is required"),
  paidDays: z
    .string()
    .min(1, "Paid Days is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Paid Days must be a valid number",
    }),
  lossOfPayDays: z
    .string()
    .min(1, "Loss of Pay Days is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Loss of Pay Days must be a valid number",
    }),
  payDate: z.string().min(1, "Pay Date is required"),
  notes: z.string().optional(),
  paySlipFile: z.any().optional(), // File is optional (will be validated in handleSubmit)
});

export default function UploadPaySlip() {
  const { FormWrapper, errors, register, reset, setValue } = useFormHook({
    validation: uploadPaySlipSchema,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadList, setUploadList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Income Details state
  const [earnings, setEarnings] = useState([
    { id: 1, type: "Basic", amount: "0.00" },
    { id: 2, type: "House Rent Allowance", amount: "0.00" },
    { id: 3, type: "Professional Allowance", amount: "0.00" },
    { id: 4, type: "Travelling Allowance", amount: "0.00" },
  ]);
  const [deductions, setDeductions] = useState([
    { id: 1, type: "Income Tax", amount: "0.00" },
    { id: 2, type: "Provident Fund", amount: "0.00" },
    { id: 3, type: "Professional Tax", amount: "0.00" },
  ]);

  // Ref to track scroll position and prevent scroll restoration
  const scrollPositionRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
  const activeInputInfoRef = useRef({
    id: null,
    field: null,
    type: null,
    selection: { start: 0, end: 0 },
  }); // type: 'earning' or 'deduction'

  // Fetch uploaded pay slips
  const fetchUploadData = async () => {
    setLoading(true);
    try {
      const resp = await API.get("/employee/upload-pay-slip");
      setUploadList(resp.data.data || resp.data || []);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadData();
  }, []);

  // Restore scroll position and input focus after render if needed
  useLayoutEffect(() => {
    if (shouldRestoreScrollRef.current) {
      // Restore scroll position first
      const container = document.querySelector(".overflow-y-auto");
      if (container) {
        container.scrollTop = scrollPositionRef.current;
      } else {
        window.scrollTo(0, scrollPositionRef.current);
      }

      // Restore input focus and selection if there was an active input
      const { id, field, type, selection } = activeInputInfoRef.current;
      if (id && field && type) {
        // Find the input element using the correct data attribute based on type
        const dataAttribute =
          type === "earning"
            ? `data-earning-id="${id}"`
            : `data-deduction-id="${id}"`;
        const inputs = document.querySelectorAll(`input[${dataAttribute}]`);
        const targetInput = Array.from(inputs).find((input) => {
          if (field === "amount") {
            return input.type === "number";
          } else if (field === "type") {
            return input.type === "text";
          }
          return false;
        });

        if (targetInput) {
          try {
            targetInput.focus();
            if (
              targetInput.setSelectionRange &&
              selection.start !== undefined
            ) {
              targetInput.setSelectionRange(selection.start, selection.end);
            }
          } catch (e) {
            // Ignore focus errors
          }
        }
      }

      shouldRestoreScrollRef.current = false;
    }
  });

  const handleSubmit = async (data) => {
    // Validate file is required only when creating new record
    if (!editingId && (!data.paySlipFile || !data.paySlipFile[0])) {
      showErrorMessage("Pay slip file is required");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("employeeName", data.employeeName);
      formData.append("employeeId", data.employeeId);
      formData.append("payPeriod", data.payPeriod);
      formData.append("paidDays", data.paidDays);
      formData.append("lossOfPayDays", data.lossOfPayDays);
      formData.append("payDate", data.payDate);
      if (data.notes) {
        formData.append("notes", data.notes);
      }
      if (data.paySlipFile && data.paySlipFile[0]) {
        formData.append("paySlipFile", data.paySlipFile[0]);
      }

      // Append income details
      formData.append("earnings", JSON.stringify(earnings));
      formData.append("deductions", JSON.stringify(deductions));
      formData.append("grossEarnings", calculateGrossEarnings().toString());
      formData.append("totalDeductions", calculateTotalDeductions().toString());
      formData.append("netPayable", calculateNetPayable().toString());

      let resp;
      if (editingId) {
        resp = await API.put(
          `/employee/upload-pay-slip/${editingId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        showSuccessMessage(
          resp.data.message || "Pay slip updated successfully!"
        );
      } else {
        resp = await API.post("/employee/upload-pay-slip", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showSuccessMessage(
          resp.data.message || "Pay slip uploaded successfully!"
        );
      }
      reset();
      setEditingId(null);
      // Reset income details
      setEarnings([
        { id: 1, type: "Basic", amount: "0.00" },
        { id: 2, type: "House Rent Allowance", amount: "0.00" },
        { id: 3, type: "Professional Allowance", amount: "0.00" },
        { id: 4, type: "Travelling Allowance", amount: "0.00" },
      ]);
      setDeductions([
        { id: 1, type: "Income Tax", amount: "0.00" },
        { id: 2, type: "Provident Fund", amount: "0.00" },
        { id: 3, type: "Professional Tax", amount: "0.00" },
      ]);
      fetchUploadData();
    } catch (error) {
      showAxiosError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setValue("employeeName", item.employeeName || "");
    setValue("employeeId", item.employeeId || item.employeeID || "");
    setValue("payPeriod", item.payPeriod || "");
    setValue("paidDays", item.paidDays?.toString() || "");
    setValue("lossOfPayDays", item.lossOfPayDays?.toString() || "");
    setValue("payDate", item.payDate ? item.payDate.split("T")[0] : "");
    setValue("notes", item.notes || "");

    // Load income details if available
    try {
      if (item.earnings) {
        const earningsData =
          typeof item.earnings === "string"
            ? JSON.parse(item.earnings)
            : item.earnings;
        if (Array.isArray(earningsData) && earningsData.length > 0) {
          setEarnings(earningsData);
        } else {
          setEarnings([
            { id: 1, type: "Basic", amount: "0.00" },
            { id: 2, type: "House Rent Allowance", amount: "0.00" },
            { id: 3, type: "Professional Allowance", amount: "0.00" },
            { id: 4, type: "Travelling Allowance", amount: "0.00" },
          ]);
        }
      } else {
        setEarnings([
          { id: 1, type: "Basic", amount: "0.00" },
          { id: 2, type: "House Rent Allowance", amount: "0.00" },
          { id: 3, type: "Professional Allowance", amount: "0.00" },
          { id: 4, type: "Travelling Allowance", amount: "0.00" },
        ]);
      }
    } catch (e) {
      setEarnings([
        { id: 1, type: "Basic", amount: "0.00" },
        { id: 2, type: "House Rent Allowance", amount: "0.00" },
        { id: 3, type: "Professional Allowance", amount: "0.00" },
        { id: 4, type: "Travelling Allowance", amount: "0.00" },
      ]);
    }

    try {
      if (item.deductions) {
        const deductionsData =
          typeof item.deductions === "string"
            ? JSON.parse(item.deductions)
            : item.deductions;
        if (Array.isArray(deductionsData) && deductionsData.length > 0) {
          setDeductions(deductionsData);
        } else {
          setDeductions([
            { id: 1, type: "Income Tax", amount: "0.00" },
            { id: 2, type: "Provident Fund", amount: "0.00" },
            { id: 3, type: "Professional Tax", amount: "0.00" },
          ]);
        }
      } else {
        setDeductions([
          { id: 1, type: "Income Tax", amount: "0.00" },
          { id: 2, type: "Provident Fund", amount: "0.00" },
          { id: 3, type: "Professional Tax", amount: "0.00" },
        ]);
      }
    } catch (e) {
      setDeductions([
        { id: 1, type: "Income Tax", amount: "0.00" },
        { id: 2, type: "Provident Fund", amount: "0.00" },
        { id: 3, type: "Professional Tax", amount: "0.00" },
      ]);
    }
    // Note: File input cannot be pre-filled for security reasons
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this uploaded pay slip?")
    ) {
      return;
    }
    try {
      const resp = await API.delete(`/employee/upload-pay-slip/${id}`);
      showSuccessMessage(resp.data.message || "Pay slip deleted successfully!");
      fetchUploadData();
    } catch (error) {
      showAxiosError(error);
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    // Reset income details
    setEarnings([
      { id: 1, type: "Basic", amount: "0.00" },
      { id: 2, type: "House Rent Allowance", amount: "0.00" },
      { id: 3, type: "Professional Allowance", amount: "0.00" },
      { id: 4, type: "Travelling Allowance", amount: "0.00" },
    ]);
    setDeductions([
      { id: 1, type: "Income Tax", amount: "0.00" },
      { id: 2, type: "Provident Fund", amount: "0.00" },
      { id: 3, type: "Professional Tax", amount: "0.00" },
    ]);
  };

  // Format pay period for display
  const formatPayPeriod = (period) => {
    if (!period) return "-";
    if (period.includes("-")) {
      const [year, month] = period.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return period;
  };

  // Calculate totals
  const calculateGrossEarnings = () => {
    return earnings.reduce((sum, earning) => {
      const amount = parseFloat(earning.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const calculateTotalDeductions = () => {
    return deductions.reduce((sum, deduction) => {
      const amount = parseFloat(deduction.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const calculateNetPayable = () => {
    return calculateGrossEarnings() - calculateTotalDeductions();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Handle earnings changes with scroll position preservation
  const handleEarningChange = useCallback((id, field, value, event) => {
    // Save current scroll position
    const scrollContainer = document.querySelector(".overflow-y-auto");
    if (scrollContainer) {
      scrollPositionRef.current = scrollContainer.scrollTop;
    } else {
      scrollPositionRef.current = window.pageYOffset || window.scrollY;
    }

    // Save active input info for restoration
    if (event && event.target) {
      activeInputInfoRef.current = {
        id,
        field,
        type: "earning", // Mark as earning
        selection: {
          start: event.target.selectionStart || 0,
          end: event.target.selectionEnd || 0,
        },
      };
    }

    shouldRestoreScrollRef.current = true;

    setEarnings((prev) =>
      prev.map((earning) =>
        earning.id === id ? { ...earning, [field]: value } : earning
      )
    );
  }, []);

  const addEarning = useCallback(() => {
    setEarnings((prev) => {
      const newId = Math.max(...prev.map((e) => e.id), 0) + 1;
      return [...prev, { id: newId, type: "", amount: "0.00" }];
    });
  }, []);

  const removeEarning = useCallback((id) => {
    setEarnings((prev) => {
      if (prev.length > 1) {
        return prev.filter((earning) => earning.id !== id);
      }
      return prev;
    });
  }, []);

  // Handle deductions changes with scroll position preservation
  const handleDeductionChange = useCallback((id, field, value, event) => {
    // Save current scroll position
    const scrollContainer = document.querySelector(".overflow-y-auto");
    if (scrollContainer) {
      scrollPositionRef.current = scrollContainer.scrollTop;
    } else {
      scrollPositionRef.current = window.pageYOffset || window.scrollY;
    }

    // Save active input info for restoration
    if (event && event.target) {
      activeInputInfoRef.current = {
        id,
        field,
        type: "deduction", // Mark as deduction
        selection: {
          start: event.target.selectionStart || 0,
          end: event.target.selectionEnd || 0,
        },
      };
    }

    shouldRestoreScrollRef.current = true;

    setDeductions((prev) =>
      prev.map((deduction) =>
        deduction.id === id ? { ...deduction, [field]: value } : deduction
      )
    );
  }, []);

  const addDeduction = useCallback(() => {
    setDeductions((prev) => {
      const newId = Math.max(...prev.map((d) => d.id), 0) + 1;
      return [...prev, { id: newId, type: "", amount: "0.00" }];
    });
  }, []);

  const removeDeduction = useCallback((id) => {
    setDeductions((prev) => {
      if (prev.length > 1) {
        return prev.filter((deduction) => deduction.id !== id);
      }
      return prev;
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Upload Pay Slip" : "Upload Pay Slip"}
      </h1>

      {/* Upload Pay Slip Form */}
      <FormWrapper
        submitFn={handleSubmit}
        className="bg-white rounded-lg p-4 mb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name
            </label>
            <input
              type="text"
              {...register("employeeName")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.employeeName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              {...register("employeeId")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.employeeId
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter employee ID"
            />
            {errors.employeeId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.employeeId.message}
              </p>
            )}
          </div>

          {/* Pay Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Period
            </label>
            <input
              type="month"
              {...register("payPeriod")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.payPeriod
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            />
            {errors.payPeriod && (
              <p className="mt-1 text-sm text-red-500">
                {errors.payPeriod.message}
              </p>
            )}
          </div>

          {/* Paid Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Days
            </label>
            <input
              type="number"
              {...register("paidDays")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.paidDays
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter paid days"
              min="0"
            />
            {errors.paidDays && (
              <p className="mt-1 text-sm text-red-500">
                {errors.paidDays.message}
              </p>
            )}
          </div>

          {/* Loss of Pay Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loss of Pay Days
            </label>
            <input
              type="number"
              {...register("lossOfPayDays")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.lossOfPayDays
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter loss of pay days"
              min="0"
            />
            {errors.lossOfPayDays && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lossOfPayDays.message}
              </p>
            )}
          </div>

          {/* Pay Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Date
            </label>
            <input
              type="date"
              {...register("payDate")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.payDate
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            />
            {errors.payDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.payDate.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (if any)
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.notes
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter any notes (optional)"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-500">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Pay Slip File */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Slip File {!editingId && "(Required)"}
            </label>
            <input
              type="file"
              {...register("paySlipFile")}
              accept="image/*,.pdf"
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.paySlipFile
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            />
            {errors.paySlipFile && (
              <p className="mt-1 text-sm text-red-500">
                {errors.paySlipFile.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: JPG, PNG, PDF
              {editingId && " - Leave empty to keep existing file"}
            </p>
          </div>
        </div>

        {/* Income Details Section */}
        <div className="mt-6 mb-4">
          <h2 className="text-xl font-semibold text-[#525B88] mb-4">
            Income Details
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Earnings
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                  <div>EARNING TYPE</div>
                  <div>AMOUNT (₹)</div>
                </div>

                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="grid grid-cols-2 gap-2 items-center"
                  >
                    <div className="flex items-center gap-2">
                      {earning.id <= 4 ? (
                        <span className="text-sm text-gray-700 flex-1">
                          {earning.type}
                        </span>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={earning.type}
                            data-earning-id={earning.id}
                            onChange={(e) =>
                              handleEarningChange(
                                earning.id,
                                "type",
                                e.target.value,
                                e
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                              }
                            }}
                            className="flex-1 px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="Earning type"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeEarning(earning.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Remove"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={earning.amount}
                      data-earning-id={earning.id}
                      onChange={(e) =>
                        handleEarningChange(
                          earning.id,
                          "amount",
                          e.target.value,
                          e
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                      className="px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="0.00"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addEarning();
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                >
                  + Add Earning
                </button>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      Gross Earnings
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(calculateGrossEarnings())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Deductions
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                  <div>DEDUCTION TYPE</div>
                  <div>AMOUNT (₹)</div>
                </div>

                {deductions.map((deduction) => (
                  <div
                    key={deduction.id}
                    className="grid grid-cols-2 gap-2 items-center"
                  >
                    <div className="flex items-center gap-2">
                      {deduction.id <= 3 ? (
                        <span className="text-sm text-gray-700 flex-1">
                          {deduction.type}
                        </span>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={deduction.type}
                            data-deduction-id={deduction.id}
                            onChange={(e) =>
                              handleDeductionChange(
                                deduction.id,
                                "type",
                                e.target.value,
                                e
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                              }
                            }}
                            className="flex-1 px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="Deduction type"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeDeduction(deduction.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Remove"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={deduction.amount}
                      data-deduction-id={deduction.id}
                      onChange={(e) =>
                        handleDeductionChange(
                          deduction.id,
                          "amount",
                          e.target.value,
                          e
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                      className="px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="0.00"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addDeduction();
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                >
                  + Add Deduction
                </button>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      Total Deductions
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(calculateTotalDeductions())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Net Payable */}
          <div className="mt-6 bg-white border-2 border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-900">
                Total Net Payable
              </span>
              <span className="text-xl font-bold text-[#525B88]">
                {formatCurrency(calculateNetPayable())}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Gross Earnings - Total Deductions
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
            disabled={isSubmitting}
          >
            {editingId ? (
              <>
                <CheckIcon className="h-4 w-4 inline mr-1.5" />
                Update Pay Slip
              </>
            ) : (
              "Upload Pay Slip"
            )}
          </button>
        </div>
      </FormWrapper>

      {/* Uploaded Pay Slips Table */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Uploaded Pay Slips
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage all uploaded pay slips
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Pay Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Paid Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Loss of Pay Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Pay Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadList.length > 0 ? (
                  uploadList.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.employeeName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.employeeId || item.employeeID || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPayPeriod(item.payPeriod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.paidDays ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.lossOfPayDays ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.payDate
                          ? new Date(item.payDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-md">{item.notes || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.paySlipFile ? (
                          <a
                            href={item.paySlipFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View File
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
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
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-gray-600">
                          No uploaded pay slips found
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Upload your first pay slip to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
