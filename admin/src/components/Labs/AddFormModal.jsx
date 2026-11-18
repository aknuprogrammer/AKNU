import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

const AddFormModal = ({ 
  formType, 
  initialData, 
  onSubmit, 
  onClose, 
  labTypes = [],
  courses = [],
  streams = [],
  courseStreamMappings = [],
  streamSubjectMappings = [],
  labs = [],
  internalExamSetups = [],
  labIncharges = [],
  maintenanceIssues = [],
}) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Initialize form based on formType
      switch (formType) {
        case "labs":
          setFormData({
            labName: "",
            labTypeId: "",
            building: "",
            location: "",
            capacity: 0,
            status: "active",
            description: "",
            equipmentCount: 0,
            inCharge: "",
            contact: "",
          });
          break;
        case "labInventory":
          setFormData({
            itemName: "",
            category: "",
            labName: "",
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
        case "labBookings":
          setFormData({
            course: "",
            courseId: "",
            stream: "",
            streamId: "",
            year: "",
            semester: "",
            semesterNumber: "",
            labName: "",
            internalExamSetupId: "",
            facultyName: "",
            facultyId: "",
            classDate: new Date().toISOString().split("T")[0],
            startTime: "",
            endTime: "",
            status: "active",
            studentCount: 0,
          });
          break;
        case "labMaintenance":
          setFormData({
            itemName: "",
            labName: "",
            issueId: "",
            maintenanceType: "repair",
            requestDate: new Date().toISOString().split("T")[0],
            completionDate: "",
            status: "pending",
            technician: "",
            cost: "",
            description: "",
            notes: "",
          });
          break;
        default:
          setFormData({});
      }
    }
  }, [initialData, formType]);

  // Filter streams based on selected course
  const availableStreams = useMemo(() => {
    if (formType !== "labBookings" || !formData.courseId || courseStreamMappings.length === 0) {
      return [];
    }
    const courseMappings = courseStreamMappings.filter((mapping) => {
      const mappingCourseId =
        typeof mapping.courseId === "object" && mapping.courseId?._id
          ? mapping.courseId._id
          : mapping.courseId;
      return (
        mappingCourseId === formData.courseId &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });
    const streamIds = new Set();
    courseMappings.forEach((mapping) => {
      const streamId =
        typeof mapping.streamId === "object" && mapping.streamId?._id
          ? mapping.streamId._id
          : mapping.streamId;
      if (streamId) streamIds.add(streamId);
    });
    return streams.filter((stream) => streamIds.has(stream._id));
  }, [formType, formData.courseId, courseStreamMappings, streams]);

  // Filter maintenance issues based on selected lab
  const availableIssues = useMemo(() => {
    if (formType !== "labMaintenance" || maintenanceIssues.length === 0) {
      return [];
    }
    
    // If no lab is selected, show all open/in_progress issues
    if (!formData.labName) {
      return maintenanceIssues;
    }
    
    // Filter issues by selected lab
    const selectedLab = labs.find(lab => lab.labName === formData.labName);
    if (!selectedLab) return maintenanceIssues;
    
    return maintenanceIssues.filter(issue => {
      const issueLabId = typeof issue.labId === "object" && issue.labId?._id 
        ? issue.labId._id 
        : issue.labId;
      return issueLabId === selectedLab._id;
    });
  }, [formType, formData.labName, maintenanceIssues, labs]);

  // Filter semesters based on selected course and stream
  const availableSemesters = useMemo(() => {
    if (
      formType !== "labBookings" ||
      !formData.courseId ||
      !formData.streamId ||
      courseStreamMappings.length === 0
    ) {
      return [];
    }
    const relevantMappings = courseStreamMappings.filter((mapping) => {
      const mappingCourseId =
        typeof mapping.courseId === "object" && mapping.courseId?._id
          ? mapping.courseId._id
          : mapping.courseId;
      const mappingStreamId =
        typeof mapping.streamId === "object" && mapping.streamId?._id
          ? mapping.streamId._id
          : mapping.streamId;
      return (
        mappingCourseId === formData.courseId &&
        mappingStreamId === formData.streamId &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });
    
    // Debug logging
    console.log("=== Semester Filtering Debug ===");
    console.log("Total courseStreamMappings:", courseStreamMappings.length);
    console.log("Selected courseId:", formData.courseId);
    console.log("Selected streamId:", formData.streamId);
    console.log("Relevant mappings found:", relevantMappings.length);
    console.log("Relevant mappings:", relevantMappings.map(m => ({
      courseId: typeof m.courseId === "object" ? m.courseId._id : m.courseId,
      streamId: typeof m.streamId === "object" ? m.streamId._id : m.streamId,
      semesterNumber: m.semesterNumber,
      status: m.status
    })));
    
    const semesterMap = new Map();
    relevantMappings.forEach((mapping) => {
      const semesterNumber = mapping.semesterNumber;
      const semesterId =
        typeof mapping.semesterId === "object" && mapping.semesterId?._id
          ? mapping.semesterId._id
          : mapping.semesterId;
      if (semesterNumber && !semesterMap.has(semesterNumber)) {
        semesterMap.set(semesterNumber, {
          semesterNumber,
          semesterId,
        });
      }
    });
    
    const result = Array.from(semesterMap.values()).sort(
      (a, b) => a.semesterNumber - b.semesterNumber
    );
    
    console.log("Available semesters (result):", result);
    console.log("=================================");
    
    return result;
  }, [formType, formData.courseId, formData.streamId, courseStreamMappings]);

  // Filter semesters based on selected year
  const availableSemestersForYear = useMemo(() => {
    if (
      formType !== "labBookings" ||
      !formData.year ||
      availableSemesters.length === 0
    ) {
      return [];
    }
    const selectedYear = parseInt(formData.year);
    return availableSemesters
      .filter((sem) => {
        const semesterYear = Math.ceil(sem.semesterNumber / 2);
        return semesterYear === selectedYear;
      })
      .map((sem) => {
        const semesterNumber = sem.semesterNumber;
        const semesterInYear = ((semesterNumber - 1) % 2) + 1;
        const yearText = getOrdinalSuffix(selectedYear) + " year";
        const semText = getOrdinalSuffix(semesterInYear) + " sem";
        return {
          ...sem,
          displayLabel: `${yearText}-${semText}`,
        };
      });
  }, [formType, formData.year, availableSemesters]);

  // Get available years from semesters
  // Show all years from 1 to the maximum year based on the highest semester number
  const availableYears = useMemo(() => {
    if (formType !== "labBookings" || availableSemesters.length === 0) {
      return [];
    }
    // Find the maximum semester number
    const maxSemesterNumber = Math.max(
      ...availableSemesters.map((sem) => sem.semesterNumber)
    );
    // Calculate the maximum year
    const maxYear = Math.ceil(maxSemesterNumber / 2);
    
    // Debug logging
    console.log("=== Year Calculation Debug ===");
    console.log("Available semesters:", availableSemesters);
    console.log("Semester numbers:", availableSemesters.map(s => s.semesterNumber));
    console.log("Max semester number:", maxSemesterNumber);
    console.log("Max year (calculated):", maxYear);
    
    // Generate all years from 1 to maxYear
    const years = [];
    for (let year = 1; year <= maxYear; year++) {
      years.push({
        value: year,
        label: getOrdinalSuffix(year) + " year",
      });
    }
    
    console.log("Available years:", years);
    console.log("===============================");
    
    return years;
  }, [formType, availableSemesters]);

  // Filter lab names from Labs collection for labBookings form type
  const availableLabNames = useMemo(() => {
    if (formType !== "labBookings") {
      return [];
    }
    // Return all active labs from Labs collection, removing duplicates by _id
    const activeLabs = labs.filter(lab => lab.status === "active" || lab.status === "Active");
    const uniqueLabsMap = new Map();
    activeLabs.forEach(lab => {
      if (lab._id && !uniqueLabsMap.has(lab._id)) {
        uniqueLabsMap.set(lab._id, lab);
      }
    });
    return Array.from(uniqueLabsMap.values());
  }, [formType, labs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Handle cascading dropdowns for labBookings
    if (formType === "labBookings") {
      if (name === "course") {
        const selectedCourse = courses.find(
          (c) => (c.courseName || c.name) === value
        );
        newFormData = {
          ...newFormData,
          courseId: selectedCourse?._id || "",
          stream: "",
          streamId: "",
          year: "",
          semester: "",
          semesterNumber: "",
          labName: "",
          internalExamSetupId: "",
        };
      } else if (name === "stream") {
        const selectedStream = streams.find(
          (s) => (s.streamName || s.name) === value
        );
        newFormData = {
          ...newFormData,
          streamId: selectedStream?._id || "",
          year: "",
          semester: "",
          semesterNumber: "",
          labName: "",
          internalExamSetupId: "",
        };
      } else if (name === "year") {
        newFormData = {
          ...newFormData,
          semester: "",
          semesterNumber: "",
          labName: "",
          internalExamSetupId: "",
        };
      } else if (name === "semester") {
        // Extract semester number from the display label (e.g., "1st year-1st sem" -> semester number)
        const selectedSem = availableSemestersForYear.find(
          (sem) => sem.displayLabel === value
        );
        if (selectedSem) {
          newFormData = {
            ...newFormData,
            semester: selectedSem.displayLabel, // Store display label for dropdown
            semesterNumber: selectedSem.semesterNumber.toString(),
            labName: "",
            internalExamSetupId: "",
          };
        }
      } else if (name === "labName") {
        // Find the lab ID for the selected lab name (from Labs collection)
        const selectedLab = labs.find(
          (lab) => lab.labName === value
        );
        if (selectedLab) {
          newFormData = {
            ...newFormData,
            labId: selectedLab._id || "",
          };
        }
      }
    }

    // Handle numeric fields
    if (
      name === "quantity" ||
      name === "purchasePrice" ||
      name === "cost" ||
      name === "studentCount" ||
      name === "capacity" ||
      name === "equipmentCount"
    ) {
      newFormData[name] = parseFloat(value) || 0;
    } else {
      newFormData[name] = value;
    }

    setFormData(newFormData);
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
      labs: "Lab",
      labInventory: "Lab Inventory Item",
      labBookings: "Class Assignment",
      labMaintenance: "Maintenance Record",
    };
    return `${action} ${titles[formType] || "Item"}`;
  };

  const renderFormFields = () => {
    switch (formType) {
      case "labs":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lab Type: *
                </label>
                <select
                  name="labTypeId"
                  value={formData.labTypeId || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="">Select Lab Type</option>
                  {labTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name} ({type.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lab Name: *
                </label>
                <input
                  type="text"
                  name="labName"
                  value={formData.labName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building: *
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building || ""}
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
                  Capacity: *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
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
                  <option value="maintenance">Under Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Count:
                </label>
                <input
                  type="number"
                  name="equipmentCount"
                  value={formData.equipmentCount || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  In Charge:
                </label>
                <input
                  type="text"
                  name="inCharge"
                  value={formData.inCharge || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact:
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
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

      case "labInventory":
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
                  <option value="equipment">Equipment</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="glassware">Glassware</option>
                  <option value="instruments">Instruments</option>
                  <option value="safety">Safety Equipment</option>
                  <option value="consumables">Consumables</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lab Name: *
                </label>
                <input
                  type="text"
                  name="labName"
                  value={formData.labName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Cabinet:
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
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

      case "labBookings":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course: *
                </label>
                <select
                  name="course"
                  value={formData.course || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option
                      key={course._id}
                      value={course.courseName || course.name}
                    >
                      {course.courseName || course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream: *
                </label>
                <select
                  name="stream"
                  value={formData.stream || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  disabled={!formData.course || availableStreams.length === 0}
                  required
                >
                  <option value="">
                    {!formData.course
                      ? "Select Course first"
                      : availableStreams.length === 0
                      ? "No streams available"
                      : "Select Stream"}
                  </option>
                  {availableStreams.map((stream) => (
                    <option
                      key={stream._id}
                      value={stream.streamName || stream.name}
                    >
                      {stream.streamName || stream.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year: *
                </label>
                <select
                  name="year"
                  value={formData.year || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  disabled={
                    !formData.course ||
                    !formData.stream ||
                    availableYears.length === 0
                  }
                  required
                >
                  <option value="">
                    {!formData.course || !formData.stream
                      ? "Select Course and Stream first"
                      : availableYears.length === 0
                      ? "No years available"
                      : "Select Year"}
                  </option>
                  {availableYears.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester: *
                </label>
                <select
                  name="semester"
                  value={formData.semester || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  disabled={
                    !formData.course ||
                    !formData.stream ||
                    !formData.year ||
                    availableSemestersForYear.length === 0
                  }
                  required
                >
                  <option value="">
                    {!formData.course || !formData.stream || !formData.year
                      ? "Select Course, Stream, and Year first"
                      : availableSemestersForYear.length === 0
                      ? "No semesters available"
                      : "Select Semester"}
                  </option>
                  {availableSemestersForYear.map((sem) => (
                    <option key={sem.semesterId || sem.semesterNumber} value={sem.displayLabel}>
                      {sem.displayLabel}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lab Name: *
                </label>
                <select
                  name="labName"
                  value={formData.labName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  disabled={availableLabNames.length === 0}
                  required
                >
                  <option value="">
                    {availableLabNames.length === 0
                      ? "No labs available"
                      : "Select Lab Name"}
                  </option>
                  {availableLabNames.map((lab) => (
                    <option key={lab._id} value={lab.labName}>
                      {lab.labName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty (Lab Incharge): *
                </label>
                <select
                  name="facultyId"
                  value={formData.facultyId || ""}
                  onChange={(e) => {
                    const selectedIncharge = labIncharges.find(
                      (incharge) => String(incharge._id) === e.target.value
                    );
                    setFormData({
                      ...formData,
                      facultyId: selectedIncharge?._id ? String(selectedIncharge._id) : "",
                      facultyName: selectedIncharge?.name || "",
                    });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="">Select Lab Incharge</option>
                  {labIncharges.map((incharge) => (
                    <option key={incharge._id} value={String(incharge._id)}>
                      {incharge.name}
                      {incharge.employeeId ? ` (${incharge.employeeId})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Date: *
                </label>
                <input
                  type="date"
                  name="classDate"
                  value={formData.classDate || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time: *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time: *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Count:
                </label>
                <input
                  type="number"
                  name="studentCount"
                  value={formData.studentCount || 0}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
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
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </>
        );

      case "labMaintenance":
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
                  Lab Name: *
                </label>
                <input
                  type="text"
                  name="labName"
                  value={formData.labName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              {formType === "labMaintenance" && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Issue (Optional):
                  </label>
                  <select
                    name="issueId"
                    value={formData.issueId || ""}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  >
                    <option value="">Select Issue (Optional)</option>
                    {availableIssues.map((issue) => (
                      <option key={issue._id} value={issue._id}>
                        {issue.issueTitle || issue.title || "Untitled Issue"} - {issue.priority || "Medium"} Priority
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.labName 
                      ? "Issues filtered by selected lab" 
                      : "Select a lab first to see related issues, or leave empty to see all open issues"}
                  </p>
                </div>
              )}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Type: *
                </label>
                <select
                  name="maintenanceType"
                  value={formData.maintenanceType || "repair"}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="repair">Repair</option>
                  <option value="calibration">Calibration</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="inspection">Inspection</option>
                  <option value="preventive">Preventive</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Date: *
                </label>
                <input
                  type="date"
                  name="requestDate"
                  value={formData.requestDate || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status: *
                </label>
                <select
                  name="status"
                  value={formData.status || "pending"}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technician:
                </label>
                <input
                  type="text"
                  name="technician"
                  value={formData.technician || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost:
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  min="0"
                />
              </div>
              <div className="mb-5 col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description: *
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>
              <div className="mb-5 col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes:
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  rows="2"
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <h3 className="text-lg font-semibold text-white">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            type="button"
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

