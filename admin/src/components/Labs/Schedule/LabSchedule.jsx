import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Search,
  Calendar,
  Clock,
  User,
  FlaskConical,
} from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import {
  labScheduleApi,
  labsApi,
  internalExamSetupsApi,
  coursesApi,
  streamsApi,
  courseStreamMappingsApi,
  labInchargesApi,
} from "../../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";

const LabSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [formData, setFormData] = useState({
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
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    duration: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [internalExamSetups, setInternalExamSetups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [labIncharges, setLabIncharges] = useState([]);
  const [labs, setLabs] = useState([]);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch schedules, internal exam setups, courses, streams, course-stream mappings, lab incharges, and labs from API
  useEffect(() => {
    fetchSchedules();
    fetchInternalExamSetups();
    fetchLabs();
    fetchCourses();
    fetchStreams();
    fetchCourseStreamMappings();
    fetchLabIncharges();
  }, []);

  const fetchInternalExamSetups = async () => {
    try {
      const response = await internalExamSetupsApi.getAll({ status: "Active" });
      let setupsData = [];
      if (Array.isArray(response)) {
        setupsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        setupsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        setupsData = response.data;
      }
      setInternalExamSetups(setupsData);
    } catch (error) {
      console.error("Error fetching internal exam setups:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      let coursesData = [];
      if (Array.isArray(response)) {
        coursesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        coursesData = response.data;
      }
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await streamsApi.getAll();
      let streamsData = [];
      if (Array.isArray(response)) {
        streamsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        streamsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        streamsData = response.data;
      }
      setStreams(streamsData);
    } catch (error) {
      console.error("Error fetching streams:", error);
    }
  };

  const fetchCourseStreamMappings = async () => {
    try {
      const response = await courseStreamMappingsApi.getAll({
        activeOnly: true,
      });
      let mappingsData = [];
      if (Array.isArray(response)) {
        mappingsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        mappingsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        mappingsData = response.data;
      }
      setCourseStreamMappings(mappingsData);
    } catch (error) {
      console.error("Error fetching course-stream mappings:", error);
    }
  };

  const fetchLabIncharges = async () => {
    try {
      const response = await labInchargesApi.getAll({ status: "Active" });
      let inchargesData = [];
      if (Array.isArray(response)) {
        inchargesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        inchargesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        inchargesData = response.data;
      }
      setLabIncharges(inchargesData);
    } catch (error) {
      console.error("Error fetching lab incharges:", error);
    }
  };

  const fetchLabs = async () => {
    try {
      const response = await labsApi.getAll({ status: "active" });
      let labsData = [];
      if (Array.isArray(response)) {
        labsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        labsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        labsData = response.data;
      }
      setLabs(labsData);
    } catch (error) {
      console.error("Error fetching labs:", error);
    }
  };

  // Filter streams based on selected course
  const availableStreams = useMemo(() => {
    if (!formData.courseId || courseStreamMappings.length === 0) {
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
  }, [formData.courseId, courseStreamMappings, streams]);

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };

  // Filter semesters based on selected course and stream
  const availableSemesters = useMemo(() => {
    if (
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
    return Array.from(semesterMap.values()).sort(
      (a, b) => a.semesterNumber - b.semesterNumber
    );
  }, [formData.courseId, formData.streamId, courseStreamMappings]);

  // Filter semesters based on selected year
  const availableSemestersForYear = useMemo(() => {
    if (!formData.year || availableSemesters.length === 0) {
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
  }, [formData.year, availableSemesters]);

  // Get available years from semesters
  const availableYears = useMemo(() => {
    if (availableSemesters.length === 0) {
      return [];
    }
    // Find the maximum semester number
    const maxSemesterNumber = Math.max(
      ...availableSemesters.map((sem) => sem.semesterNumber)
    );
    // Calculate the maximum year
    const maxYear = Math.ceil(maxSemesterNumber / 2);
    // Generate all years from 1 to maxYear
    const years = [];
    for (let year = 1; year <= maxYear; year++) {
      years.push({
        value: year,
        label: getOrdinalSuffix(year) + " year",
      });
    }
    return years;
  }, [availableSemesters]);

  // Get labs from Labs collection
  const availableLabNames = useMemo(() => {
    // Return all active labs from Labs collection
    return labs.filter(lab => lab.status === "active" || lab.status === "Active");
  }, [labs]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await labScheduleApi.getAll({});

      let schedulesData = [];
      if (Array.isArray(response)) {
        schedulesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        schedulesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        schedulesData = response.data;
      }

      // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
      const getOrdinalSuffix = (num) => {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return num + "st";
        if (j === 2 && k !== 12) return num + "nd";
        if (j === 3 && k !== 13) return num + "rd";
        return num + "th";
      };

      // Map backend data to frontend format (handle populated internalExamSetupId)
      const mappedSchedules = schedulesData.map((schedule) => {
        // Get course, stream, semester, and labName from internal exam setup if available
        const setup = schedule.internalExamSetupId;

        // Get course and stream names for display - prefer stored values, then from populated setup
        let courseName = "";
        let streamName = "";

        // Course: prioritize stored value
        if (
          schedule.course &&
          schedule.course !== "-" &&
          schedule.course.trim() !== ""
        ) {
          courseName = schedule.course;
        } else if (setup?.courseId) {
          courseName = setup.courseId.name || setup.courseId.code || "";
        } else {
          courseName = "-";
        }

        // Stream: prioritize stored value
        if (
          schedule.stream &&
          schedule.stream !== "-" &&
          schedule.stream.trim() !== ""
        ) {
          streamName = schedule.stream;
        } else if (setup?.streamId) {
          streamName = setup.streamId.name || setup.streamId.code || "";
        } else {
          streamName = "-";
        }

        // Get codes for className short form
        const courseCode = setup?.courseId?.code || "-";
        const streamCode = setup?.streamId?.code || "-";
        const semesterNumber =
          setup?.semesterNumber || schedule.semesterNumber || null;
        const semester = setup?.semesterNumber
          ? `Semester ${setup.semesterNumber}`
          : setup?.semesterId?.numberOfSemesters
          ? `Semester ${setup.semesterId.numberOfSemesters}`
          : schedule.semester || "-";

        // Get lab name - prefer stored labName, then from populated setup, then from labId
        let labName = "";
        if (
          schedule.labName &&
          schedule.labName !== "-" &&
          schedule.labName.trim() !== ""
        ) {
          // First priority: Use stored labName if it exists and is valid
          labName = schedule.labName;
        } else if (setup?.subjectId) {
          // Second priority: If setup is populated, use subjectId
          labName = setup.subjectId.name || setup.subjectId.code || "";
        } else if (schedule.labId?.labName) {
          // Third priority: Fallback to labId if populated
          labName = schedule.labId.labName;
        }

        // Only use "-" as last resort if nothing is available
        if (!labName || labName.trim() === "") {
          labName = "-";
        }

        // Generate className from course-stream-year using codes (short form)
        let className = schedule.className || "";
        if (
          !className &&
          semesterNumber &&
          courseCode !== "-" &&
          streamCode !== "-"
        ) {
          const year = Math.ceil(semesterNumber / 2);
          const yearText = getOrdinalSuffix(year) + " year";
          className = `${courseCode} ${streamCode} ${yearText}`;
        } else if (!className && courseCode !== "-" && streamCode !== "-") {
          className = `${courseCode} ${streamCode}`;
        }

        return {
          ...schedule,
          className: className,
          course: courseName, // Keep full name for display
          stream: streamName, // Keep full name for display
          semester,
          labName,
          date: schedule.date
            ? typeof schedule.date === "string"
              ? schedule.date.split("T")[0]
              : new Date(schedule.date).toISOString().split("T")[0]
            : schedule.day
            ? "" // No date available, will use current date as default
            : "",
        };
      });

      setSchedules(mappedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      showAxiosError(error, "Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get employee ID from faculty ID
  const getEmployeeIdFromFacultyId = (facultyId) => {
    if (!facultyId || !labIncharges.length) return "";
    const incharge = labIncharges.find(
      (incharge) => String(incharge._id) === String(facultyId)
    );
    return incharge?.employeeId || "";
  };

  const filteredSchedules = useMemo(() => {
    let filtered = schedules;

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = schedules.filter((item) => {
        const className = (item.className || "").toLowerCase();
        const course = (item.course || "").toLowerCase();
        const facultyName = (item.facultyName || "").toLowerCase();
        const labName = (item.labName || "").toLowerCase();
        const date = (item.date || item.day || "").toLowerCase();
        const startTime = (item.startTime || "").toLowerCase();
        const endTime = (item.endTime || "").toLowerCase();
        const semester = (item.semester || "").toLowerCase();

        return (
          className.includes(query) ||
          course.includes(query) ||
          facultyName.includes(query) ||
          labName.includes(query) ||
          date.includes(query) ||
          startTime.includes(query) ||
          endTime.includes(query) ||
          semester.includes(query)
        );
      });
    }

    // Sort by createdAt descending (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a._id || 0);
      const dateB = new Date(b.createdAt || b._id || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    return filtered;
  }, [schedules, searchQuery]);

  const handleAdd = () => {
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
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      duration: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);

    // Get the internal exam setup (could be populated object or just ID)
    const setup = item.internalExamSetupId;

    // Extract courseId and streamId from internalExamSetupId if populated
    let courseId = "";
    let streamId = "";
    let courseName = "";
    let streamName = "";

    // Find course - must match dropdown value exactly (courseName || name)
    if (setup?.courseId) {
      // If setup is populated, find the course in courses array to get exact value
      const courseIdValue = setup.courseId._id || setup.courseId;
      const foundCourse = courses.find((c) => c._id === courseIdValue);
      if (foundCourse) {
        courseId = foundCourse._id;
        courseName = foundCourse.courseName || foundCourse.name; // Use exact dropdown value
      } else {
        // Fallback to setup value
        courseId = courseIdValue;
        courseName = setup.courseId.name || "";
      }
    } else if (item.course && item.course !== "-") {
      // Fallback: Find course ID from course name
      const foundCourse = courses.find(
        (c) => (c.courseName || c.name) === item.course
      );
      if (foundCourse) {
        courseId = foundCourse._id;
        courseName = foundCourse.courseName || foundCourse.name;
      } else {
        courseName = item.course;
      }
    }

    // Find stream - must match dropdown value exactly (streamName || name)
    if (setup?.streamId) {
      // If setup is populated, find the stream in streams array to get exact value
      const streamIdValue = setup.streamId._id || setup.streamId;
      const foundStream = streams.find((s) => s._id === streamIdValue);
      if (foundStream) {
        streamId = foundStream._id;
        streamName = foundStream.streamName || foundStream.name; // Use exact dropdown value
      } else {
        // Fallback to setup value
        streamId = streamIdValue;
        streamName = setup.streamId.name || "";
      }
    } else if (item.stream && item.stream !== "-") {
      // Fallback: Find stream ID from stream name
      const foundStream = streams.find(
        (s) => (s.streamName || s.name) === item.stream
      );
      if (foundStream) {
        streamId = foundStream._id;
        streamName = foundStream.streamName || foundStream.name;
      } else {
        streamName = item.stream;
      }
    }

    // Extract semester number from setup or item
    const semesterNumber =
      setup?.semesterNumber ||
      (item.semester && item.semester !== "-"
        ? item.semester.replace("Semester ", "").trim()
        : "");

    // Calculate year from semester number
    const year = semesterNumber ? Math.ceil(Number(semesterNumber) / 2) : "";

    // Generate semester display label
    let semesterDisplayLabel = item.semester || "";
    if (semesterNumber && !semesterDisplayLabel.includes("year")) {
      const semesterInYear = ((Number(semesterNumber) - 1) % 2) + 1;
      const yearText = getOrdinalSuffix(year) + " year";
      const semText = getOrdinalSuffix(semesterInYear) + " sem";
      semesterDisplayLabel = `${yearText}-${semText}`;
    }

    // Set formData first to enable availableLabNames calculation
    const initialFormData = {
      course: courseName,
      courseId: courseId,
      stream: streamName,
      streamId: streamId,
      year: year.toString(),
      semester: semesterDisplayLabel,
      semesterNumber: semesterNumber.toString(),
      labName: (() => {
        // Get lab name from item or find from labs collection
        if (item.labId) {
          const foundLab = labs.find(lab => lab._id === item.labId);
          return foundLab ? foundLab.labName : (item.labName || "");
        }
        return item.labName || "";
      })(),
      internalExamSetupId:
        setup?._id || setup || item.internalExamSetupId || "",
      facultyName: item.facultyName || "",
      facultyId: item.facultyId || "",
      date: item.date
        ? typeof item.date === "string"
          ? item.date.split("T")[0]
          : new Date(item.date).toISOString().split("T")[0]
        : item.day
        ? new Date().toISOString().split("T")[0] // Fallback if no date
        : new Date().toISOString().split("T")[0],
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      duration: item.duration || "",
    };

    setFormData(initialFormData);
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await labScheduleApi.delete(id);
        setSchedules(schedules.filter((item) => item._id !== id));
        showSuccessMessage("Schedule deleted successfully");
      } catch (error) {
        console.error("Error deleting schedule:", error);
        showAxiosError(error, "Failed to delete schedule");
      }
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours > 0 && diffMinutes > 0) {
      return `${diffHours} hour${
        diffHours > 1 ? "s" : ""
      } ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === "course") {
      // Find course ID and clear dependent fields
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
      // Find stream ID and clear dependent fields
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
          semester: selectedSem.displayLabel, // Store displayLabel to match dropdown value
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
        // Store labId if needed for backend
        newFormData = {
          ...newFormData,
          labId: selectedLab._id || "",
        };
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const duration = calculateDuration(formData.startTime, formData.endTime);

    if (
      !formData.course ||
      !formData.stream ||
      !formData.year ||
      !formData.semester ||
      !formData.labName
    ) {
      showErrorMessage(
        "Please select course, stream, year, semester, and lab name"
      );
      return;
    }

    // if (!formData.internalExamSetupId) {
    //   showErrorMessage("Please select a lab name");
    //   return;
    // }

    if (!formData.facultyId || !formData.facultyName) {
      showErrorMessage("Please select a lab incharge");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      showErrorMessage("Please select start time and end time");
      return;
    }

    // Get course and stream codes
    const selectedCourse = courses.find(
      (c) =>
        c._id === formData.courseId ||
        (c.courseName || c.name) === formData.course
    );
    const selectedStream = streams.find(
      (s) =>
        s._id === formData.streamId ||
        (s.streamName || s.name) === formData.stream
    );
    const courseCode = selectedCourse?.code || "-";
    const streamCode = selectedStream?.code || "-";

    // Generate className from course-stream-year using codes
    let className = "";
    if (courseCode && streamCode && formData.semesterNumber) {
      const year = Math.ceil(Number(formData.semesterNumber) / 2);
      const yearText = getOrdinalSuffix(year) + " year";
      className = `${courseCode} ${streamCode} ${yearText}`;
    } else if (courseCode && streamCode) {
      // Fallback if semesterNumber is not available
      className = `${courseCode} ${streamCode}`;
    }

    // Ensure className is not empty (required field)
    if (!className || className.trim() === "") {
      showErrorMessage(
        "Unable to generate class name. Please ensure course, stream, and semester are selected."
      );
      return;
    }

    try {
      if (showAddModal) {
        // Convert semester displayLabel to "Semester X" format for backend
        const semesterForBackend = formData.semesterNumber
          ? `Semester ${formData.semesterNumber}`
          : formData.semester;

        // Get lab name from selected lab (from Labs collection)
        const selectedLab = labs.find(
          (lab) => lab.labName === formData.labName
        );
        const labNameForBackend =
          selectedLab?.labName || formData.labName || "";

        // Send course, stream, semester, and internalExamSetupId to backend
        // const backendData = {
        //   className: className,
        //   course: formData.course,
        //   stream: formData.stream,
        //   semester: semesterForBackend,
        //   internalExamSetupId: formData.internalExamSetupId,
        //   labName: labNameForBackend, // Store labName for display
        //   facultyName: formData.facultyName,
        //   facultyId: formData.facultyId ? String(formData.facultyId) : "",
        //   date: formData.date, // Send date as Date type
        //   startTime: formData.startTime,
        //   endTime: formData.endTime,
        //   duration: duration,
        // };
        const backendData = {
          className: className,
          course: formData.course,
          stream: formData.stream,
          semester: semesterForBackend,
          labName: labNameForBackend,
          facultyName: formData.facultyName,
          facultyId: formData.facultyId ? String(formData.facultyId) : "",
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          duration: duration,
        };
        
        // ✅ ONLY add if it exists
        if (formData.internalExamSetupId) {
          backendData.internalExamSetupId = formData.internalExamSetupId;
        }
        

        const response = await labScheduleApi.create(backendData);
        const newSchedule = Array.isArray(response)
          ? response[0]
          : response.data || response;

        // Map backend response to frontend format
        const setup = newSchedule.internalExamSetupId;
        // Generate className if not present
        let scheduleClassName = newSchedule.className || className || "";
        if (
          !scheduleClassName &&
          setup?.courseId?.code &&
          setup?.streamId?.code &&
          setup?.semesterNumber
        ) {
          const year = Math.ceil(setup.semesterNumber / 2);
          const yearText = getOrdinalSuffix(year) + " year";
          scheduleClassName = `${setup.courseId.code} ${setup.streamId.code} ${yearText}`;
        }
        const mappedSchedule = {
          ...newSchedule,
          className: scheduleClassName,
          // Prioritize stored values over populated setup
          course:
            newSchedule.course && newSchedule.course !== "-"
              ? newSchedule.course
              : setup?.courseId?.name || setup?.courseId?.code || "-",
          stream:
            newSchedule.stream && newSchedule.stream !== "-"
              ? newSchedule.stream
              : setup?.streamId?.name || setup?.streamId?.code || "-",
          semester: setup?.semesterNumber
            ? `Semester ${setup.semesterNumber}`
            : setup?.semesterId?.numberOfSemesters
            ? `Semester ${setup.semesterId.numberOfSemesters}`
            : newSchedule.semester || "-",
          labName:
            newSchedule.labName && newSchedule.labName !== "-"
              ? newSchedule.labName
              : setup?.subjectId?.name || setup?.subjectId?.code || "-",
          date: newSchedule.date || newSchedule.day || "",
        };

        setSchedules([mappedSchedule, ...schedules]);
        setShowAddModal(false);
        showSuccessMessage("Schedule added successfully");
      } else if (showEditModal) {
        // Convert semester displayLabel to "Semester X" format for backend
        const semesterForBackend = formData.semesterNumber
          ? `Semester ${formData.semesterNumber}`
          : formData.semester;

        // Get lab name from selected lab (from Labs collection)
        const selectedLab = labs.find(
          (lab) => lab.labName === formData.labName
        );
        const labNameForBackend =
          selectedLab?.labName || formData.labName || "";

        // Send course, stream, semester, and internalExamSetupId to backend
        // const backendData = {
        //   className: className,
        //   course: formData.course,
        //   stream: formData.stream,
        //   semester: semesterForBackend,
        //   internalExamSetupId: formData.internalExamSetupId,
        //   labName: labNameForBackend, // Store labName for display
        //   facultyName: formData.facultyName,
        //   facultyId: formData.facultyId ? String(formData.facultyId) : "",
        //   date: formData.date, // Send date as Date type
        //   startTime: formData.startTime,
        //   endTime: formData.endTime,
        //   duration: duration,
        // };
        // if (formData.internalExamSetupId) {
        //   backendData.internalExamSetupId = formData.internalExamSetupId;
        // }

        const backendData = {
          className: className,
          course: formData.course,
          stream: formData.stream,
          semester: semesterForBackend,
          labName: labNameForBackend,
          facultyName: formData.facultyName,
          facultyId: formData.facultyId ? String(formData.facultyId) : "",
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          duration: duration,
        };
        
        // ✅ ONLY send if user actually selected it
        if (formData.internalExamSetupId) {
          backendData.internalExamSetupId = formData.internalExamSetupId;
        }
        
        

        const response = await labScheduleApi.update(
          selectedItem._id,
          backendData
        );
        const updatedSchedule = Array.isArray(response)
          ? response[0]
          : response.data || response;

        // Map backend response to frontend format
        const setup = updatedSchedule.internalExamSetupId;
        // Generate className if not present
        let scheduleClassName = updatedSchedule.className || className || "";
        if (
          !scheduleClassName &&
          setup?.courseId?.code &&
          setup?.streamId?.code &&
          setup?.semesterNumber
        ) {
          const year = Math.ceil(setup.semesterNumber / 2);
          const yearText = getOrdinalSuffix(year) + " year";
          scheduleClassName = `${setup.courseId.code} ${setup.streamId.code} ${yearText}`;
        }
        const mappedSchedule = {
          ...updatedSchedule,
          className: scheduleClassName,
          // Prioritize stored values over populated setup
          course:
            updatedSchedule.course && updatedSchedule.course !== "-"
              ? updatedSchedule.course
              : setup?.courseId?.name || setup?.courseId?.code || "-",
          stream:
            updatedSchedule.stream && updatedSchedule.stream !== "-"
              ? updatedSchedule.stream
              : setup?.streamId?.name || setup?.streamId?.code || "-",
          semester: setup?.semesterNumber
            ? `Semester ${setup.semesterNumber}`
            : setup?.semesterId?.numberOfSemesters
            ? `Semester ${setup.semesterId.numberOfSemesters}`
            : updatedSchedule.semester || "-",
          labName:
            updatedSchedule.labName && updatedSchedule.labName !== "-"
              ? updatedSchedule.labName
              : setup?.subjectId?.name || setup?.subjectId?.code || "-",
          date: updatedSchedule.date
            ? typeof updatedSchedule.date === "string"
              ? updatedSchedule.date.split("T")[0]
              : new Date(updatedSchedule.date).toISOString().split("T")[0]
            : updatedSchedule.day || "",
        };

        setSchedules(
          schedules.map((item) =>
            item._id === selectedItem._id ? mappedSchedule : item
          )
        );
        setShowEditModal(false);
        setSelectedItem(null);
        showSuccessMessage("Schedule updated successfully");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      showAxiosError(error, "Failed to save schedule");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading schedules...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Lab Schedule / Timetable
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </button>
        </div>

        {/* Search Input - Above Table */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search schedules by class, course, lab, faculty, date, time, or semester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        {filteredSchedules.length === 0 ? (
          <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
            <div className="text-gray-500">
              {searchQuery
                ? "No schedules found matching your search"
                : "No schedules found"}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-[#525b88] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Class
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Lab
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Faculty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No schedules found
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {item.className}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {item.course}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.labName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>{item.facultyName}</div>
                        <div className="text-xs text-gray-500">
                          {getEmployeeIdFromFacultyId(item.facultyId) ||
                            item.facultyId ||
                            "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.date || item.day
                          ? new Date(item.date || item.day).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.startTime} - {item.endTime}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.duration}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-3xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Add Schedule
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course: *
                      </label>
                      <select
                        name="course"
                        value={formData.course}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stream: *
                      </label>
                      <select
                        name="stream"
                        value={formData.stream || ""}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        disabled={
                          !formData.course || availableStreams.length === 0
                        }
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
                    <div>
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
                    <div>
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
                          {!formData.course ||
                          !formData.stream ||
                          !formData.year
                            ? "Select Course, Stream, and Year first"
                            : availableSemestersForYear.length === 0
                            ? "No semesters available"
                            : "Select Semester"}
                        </option>
                        {availableSemestersForYear.map((sem, index) => (
                          <option
                            key={`${
                              sem.semesterId || sem.semesterNumber
                            }-${index}-${formData.year}`}
                            value={sem.displayLabel}
                          >
                            {sem.displayLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Name: *
                      </label>
                      <select
                        name="labName"
                        value={formData.labName}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date: *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time: *
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time: *
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Faculty (Lab Incharge): *
                      </label>
                      <select
                        name="faculty"
                        value={formData.facultyId || ""}
                        onChange={(e) => {
                          const selectedIncharge = labIncharges.find(
                            (incharge) =>
                              String(incharge._id) === e.target.value
                          );
                          setFormData({
                            ...formData,
                            facultyId: selectedIncharge?._id
                              ? String(selectedIncharge._id)
                              : "",
                            facultyName: selectedIncharge?.name || "",
                          });
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Lab Incharge</option>
                        {labIncharges.map((incharge) => (
                          <option
                            key={incharge._id}
                            value={String(incharge._id)}
                          >
                            {incharge.name}
                            {incharge.employeeId
                              ? ` (${incharge.employeeId})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
                    >
                      Add Schedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Edit Modal */}
      {showEditModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-3xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Edit Schedule
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                  }}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course: *
                      </label>
                      <select
                        name="course"
                        value={formData.course}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stream: *
                      </label>
                      <select
                        name="stream"
                        value={formData.stream || ""}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        disabled={
                          !formData.course || availableStreams.length === 0
                        }
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
                    <div>
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
                    <div>
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
                          {!formData.course ||
                          !formData.stream ||
                          !formData.year
                            ? "Select Course, Stream, and Year first"
                            : availableSemestersForYear.length === 0
                            ? "No semesters available"
                            : "Select Semester"}
                        </option>
                        {availableSemestersForYear.map((sem, index) => (
                          <option
                            key={`${
                              sem.semesterId || sem.semesterNumber
                            }-${index}-${formData.year}`}
                            value={sem.displayLabel}
                          >
                            {sem.displayLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Name: *
                      </label>
                      <select
                        name="labName"
                        value={formData.labName}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date: *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time: *
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time: *
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Faculty (Lab Incharge): *
                      </label>
                      <select
                        name="faculty"
                        value={formData.facultyId || ""}
                        onChange={(e) => {
                          const selectedIncharge = labIncharges.find(
                            (incharge) =>
                              String(incharge._id) === e.target.value
                          );
                          setFormData({
                            ...formData,
                            facultyId: selectedIncharge?._id
                              ? String(selectedIncharge._id)
                              : "",
                            facultyName: selectedIncharge?.name || "",
                          });
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Lab Incharge</option>
                        {labIncharges.map((incharge) => (
                          <option
                            key={incharge._id}
                            value={String(incharge._id)}
                          >
                            {incharge.name}
                            {incharge.employeeId
                              ? ` (${incharge.employeeId})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedItem(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* View Modal */}
      {showViewModal &&
        selectedItem &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Schedule Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Class Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.className || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Course:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.course || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Stream:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.stream || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Lab Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.labName || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.date || selectedItem.day
                          ? new Date(
                              selectedItem.date || selectedItem.day
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Time Slot:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.startTime} - {selectedItem.endTime}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Duration:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.duration || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Faculty Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.facultyName || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Faculty ID:
                      </label>
                      <p className="text-sm text-gray-900">
                        {getEmployeeIdFromFacultyId(selectedItem.facultyId) ||
                          selectedItem.facultyId ||
                          "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Semester:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.semester || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default LabSchedule;
