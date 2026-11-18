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
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Filter, Plus } from "lucide-react";
import { z } from "zod";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { aknuLogoNew, aknuadikavi } from "../../assets";

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
  paySlipFile: z.any().optional(),
});

const EmployeePayroll = () => {
  const { FormWrapper, errors, register, reset, setValue, watch } = useFormHook(
    {
      validation: uploadPaySlipSchema,
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadList, setUploadList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    employeeName: "",
    employeeId: "",
    payPeriod: "",
    payDate: "",
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPaySlip, setSelectedPaySlip] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Income Details state
  const [earnings, setEarnings] = useState([
    { id: 1, type: "Basic", amount: "" },
    { id: 2, type: "House Rent Allowance", amount: "" },
    { id: 3, type: "Professional Allowance", amount: "" },
    { id: 4, type: "Travelling Allowance", amount: "" },
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
  });

  // Fetch uploaded pay slips
  const fetchUploadData = async () => {
    setLoading(true);
    try {
      const resp = await API.get("/employee/upload-pay-slip");
      console.log("Pay slip data response:", resp.data);
      const data = resp.data.data || resp.data || [];
      console.log("Pay slip list:", data);
      if (data.length > 0) {
        console.log("First item structure:", data[0]);
        console.log("First item paySlipFile:", data[0].paySlipFile);
      }
      setUploadList(data);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadData();
  }, []);

  // Filter pay slip data based on search filters
  useEffect(() => {
    let filtered = uploadList;

    if (searchFilters.employeeName) {
      filtered = filtered.filter((record) =>
        record.employeeName
          ?.toLowerCase()
          .includes(searchFilters.employeeName.toLowerCase())
      );
    }
    if (searchFilters.employeeId) {
      filtered = filtered.filter((record) =>
        (record.employeeId || record.employeeID)
          ?.toLowerCase()
          .includes(searchFilters.employeeId.toLowerCase())
      );
    }
    if (searchFilters.payPeriod) {
      filtered = filtered.filter((record) =>
        record.payPeriod
          ?.toLowerCase()
          .includes(searchFilters.payPeriod.toLowerCase())
      );
    }
    if (searchFilters.payDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.payDate
          ? record.payDate.split("T")[0]
          : record.payDate;
        return recordDate === searchFilters.payDate;
      });
    }

    setFilteredList(filtered);
  }, [uploadList, searchFilters]);

  // Restore scroll position and input focus after render if needed
  useLayoutEffect(() => {
    if (shouldRestoreScrollRef.current) {
      const container = document.querySelector(".overflow-y-auto");
      if (container) {
        container.scrollTop = scrollPositionRef.current;
      } else {
        window.scrollTo(0, scrollPositionRef.current);
      }

      const { id, field, type, selection } = activeInputInfoRef.current;
      if (id && field && type) {
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
    setIsSubmitting(true);
    try {
      // Generate PDF payslip
      let pdfBlob, pdfFileName;
      try {
        const pdfResult = await generatePayslipPDF({
          ...data,
          earnings,
          deductions,
        });
        pdfBlob = pdfResult.blob;
        pdfFileName = pdfResult.fileName;
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        showErrorMessage("Failed to generate PDF. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Create FormData for submission
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

      // Append generated PDF
      formData.append("paySlipFile", pdfBlob, pdfFileName);

      formData.append("earnings", JSON.stringify(earnings));
      formData.append("deductions", JSON.stringify(deductions));
      formData.append("grossEarnings", calculateGrossEarnings().toString());
      const lossOfPayDeduction = calculateLossOfPayDeduction();
      const totalDeductionsWithLossOfPay =
        calculateTotalDeductions() + lossOfPayDeduction;
      formData.append(
        "totalDeductions",
        totalDeductionsWithLossOfPay.toString()
      );
      formData.append("lossOfPayDeduction", lossOfPayDeduction.toString());
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
          resp.data.message ||
            "Pay slip updated successfully! PDF has been generated."
        );
      } else {
        resp = await API.post("/employee/upload-pay-slip", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Upload response:", resp.data);
        console.log("Uploaded pay slip data:", resp.data.data);
        showSuccessMessage(
          resp.data.message ||
            "Pay slip uploaded successfully! PDF has been generated and saved."
        );
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      setEarnings([
        { id: 1, type: "Basic", amount: "" },
        { id: 2, type: "House Rent Allowance", amount: "" },
        { id: 3, type: "Professional Allowance", amount: "" },
        { id: 4, type: "Travelling Allowance", amount: "" },
      ]);
      setDeductions([
        { id: 1, type: "Income Tax", amount: "" },
        { id: 2, type: "Provident Fund", amount: "" },
        { id: 3, type: "Professional Tax", amount: "" },
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
    setShowForm(true);

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

  const handleCloseForm = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
    setEarnings([
      { id: 1, type: "Basic", amount: "" },
      { id: 2, type: "House Rent Allowance", amount: "" },
      { id: 3, type: "Professional Allowance", amount: "" },
      { id: 4, type: "Travelling Allowance", amount: "" },
    ]);
    setDeductions([
      { id: 1, type: "Income Tax", amount: "" },
      { id: 2, type: "Provident Fund", amount: "" },
      { id: 3, type: "Professional Tax", amount: "" },
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

  // Get approval status badge styling
  const getApprovalStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  // Handle approve payslip
  const handleApprovePaySlip = async (paySlipId) => {
    if (
      !window.confirm(
        "Approve this pay slip? It will be visible to the employee."
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      const response = await API.patch(
        `/employee/upload-pay-slip/${paySlipId}/approve`
      );
      if (response.data.success) {
        showSuccessMessage("Pay slip approved successfully");
        await fetchUploadData();
      } else {
        showErrorMessage(response.data.message || "Failed to approve pay slip");
      }
    } catch (error) {
      showAxiosError(error, "Failed to approve pay slip");
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject payslip
  const handleRejectPaySlip = async () => {
    if (!selectedPaySlip || !rejectionReason.trim()) {
      showErrorMessage("Please provide a rejection reason");
      return;
    }

    try {
      setProcessing(true);
      const response = await API.patch(
        `/employee/upload-pay-slip/${selectedPaySlip._id}/reject`,
        {
          rejectionReason: rejectionReason.trim(),
        }
      );
      if (response.data.success) {
        showSuccessMessage("Pay slip rejected successfully");
        setShowRejectModal(false);
        setSelectedPaySlip(null);
        setRejectionReason("");
        await fetchUploadData();
      } else {
        showErrorMessage(response.data.message || "Failed to reject pay slip");
      }
    } catch (error) {
      showAxiosError(error, "Failed to reject pay slip");
    } finally {
      setProcessing(false);
    }
  };

  // Open reject modal
  const openRejectModal = (paySlip) => {
    setSelectedPaySlip(paySlip);
    setShowRejectModal(true);
    setRejectionReason("");
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

  // Calculate Loss of Pay Deduction based on leaves
  // Formula: n * (basic amount / days in a month)
  // where n = number of leaves (loss of pay days)
  const calculateLossOfPayDeduction = useCallback(() => {
    // Get values directly from form inputs
    const paidDaysValue = parseFloat(
      document.querySelector('input[name="paidDays"]')?.value || 0
    );
    const lossOfPayDaysValue = parseFloat(
      document.querySelector('input[name="lossOfPayDays"]')?.value || 0
    );

    if (lossOfPayDaysValue <= 0) {
      return 0;
    }

    // Find Basic amount from earnings
    const basicEarning = earnings.find((e) => e.type === "Basic");
    const basicAmount = parseFloat(basicEarning?.amount || 0);

    if (basicAmount <= 0) {
      return 0;
    }

    // Calculate days in a month (use paidDays + lossOfPayDays as total days)
    const daysInMonth = paidDaysValue + lossOfPayDaysValue;

    // If no days specified, default to 30 days
    const totalDays = daysInMonth > 0 ? daysInMonth : 30;

    // Calculate deduction: n * (basic amount / days in a month)
    const deduction = lossOfPayDaysValue * (basicAmount / totalDays);

    return deduction;
  }, [earnings]);

  const calculateNetPayable = () => {
    const grossEarnings = calculateGrossEarnings();
    const totalDeductions = calculateTotalDeductions();
    const lossOfPayDeduction = calculateLossOfPayDeduction();

    return grossEarnings - totalDeductions - lossOfPayDeduction;
  };

  // Format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `Rs.${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Convert number to words (Indian format)
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " " + numberToWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        numberToWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 !== 0 ? " " + numberToWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        numberToWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 !== 0 ? " " + numberToWords(num % 100000) : "")
      );
    return (
      numberToWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 !== 0 ? " " + numberToWords(num % 10000000) : "")
    );
  };

  // Load logo as base64
  const loadLogoAsBase64 = (logoPath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = logoPath;
    });
  };

  // Generate Payslip PDF
  const generatePayslipPDF = async (formData) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 15;

    // Helper function to calculate loss of pay deduction for PDF
    // Formula: n * (basic amount / days in a month)
    const calculateLossOfPayForPDF = (
      paidDays,
      lossOfPayDays,
      earningsData
    ) => {
      const paidDaysValue = parseFloat(paidDays || 0);
      const lossOfPayDaysValue = parseFloat(lossOfPayDays || 0);

      if (lossOfPayDaysValue <= 0) {
        return 0;
      }

      // Find Basic amount from earnings
      const basicEarning = earningsData.find((e) => e.type === "Basic");
      const basicAmount = parseFloat(basicEarning?.amount || 0);

      if (basicAmount <= 0) {
        return 0;
      }

      // Calculate days in a month (use paidDays + lossOfPayDays as total days)
      const daysInMonth = paidDaysValue + lossOfPayDaysValue;
      // If no days specified, default to 30 days
      const totalDays = daysInMonth > 0 ? daysInMonth : 30;

      // Calculate deduction: n * (basic amount / days in a month)
      const deduction = lossOfPayDaysValue * (basicAmount / totalDays);

      return deduction;
    };

    // Load logos
    let aknuLogoBase64, adikaviLogoBase64;
    try {
      aknuLogoBase64 = await loadLogoAsBase64(aknuLogoNew);
    } catch (e) {
      console.error("Error loading AKNU logo:", e);
    }
    try {
      adikaviLogoBase64 = await loadLogoAsBase64(aknuadikavi);
    } catch (e) {
      console.error("Error loading Adikavi logo:", e);
    }

    // Header Section with Logos - Left aligned
    const logoSize = 15; // mm
    const logoY = yPos;
    const spacing = 8; // mm spacing between elements (increased for better spacing)

    // Start from left margin
    const startX = margin;

    // Left Logo (AKNU)
    if (aknuLogoBase64) {
      pdf.addImage(aknuLogoBase64, "PNG", startX, logoY, logoSize, logoSize);
    }

    // Company Name (Title)
    yPos += 5;
    pdf.setFontSize(14);
    pdf.setTextColor(82, 91, 136); // #525B88
    pdf.setFont("helvetica", "bold");
    const titleText = "ADIKAVI NANNAYA UNIVERSITY";
    const companyNameX = startX + logoSize + spacing;
    pdf.text(titleText, companyNameX, yPos);

    // Address (Subtitle) - Left aligned
    yPos += 6;
    pdf.setFontSize(9);
    pdf.setTextColor(82, 91, 136);
    pdf.setFont("helvetica", "normal");
    const addressText = "RAJAMAHENDRAVARAM, ANDHRA PRADESH INDIA - 533296";
    const addressX = startX + logoSize + spacing;
    pdf.text(addressText, addressX, yPos);

    // Right Logo (Nannaya/Adikavi) - positioned with spacing from address text
    if (adikaviLogoBase64) {
      // Calculate address text width
      const addressTextWidth = pdf.getTextWidth(addressText);
      // Calculate minimum X position to have spacing after address text
      const minLogoX = addressX + addressTextWidth + spacing;
      // Also calculate position after title for alignment
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      const titleWidth = pdf.getTextWidth(titleText);
      const titleLogoX = companyNameX + titleWidth + spacing;
      // Use the maximum to ensure spacing from both title and address
      const finalLogoX = Math.max(minLogoX, titleLogoX);

      pdf.addImage(
        adikaviLogoBase64,
        "PNG",
        finalLogoX,
        logoY,
        logoSize,
        logoSize
      );
    }

    // "Payslip For the Month" (Right side)
    yPos = logoY + 5;
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.text("Payslip For the Month", pageWidth - margin, yPos, {
      align: "right",
    });

    yPos += 6;
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
    pdf.setFont("helvetica", "bold");
    pdf.text(formatPayPeriod(formData.payPeriod), pageWidth - margin, yPos, {
      align: "right",
    });

    yPos = logoY + logoSize + 12;

    // Draw a line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Calculate layout positions
    const leftColumnStart = margin;
    const rightColumnStart = pageWidth / 2 + 5;
    const columnWidth = (pageWidth - 2 * margin - 10) / 2;
    const amountColumnWidth = 50;
    const amountColumnRightEdge = pageWidth - margin;

    // Employee Summary Section (Left side)
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("EMPLOYEE SUMMARY", leftColumnStart, yPos);

    yPos += 7;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const employeeInfo = [
      { label: "Employee Name", value: formData.employeeName || "-" },
      { label: "Employee ID", value: formData.employeeId || "-" },
      { label: "Pay Period", value: formatPayPeriod(formData.payPeriod) },
      { label: "Pay Date", value: formatDate(formData.payDate) },
    ];

    let infoY = yPos;
    employeeInfo.forEach((info) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(`${info.label}:`, leftColumnStart, infoY);
      pdf.setFont("helvetica", "bold");
      const labelWidth = pdf.getTextWidth(`${info.label}:`);
      pdf.text(info.value, leftColumnStart + labelWidth + 3, infoY);
      infoY += 5;
    });

    // Calculate net pay early for the net pay box
    const grossEarningsForNetBox = earnings.reduce(
      (sum, e) => sum + parseFloat(e.amount || 0),
      0
    );
    const totalDeductionsForNetBox = deductions.reduce(
      (sum, d) => sum + parseFloat(d.amount || 0),
      0
    );
    const lossOfPayForNetBox = calculateLossOfPayForPDF(
      formData.paidDays,
      formData.lossOfPayDays,
      earnings
    );
    const netPayAmount =
      grossEarningsForNetBox - totalDeductionsForNetBox - lossOfPayForNetBox;

    // Total Net Pay Box (Right side - Top)
    const netPayBoxY = logoY + logoSize + 12;
    const netPayBoxWidth = 60;
    const netPayBoxHeight = 25;
    const netPayBoxX = pageWidth - margin - netPayBoxWidth;

    // Draw box with light green background and dark green left border
    pdf.setFillColor(240, 248, 240); // Light green
    pdf.rect(netPayBoxX, netPayBoxY, netPayBoxWidth, netPayBoxHeight, "F");
    pdf.setFillColor(34, 139, 34); // Dark green
    pdf.rect(netPayBoxX, netPayBoxY, 2, netPayBoxHeight, "F"); // Left border

    // Net Pay Amount
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      formatCurrency(netPayAmount),
      netPayBoxX + netPayBoxWidth - 2,
      netPayBoxY + 12,
      { align: "right" }
    );

    // "Total Net Pay" label
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      "Total Net Pay",
      netPayBoxX + netPayBoxWidth - 2,
      netPayBoxY + 18,
      { align: "right" }
    );

    yPos = infoY + 8;

    // Earnings and Deductions Side by Side
    const tableStartY = yPos;
    const earningsTableWidth = columnWidth;
    const deductionsTableWidth = columnWidth;

    // Calculate values once for PDF
    const grossEarningsForPDF = earnings.reduce(
      (sum, e) => sum + parseFloat(e.amount || 0),
      0
    );
    const totalDeductionsForPDF = deductions.reduce(
      (sum, d) => sum + parseFloat(d.amount || 0),
      0
    );
    const lossOfPayDeduction = calculateLossOfPayForPDF(
      formData.paidDays,
      formData.lossOfPayDays,
      earnings
    );
    const totalDeductionsWithLossOfPay =
      totalDeductionsForPDF + lossOfPayDeduction;
    const netPayableForPDF = grossEarningsForPDF - totalDeductionsWithLossOfPay;

    // Earnings Table (Left)
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("EARNINGS", leftColumnStart, yPos);

    yPos += 6;
    const earningsData = earnings.map((e) => [
      e.type,
      formatCurrency(parseFloat(e.amount || 0)),
    ]);

    autoTable(pdf, {
      startY: yPos,
      head: [["EARNING TYPE", "AMOUNT"]],
      body: earningsData,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [82, 91, 136],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: {
          cellWidth: earningsTableWidth - amountColumnWidth,
          halign: "left",
        },
        1: { cellWidth: amountColumnWidth, halign: "right" },
      },
      margin: {
        left: leftColumnStart,
        right: pageWidth - leftColumnStart - earningsTableWidth,
      },
    });

    const earningsTableEndY = pdf.lastAutoTable.finalY;

    // Deductions Table (Right)
    yPos = tableStartY;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("DEDUCTIONS", rightColumnStart, yPos);

    yPos += 6;
    // Include loss of pay deduction in deductions
    const deductionsData = [
      ...deductions.map((d) => [
        d.type,
        formatCurrency(parseFloat(d.amount || 0)),
      ]),
      ...(lossOfPayDeduction > 0
        ? [["Loss of Pay", formatCurrency(lossOfPayDeduction)]]
        : []),
    ];

    autoTable(pdf, {
      startY: yPos,
      head: [["DEDUCTION TYPE", "AMOUNT"]],
      body: deductionsData,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [82, 91, 136],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: {
          cellWidth: deductionsTableWidth - amountColumnWidth,
          halign: "left",
        },
        1: { cellWidth: amountColumnWidth, halign: "right" },
      },
      margin: {
        left: rightColumnStart,
        right: pageWidth - rightColumnStart - deductionsTableWidth,
      },
    });

    const deductionsTableEndY = pdf.lastAutoTable.finalY;

    // Align both totals on the same line - use the maximum Y position
    const maxTableEndY = Math.max(earningsTableEndY, deductionsTableEndY);
    const totalsY = maxTableEndY + 5;

    // Gross Earnings Total (Left)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    const grossEarningsText = `Gross Earnings: ${formatCurrency(
      grossEarningsForPDF
    )}`;
    pdf.text(
      grossEarningsText,
      leftColumnStart + earningsTableWidth - 2,
      totalsY,
      { align: "right" }
    );

    // Total Deductions (including loss of pay) (Right)
    const totalDeductionsText = `Total Deductions: ${formatCurrency(
      totalDeductionsWithLossOfPay
    )}`;
    pdf.text(
      totalDeductionsText,
      rightColumnStart + deductionsTableWidth - 2,
      totalsY,
      { align: "right" }
    );

    yPos = totalsY + 10;

    // Total Net Payable Section
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("TOTAL NET PAYABLE", leftColumnStart, yPos);

    yPos += 5;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("Gross Earnings - Total Deductions", leftColumnStart, yPos);

    yPos += 6;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(82, 91, 136);
    const netPayableText = formatCurrency(netPayableForPDF);
    pdf.text(netPayableText, amountColumnRightEdge, yPos, { align: "right" });

    yPos += 10;

    // Amount In Words
    const amountInWords = numberToWords(Math.floor(netPayableForPDF));
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      `Amount In Words : Indian Rupee ${amountInWords} Only`,
      leftColumnStart,
      yPos
    );

    yPos += 12;

    // Notes Section (if any)
    if (formData.notes && formData.notes.trim()) {
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      const notesLines = pdf.splitTextToSize(
        `Notes: ${formData.notes}`,
        pageWidth - 2 * margin
      );
      pdf.text(notesLines, leftColumnStart, yPos);
      yPos += notesLines.length * 5;
    }

    // Footer
    yPos = pageHeight - 15;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 8;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.setFont("helvetica", "normal");
    pdf.text("- This is a system-generated document. -", pageWidth / 2, yPos, {
      align: "center",
    });

    // Convert PDF to blob and then to File object for FormData
    const pdfBlob = pdf.output("blob");
    const fileName = `Payslip_${formData.employeeId}_${
      formData.payPeriod || Date.now()
    }.pdf`;

    // Convert blob to File object for better FormData compatibility
    const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

    return { blob: pdfFile, fileName };
  };

  // Handle earnings changes with scroll position preservation
  const handleEarningChange = useCallback((id, field, value, event) => {
    const scrollContainer = document.querySelector(".overflow-y-auto");
    if (scrollContainer) {
      scrollPositionRef.current = scrollContainer.scrollTop;
    } else {
      scrollPositionRef.current = window.pageYOffset || window.scrollY;
    }

    if (event && event.target) {
      activeInputInfoRef.current = {
        id,
        field,
        type: "earning",
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
    const scrollContainer = document.querySelector(".overflow-y-auto");
    if (scrollContainer) {
      scrollPositionRef.current = scrollContainer.scrollTop;
    } else {
      scrollPositionRef.current = window.pageYOffset || window.scrollY;
    }

    if (event && event.target) {
      activeInputInfoRef.current = {
        id,
        field,
        type: "deduction",
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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Employee Payroll Management
        </h2>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#525B88] text-white rounded-lg hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Pay Slip
        </button>
      </div>

      {/* Filter Section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="flex flex-col md:flex-row md:items-center gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-6"
      >
        {/* Employee Name */}
        <div className="flex-1 min-w-[120px]">
          <input
            type="text"
            name="employeeName"
            placeholder="Employee Name"
            value={searchFilters.employeeName}
            onChange={(e) =>
              setSearchFilters({
                ...searchFilters,
                employeeName: e.target.value,
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>

        {/* Employee ID */}
        <div className="flex-1 min-w-[120px]">
          <input
            type="text"
            name="employeeId"
            placeholder="Employee ID"
            value={searchFilters.employeeId}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, employeeId: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>

        {/* Pay Period */}
        <div className="flex-1 min-w-[120px]">
          <input
            type="month"
            name="payPeriod"
            placeholder="Pay Period"
            value={searchFilters.payPeriod}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, payPeriod: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>

        {/* Pay Date */}
        <div className="flex-1 min-w-[120px]">
          <input
            type="date"
            name="payDate"
            placeholder="Pay Date"
            value={searchFilters.payDate}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, payDate: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>

        {/* Filter Button */}
        <div>
          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-5xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? "Edit Pay Slip" : "Add Pay Slip"}
              </h3>
              <button
                onClick={handleCloseForm}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Employee Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("employeeName")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.employeeName ? "border-red-500" : "border-gray-200"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("employeeId")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.employeeId ? "border-red-500" : "border-gray-200"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Pay Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    {...register("payPeriod")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.payPeriod ? "border-red-500" : "border-gray-200"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Paid Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("paidDays")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.paidDays ? "border-red-500" : "border-gray-200"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Loss of Pay Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("lossOfPayDays")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.lossOfPayDays
                        ? "border-red-500"
                        : "border-gray-200"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Pay Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("payDate")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.payDate ? "border-red-500" : "border-gray-200"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Notes (if any)
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.notes ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Enter any notes (optional)"
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.notes.message}
                    </p>
                  )}
                </div>

                {/* Pay Slip PDF Info */}
                <div className="md:col-span-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Note:</span> Pay slip PDF
                      will be automatically generated with all the details when
                      you submit this form.
                    </p>
                  </div>
                </div>
              </div>

              {/* Income Details Section */}
              <div className="mt-6">
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

                      {/* Loss of Pay Deduction - shown as a deduction item */}
                      {calculateLossOfPayDeduction() > 0 && (
                        <div className="grid grid-cols-2 gap-2 items-center bg-yellow-50 p-2 rounded border border-yellow-200 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 font-medium">
                              Loss of Pay (Leave Deduction)
                            </span>
                          </div>
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(calculateLossOfPayDeduction())}
                          </div>
                        </div>
                      )}

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

                      <div className="mt-4 pt-3 border-t space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">
                            Total Deductions
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              calculateTotalDeductions() +
                                calculateLossOfPayDeduction()
                            )}
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

              {/* Footer Buttons */}
              <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-[#525B88]/20 bg-gradient-to-r from-[#525B88] to-[#3a4166] hover:from-[#3a4166] hover:to-[#2d3450] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88] disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : editingId ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Update Pay Slip
                    </>
                  ) : (
                    "Upload Pay Slip"
                  )}
                </button>
              </div>
            </FormWrapper>
          </div>
        </div>
      )}

      {/* Uploaded Pay Slips Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Pay Slip Records
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525b88]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs whitespace-nowrap font-medium text-white uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium whitespace-nowrap text-white uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium whitespace-nowrap text-white uppercase tracking-wider">
                    Pay Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium whitespace-nowrap text-white uppercase tracking-wider">
                    Paid Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium whitespace-nowrap text-white uppercase tracking-wider">
                    Loss of Pay Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium whitespace-nowrap text-white uppercase tracking-wider">
                    Pay Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium whitespace-nowrap text-white uppercase tracking-wider">
                    Approval Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium whitespace-nowrap text-white uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium whitespace-nowrap text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredList.length > 0 ? (
                  filteredList.map((item) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getApprovalStatusBadge(item.approvalStatus || "PENDING")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.paySlipFileName || item.paySlipFile ? (
                          <button
                            onClick={async () => {
                              try {
                                // Try to fetch file using the ID endpoint
                                const response = await API.get(
                                  `/employee/upload-pay-slip/${item._id}/file`,
                                  {
                                    responseType: "arraybuffer",
                                  }
                                );

                                // Create a blob from the response
                                const blob = new Blob([response.data], {
                                  type:
                                    item.paySlipFileContentType ||
                                    "application/pdf",
                                });
                                const url = URL.createObjectURL(blob);

                                // Open the PDF in a new tab
                                window.open(url, "_blank");

                                // Revoke the object URL after a delay
                                setTimeout(
                                  () => URL.revokeObjectURL(url),
                                  1000
                                );
                              } catch (error) {
                                console.error("Error viewing file:", error);
                                // Fallback: try direct URL if available
                                if (item.paySlipFile) {
                                  window.open(item.paySlipFile, "_blank");
                                } else {
                                  showErrorMessage(
                                    "Failed to open file. Please try again."
                                  );
                                }
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer bg-transparent border-none p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View File"
                          >
                            <DocumentIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {(!item.approvalStatus || item.approvalStatus === "PENDING") && (
                            <>
                              <button
                                onClick={() => handleApprovePaySlip(item._id)}
                                disabled={processing}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Approve"
                              >
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                {/* Approve */}
                              </button>
                              <button
                                onClick={() => openRejectModal(item)}
                                disabled={processing}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Reject"
                              >
                                <XCircleIcon className="w-4 h-4 mr-1" />
                                {/* Reject */}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
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

      {/* Reject Pay Slip Modal */}
      {showRejectModal && selectedPaySlip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Reject Pay Slip
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPaySlip(null);
                  setRejectionReason("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Employee:</span>{" "}
                  {selectedPaySlip.employeeName} (
                  {selectedPaySlip.employeeId || selectedPaySlip.employeeID})
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Pay Period:</span>{" "}
                  {formatPayPeriod(selectedPaySlip.payPeriod)}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPaySlip(null);
                  setRejectionReason("");
                }}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPaySlip}
                disabled={!rejectionReason.trim() || processing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? "Rejecting..." : "Reject Pay Slip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayroll;
