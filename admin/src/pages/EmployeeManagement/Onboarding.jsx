import React, { useState, useEffect } from "react";
import { useFormHook } from "../../Hooks/FormHook";
import { API } from "../../config/urls";
import {
  showAxiosError,
  showSuccessMessage,
  showErrorMessage,
} from "../../config/Toast";
import {
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  UserIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Plus } from "lucide-react";
import { z } from "zod";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { aknuLogoNew, aknuadikavi } from "../../assets";

// Validation schema for onboarding form
const onboardingSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  contactNumber: z
    .string()
    .min(10, "Contact Number must be at least 10 digits")
    .max(10, "Contact Number must be 10 digits")
    .regex(/^\d+$/, "Contact Number must contain only digits"),
  alternativeNumber: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) =>
        !val || val.length === 0 || (val.length === 10 && /^\d+$/.test(val)),
      {
        message: "Alternative Number must be 10 digits if provided",
      }
    ),
  gmail: z.string().email("Please enter a valid email address"),
  aadharNumber: z
    .string()
    .min(12, "Aadhar Number must be 12 digits")
    .max(12, "Aadhar Number must be 12 digits")
    .regex(/^\d+$/, "Aadhar Number must contain only digits"),
  fatherName: z.string().min(1, "Father Name is required"),
  fatherPhoneNumber: z
    .string()
    .min(10, "Father Phone Number must be at least 10 digits")
    .max(10, "Father Phone Number must be 10 digits")
    .regex(/^\d+$/, "Father Phone Number must contain only digits"),
  motherName: z.string().min(1, "Mother Name is required"),
  motherPhoneNumber: z
    .string()
    .min(10, "Mother Phone Number must be at least 10 digits")
    .max(10, "Mother Phone Number must be 10 digits")
    .regex(/^\d+$/, "Mother Phone Number must contain only digits"),
  photo: z.any().optional(),
  // Current Address
  currentAddressLine1: z.string().min(1, "Current Address Line 1 is required"),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().min(1, "Current City is required"),
  currentState: z.string().min(1, "Current State is required"),
  currentPincode: z
    .string()
    .min(6, "Current Pincode must be 6 digits")
    .max(6, "Current Pincode must be 6 digits")
    .regex(/^\d+$/, "Current Pincode must contain only digits"),
  // Permanent Address
  permanentAddressLine1: z
    .string()
    .min(1, "Permanent Address Line 1 is required"),
  permanentAddressLine2: z.string().optional(),
  permanentCity: z.string().min(1, "Permanent City is required"),
  permanentState: z.string().min(1, "Permanent State is required"),
  permanentPincode: z
    .string()
    .min(6, "Permanent Pincode must be 6 digits")
    .max(6, "Permanent Pincode must be 6 digits")
    .regex(/^\d+$/, "Permanent Pincode must contain only digits"),
  // Qualification - Array of qualifications
  qualifications: z
    .array(
      z.object({
        collegeName: z.string().min(1, "College Name is required"),
        rollNumber: z.string().min(1, "Roll Number is required"),
        education: z.string().min(1, "Education is required"),
        passoutYear: z.string().min(1, "Passout Year is required"),
        percentage: z.string().min(1, "Percentage/CGPA is required"),
        specialization: z.string().optional(), // Optional field
      })
    )
    .min(1, "At least one qualification is required"),
  // Experience Details - Array of experiences
  experiences: z
    .array(
      z.object({
        companyName: z.string().min(1, "Company/Organization Name is required"),
        fromDate: z.string().min(1, "From Date is required"),
        toDate: z.string().min(1, "To Date is required"),
        location: z.string().optional(),
        domain: z.string().optional(),
      })
    )
    .optional(),
  // Legacy fields for backward compatibility
  experienceCollegeName: z.string().optional(),
  experience: z.string().optional(),
  location: z.string().optional(),
  domain: z.string().optional(),
  // Employment Details
  employeeId: z.string().min(1, "Employee ID is required"),
  jobTitle: z.string().min(1, "Job Title is required"),
  jobRole: z.string().min(1, "Job Role is required"),
  joiningDate: z.string().min(1, "Joining Date is required"),
  department: z.string().min(1, "Department is required"),
  signature: z.any().optional(),
  // Skills - Array of skills
  skills: z
    .array(
      z.object({
        skillName: z.string().min(1, "Skill Name is required"),
        experience: z.string().min(1, "Experience is required"),
        notes: z.string().optional(),
      })
    )
    .optional(),
  // Bank Account Details
  accountNumber: z.string().min(1, "Account Number is required"),
  ifscCode: z.string().min(1, "IFSC Code is required"),
  bankName: z.string().min(1, "Bank Name is required"),
  branchName: z.string().min(1, "Branch Name is required"),
  accountType: z.string().min(1, "Account Type is required"),
  accountHolderName: z.string().min(1, "Account Holder Name is required"),
  panCardNumber: z
    .string()
    .min(10, "PAN Card Number must be 10 characters")
    .max(10, "PAN Card Number must be 10 characters")
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN Card format"),
  // Documents
  document10th: z.any().optional(),
  documentInter: z.any().optional(),
  documentGraduation: z.any().optional(),
  documentPostGraduation: z.any().optional(),
  documentPhd: z.any().optional(),
  documentAadharCard: z.any().optional(),
  documentPanCard: z.any().optional(),
  documentBankDetails: z.any().optional(),
  documentResume: z.any().optional(),
  documentOtherCertificates: z.any().optional(),
  documentAppointment: z.any().optional(),
  // Login Credentials
  username: z.string().min(1, "Username is required"),
  pin: z
    .string()
    .min(6, "Pin must be exactly 6 digits")
    .max(6, "Pin must be exactly 6 digits")
    .regex(/^\d+$/, "Pin must contain only numbers")
    .refine((val) => !val.startsWith("0"), {
      message: "Pin cannot start with zero",
    }),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  declaration: z.boolean().refine((val) => val === true, {
    message: "You must agree to the declaration",
  }),
});

// List of banks in Andhra Pradesh
const AP_STATE_BANKS = [
  "State Bank of India",
  "Andhra Bank",
  "Andhra Pradesh Grameena Vikas Bank",
  "Axis Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Indian Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Oriental Bank of Commerce",
  "Corporation Bank",
  "Syndicate Bank",
  "Vijaya Bank",
  "Dena Bank",
  "IDBI Bank",
  "Kotak Mahindra Bank",
  "Yes Bank",
  "Federal Bank",
  "South Indian Bank",
  "Karur Vysya Bank",
  "City Union Bank",
  "DCB Bank",
  "RBL Bank",
  "Bandhan Bank",
  "Andhra Pragathi Grameena Bank",
  "Chaitanya Godavari Grameena Bank",
  "Saptagiri Grameena Bank",
  "Andhra Pradesh State Co-operative Bank",
  "Other",
];

// Account type options
const ACCOUNT_TYPES = [
  "Savings",
  "Current",
  "Fixed Deposit",
  "Recurring Deposit",
];

export default function Onboarding() {
  const { FormWrapper, errors, register, reset, setValue, getValues } =
    useFormHook({
      validation: onboardingSchema,
    });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingList, setOnboardingList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [loadingDocumentName, setLoadingDocumentName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = React.useRef(null);
  const [departments, setDepartments] = useState([]);
  const [qualificationCount, setQualificationCount] = useState(1);
  const [experienceCount, setExperienceCount] = useState(1);
  const [skillCount, setSkillCount] = useState(1);
  const [documentCount, setDocumentCount] = useState(1);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const bankDropdownRef = React.useRef(null);
  const [isAccountTypeDropdownOpen, setIsAccountTypeDropdownOpen] =
    useState(false);
  const accountTypeDropdownRef = React.useRef(null);

  // Helper functions to get specific sections of data
  const getPersonalInfo = () => {
    const formData = getValues();
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      dob: formData.dob,
      contactNumber: formData.contactNumber,
      alternativeNumber: formData.alternativeNumber,
      gmail: formData.gmail,
      aadharNumber: formData.aadharNumber,
      fatherName: formData.fatherName,
      fatherPhoneNumber: formData.fatherPhoneNumber,
      motherName: formData.motherName,
      motherPhoneNumber: formData.motherPhoneNumber,
      photo: formData.photo,
    };
  };

  const getAddressInfo = () => {
    const formData = getValues();
    return {
      currentAddressLine1: formData.currentAddressLine1,
      currentAddressLine2: formData.currentAddressLine2,
      currentCity: formData.currentCity,
      currentState: formData.currentState,
      currentPincode: formData.currentPincode,
      permanentAddressLine1: formData.permanentAddressLine1,
      permanentAddressLine2: formData.permanentAddressLine2,
      permanentCity: formData.permanentCity,
      permanentState: formData.permanentState,
      permanentPincode: formData.permanentPincode,
    };
  };

  const getQualificationInfo = () => {
    const formData = getValues();
    return {
      qualifications: formData.qualifications || [],
    };
  };

  const getExperienceInfo = () => {
    const formData = getValues();
    return {
      experienceCollegeName: formData.experienceCollegeName,
      experience: formData.experience,
      location: formData.location,
      domain: formData.domain,
    };
  };

  const getEmploymentInfo = () => {
    const formData = getValues();
    return {
      employeeId: formData.employeeId,
      jobTitle: formData.jobTitle,
      jobRole: formData.jobRole,
      joiningDate: formData.joiningDate,
      department: formData.department,
      signature: formData.signature,
    };
  };

  const getSkillsInfo = () => {
    const formData = getValues();
    return {
      skills: formData.skills,
    };
  };

  // Fetch onboarding data
  const fetchOnboardingData = async () => {
    setLoading(true);
    try {
      const resp = await API.get("/employee/onboarding");
      setOnboardingList(resp.data.data || resp.data || []);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for dropdown
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const resp = await API.get("/departments/");
        const formatted = resp.data.map((dept) => ({
          label: dept.title,
          value: dept._id || dept.id,
        }));
        setDepartments(formatted);
      } catch (error) {
        showAxiosError(error);
      }
    };
    getDepartments();
  }, []);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  // Handle click outside bank dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking on Bank Name dropdown button, don't close Account Type (onClick will handle it)
      // If clicking on Account Type dropdown button, don't close Bank Name (onClick will handle it)
      // Only close if clicking outside both dropdowns
      const isClickInsideBank = bankDropdownRef.current?.contains(event.target);
      const isClickInsideAccountType = accountTypeDropdownRef.current?.contains(
        event.target
      );

      if (
        isBankDropdownOpen &&
        !isClickInsideBank &&
        !isClickInsideAccountType
      ) {
        setIsBankDropdownOpen(false);
      }
      if (
        isAccountTypeDropdownOpen &&
        !isClickInsideAccountType &&
        !isClickInsideBank
      ) {
        setIsAccountTypeDropdownOpen(false);
      }
    };

    if (isBankDropdownOpen || isAccountTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBankDropdownOpen, isAccountTypeDropdownOpen]);

  // Initialize qualifications on mount - use ref to prevent re-initialization
  const initializedRef = React.useRef(false);
  useEffect(() => {
    if (!editingId && !initializedRef.current && showForm) {
      // Initialize additionalDocuments array if it doesn't exist
      const currentDocuments = getValues("additionalDocuments");
      if (
        !currentDocuments ||
        !Array.isArray(currentDocuments) ||
        currentDocuments.length === 0
      ) {
        setValue("additionalDocuments", [{ name: "", file: null, notes: "" }], {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
      initializedRef.current = true;
    } else if (editingId) {
      // Reset ref when editing
      initializedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, showForm]);

  // Ensure additionalDocuments is always initialized when form is shown
  useEffect(() => {
    if (showForm) {
      const currentDocuments = getValues("additionalDocuments");
      if (!currentDocuments || !Array.isArray(currentDocuments)) {
        setValue("additionalDocuments", [{ name: "", file: null, notes: "" }], {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  const handleSubmit = async (data) => {
    // Validate photo is required only when creating
    if (!editingId && (!data.photo || !data.photo[0])) {
      showErrorMessage("Photo is required");
      return;
    }

    const rawDataForLog = { ...data };

    // Convert FileList/File objects to readable format for logging
    if (rawDataForLog.photo && rawDataForLog.photo[0]) {
      rawDataForLog.photo = {
        type: "File",
        name: rawDataForLog.photo[0].name,
        size: rawDataForLog.photo[0].size,
        fileType: rawDataForLog.photo[0].type,
      };
    }

    if (rawDataForLog.signature && rawDataForLog.signature[0]) {
      rawDataForLog.signature = {
        type: "File",
        name: rawDataForLog.signature[0].name,
        size: rawDataForLog.signature[0].size,
        fileType: rawDataForLog.signature[0].type,
      };
    }

    // Convert additionalDocuments array
    if (
      rawDataForLog.additionalDocuments &&
      Array.isArray(rawDataForLog.additionalDocuments)
    ) {
      rawDataForLog.additionalDocuments = rawDataForLog.additionalDocuments.map(
        (doc, index) => {
          const docObj = {};
          if (doc.file && doc.file[0]) {
            docObj.file = {
              type: "File",
              name: doc.file[0].name,
              size: doc.file[0].size,
              fileType: doc.file[0].type,
            };
          }
          if (doc.name) {
            docObj.name = doc.name;
          }
          if (doc.notes) {
            docObj.notes = doc.notes;
          }
          return docObj;
        }
      );
    }
    // ========== END RAW DATA LOG ==========

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all form fields
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("gender", data.gender);
      formData.append("dob", data.dob);
      formData.append("contactNumber", data.contactNumber);
      if (data.alternativeNumber) {
        formData.append("alternativeNumber", data.alternativeNumber);
      }
      formData.append("gmail", data.gmail);
      formData.append("aadharNumber", data.aadharNumber);
      formData.append("fatherName", data.fatherName);
      formData.append("fatherPhoneNumber", data.fatherPhoneNumber);
      formData.append("motherName", data.motherName);
      formData.append("motherPhoneNumber", data.motherPhoneNumber);

      // Append current address fields
      formData.append("currentAddressLine1", data.currentAddressLine1);
      if (data.currentAddressLine2) {
        formData.append("currentAddressLine2", data.currentAddressLine2);
      }
      formData.append("currentCity", data.currentCity);
      formData.append("currentState", data.currentState);
      formData.append("currentPincode", data.currentPincode);

      // Append permanent address fields
      formData.append("permanentAddressLine1", data.permanentAddressLine1);
      if (data.permanentAddressLine2) {
        formData.append("permanentAddressLine2", data.permanentAddressLine2);
      }
      formData.append("permanentCity", data.permanentCity);
      formData.append("permanentState", data.permanentState);
      formData.append("permanentPincode", data.permanentPincode);

      // Append experience fields as indexed array
      if (data.experiences && Array.isArray(data.experiences)) {
        data.experiences.forEach((exp, index) => {
          if (exp.companyName)
            formData.append(
              `experiences[${index}][companyName]`,
              exp.companyName
            );
          if (exp.fromDate)
            formData.append(`experiences[${index}][fromDate]`, exp.fromDate);
          if (exp.toDate)
            formData.append(`experiences[${index}][toDate]`, exp.toDate);
          if (exp.location)
            formData.append(`experiences[${index}][location]`, exp.location);
          if (exp.domain)
            formData.append(`experiences[${index}][domain]`, exp.domain);
        });
      }

      // Append qualification fields as indexed array (matching backend object structure)
      // Backend expects: collegeName, rollNumber, education, passoutYear, percentage, specialization
      if (data.qualifications && Array.isArray(data.qualifications)) {
        data.qualifications.forEach((qual, index) => {
          // Required fields - always append (even if empty string to ensure all fields are sent)
          formData.append(
            `qualifications[${index}][collegeName]`,
            qual.collegeName || ""
          );
          formData.append(
            `qualifications[${index}][rollNumber]`,
            qual.rollNumber || ""
          );
          formData.append(
            `qualifications[${index}][education]`,
            qual.education || ""
          );
          formData.append(
            `qualifications[${index}][passoutYear]`,
            qual.passoutYear || ""
          );
          formData.append(
            `qualifications[${index}][percentage]`,
            qual.percentage || ""
          );
          // Optional fields - only append if they have values
          if (qual.specialization) {
            formData.append(
              `qualifications[${index}][specialization]`,
              qual.specialization
            );
          }
        });
      }

      // Append experience details
      if (data.experienceCollegeName) {
        formData.append("experienceCollegeName", data.experienceCollegeName);
      }
      if (data.experience) {
        formData.append("experience", data.experience);
      }
      if (data.location) {
        formData.append("location", data.location);
      }
      if (data.domain) {
        formData.append("domain", data.domain);
      }

      // Append employment details
      formData.append("employeeId", data.employeeId);
      formData.append("jobTitle", data.jobTitle);
      formData.append("jobRole", data.jobRole);
      formData.append("joiningDate", data.joiningDate);
      formData.append("department", data.department);
      if (data.signature && data.signature[0]) {
        formData.append("signature", data.signature[0]);
      }

      // Append skills array
      if (data.skills && Array.isArray(data.skills)) {
        data.skills.forEach((skill, index) => {
          if (skill.skillName)
            formData.append(`skills[${index}][skillName]`, skill.skillName);
          if (skill.experience)
            formData.append(`skills[${index}][experience]`, skill.experience);
          if (skill.notes)
            formData.append(`skills[${index}][notes]`, skill.notes);
        });
      }

      // Append bank account details
      formData.append("accountNumber", data.accountNumber);
      formData.append("ifscCode", data.ifscCode);
      formData.append("bankName", data.bankName);
      formData.append("branchName", data.branchName);
      formData.append("accountType", data.accountType);
      formData.append("accountHolderName", data.accountHolderName);
      formData.append("panCardNumber", data.panCardNumber);

      // Append photo file (required for new employees, optional for updates)
      if (data.photo && data.photo[0]) {
        formData.append("photo", data.photo[0]);
      }

      // Append signature file (if provided)
      if (data.signature && data.signature[0]) {
        formData.append("signature", data.signature[0]);
      }

      // Append documents array from the Documents Section
      // Get documents directly from form state since it might not be in data object
      const documents =
        getValues("additionalDocuments") || data.additionalDocuments;

      if (documents && Array.isArray(documents)) {
        let documentIndex = 0; // Track actual document index (only for documents with files)
        documents.forEach((doc) => {
          // Only append if file exists (user has uploaded a document)
          if (doc && doc.file && doc.file[0]) {
            formData.append(`documents[${documentIndex}][file]`, doc.file[0]);
            // Include name if provided
            if (doc.name && doc.name.trim()) {
              formData.append(
                `documents[${documentIndex}][name]`,
                doc.name.trim()
              );
            }
            // Include notes if provided
            if (doc.notes && doc.notes.trim()) {
              formData.append(
                `documents[${documentIndex}][notes]`,
                doc.notes.trim()
              );
            }
            documentIndex++; // Only increment for documents that have files
          }
        });
      }

      // Note: username, pin, declaration are NOT in the onboarding object
      // They are handled separately (likely in a credentials collection)
      // Do NOT send these to the onboarding endpoint

      // ========== TESTING: Convert FormData to object for display ==========
      const formDataObject = {};
      const rawFormDataEntries = [];

      for (let pair of formData.entries()) {
        const key = pair[0];
        const value = pair[1];

        // Store raw entry for debugging
        rawFormDataEntries.push({
          key,
          value:
            value instanceof File
              ? {
                  type: "File",
                  name: value.name,
                  size: value.size,
                  fileType: value.type,
                }
              : value,
        });

        // Handle file objects
        if (value instanceof File) {
          formDataObject[key] = {
            type: "File",
            name: value.name,
            size: value.size,
            fileType: value.type,
          };
        }
        // Handle array notation (e.g., qualifications[0][collegeName] or additionalDocuments[0][file])
        else if (key.includes("[") && key.includes("]")) {
          // Parse nested array notation (e.g., additionalDocuments[0][file])
          const nestedMatch = key.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
          if (nestedMatch) {
            const [, arrayName, index, fieldName] = nestedMatch;
            if (!formDataObject[arrayName]) {
              formDataObject[arrayName] = [];
            }
            if (!formDataObject[arrayName][parseInt(index)]) {
              formDataObject[arrayName][parseInt(index)] = {};
            }
            // Handle file objects in nested arrays
            if (value instanceof File) {
              formDataObject[arrayName][parseInt(index)][fieldName] = {
                type: "File",
                name: value.name,
                size: value.size,
                fileType: value.type,
              };
            } else {
              formDataObject[arrayName][parseInt(index)][fieldName] = value;
            }
          } else {
            // Simple array index (e.g., array[0])
            const simpleMatch = key.match(/^(\w+)\[(\d+)\]$/);
            if (simpleMatch) {
              const [, arrayName, index] = simpleMatch;
              if (!formDataObject[arrayName]) {
                formDataObject[arrayName] = [];
              }
              // Handle file objects in simple arrays
              if (value instanceof File) {
                formDataObject[arrayName][parseInt(index)] = {
                  type: "File",
                  name: value.name,
                  size: value.size,
                  fileType: value.type,
                };
              } else {
                formDataObject[arrayName][parseInt(index)] = value;
              }
            } else {
              formDataObject[key] = value;
            }
          }
        }
        // Regular key-value pairs
        else {
          formDataObject[key] = value;
        }
      }

      // ========== LOG FORMDATA BEING SENT TO BACKEND ==========
      console.log("\n========== FORMDATA BEING SENT TO BACKEND ==========");
      console.log("FormData Object (parsed structure):", formDataObject);

      // Also show raw FormData entries
      console.log("\nRaw FormData Entries:");
      for (let pair of formData.entries()) {
        const key = pair[0];
        const value = pair[1];
        if (value instanceof File) {
          console.log(
            `  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Show documents structure clearly if present
      if (formDataObject.documents && Array.isArray(formDataObject.documents)) {
        console.log("\n📄 DOCUMENTS STRUCTURE:");
        formDataObject.documents.forEach((doc, idx) => {
          const fileInfo = doc.file
            ? `✅ File: ${doc.file.name || doc.file} (${
                doc.file.size || "unknown"
              } bytes)`
            : "❌ No file";
          console.log(`  Document ${idx}:`, {
            file: fileInfo,
            name: doc.name || "No name",
            notes: doc.notes || "No notes",
          });
        });
      } else {
        // Check if documents are stored with bracket notation
        const documentKeys = Object.keys(formDataObject).filter(
          (key) => key.startsWith("documents[") && key.includes("][")
        );
        if (documentKeys.length > 0) {
          console.log("\n📄 DOCUMENTS STRUCTURE (from bracket notation):");
          const docIndices = new Set();
          documentKeys.forEach((key) => {
            const match = key.match(/documents\[(\d+)\]\[(\w+)\]/);
            if (match) {
              const [, index, field] = match;
              docIndices.add(index);
            }
          });
          docIndices.forEach((index) => {
            const fileKey = `documents[${index}][file]`;
            const nameKey = `documents[${index}][name]`;
            const notesKey = `documents[${index}][notes]`;
            const file = formDataObject[fileKey];
            const name = formDataObject[nameKey];
            const notes = formDataObject[notesKey];
            console.log(`  Document ${index}:`, {
              file: file
                ? `✅ File: ${file.name || "File"} (${
                    file.size || "unknown"
                  } bytes, ${file.fileType || file.type || "unknown type"})`
                : "❌ No file",
              name: name || "No name",
              notes: notes || "No notes",
            });
          });
        }
      }

      console.log("\n========== END FORMDATA LOG ==========\n");
      // ========== END TESTING LOGS ==========

      // Extract login credentials for separate API call
      const credentialsData = {
        username: data.username,
        pin: data.pin,
        password: data.password,
        employeeId: data.employeeId,
        department: data.department,
        jobTitle: data.jobTitle,
        email: data.gmail, // Using gmail field from form as email
      };

      // Call both APIs in parallel
      let onboardingResp, credentialsResp;

      if (editingId) {
        // For update, call both APIs in parallel
        [onboardingResp, credentialsResp] = await Promise.all([
          API.put(`/employee/onboarding/${editingId}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
          API.post("/login", credentialsData).catch((err) => {
            console.warn(
              "Credentials API call failed (may not be required for update):",
              err
            );
            return null; // Don't fail the whole operation if credentials update fails
          }),
        ]);

        showSuccessMessage(
          onboardingResp.data.message || "Employee updated successfully!"
        );
      } else {
        // For create, call both APIs in parallel

        [onboardingResp, credentialsResp] = await Promise.all([
          API.post("/employee/onboarding", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
          API.post("/login", credentialsData).catch((err) => {
            console.error("Credentials API call failed:", err);
            throw err; // Fail if credentials creation fails during create
          }),
        ]);
        showSuccessMessage(
          onboardingResp.data.message || "Employee onboarded successfully!"
        );
      }

      reset();
      setEditingId(null);
      setShowForm(false);
      fetchOnboardingData();
    } catch (error) {
      console.error("Error submitting onboarding form:", error);
      console.error("Error response:", error.response?.data);

      // Show more detailed error message
      if (error.response?.data?.message) {
        showErrorMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        showErrorMessage(error.response.data.error);
      } else {
        showAxiosError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setValue("firstName", item.firstName || "");
    setValue("lastName", item.lastName || "");
    // Normalize gender to lowercase to match option values, or set to empty string if not present
    const genderValue = item.gender ? item.gender.toLowerCase() : "";
    setValue("gender", genderValue);
    setValue("dob", item.dob ? item.dob.split("T")[0] : "");
    setValue("contactNumber", item.contactNumber || "");
    setValue("alternativeNumber", item.alternativeNumber || "");
    setValue("gmail", item.gmail || "");
    setValue("aadharNumber", item.aadharNumber || "");
    setValue("fatherName", item.fatherName || "");
    setValue("fatherPhoneNumber", item.fatherPhoneNumber || "");
    setValue("motherName", item.motherName || "");
    setValue("motherPhoneNumber", item.motherPhoneNumber || "");
    // Address fields
    setValue("currentAddressLine1", item.currentAddressLine1 || "");
    setValue("currentAddressLine2", item.currentAddressLine2 || "");
    setValue("currentCity", item.currentCity || "");
    setValue("currentState", item.currentState || "");
    setValue("currentPincode", item.currentPincode || "");
    setValue("permanentAddressLine1", item.permanentAddressLine1 || "");
    setValue("permanentAddressLine2", item.permanentAddressLine2 || "");
    setValue("permanentCity", item.permanentCity || "");
    setValue("permanentState", item.permanentState || "");
    setValue("permanentPincode", item.permanentPincode || "");
    // Qualification fields - handle both array and single object
    if (item.qualifications && Array.isArray(item.qualifications)) {
      setValue("qualifications", item.qualifications);
      setQualificationCount(item.qualifications.length);
    } else if (item.collegeName) {
      // Legacy single qualification format
      setValue("qualifications", [
        {
          collegeName: item.collegeName || "",
          rollNumber: item.rollNumber || "",
          education: item.education || "",
          passoutYear: item.passoutYear || "",
          percentage: item.percentage || "",
          specialization: item.specialization || "",
        },
      ]);
      setQualificationCount(1);
    } else {
      setValue("qualifications", [
        {
          collegeName: "",
          rollNumber: "",
          education: "",
          passoutYear: "",
          percentage: "",
          specialization: "",
        },
      ]);
      setQualificationCount(1);
    }
    // Experience details - handle both array and single object
    if (item.experiences && Array.isArray(item.experiences)) {
      setValue("experiences", item.experiences);
      setExperienceCount(item.experiences.length);
    } else if (item.experienceCollegeName || item.experience) {
      // Legacy single experience format
      setValue("experiences", [
        {
          companyName: item.experienceCollegeName || "",
          fromDate: "",
          toDate: "",
          location: item.location || "",
          domain: item.domain || "",
        },
      ]);
      setExperienceCount(1);
    } else {
      setValue("experiences", [
        {
          companyName: "",
          fromDate: "",
          toDate: "",
          location: "",
          domain: "",
        },
      ]);
      setExperienceCount(1);
    }
    // Legacy fields for backward compatibility
    setValue("experienceCollegeName", item.experienceCollegeName || "");
    setValue("experience", item.experience || "");
    setValue("location", item.location || "");
    setValue("domain", item.domain || "");
    // Employment details
    setValue("employeeId", item.employeeId || "");
    setValue("jobTitle", item.jobTitle || "");
    setValue("jobRole", item.jobRole || "");
    setValue(
      "joiningDate",
      item.joiningDate ? item.joiningDate.split("T")[0] : ""
    );
    setValue("department", item.department || "");
    // Skills - handle both array and legacy string format
    if (item.skills && Array.isArray(item.skills)) {
      setValue("skills", item.skills);
      setSkillCount(item.skills.length);
    } else if (item.skills && typeof item.skills === "string") {
      // Legacy format: convert string to array format
      setValue("skills", [
        {
          skillName: item.skills,
          experience: "",
          notes: "",
        },
      ]);
      setSkillCount(1);
    } else {
      setValue("skills", [
        {
          skillName: "",
          experience: "",
          notes: "",
        },
      ]);
      setSkillCount(1);
    }
    // Bank account details
    setValue("accountNumber", item.accountNumber || "");
    setValue("ifscCode", item.ifscCode || "");
    setValue("bankName", item.bankName || "");
    setValue("branchName", item.branchName || "");
    setValue("accountType", item.accountType || "");
    setValue("accountHolderName", item.accountHolderName || "");
    setValue("panCardNumber", item.panCardNumber || "");

    // Login credentials
    setValue("username", item.username || "");
    setValue("pin", item.pin || "");
    setValue("password", item.password || "");
    setValue("declaration", item.declaration || false);

    // Handle additional documents
    if (
      item.documents &&
      Array.isArray(item.documents) &&
      item.documents.length > 0
    ) {
      // Filter out main document types, keep only additional documents
      const additionalDocs = item.documents.filter((doc) => {
        if (!doc || typeof doc !== "object") return false;
        const mainDocTypes = [
          "10th",
          "Intermediate",
          "Graduation",
          "PostGraduation",
          "PhD",
          "AadharCard",
          "PanCard",
          "BankDetails",
          "Resume",
          "OtherCertificates",
          "Appointment",
        ];
        return !doc.type || !mainDocTypes.includes(doc.type);
      });
      if (additionalDocs.length > 0) {
        setValue("additionalDocuments", additionalDocs);
        setDocumentCount(additionalDocs.length);
      } else {
        setValue("additionalDocuments", [{ name: "", file: null, notes: "" }]);
        setDocumentCount(1);
      }
    } else if (
      item.additionalDocuments &&
      Array.isArray(item.additionalDocuments) &&
      item.additionalDocuments.length > 0
    ) {
      setValue("additionalDocuments", item.additionalDocuments);
      setDocumentCount(item.additionalDocuments.length);
    } else {
      setValue("additionalDocuments", [{ name: "", file: null, notes: "" }]);
      setDocumentCount(1);
    }

    // Handle photo preview if exists
    if (item.photo) {
      // If photo is a URL, set it as preview
      if (typeof item.photo === "string") {
        // If it's already a full URL, use it; otherwise construct it
        const photoUrl = item.photo.startsWith("http")
          ? item.photo
          : `${API.defaults.baseURL}${item.photo.startsWith("/") ? "" : "/"}${
              item.photo
            }`;
        setPhotoPreview(photoUrl);
      }
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Open the form modal
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this employee record?")
    ) {
      return;
    }
    try {
      const resp = await API.delete(`/employee/onboarding/${id}`);
      showSuccessMessage(
        resp.data.message || "Employee record deleted successfully!"
      );
      fetchOnboardingData();
    } catch (error) {
      showAxiosError(error);
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setQualificationCount(1);
    setExperienceCount(1);
    setSkillCount(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Helper function to check if string is base64-encoded PDF
  const isBase64String = (str) => {
    if (typeof str !== "string" || str.length < 50) return false;

    // If it's already a full URL (starts with http:// or https://), it's not base64
    if (str.startsWith("http://") || str.startsWith("https://")) {
      return false;
    }

    // If it's a data URL, extract the base64 part
    if (str.startsWith("data:")) {
      return true; // It's base64, but with a data URL prefix
    }

    // Base64 strings can contain A-Z, a-z, 0-9, +, /, and = for padding
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(str)) return false;

    // Check if it starts with common PDF base64 prefixes (JVBERi0 is base64 for %PDF-)
    if (str.startsWith("JVBERi0") || str.startsWith("JVBER")) {
      return true;
    }

    // Try to decode and check if it's a PDF (starts with %PDF-)
    try {
      const decoded = atob(str.substring(0, Math.min(100, str.length)));
      // PDF files start with "%PDF-"
      if (decoded.startsWith("%PDF-")) {
        return true;
      }
    } catch (e) {
      // If decoding fails, it's not valid base64
      return false;
    }

    // If it's a very long base64-like string (likely a document), treat as base64
    // File paths are typically much shorter than 200 characters
    if (str.length > 200 && base64Regex.test(str)) {
      return true;
    }

    return false;
  };

  // Helper function to get document URL
  const getDocumentUrl = (document) => {
    if (!document) return null;

    // If document is an object with file property
    if (typeof document === "object" && document.file) {
      const filePath = document.file;
      if (typeof filePath === "string") {
        // Check if it's base64 content FIRST (before any URL checks)
        if (isBase64String(filePath)) {
          return filePath; // Return base64 as-is
        }
        // If it's already a full URL
        if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
          return filePath;
        }
        // Check if it's already a path starting with /
        if (filePath.startsWith("/")) {
          return `${API.defaults.baseURL}${filePath}`;
        }
        // For filenames only, use API endpoint to fetch the document
        // This is more reliable than guessing file paths
        return filePath; // Return just the filename, we'll use API endpoint in handleViewDocument
      }
      return null;
    }

    // If document is a string
    if (typeof document === "string") {
      // Check if it's base64 content FIRST (before any URL checks)
      if (isBase64String(document)) {
        return document; // Return base64 as-is
      }
      // If it's already a full URL
      if (document.startsWith("http://") || document.startsWith("https://")) {
        return document;
      }
      // Check if it's already a path starting with /
      if (document.startsWith("/")) {
        return `${API.defaults.baseURL}${document}`;
      }
      // For filenames only, return as-is (we'll use API endpoint in handleViewDocument)
      return document;
    }

    return null;
  };

  // Handler to open PDF with authentication
  // Updated to use proper API endpoints
  const handleViewDocument = async (
    e,
    documentUrl,
    employeeId = null,
    docType = null,
    docIndex = null
  ) => {
    e.preventDefault();

    // If we have employeeId and docType/docIndex, use API endpoint
    if (employeeId && (docType || docIndex !== null)) {
      // Set loading state
      setDocumentLoading(true);
      const docName =
        docType === "documents"
          ? `Document ${(docIndex || 0) + 1}`
          : docType || "Document";
      setLoadingDocumentName(docName);

      try {
        let apiEndpoint;

        if (docType === "documents" && docIndex !== null) {
          // For documents array: GET /api/employee/onboarding/:id/document/documents?index=0
          apiEndpoint = `/employee/onboarding/${employeeId}/document/documents?index=${docIndex}`;
        } else if (docType) {
          // For specific document types: GET /api/employee/onboarding/:id/document/:docType
          apiEndpoint = `/employee/onboarding/${employeeId}/document/${docType}`;
        } else {
          setDocumentLoading(false);
          showErrorMessage("Document type or index is required.");
          return;
        }

        // Show loading message
        showSuccessMessage(`Loading ${docName}...`);

        // Use API instance for better error handling and timeout
        const response = await API.get(apiEndpoint, {
          responseType: "blob", // Important: tell axios to expect binary data
          timeout: 60000, // 60 second timeout for large files
        });

        // Create blob URL and open in new tab
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, "_blank");

        // Check if popup was blocked
        if (!newWindow) {
          setDocumentLoading(false);
          setLoadingDocumentName("");
          showErrorMessage(
            "Popup blocked. Please allow popups for this site to view documents."
          );
          window.URL.revokeObjectURL(url);
          return;
        }

        // Clean up after a delay (give browser time to open)
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

        setDocumentLoading(false);
        setLoadingDocumentName("");
        showSuccessMessage(`${docName} opened successfully`);
        return;
      } catch (error) {
        setDocumentLoading(false);
        setLoadingDocumentName("");
        console.error("Error fetching document from API:", error);

        if (error.response) {
          showErrorMessage(
            `Failed to load document. Status: ${error.response.status}`
          );
        } else if (error.code === "ECONNABORTED") {
          showErrorMessage(
            "Request timeout. The document may be too large. Please try again."
          );
        } else {
          showErrorMessage(`Failed to fetch document: ${error.message}`);
        }
        return;
      }
    }

    // Fallback to old method if documentUrl is provided
    if (!documentUrl) {
      showErrorMessage("Document URL is not available.");
      return;
    }

    try {
      // Check if documentUrl is a data URL (data:application/pdf;base64,...)
      if (documentUrl.startsWith("data:application/pdf;base64,")) {
        try {
          // Extract base64 content from data URL
          const base64Content = documentUrl.split(
            "data:application/pdf;base64,"
          )[1];
          const byteCharacters = atob(base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
          return;
        } catch (base64Error) {
          console.error("Error decoding base64 data URL:", base64Error);
          showErrorMessage("Failed to decode document. Please try again.");
          return;
        }
      }

      // Check if documentUrl is base64-encoded PDF content (without data URL prefix)
      if (isBase64String(documentUrl)) {
        try {
          // Convert base64 to blob
          const byteCharacters = atob(documentUrl);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
          return;
        } catch (base64Error) {
          console.error("Error decoding base64:", base64Error);
          showErrorMessage("Failed to decode document. Please try again.");
          return;
        }
      }

      // Check if URL contains base64 content after API base URL (fix for incorrectly constructed URLs)
      if (documentUrl.startsWith("http")) {
        try {
          const apiBaseUrl = API.defaults.baseURL;
          // Check if the URL starts with the API base URL and contains what looks like base64
          if (documentUrl.startsWith(apiBaseUrl)) {
            // Extract the path part after the API base URL
            const pathPart = documentUrl.substring(apiBaseUrl.length);
            // Remove leading slashes
            const cleanPath = pathPart.replace(/^\/+/, "");
            // Check if the path part looks like base64 (starts with JVBERi0 which is %PDF- encoded)
            if (
              cleanPath.startsWith("JVBERi0") ||
              cleanPath.startsWith("JVBER")
            ) {
              // Try to decode it as base64
              if (isBase64String(cleanPath)) {
                const byteCharacters = atob(cleanPath);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");
                return;
              }
            }
          }
        } catch (extractError) {
          console.error("Error extracting base64 from URL:", extractError);
          // Continue to normal URL handling
        }
      }

      // If it's already a full URL starting with http, try to open it directly
      if (documentUrl.startsWith("http")) {
        // Fetch with authentication headers
        const token = localStorage.getItem("token");

        // Try fetching with auth first
        try {
          const response = await fetch(documentUrl, {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            return;
          } else if (response.status === 404) {
            // If 404, try alternative paths

            // Extract filename from URL
            const urlParts = documentUrl.split("/");
            const filename = urlParts[urlParts.length - 1];
            const baseUrl = API.defaults.baseURL;

            // Try common upload directory patterns
            const alternativePaths = [
              `${baseUrl}/uploads/employee-documents/${filename}`,
              `${baseUrl}/uploads/employee/${filename}`,
              `${baseUrl}/uploads/${filename}`,
              `${baseUrl}/files/employee-documents/${filename}`,
              `${baseUrl}/files/${filename}`,
              `${baseUrl}/employee/onboarding/documents/${filename}`,
              `${baseUrl}/employee/documents/${filename}`,
              `${baseUrl}/static/employee-documents/${filename}`,
              `${baseUrl}/public/uploads/${filename}`,
            ];

            // Try each alternative path
            for (const altPath of alternativePaths) {
              try {
                const altResponse = await fetch(altPath, {
                  headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                  },
                });

                if (altResponse.ok) {
                  const blob = await altResponse.blob();
                  const url = window.URL.createObjectURL(blob);
                  window.open(url, "_blank");
                  showSuccessMessage("Document loaded successfully");
                  return;
                }
              } catch (altError) {
                console.log(`Failed to fetch from ${altPath}:`, altError);
                continue;
              }
            }

            // If all paths fail, show error
            showErrorMessage(
              `Document not found. Please check if the file exists on the server.`
            );
            console.error("All alternative paths failed for:", filename);
          } else {
            console.error(
              "Failed to fetch document:",
              response.status,
              response.statusText
            );
            showErrorMessage(
              `Failed to load document. Status: ${response.status}`
            );
          }
        } catch (fetchError) {
          console.error("Error fetching document:", fetchError);
          showErrorMessage(`Failed to fetch document: ${fetchError.message}`);
        }
      } else {
        // For relative URLs or filenames, try API endpoint first
        const token = localStorage.getItem("token");
        const baseUrl = API.defaults.baseURL;

        // Extract filename (could be a path or just filename)
        let filename = documentUrl;
        if (documentUrl.includes("/")) {
          const urlParts = documentUrl.split("/");
          filename = urlParts[urlParts.length - 1];
        }

        // Decode URL-encoded filename (e.g., %20 to space)
        filename = decodeURIComponent(filename);

        // Try API endpoints first (most reliable - backend should provide these)
        const apiEndpoints = [
          `${baseUrl}/employee/onboarding/documents/${encodeURIComponent(
            filename
          )}`,
          `${baseUrl}/employee/documents/${encodeURIComponent(filename)}`,
          `${baseUrl}/employee/onboarding/document/${encodeURIComponent(
            filename
          )}`,
        ];

        // Try each API endpoint
        for (const apiEndpoint of apiEndpoints) {
          try {
            const response = await fetch(apiEndpoint, {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
              },
            });

            if (response.ok) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              window.open(url, "_blank");
              return;
            }
          } catch (apiError) {
            continue;
          }
        }

        // If API endpoints fail, try static file paths
        const fullUrl = documentUrl.startsWith("/")
          ? `${baseUrl}${documentUrl}`
          : `${baseUrl}/${documentUrl}`;

        try {
          const response = await fetch(fullUrl, {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            return;
          } else if (response.status === 404) {
            // Try alternative static paths as last resort
            const alternativePaths = [
              `${baseUrl}/uploads/employee-documents/${encodeURIComponent(
                filename
              )}`,
              `${baseUrl}/uploads/employee/${encodeURIComponent(filename)}`,
              `${baseUrl}/uploads/${encodeURIComponent(filename)}`,
              `${baseUrl}/files/employee-documents/${encodeURIComponent(
                filename
              )}`,
              `${baseUrl}/files/${encodeURIComponent(filename)}`,
            ];

            for (const altPath of alternativePaths) {
              try {
                const altResponse = await fetch(altPath, {
                  headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                  },
                });

                if (altResponse.ok) {
                  const blob = await altResponse.blob();
                  const url = window.URL.createObjectURL(blob);
                  window.open(url, "_blank");
                  return;
                }
              } catch (altError) {
                continue;
              }
            }

            // If all paths fail, show helpful error
            showErrorMessage(
              `Document "${filename}" not found. The backend may need to provide a document retrieval API endpoint. Please contact the backend team.`
            );
            console.error("All document paths failed for:", filename);
          } else {
            console.error(
              "Failed to fetch document:",
              response.status,
              response.statusText
            );
            showErrorMessage(
              `Failed to load document. Status: ${response.status}`
            );
          }
        } catch (fetchError) {
          console.error("Error fetching document:", fetchError);
          showErrorMessage(`Failed to fetch document: ${fetchError.message}`);
        }
      }
    } catch (error) {
      console.error("Error opening document:", error);
      console.error("Document URL:", documentUrl);
      // Fallback: try opening directly if it's a URL
      if (documentUrl.startsWith("http")) {
        window.open(documentUrl, "_blank");
      } else {
        showErrorMessage(`Failed to open document: ${error.message}`);
      }
    }
  };

  // Function to load logo as base64
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

  // Function to generate and download PDF
  const handleDownloadPDF = async () => {
    if (!viewingItem) return;

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

    const pdf = new jsPDF();
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 15;

    // Header Section with Logos
    const logoSize = 15; // mm
    const logoY = yPosition;
    const spacing = 8; // mm spacing between elements
    const startX = margin;

    // Left Logo (AKNU)
    if (aknuLogoBase64) {
      pdf.addImage(aknuLogoBase64, "PNG", startX, logoY, logoSize, logoSize);
    }

    // University Name (Title) - Center aligned
    yPosition += 5;
    pdf.setFontSize(14);
    pdf.setTextColor(82, 91, 136); // #525B88
    pdf.setFont("helvetica", "bold");
    const titleText = "ADIKAVI NANNAYA UNIVERSITY";
    const titleX = (pageWidth - pdf.getTextWidth(titleText)) / 2;
    pdf.text(titleText, titleX, yPosition);

    // Address (Subtitle) - Center aligned
    yPosition += 6;
    pdf.setFontSize(9);
    pdf.setTextColor(82, 91, 136);
    pdf.setFont("helvetica", "normal");
    const addressText = "RAJAMAHENDRAVARAM, ANDHRA PRADESH INDIA - 533296";
    const addressX = (pageWidth - pdf.getTextWidth(addressText)) / 2;
    pdf.text(addressText, addressX, yPosition);

    // Right Logo (Nannaya/Adikavi)
    if (adikaviLogoBase64) {
      const rightLogoX = pageWidth - margin - logoSize;
      pdf.addImage(
        adikaviLogoBase64,
        "PNG",
        rightLogoX,
        logoY,
        logoSize,
        logoSize
      );
    }

    yPosition += 10;

    // Draw line
    pdf.setDrawColor(82, 91, 136);
    pdf.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 10;

    // Employee Details Title
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    const detailsTitle = "Employee Details";
    const detailsTitleX = (pageWidth - pdf.getTextWidth(detailsTitle)) / 2;
    pdf.text(detailsTitle, detailsTitleX, yPosition);
    yPosition += 15;

    // Helper function to format value
    const formatValue = (value) => {
      if (!value || value === null || value === undefined) return "-";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (value instanceof Date) {
        return new Date(value).toLocaleDateString();
      }
      return String(value);
    };

    // Helper function to mask sensitive data (shows last 4 digits)
    const maskSensitiveData = (value, visibleDigits = 4) => {
      if (!value || value === null || value === undefined) return "-";
      const str = String(value).trim();
      if (str.length <= visibleDigits) return str; // If too short, return as is
      const masked =
        "x".repeat(str.length - visibleDigits) + str.slice(-visibleDigits);
      return masked;
    };

    // Personal Information Section
    pdf.setFontSize(12);
    pdf.setTextColor(82, 91, 136);
    pdf.text("Personal Information", 10, yPosition);
    yPosition += 8;

    const personalInfoRows = [
      ["First Name", formatValue(viewingItem.firstName)],
      ["Last Name", formatValue(viewingItem.lastName)],
      ["Gender", formatValue(viewingItem.gender)],
      [
        "Date of Birth",
        viewingItem.dob ? new Date(viewingItem.dob).toLocaleDateString() : "-",
      ],
      ["Contact Number", formatValue(viewingItem.contactNumber)],
      ["Alternative Number", formatValue(viewingItem.alternativeNumber)],
      ["Email", formatValue(viewingItem.gmail)],
      ["Aadhar Number", formatValue(viewingItem.aadharNumber)],
      ["Father Name", formatValue(viewingItem.fatherName)],
      ["Father Phone Number", formatValue(viewingItem.fatherPhoneNumber)],
      ["Mother Name", formatValue(viewingItem.motherName)],
      ["Mother Phone Number", formatValue(viewingItem.motherPhoneNumber)],
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: personalInfoRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [82, 91, 136] },
      theme: "grid",
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 70 }, // Field column
        1: { cellWidth: 120 }, // Value column
      },
    });

    yPosition = pdf.lastAutoTable.finalY + 10;

    // Address Information Section
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(82, 91, 136);
    pdf.text("Address Information", 10, yPosition);
    yPosition += 8;

    const addressRows = [
      ["Current Address Line 1", formatValue(viewingItem.currentAddressLine1)],
      ["Current Address Line 2", formatValue(viewingItem.currentAddressLine2)],
      ["Current City", formatValue(viewingItem.currentCity)],
      ["Current State", formatValue(viewingItem.currentState)],
      ["Current Pincode", formatValue(viewingItem.currentPincode)],
      [
        "Permanent Address Line 1",
        formatValue(viewingItem.permanentAddressLine1),
      ],
      [
        "Permanent Address Line 2",
        formatValue(viewingItem.permanentAddressLine2),
      ],
      ["Permanent City", formatValue(viewingItem.permanentCity)],
      ["Permanent State", formatValue(viewingItem.permanentState)],
      ["Permanent Pincode", formatValue(viewingItem.permanentPincode)],
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: addressRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [82, 91, 136] },
      theme: "grid",
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 70 }, // Field column
        1: { cellWidth: 120 }, // Value column
      },
    });

    yPosition = pdf.lastAutoTable.finalY + 10;

    // Qualification Details Section
    if (
      viewingItem.qualifications &&
      Array.isArray(viewingItem.qualifications) &&
      viewingItem.qualifications.length > 0
    ) {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setTextColor(82, 91, 136);
      pdf.text("Qualification Details", 10, yPosition);
      yPosition += 8;

      const qualificationRows = [];
      viewingItem.qualifications.forEach((qual, index) => {
        qualificationRows.push(
          [
            `Qualification ${index + 1} - College/School Name`,
            formatValue(qual.collegeName),
          ],
          [
            `Qualification ${index + 1} - Roll Number`,
            formatValue(qual.rollNumber),
          ],
          [
            `Qualification ${index + 1} - Education`,
            formatValue(qual.education),
          ],
          [
            `Qualification ${index + 1} - Pass Out Year`,
            formatValue(qual.passoutYear),
          ],
          [
            `Qualification ${index + 1} - Percentage/CGPA`,
            formatValue(qual.percentage),
          ],
          [
            `Qualification ${index + 1} - Specialization`,
            formatValue(qual.specialization),
          ],
          [
            `Qualification ${index + 1} - Roll Number`,
            formatValue(qual.rollNumber),
          ]
        );
      });

      autoTable(pdf, {
        startY: yPosition,
        head: [["Field", "Value"]],
        body: qualificationRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [82, 91, 136] },
        theme: "grid",
        margin: { left: 10, right: 10 },
        columnStyles: {
          0: { cellWidth: 70 }, // Field column
          1: { cellWidth: 120 }, // Value column
        },
      });

      yPosition = pdf.lastAutoTable.finalY + 10;
    }

    // Experience Details Section
    if (
      viewingItem.experienceCollegeName ||
      viewingItem.experience ||
      viewingItem.location ||
      viewingItem.domain
    ) {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setTextColor(82, 91, 136);
      pdf.text("Experience Details", 10, yPosition);
      yPosition += 8;

      const experienceRows = [
        ["College Name", formatValue(viewingItem.experienceCollegeName)],
        ["Experience", formatValue(viewingItem.experience)],
        ["Work Location", formatValue(viewingItem.location)],
        ["Domain", formatValue(viewingItem.domain)],
      ];

      autoTable(pdf, {
        startY: yPosition,
        head: [["Field", "Value"]],
        body: experienceRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [82, 91, 136] },
        theme: "grid",
        margin: { left: 10, right: 10 },
        columnStyles: {
          0: { cellWidth: 70 }, // Field column
          1: { cellWidth: 120 }, // Value column
        },
      });

      yPosition = pdf.lastAutoTable.finalY + 10;
    }

    // Employment Details Section
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(82, 91, 136);
    pdf.text("Employment Details", 10, yPosition);
    yPosition += 8;

    const employmentRows = [
      ["Employee ID", formatValue(viewingItem.employeeId)],
      ["Job Title", formatValue(viewingItem.jobTitle)],
      ["Job Role", formatValue(viewingItem.jobRole)],
      [
        "Joining Date",
        viewingItem.joiningDate
          ? new Date(viewingItem.joiningDate).toLocaleDateString()
          : "-",
      ],
      [
        "Department",
        formatValue(
          viewingItem.department
            ? departments.find((dept) => dept.value === viewingItem.department)
                ?.label || viewingItem.department
            : "-"
        ),
      ],
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: employmentRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [82, 91, 136] },
      theme: "grid",
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 70 }, // Field column
        1: { cellWidth: 120 }, // Value column
      },
    });

    yPosition = pdf.lastAutoTable.finalY + 10;

    // Skills Section
    if (
      viewingItem.skills &&
      Array.isArray(viewingItem.skills) &&
      viewingItem.skills.length > 0
    ) {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setTextColor(82, 91, 136);
      pdf.text("Skills", 10, yPosition);
      yPosition += 8;

      const skillRows = [];
      viewingItem.skills.forEach((skill, index) => {
        if (typeof skill === "object") {
          skillRows.push(
            [`Skill ${index + 1} - Skill Name`, formatValue(skill.skillName)],
            [`Skill ${index + 1} - Experience`, formatValue(skill.experience)],
            [`Skill ${index + 1} - Notes`, formatValue(skill.notes)]
          );
        } else {
          skillRows.push([`Skill ${index + 1}`, formatValue(skill)]);
        }
      });

      autoTable(pdf, {
        startY: yPosition,
        head: [["Field", "Value"]],
        body: skillRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [82, 91, 136] },
        theme: "grid",
        margin: { left: 10, right: 10 },
        columnStyles: {
          0: { cellWidth: 70 }, // Field column
          1: { cellWidth: 120 }, // Value column
        },
      });

      yPosition = pdf.lastAutoTable.finalY + 10;
    }

    // Bank Account Details Section
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(82, 91, 136);
    pdf.text("Bank Account Details", 10, yPosition);
    yPosition += 8;

    const bankRows = [
      ["Account Holder Name", formatValue(viewingItem.accountHolderName)],
      ["Account Number", maskSensitiveData(viewingItem.accountNumber, 4)],
      ["Bank Name", formatValue(viewingItem.bankName)],
      ["Branch Name", formatValue(viewingItem.branchName)],
      ["Account Type", formatValue(viewingItem.accountType)],
      ["IFSC Code", maskSensitiveData(viewingItem.ifscCode, 4)],
      ["PAN Card Number", formatValue(viewingItem.panCardNumber)],
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: bankRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [82, 91, 136] },
      theme: "grid",
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 70 }, // Field column
        1: { cellWidth: 120 }, // Value column
      },
    });

    // Generate filename
    const employeeName =
      viewingItem.firstName && viewingItem.lastName
        ? `${viewingItem.firstName}_${viewingItem.lastName}`
            .trim()
            .replace(/\s+/g, "_")
        : viewingItem.employeeId || "employee";
    const fileName = `${employeeName}_details.pdf`;

    // Save PDF
    pdf.save(fileName);
    showSuccessMessage("PDF downloaded successfully");

    // Close modal after download
    setShowViewModal(false);
    setViewingItem(null);
  };

  // Helper function to get document by type from documents array
  const getDocumentByType = (documents, type) => {
    if (!documents || !Array.isArray(documents)) return null;
    const doc = documents.find((d) => d.type === type);
    return doc ? doc.file || doc.fileName || doc : null;
  };

  const addQualification = () => {
    const currentQualifications = getValues("qualifications") || [];
    setValue("qualifications", [
      ...currentQualifications,
      {
        collegeName: "",
        rollNumber: "",
        education: "",
        passoutYear: "",
        percentage: "",
        specialization: "",
      },
    ]);
    setQualificationCount((prev) => prev + 1);
  };

  const removeQualification = (index) => {
    if (qualificationCount > 1) {
      const currentQualifications = getValues("qualifications") || [];
      const updatedQualifications = currentQualifications.filter(
        (_, i) => i !== index
      );
      setValue("qualifications", updatedQualifications);
      setQualificationCount((prev) => prev - 1);
    }
  };

  const addExperience = () => {
    const currentExperiences = getValues("experiences") || [];
    setValue("experiences", [
      ...currentExperiences,
      {
        companyName: "",
        fromDate: "",
        toDate: "",
        location: "",
        domain: "",
      },
    ]);
    setExperienceCount((prev) => prev + 1);
  };

  const removeExperience = (index) => {
    if (experienceCount > 1) {
      const currentExperiences = getValues("experiences") || [];
      const updatedExperiences = currentExperiences.filter(
        (_, i) => i !== index
      );
      setValue("experiences", updatedExperiences);
      setExperienceCount((prev) => prev - 1);
    }
  };

  const addDocument = () => {
    const currentDocuments = getValues("additionalDocuments") || [];
    const newDocument = {
      name: "",
      file: null,
      notes: "",
    };
    setValue("additionalDocuments", [...currentDocuments, newDocument], {
      shouldValidate: false,
      shouldDirty: false,
    });
    setDocumentCount((prev) => prev + 1);
  };

  const removeDocument = (index) => {
    if (documentCount > 1) {
      const currentDocuments = getValues("additionalDocuments") || [];
      const updatedDocuments = currentDocuments.filter((_, i) => i !== index);
      setValue("additionalDocuments", updatedDocuments);
      setDocumentCount((prev) => prev - 1);
    }
  };

  const addSkill = () => {
    const currentSkills = getValues("skills") || [];
    setValue("skills", [
      ...currentSkills,
      {
        skillName: "",
        experience: "",
        notes: "",
      },
    ]);
    setSkillCount((prev) => prev + 1);
  };

  const removeSkill = (index) => {
    if (skillCount > 1) {
      const currentSkills = getValues("skills") || [];
      const updatedSkills = currentSkills.filter((_, i) => i !== index);
      setValue("skills", updatedSkills);
      setSkillCount((prev) => prev - 1);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      if (typeof window !== "undefined" && typeof window.URL !== "undefined") {
        setPhotoPreview(window.URL.createObjectURL(file));
      }
      setValue("photo", e.target.files);
    }
  };

  const handleDocumentFileChange = (index, e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Get current documents array or initialize it
      const currentDocuments = getValues("additionalDocuments") || [];

      // Ensure we have enough items in the array
      const updatedDocuments = [...currentDocuments];
      while (updatedDocuments.length <= index) {
        updatedDocuments.push({ name: "", file: null, notes: "" });
      }

      // Update the specific document's file
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        file: files,
      };

      // Update the entire array in form state
      setValue("additionalDocuments", updatedDocuments, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#525B88]">
          Employee Onboarding
        </h1>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#525B88] text-white px-4 py-2 rounded-md hover:bg-[#3a4166] transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Employee
        </button>
      </div>

      {/* Onboarding Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-5xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                {editingId
                  ? "Edit Employee Onboarding"
                  : "Add Employee Onboarding"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Form Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <FormWrapper submitFn={handleSubmit} className="space-y-2">
                {/* Personal Information Section */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Personal Information
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          {...register("firstName")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.firstName
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          {...register("lastName")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.lastName
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          {...register("gender")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.gender
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                        >
                          <option value="">Select Gender</option>
                          {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.gender && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.gender.message}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          {...register("dob")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.dob
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                        />
                        {errors.dob && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.dob.message}
                          </p>
                        )}
                      </div>

                      {/* Contact Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          {...register("contactNumber")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.contactNumber
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter contact number"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                          }}
                        />
                        {errors.contactNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.contactNumber.message}
                          </p>
                        )}
                      </div>

                      {/* Alternative Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alternative Number (Optional)
                        </label>
                        <input
                          type="tel"
                          {...register("alternativeNumber")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.alternativeNumber
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter alternative number"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                          }}
                        />
                        {errors.alternativeNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.alternativeNumber.message}
                          </p>
                        )}
                      </div>

                      {/* Gmail */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          {...register("gmail")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.gmail
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter email address"
                        />
                        {errors.gmail && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.gmail.message}
                          </p>
                        )}
                      </div>

                      {/* Aadhar Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aadhar Number
                        </label>
                        <input
                          type="text"
                          {...register("aadharNumber")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.aadharNumber
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter 12-digit Aadhar number"
                          maxLength={12}
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                          }}
                        />
                        {errors.aadharNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.aadharNumber.message}
                          </p>
                        )}
                      </div>

                      {/* Father Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Father Name
                        </label>
                        <input
                          type="text"
                          {...register("fatherName")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.fatherName
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter father name"
                        />
                        {errors.fatherName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.fatherName.message}
                          </p>
                        )}
                      </div>

                      {/* Father Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Father Phone Number
                        </label>
                        <input
                          type="tel"
                          {...register("fatherPhoneNumber")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.fatherPhoneNumber
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter father phone number"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                          }}
                        />
                        {errors.fatherPhoneNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.fatherPhoneNumber.message}
                          </p>
                        )}
                      </div>

                      {/* Mother Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mother Name
                        </label>
                        <input
                          type="text"
                          {...register("motherName")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.motherName
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter mother name"
                        />
                        {errors.motherName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.motherName.message}
                          </p>
                        )}
                      </div>

                      {/* Mother Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mother Phone Number
                        </label>
                        <input
                          type="tel"
                          {...register("motherPhoneNumber")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.motherPhoneNumber
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter mother phone number"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                          }}
                        />
                        {errors.motherPhoneNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.motherPhoneNumber.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="mt-4">
                      <label
                        htmlFor="photo"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Photo {!editingId && "(Required)"}
                      </label>
                      <div className="flex items-center">
                        <label className="flex flex-col items-center px-3 py-3 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                          <DocumentTextIcon className="h-5 w-5 text-[#525B88] mb-1" />
                          <span className="text-xs text-gray-600">
                            {photoFile
                              ? photoFile.name
                              : editingId
                              ? "Choose a new photo (optional)"
                              : "Choose a photo"}
                          </span>
                          <input
                            type="file"
                            id="photo"
                            name="photo"
                            onChange={handlePhotoChange}
                            className="hidden"
                            accept="image/*"
                            ref={fileInputRef}
                          />
                        </label>
                        {photoFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoFile(null);
                              setPhotoPreview(null);
                              setValue("photo", null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                            className="ml-3 p-1.5 text-red-500 hover:text-red-700"
                            title="Remove file"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {errors.photo && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.photo.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted formats: JPG, PNG, GIF (Max 5 MB)
                        {editingId && " - Leave empty to keep existing photo"}
                      </p>
                      {photoPreview && (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-24 mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Address Information
                  </h3>
                  <div className="px-4 py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Current Address */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-700 border-b pb-2">
                          Current Address
                        </h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            {...register("currentAddressLine1")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.currentAddressLine1
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter address line 1"
                          />
                          {errors.currentAddressLine1 && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.currentAddressLine1.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            {...register("currentAddressLine2")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.currentAddressLine2
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter address line 2"
                          />
                          {errors.currentAddressLine2 && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.currentAddressLine2.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            {...register("currentCity")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.currentCity
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter city"
                          />
                          {errors.currentCity && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.currentCity.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            {...register("currentState")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.currentState
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter state"
                          />
                          {errors.currentState && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.currentState.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pin code
                          </label>
                          <input
                            type="text"
                            {...register("currentPincode")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.currentPincode
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter 6-digit pincode"
                            maxLength={6}
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                          />
                          {errors.currentPincode && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.currentPincode.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Permanent Address */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-700 border-b pb-2">
                          Permanent Address
                        </h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            {...register("permanentAddressLine1")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.permanentAddressLine1
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter address line 1"
                          />
                          {errors.permanentAddressLine1 && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.permanentAddressLine1.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            {...register("permanentAddressLine2")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.permanentAddressLine2
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter address line 2"
                          />
                          {errors.permanentAddressLine2 && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.permanentAddressLine2.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            {...register("permanentCity")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.permanentCity
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter city"
                          />
                          {errors.permanentCity && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.permanentCity.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            {...register("permanentState")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.permanentState
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter state"
                          />
                          {errors.permanentState && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.permanentState.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pin code
                          </label>
                          <input
                            type="text"
                            {...register("permanentPincode")}
                            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.permanentPincode
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                            placeholder="Enter 6-digit pincode"
                            maxLength={6}
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                          />
                          {errors.permanentPincode && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.permanentPincode.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualification Details Section */}
                <div className="mt-3 mb-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#525B88]">
                      Qualification Details
                    </h3>
                    <button
                      type="button"
                      onClick={addQualification}
                      className="flex items-center px-3 py-1.5 bg-[#525B88] text-white rounded-lg  text-sm transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Qualification
                    </button>
                  </div>

                  {Array.from({ length: qualificationCount }).map(
                    (_, index) => {
                      const qualificationErrors =
                        errors.qualifications?.[index];
                      return (
                        <div key={index} className="p-4 relative">
                          {qualificationCount > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQualification(index)}
                              className="absolute top-2 right-2 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Remove Qualification"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                          <h4 className="text-md font-medium text-gray-700 mb-3">
                            Qualification {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* College Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                College/School Name
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `qualifications.${index}.collegeName`
                                )}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  qualificationErrors?.collegeName
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter College or School name"
                              />
                              {qualificationErrors?.collegeName && (
                                <p className="mt-1 text-sm text-red-500">
                                  {qualificationErrors.collegeName.message}
                                </p>
                              )}
                            </div>
                            {/* Roll Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Roll Number
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `qualifications.${index}.rollNumber`
                                )}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  qualificationErrors?.rollNumber
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter roll number"
                              />
                              {qualificationErrors?.rollNumber && (
                                <p className="mt-1 text-sm text-red-500">
                                  {qualificationErrors.rollNumber.message}
                                </p>
                              )}
                            </div>
                            {/* Education */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Education
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `qualifications.${index}.education`
                                )}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  qualificationErrors?.education
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter education"
                              />
                              {qualificationErrors?.education && (
                                <p className="mt-1 text-sm text-red-500">
                                  {qualificationErrors.education.message}
                                </p>
                              )}
                            </div>
                            {/* Specialization */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Specialization
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `qualifications.${index}.specialization`
                                )}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  qualificationErrors?.specialization
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter specialization"
                              />
                              {qualificationErrors?.specialization && (
                                <p className="mt-1 text-sm text-red-500">
                                  {qualificationErrors.specialization.message}
                                </p>
                              )}
                            </div>
                            {/* Pass Out Year */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pass Out Year
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `qualifications.${index}.passoutYear`
                                )}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  qualificationErrors?.passoutYear
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter pass out year"
                              />
                              {qualificationErrors?.passoutYear && (
                                <p className="mt-1 text-sm text-red-500">
                                  {qualificationErrors.passoutYear.message}
                                </p>
                              )}
                            </div>
                            {/* Percentage/CGPA */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Percentage/CGPA
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `qualifications.${index}.percentage`
                                )}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  qualificationErrors?.percentage
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter percentage or CGPA"
                              />
                              {qualificationErrors?.percentage && (
                                <p className="mt-1 text-sm text-red-500">
                                  {qualificationErrors.percentage.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                  {errors.qualifications &&
                    typeof errors.qualifications.message === "string" && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.qualifications.message}
                      </p>
                    )}
                </div>

                {/* Experience Details Section */}
                <div className="mt-3 mb-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#525B88]">
                      Experience Details
                    </h3>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="flex items-center px-3 py-1.5 bg-[#525B88] text-white rounded-lg text-sm transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Experience
                    </button>
                  </div>
                  <div className="p-4">
                    {Array.from({ length: experienceCount }).map((_, index) => {
                      const experienceErrors = errors.experiences?.[index];
                      return (
                        <div key={index} className="relative mb-4">
                          {experienceCount > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExperience(index)}
                              className="absolute top-2 right-2 p-1.5 text-red-600 hover:text-red-800 transition-colors"
                              title="Remove Experience"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                          <h4 className="text-md font-medium text-gray-700 mb-3">
                            Experience {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company/Organization Name
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `experiences.${index}.companyName`
                                )}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  experienceErrors?.companyName
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter Company/Organization name"
                              />
                              {experienceErrors?.companyName && (
                                <p className="mt-1 text-sm text-red-500">
                                  {experienceErrors.companyName.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                              </label>
                              <input
                                type="date"
                                {...register(`experiences.${index}.fromDate`)}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  experienceErrors?.fromDate
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                              />
                              {experienceErrors?.fromDate && (
                                <p className="mt-1 text-sm text-red-500">
                                  {experienceErrors.fromDate.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                              </label>
                              <input
                                type="date"
                                {...register(`experiences.${index}.toDate`)}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  experienceErrors?.toDate
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                              />
                              {experienceErrors?.toDate && (
                                <p className="mt-1 text-sm text-red-500">
                                  {experienceErrors.toDate.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Work Location
                              </label>
                              <input
                                type="text"
                                {...register(`experiences.${index}.location`)}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  experienceErrors?.location
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter location"
                              />
                              {experienceErrors?.location && (
                                <p className="mt-1 text-sm text-red-500">
                                  {experienceErrors.location.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Domain
                              </label>
                              <input
                                type="text"
                                {...register(`experiences.${index}.domain`)}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  experienceErrors?.domain
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter domain"
                              />
                              {experienceErrors?.domain && (
                                <p className="mt-1 text-sm text-red-500">
                                  {experienceErrors.domain.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {errors.experiences &&
                      typeof errors.experiences.message === "string" && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.experiences.message}
                        </p>
                      )}
                  </div>
                </div>

                {/* Skills Section */}
                <div className="mt-3 mb-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#525B88]">
                      Skills
                    </h3>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="flex items-center px-3 py-1.5 bg-[#525B88] text-white rounded-lg text-sm transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Skill
                    </button>
                  </div>
                  <div className="p-4">
                    {Array.from({ length: skillCount }).map((_, index) => {
                      const skillErrors = errors.skills?.[index];
                      return (
                        <div key={index} className="relative mb-4">
                          {skillCount > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="absolute top-2 right-2 p-1.5 text-red-600 hover:text-red-800 transition-colors"
                              title="Remove Skill"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                          <h4 className="text-md font-medium text-gray-700 mb-3">
                            Skill {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Skill Name
                              </label>
                              <input
                                type="text"
                                {...register(`skills.${index}.skillName`)}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  skillErrors?.skillName
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter skill name"
                              />
                              {skillErrors?.skillName && (
                                <p className="mt-1 text-sm text-red-500">
                                  {skillErrors.skillName.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Experience
                              </label>
                              <input
                                type="text"
                                {...register(`skills.${index}.experience`)}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  skillErrors?.experience
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter experience"
                              />
                              {skillErrors?.experience && (
                                <p className="mt-1 text-sm text-red-500">
                                  {skillErrors.experience.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                              </label>
                              <input
                                type="text"
                                {...register(`skills.${index}.notes`)}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                                  skillErrors?.notes
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                }`}
                                placeholder="Enter notes (optional)"
                              />
                              {skillErrors?.notes && (
                                <p className="mt-1 text-sm text-red-500">
                                  {skillErrors.notes.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {errors.skills &&
                      typeof errors.skills.message === "string" && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.skills.message}
                        </p>
                      )}
                  </div>
                </div>

                {/* Employment Details Section */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Employment Details
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employee ID <span className="text-red-500">*</span>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title
                        </label>
                        <input
                          type="text"
                          {...register("jobTitle")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.jobTitle
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter job title"
                        />
                        {errors.jobTitle && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.jobTitle.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Role
                        </label>
                        <input
                          type="text"
                          {...register("jobRole")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.jobRole
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter job role"
                        />
                        {errors.jobRole && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.jobRole.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Joining Date
                        </label>
                        <input
                          type="date"
                          {...register("joiningDate")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.joiningDate
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                        />
                        {errors.joiningDate && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.joiningDate.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          {...register("department")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.department
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Signature
                        </label>
                        <input
                          type="file"
                          {...register("signature")}
                          accept="image/*,.pdf"
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.signature
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                        />
                        {errors.signature && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.signature.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Accepted formats: JPG, PNG, PDF
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details Section */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Bank Account Details
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          {...register("accountHolderName")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.accountHolderName
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter account holder name"
                        />
                        {errors.accountHolderName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.accountHolderName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          {...register("accountNumber")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.accountNumber
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter account number"
                        />
                        {errors.accountNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.accountNumber.message}
                          </p>
                        )}
                      </div>
                      <div className="relative" ref={bankDropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Name
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountTypeDropdownOpen(false);
                            setIsBankDropdownOpen(!isBankDropdownOpen);
                          }}
                          className={`w-full px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 bg-white text-left flex items-center justify-between ${
                            errors.bankName
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          style={{
                            height: "36px",
                            cursor: "pointer",
                          }}
                        >
                          <span
                          // className={
                          //   getValues("bankName")
                          //     ? "text-gray-900"
                          //     : "text-gray-500"
                          // }
                          >
                            {getValues("bankName") || "Select bank name"}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${
                              isBankDropdownOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <input type="hidden" {...register("bankName")} />
                        {isBankDropdownOpen && (
                          <>
                            <style>{`
                              .bank-dropdown-scroll::-webkit-scrollbar {
                                width: 8px;
                              }
                              .bank-dropdown-scroll::-webkit-scrollbar-track {
                                background: #f1f1f1;
                                border-radius: 4px;
                              }
                              .bank-dropdown-scroll::-webkit-scrollbar-thumb {
                                background: #888;
                                border-radius: 4px;
                              }
                              .bank-dropdown-scroll::-webkit-scrollbar-thumb:hover {
                                background: #555;
                              }
                            `}</style>
                            <div
                              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg bank-dropdown-scroll"
                              style={{
                                maxHeight: "300px",
                                overflowY: "auto",
                                scrollbarWidth: "thin",
                                scrollbarColor: "#888 #f1f1f1",
                              }}
                            >
                              <div
                                onClick={() => {
                                  setValue("bankName", "");
                                  setIsBankDropdownOpen(false);
                                }}
                                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                                  !getValues("bankName")
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-900"
                                }`}
                              >
                                Select bank name
                              </div>
                              {[...AP_STATE_BANKS]
                                .sort((a, b) => {
                                  // Keep "Other" at the end
                                  if (a === "Other") return 1;
                                  if (b === "Other") return -1;
                                  return a.localeCompare(b);
                                })
                                .map((bank) => (
                                  <div
                                    key={bank}
                                    onClick={() => {
                                      setValue("bankName", bank);
                                      setIsBankDropdownOpen(false);
                                    }}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                                      getValues("bankName") === bank
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {bank}
                                  </div>
                                ))}
                            </div>
                          </>
                        )}
                        {errors.bankName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.bankName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          {...register("branchName")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.branchName
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter branch name"
                        />
                        {errors.branchName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.branchName.message}
                          </p>
                        )}
                      </div>
                      <div className="relative" ref={accountTypeDropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Type
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsBankDropdownOpen(false);
                            setIsAccountTypeDropdownOpen(
                              !isAccountTypeDropdownOpen
                            );
                          }}
                          className={`w-full px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 bg-white text-left flex items-center justify-between ${
                            errors.accountType
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          style={{
                            height: "36px",
                            cursor: "pointer",
                          }}
                        >
                          <span>
                            {getValues("accountType") || "Select account type"}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${
                              isAccountTypeDropdownOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <input type="hidden" {...register("accountType")} />
                        {isAccountTypeDropdownOpen && (
                          <>
                            <style>{`
                              .account-type-dropdown-scroll::-webkit-scrollbar {
                                width: 8px;
                              }
                              .account-type-dropdown-scroll::-webkit-scrollbar-track {
                                background: #f1f1f1;
                                border-radius: 4px;
                              }
                              .account-type-dropdown-scroll::-webkit-scrollbar-thumb {
                                background: #888;
                                border-radius: 4px;
                              }
                              .account-type-dropdown-scroll::-webkit-scrollbar-thumb:hover {
                                background: #555;
                              }
                            `}</style>
                            <div
                              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg account-type-dropdown-scroll"
                              style={{
                                maxHeight: "300px",
                                overflowY: "auto",
                                scrollbarWidth: "thin",
                                scrollbarColor: "#888 #f1f1f1",
                              }}
                            >
                              <div
                                onClick={() => {
                                  setValue("accountType", "");
                                  setIsAccountTypeDropdownOpen(false);
                                }}
                                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                                  !getValues("accountType")
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-900"
                                }`}
                              >
                                Select account type
                              </div>
                              {ACCOUNT_TYPES.map((type) => (
                                <div
                                  key={type}
                                  onClick={() => {
                                    setValue("accountType", type);
                                    setIsAccountTypeDropdownOpen(false);
                                  }}
                                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                                    getValues("accountType") === type
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {type}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {errors.accountType && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.accountType.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          {...register("ifscCode")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.ifscCode
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter IFSC code"
                        />
                        {errors.ifscCode && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.ifscCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PAN Card Number
                        </label>
                        <input
                          type="text"
                          {...register("panCardNumber")}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 uppercase ${
                            errors.panCardNumber
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter PAN card number"
                          maxLength={10}
                          onInput={(e) => {
                            e.target.value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "");
                          }}
                        />
                        {errors.panCardNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.panCardNumber.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="mt-3 mb-3">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-[#525B88]">
                      Documents
                    </h3>
                    <button
                      type="button"
                      onClick={addDocument}
                      className="flex items-center px-3 py-1.5 bg-[#525B88] text-white rounded-lg text-sm transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Document
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-4">
                      {(() => {
                        // Get the actual additionalDocuments array from form state
                        const currentDocuments =
                          getValues("additionalDocuments") || [];
                        // Ensure we have at least documentCount items
                        const documentsToRender = Array.from({
                          length: Math.max(
                            documentCount,
                            currentDocuments.length || 1
                          ),
                        });
                        return documentsToRender.map((_, index) => {
                          return (
                            <div
                              key={index}
                              className="grid grid-cols-1 md:grid-cols-3 gap-4 relative"
                            >
                              {documentCount > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeDocument(index)}
                                  className="absolute top-0 right-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                  title="Remove Document"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Document {index + 1}
                                </label>
                                <input
                                  type="file"
                                  name={`additionalDocuments.${index}.file`}
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleDocumentFileChange(index, e)
                                  }
                                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                  JPG, PNG, PDF
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Name of Document
                                </label>
                                <input
                                  type="text"
                                  {...register(
                                    `additionalDocuments.${index}.name`
                                  )}
                                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                                  placeholder="Enter document name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notes (Optional)
                                </label>
                                <input
                                  type="text"
                                  {...register(
                                    `additionalDocuments.${index}.notes`
                                  )}
                                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                                  placeholder="Enter notes"
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Login Credentials Section */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Login Credentials
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register("username")}
                          autoComplete="username"
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.username
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter username"
                        />
                        {errors.username && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.username.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          This will be used to log in to the system
                        </p>
                      </div>

                      {/* Pin */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pin <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          {...register("pin")}
                          autoComplete="new-password"
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.pin
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter 6-digit pin"
                          maxLength={6}
                          onInput={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, "");
                            // Prevent starting with zero
                            if (value.length === 1 && value === "0") {
                              value = "";
                            }
                            e.target.value = value;
                          }}
                        />
                        {errors.pin && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.pin.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Must be exactly 6 digits (numbers only, cannot start
                          with zero)
                        </p>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          {...register("password")}
                          autoComplete="new-password"
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.password
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                          placeholder="Enter password"
                        />
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.password.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Must contain at least one uppercase letter, one
                          lowercase letter, and one number. Special characters
                          are allowed.
                        </p>
                      </div>
                    </div>

                    {/* Declaration */}
                    <div className="mb-4">
                      <label className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          {...register("declaration")}
                          className="mt-1 h-4 w-4 text-[#525B88] border-gray-300 rounded focus:ring-[#525B88]"
                        />
                        <span className="text-sm text-gray-700">
                          I hereby declare that the above information is true to
                          the best of my knowledge and belief.
                        </span>
                      </label>
                      {errors.declaration && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.declaration.message}
                        </p>
                      )}
                    </div>
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
                    className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-[#3a4166] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : editingId ? (
                      <>
                        <CheckIcon className="h-4 w-4 inline mr-1.5" />
                        Update Employee
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </FormWrapper>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Table */}
      <div className="mt-6">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            {/* <h2 className="text-xl font-semibold text-[#525b88]">
              Onboarded Employees
            </h2> */}
            {/* Search Input */}
            <div className="w-full max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Employee ID, Name, Email, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="table-scroll-container">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#525b88]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {(() => {
                    // Filter onboarding list based on search query
                    const filteredList = onboardingList.filter((item) => {
                      if (!searchQuery.trim()) return true;

                      const query = searchQuery.toLowerCase().trim();
                      const employeeId = (item.employeeId || "").toLowerCase();
                      const firstName = (item.firstName || "").toLowerCase();
                      const lastName = (item.lastName || "").toLowerCase();
                      const fullName = `${firstName} ${lastName}`.trim();
                      const email = (item.gmail || "").toLowerCase();
                      const phone = (item.contactNumber || "").toLowerCase();
                      const gender = (item.gender || "").toLowerCase();

                      return (
                        employeeId.includes(query) ||
                        firstName.includes(query) ||
                        lastName.includes(query) ||
                        fullName.includes(query) ||
                        email.includes(query) ||
                        phone.includes(query) ||
                        gender.includes(query)
                      );
                    });

                    return filteredList.length > 0 ? (
                      filteredList.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {item.employeeId || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {`${item.firstName || ""} ${
                              item.lastName || ""
                            }`.trim() || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {item.gender
                              ? item.gender.charAt(0).toUpperCase() +
                                item.gender.slice(1)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {item.dob
                              ? new Date(item.dob).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {item.contactNumber || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            <div
                              className="max-w-xs truncate"
                              title={item.gmail || "-"}
                            >
                              {item.gmail || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setViewingItem(item);
                                  setShowViewModal(true);
                                }}
                                className="text-[#525b88] hover:text-[#3a4166] p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="View"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            {searchQuery.trim() ? (
                              <>
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
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                                <p className="text-gray-600">
                                  No employees found matching "{searchQuery}"
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Try a different search term
                                </p>
                              </>
                            ) : (
                              <>
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                <p className="text-gray-600">
                                  No onboarded employees found
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Add your first employee to get started
                                </p>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Loading Overlay */}
      {documentLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center gap-4">
              <svg
                className="animate-spin h-12 w-12 text-[#525B88]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">
                  Loading Document
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {loadingDocumentName}
                </p>
                <p className="text-xs text-gray-500 mt-2">Please wait...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-5xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                Employee Details
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingItem(null);
                }}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
                title="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-2">
                {/* Photo and Signature Section */}
                <div className="flex justify-center gap-8 mb-6">
                  {/* Profile Photo */}
                  {viewingItem.photo && (
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo
                      </label>
                      <img
                        src={
                          typeof viewingItem.photo === "string" &&
                          viewingItem.photo.startsWith("http")
                            ? viewingItem.photo
                            : `${API.defaults.baseURL}${
                                viewingItem.photo.startsWith("/") ? "" : "/"
                              }${viewingItem.photo}`
                        }
                        alt="Employee Photo"
                        className="h-32 w-32 rounded-full object-cover border-4 border-[#525B88] mx-auto"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Signature PDF */}
                  {viewingItem.signature && (
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Signature
                      </label>
                      <div className="border-2 border-[#525B88] rounded-lg p-2 bg-gray-50">
                        <iframe
                          src={
                            typeof viewingItem.signature === "string" &&
                            viewingItem.signature.startsWith("http")
                              ? viewingItem.signature
                              : `${API.defaults.baseURL}${
                                  viewingItem.signature.startsWith("/")
                                    ? ""
                                    : "/"
                                }${viewingItem.signature}`
                          }
                          className="w-48 h-32 rounded"
                          title="Signature"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <a
                          href={
                            typeof viewingItem.signature === "string" &&
                            viewingItem.signature.startsWith("http")
                              ? viewingItem.signature
                              : `${API.defaults.baseURL}${
                                  viewingItem.signature.startsWith("/")
                                    ? ""
                                    : "/"
                                }${viewingItem.signature}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          View Full Signature PDF
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Personal Information
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          First Name:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.firstName || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Last Name:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.lastName || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Gender:
                        </label>
                        <p className="text-sm text-gray-900 capitalize">
                          {viewingItem.gender || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Date of Birth:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.dob
                            ? new Date(viewingItem.dob).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Contact Number:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.contactNumber || "-"}
                        </p>
                      </div>
                      {viewingItem.alternativeNumber && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Alternative Number:
                          </label>
                          <p className="text-sm text-gray-900">
                            {viewingItem.alternativeNumber}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Email:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.gmail || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Aadhar Number:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.aadharNumber || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Father Name:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.fatherName || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Father Phone Number:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.fatherPhoneNumber || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Mother Name:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.motherName || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Mother Phone Number:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.motherPhoneNumber || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Address Information
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:border-r md:border-gray-500 md:pr-4">
                        <h4 className="text-md font-medium text-gray-800 mb-3">
                          Current Address
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              Address Line 1:
                            </label>
                            <p className="text-sm text-gray-900">
                              {viewingItem.currentAddressLine1 || "-"}
                            </p>
                          </div>
                          {viewingItem.currentAddressLine2 && (
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                Address Line 2:
                              </label>
                              <p className="text-sm text-gray-900">
                                {viewingItem.currentAddressLine2}
                              </p>
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]">
                                City:
                              </label>
                              <p className="text-sm text-gray-900">
                                {viewingItem.currentCity || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]">
                                State:
                              </label>
                              <p className="text-sm text-gray-900">
                                {viewingItem.currentState || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]">
                                Pincode:
                              </label>
                              <p className="text-sm text-gray-900">
                                {viewingItem.currentPincode || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="md:pl-4">
                        <h4 className="text-md font-medium text-gray-800 mb-3">
                          Permanent Address
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              Address Line 1:
                            </label>
                            <p className="text-sm text-gray-900">
                              {viewingItem.permanentAddressLine1 || "-"}
                            </p>
                          </div>
                          {viewingItem.permanentAddressLine2 && (
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                Address Line 2:
                              </label>
                              <p className="text-sm text-gray-900">
                                {viewingItem.permanentAddressLine2}
                              </p>
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]">
                                City:
                              </label>
                              <p className="text-sm text-gray-900">
                                {viewingItem.permanentCity || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]">
                                State:
                              </label>
                              <p className="text-sm text-gray-900">
                                {viewingItem.permanentState || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]">
                                Pincode:
                              </label>
                              <p className="text-sm text-gray-900">
                                {viewingItem.permanentPincode || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualification Details */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Qualification Details
                  </h3>
                  {viewingItem.qualifications &&
                  Array.isArray(viewingItem.qualifications) &&
                  viewingItem.qualifications.length > 0 ? (
                    <div className="p-4 space-y-4">
                      {viewingItem.qualifications.map((qual, index) => (
                        <div key={index} className="">
                          <h4 className="text-md font-medium text-gray-800 mb-3">
                            Qualification {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[140px]">
                                College/School Name:
                              </label>
                              <p className="text-sm text-gray-900">
                                {qual.collegeName || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[140px]">
                                Roll Number:
                              </label>
                              <p className="text-sm text-gray-900">
                                {qual.rollNumber || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[140px]">
                                Education:
                              </label>
                              <p className="text-sm text-gray-900">
                                {qual.education || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[140px]">
                                Pass Out Year:
                              </label>
                              <p className="text-sm text-gray-900">
                                {qual.passoutYear || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[140px]">
                                Percentage/CGPA:
                              </label>
                              <p className="text-sm text-gray-900">
                                {qual.percentage || "-"}
                              </p>
                            </div>
                            {qual.specialization && (
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[140px]">
                                  Specialization:
                                </label>
                                <p className="text-sm text-gray-900">
                                  {qual.specialization}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-sm text-gray-500">
                        No qualifications added
                      </p>
                    </div>
                  )}
                </div>

                {/* Experience Details */}
                {(viewingItem.experienceCollegeName ||
                  viewingItem.experience ||
                  viewingItem.location ||
                  viewingItem.domain) && (
                  <div className="mt-3 mb-3">
                    <h3 className="text-lg font-semibold text-[#525B88]">
                      Experience Details
                    </h3>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {viewingItem.experienceCollegeName && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              College Name:
                            </label>
                            <p className="text-sm text-gray-900">
                              {viewingItem.experienceCollegeName}
                            </p>
                          </div>
                        )}
                        {viewingItem.experience && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              Experience:
                            </label>
                            <p className="text-sm text-gray-900">
                              {viewingItem.experience}
                            </p>
                          </div>
                        )}
                        {viewingItem.location && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              Work Location:
                            </label>
                            <p className="text-sm text-gray-900">
                              {viewingItem.location}
                            </p>
                          </div>
                        )}
                        {viewingItem.domain && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              Domain:
                            </label>
                            <p className="text-sm text-gray-900">
                              {viewingItem.domain}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Employment Details */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Employment Details
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Employee ID:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.employeeId || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Job Title:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.jobTitle || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Job Role:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.jobRole || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Joining Date:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.joiningDate
                            ? new Date(
                                viewingItem.joiningDate
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Department:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.department
                            ? departments.find(
                                (dept) => dept.value === viewingItem.department
                              )?.label || viewingItem.department
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {viewingItem.skills && (
                  <div className="mt-3 mb-3">
                    <h3 className="text-lg font-semibold text-[#525B88]">
                      Skills
                    </h3>
                    {Array.isArray(viewingItem.skills) ? (
                      <div className="p-4 space-y-4">
                        {viewingItem.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="border-b pb-3 last:border-b-0"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                  Skill Name:
                                </label>
                                <p className="text-sm text-gray-900">
                                  {skill.skillName || "-"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                  Experience:
                                </label>
                                <p className="text-sm text-gray-900">
                                  {skill.experience || "-"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                  Notes:
                                </label>
                                <p className="text-sm text-gray-900">
                                  {skill.notes || "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4">
                        <p className="text-sm text-gray-900">
                          {viewingItem.skills}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Account Details */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Bank Account Details
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Account Holder Name:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.accountHolderName || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Account Number:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.accountNumber || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Bank Name:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.bankName || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Branch Name:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.branchName || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Account Type:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.accountType || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          IFSC Code:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.ifscCode || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          PAN Card Number:
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.panCardNumber || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mt-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#525B88]">
                    Documents
                  </h3>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const doc10th = viewingItem.documents
                          ? getDocumentByType(viewingItem.documents, "10th")
                          : viewingItem.document10th;
                        const docUrl10th = getDocumentUrl(doc10th);
                        return (
                          docUrl10th && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                10th Document
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "10th"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docInter = viewingItem.documents
                          ? getDocumentByType(
                              viewingItem.documents,
                              "Intermediate"
                            )
                          : viewingItem.documentInter;
                        const docUrlInter = getDocumentUrl(docInter);
                        return (
                          docUrlInter && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Inter Document
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "Intermediate"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docGrad = viewingItem.documents
                          ? getDocumentByType(
                              viewingItem.documents,
                              "Graduation"
                            )
                          : viewingItem.documentGraduation;
                        const docUrlGrad = getDocumentUrl(docGrad);
                        return (
                          docUrlGrad && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Graduation Document
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "Graduation"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docPostGrad = viewingItem.documents
                          ? getDocumentByType(
                              viewingItem.documents,
                              "PostGraduation"
                            )
                          : viewingItem.documentPostGraduation;
                        const docUrlPostGrad = getDocumentUrl(docPostGrad);
                        return (
                          docUrlPostGrad && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Post Graduation Document
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "PostGraduation"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docPhd = viewingItem.documents
                          ? getDocumentByType(viewingItem.documents, "PhD")
                          : viewingItem.documentPhd;
                        const docUrlPhd = getDocumentUrl(docPhd);
                        return (
                          docUrlPhd && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                PhD Document
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "PhD"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docAadhar = viewingItem.documents
                          ? getDocumentByType(
                              viewingItem.documents,
                              "AadharCard"
                            )
                          : viewingItem.documentAadharCard;
                        const docUrlAadhar = getDocumentUrl(docAadhar);
                        return (
                          docUrlAadhar && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Aadhar Card
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "AadharCard"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docPan = viewingItem.documents
                          ? getDocumentByType(viewingItem.documents, "PanCard")
                          : viewingItem.documentPanCard;
                        const docUrlPan = getDocumentUrl(docPan);
                        return (
                          docUrlPan && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                PAN Card
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "PanCard"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docBank = viewingItem.documents
                          ? getDocumentByType(
                              viewingItem.documents,
                              "BankDetails"
                            )
                          : viewingItem.documentBankDetails;
                        const docUrlBank = getDocumentUrl(docBank);
                        return (
                          docUrlBank && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Bank Details Document
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "BankDetails"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docResume = viewingItem.documents
                          ? getDocumentByType(viewingItem.documents, "Resume")
                          : viewingItem.documentResume;
                        const docUrlResume = getDocumentUrl(docResume);
                        return (
                          docUrlResume && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Resume
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "Resume"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docOther = viewingItem.documents
                          ? getDocumentByType(
                              viewingItem.documents,
                              "OtherCertificates"
                            )
                          : viewingItem.documentOtherCertificates;
                        const docUrlOther = getDocumentUrl(docOther);
                        return (
                          docUrlOther && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Other Certificates
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "OtherCertificates"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}
                      {(() => {
                        const docAppointment = viewingItem.documents
                          ? getDocumentByType(
                              viewingItem.documents,
                              "Appointment"
                            )
                          : viewingItem.documentAppointment;
                        const docUrlAppointment =
                          getDocumentUrl(docAppointment);
                        return (
                          docUrlAppointment && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Appointment Document
                              </label>
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "Appointment"
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          )
                        );
                      })()}

                      {/* Documents from Documents Section - Display in main Documents section */}
                      {(() => {
                        // Check both 'documents' (new) and 'additionalDocuments' (old) for backward compatibility
                        const uploadedDocs =
                          viewingItem.documents ||
                          viewingItem.additionalDocuments;

                        // Filter to only get documents that are not the main document types
                        // (10th, Inter, Graduation, etc. are already displayed above)
                        const mainDocTypes = [
                          "10th",
                          "Intermediate",
                          "Graduation",
                          "PostGraduation",
                          "PhD",
                          "AadharCard",
                          "PanCard",
                          "BankDetails",
                          "Resume",
                          "OtherCertificates",
                          "Appointment",
                        ];

                        if (
                          !uploadedDocs ||
                          !Array.isArray(uploadedDocs) ||
                          uploadedDocs.length === 0
                        ) {
                          return null;
                        }

                        // Filter out documents without files and exclude main document types
                        const docsWithFiles = uploadedDocs.filter((doc) => {
                          if (!doc) return false;
                          // Skip if this is a main document type (already displayed above)
                          if (doc.type && mainDocTypes.includes(doc.type)) {
                            return false;
                          }
                          // Check multiple possible file property names
                          return (
                            doc.file ||
                            doc.fileName ||
                            doc.filePath ||
                            (typeof doc === "string" && doc.length > 0)
                          );
                        });

                        if (docsWithFiles.length === 0) {
                          return null;
                        }

                        // Render uploaded documents in the same grid
                        return docsWithFiles.map((doc, index) => {
                          // Get file from multiple possible properties
                          const file =
                            doc.file ||
                            doc.fileName ||
                            doc.filePath ||
                            (typeof doc === "string" ? doc : null);

                          if (!file) return null;

                          const docUrl = getDocumentUrl(file);
                          if (!docUrl) return null;

                          return (
                            <div key={`document-${index}`}>
                              <label className="block text-sm font-medium text-gray-700">
                                {doc.name || `Document ${index + 1}`}
                              </label>
                              {doc.notes && (
                                <p className="text-xs text-gray-500 mt-1 mb-1">
                                  {doc.notes}
                                </p>
                              )}
                              <button
                                onClick={(e) =>
                                  handleViewDocument(
                                    e,
                                    null,
                                    viewingItem._id,
                                    "documents",
                                    index
                                  )
                                }
                                className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                View Document
                              </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Login Credentials */}
                {/* <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                    Login Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingItem.username || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        PIN
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {"*".repeat(viewingItem.pin?.length || 0)}
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={handleDownloadPDF}
                className="px-5 py-2 bg-[#525B88] text-white rounded-lg hover:bg-[#3a4166] transition-colors flex items-center gap-2"
                title="Download PDF"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingItem(null);
                }}
                className="px-5 py-2 bg-[#525B88] text-white rounded-lg hover:bg-[#3a4166] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
