import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import {
  labBookingsApi,
  labsApi,
  coursesApi,
  streamsApi,
  courseStreamMappingsApi,
  streamSubjectMappingsApi,
  internalExamSetupsApi,
  labInchargesApi,
} from "../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../config/Toast";
import {
  Search,
  Clock,
  User,
  FlaskConical,
  Eye,
  Plus,
  XCircle,
} from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const AssignmentsTable = ({
  assignments,
  onView,
  onEdit,
  onDelete,
  sortConfig,
  requestSort,
  searchQuery,
  onSearchChange,
  getEmployeeIdFromFacultyId,
}) => {
  return (
    <div>
      {/* Search Input - Above Table */}
      <div className="mb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings by class name, course, lab name, faculty name, or status..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      {assignments.length === 0 ? (
        <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
          <div className="text-gray-500">
            {searchQuery
              ? "No bookings found matching your search"
              : "No bookings found"}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88] sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("className")}
                >
                  <div className="flex items-center">
                    Class Name
                    {sortConfig.key === "className" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("course")}
                >
                  <div className="flex items-center">
                    Course
                    {sortConfig.key === "course" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("labName")}
                >
                  <div className="flex items-center">
                    Lab Name
                    {sortConfig.key === "labName" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Faculty
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
                >
                  Class Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Time Slot
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {assignment.className || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.course || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.labName || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div>{assignment.facultyName || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {getEmployeeIdFromFacultyId(assignment.facultyId) ||
                        assignment.facultyId ||
                        "-"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.classDate || assignment.bookingDate
                      ? new Date(
                          assignment.classDate || assignment.bookingDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.startTime} - {assignment.endTime}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(assignment._id)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(assignment._id)}
                        className="text-[#525b88] hover:text-[#3a4166]"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(assignment._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const LabBookings = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [streamSubjectMappings, setStreamSubjectMappings] = useState([]);
  const [internalExamSetups, setInternalExamSetups] = useState([]);
  const [labIncharges, setLabIncharges] = useState([]);
  const [labs, setLabs] = useState([]);

  // Fetch bookings, internal exam setups, courses, streams, mappings, lab incharges, and labs from API
  useEffect(() => {
    fetchBookings();
    fetchInternalExamSetups();
    fetchLabs();
    fetchCourses();
    fetchStreams();
    fetchCourseStreamMappings();
    fetchStreamSubjectMappings();
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

  const fetchStreamSubjectMappings = async () => {
    try {
      const response = await streamSubjectMappingsApi.getAll({
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
      setStreamSubjectMappings(mappingsData);
    } catch (error) {
      console.error("Error fetching stream-subject mappings:", error);
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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await labBookingsApi.getAll({});

      let bookingsData = [];
      if (Array.isArray(response)) {
        bookingsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        bookingsData = response.data;
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
      const mappedBookings = bookingsData.map((booking) => {
        const setup = booking.internalExamSetupId;
        // Get course and stream names for display
        const courseName = setup?.courseId?.name || booking.course || "-";
        const streamName = setup?.streamId?.name || booking.stream || "-";
        // Get codes for className short form
        const courseCode = setup?.courseId?.code || booking.courseCode || "-";
        const streamCode = setup?.streamId?.code || booking.streamCode || "-";
        const semesterNumber =
          setup?.semesterNumber || booking.semesterNumber || null;

        // Generate className from course-stream-year using codes (short form)
        let className = booking.className || "";
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
          ...booking,
          className: className,
          course: courseName, // Keep full name for display
          stream: streamName, // Keep full name for display
          semesterNumber: semesterNumber, // Include semesterNumber for view modal
          labName:
            booking.labId?.labName || // First try to get from populated labId
            setup?.subjectId?.name ||
            setup?.subjectId?.code ||
            booking.labName ||
            "-",
          bookingDate: booking.bookingDate || booking.classDate,
          classDate: booking.bookingDate || booking.classDate,
        };
      });

      setAssignments(mappedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings");
      showAxiosError(error, "Failed to load bookings");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAssignments = useMemo(() => {
    let sortableItems = [...assignments];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort: newest first (by createdAt descending)
      sortableItems.sort((a, b) => {
        const dateA = new Date(a.createdAt || a._id || 0);
        const dateB = new Date(b.createdAt || b._id || 0);
        return dateB - dateA; // Descending order (newest first)
      });
    }
    return sortableItems;
  }, [assignments, sortConfig]);

  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = sortedAssignments;

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = sortedAssignments.filter((assignment) => {
        const className = (assignment.className || "").toLowerCase();
        const course = (assignment.course || "").toLowerCase();
        const labName = (assignment.labName || "").toLowerCase();
        const facultyName = (assignment.facultyName || "").toLowerCase();
        const facultyId = (assignment.facultyId || "").toLowerCase();

        return (
          className.includes(query) ||
          course.includes(query) ||
          labName.includes(query) ||
          facultyName.includes(query) ||
          facultyId.includes(query)
        );
      });
    }

    return filtered;
  }, [sortedAssignments, searchQuery]);

  // Helper function to get employee ID from faculty ID
  const getEmployeeIdFromFacultyId = (facultyId) => {
    if (!facultyId || !labIncharges.length) return "";
    const incharge = labIncharges.find(
      (incharge) => String(incharge._id) === String(facultyId)
    );
    return incharge?.employeeId || "";
  };

  const handleView = (id) => {
    const assignment = assignments.find((a) => a._id === id);
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    const assignment = assignments.find((a) => a._id === id);

    // Get the internal exam setup (could be populated object or just ID)
    const setup = assignment.internalExamSetupId;

    // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (num) => {
      const j = num % 10;
      const k = num % 100;
      if (j === 1 && k !== 11) return num + "st";
      if (j === 2 && k !== 12) return num + "nd";
      if (j === 3 && k !== 13) return num + "rd";
      return num + "th";
    };

    // Extract courseId and streamId from internalExamSetupId if populated
    let courseId = "";
    let streamId = "";
    let courseName = "";

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
        courseName = setup.courseId.name || assignment.course || "";
      }
    } else if (assignment.course && assignment.course !== "-") {
      // Fallback: Find course ID from course name
      const foundCourse = courses.find(
        (c) => (c.courseName || c.name) === assignment.course
      );
      if (foundCourse) {
        courseId = foundCourse._id;
        courseName = foundCourse.courseName || foundCourse.name;
      } else {
        courseName = assignment.course;
      }
    }

    // Find stream - must match dropdown value exactly (streamName || name)
    let streamName = "";
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
        streamName = setup.streamId.name || assignment.stream || "";
      }
    } else if (assignment.stream && assignment.stream !== "-") {
      // Fallback: Find stream ID from stream name
      const foundStream = streams.find(
        (s) => (s.streamName || s.name) === assignment.stream
      );
      if (foundStream) {
        streamId = foundStream._id;
        streamName = foundStream.streamName || foundStream.name;
      } else {
        streamName = assignment.stream;
      }
    }

    // Extract semester number from setup or assignment
    const semesterNumber =
      setup?.semesterNumber ||
      (assignment.semester && assignment.semester !== "-"
        ? assignment.semester.replace("Semester ", "").trim()
        : "");

    // Calculate year from semester number
    const year = semesterNumber ? Math.ceil(Number(semesterNumber) / 2) : "";

    // Generate semester display label
    let semesterDisplayLabel = assignment.semester || "";
    if (semesterNumber && !semesterDisplayLabel.includes("year")) {
      const semesterInYear = ((Number(semesterNumber) - 1) % 2) + 1;
      const yearText = getOrdinalSuffix(year) + " year";
      const semText = getOrdinalSuffix(semesterInYear) + " sem";
      semesterDisplayLabel = `${yearText}-${semText}`;
    }

    // Get internal exam setup ID
    const internalExamSetupId =
      setup?._id || setup || assignment.internalExamSetupId || "";

    // Calculate available lab names to find the matching lab name (same logic as AddFormModal)
    let finalLabName = assignment.labName || "";
    if (
      courseId &&
      streamId &&
      semesterNumber &&
      internalExamSetups.length > 0
    ) {
      // Find matching internal exam setups
      const matchingSetups = internalExamSetups.filter((setupItem) => {
        const setupCourseId =
          typeof setupItem.courseId === "object" && setupItem.courseId?._id
            ? setupItem.courseId._id
            : setupItem.courseId;
        const setupStreamId =
          typeof setupItem.streamId === "object" && setupItem.streamId?._id
            ? setupItem.streamId._id
            : setupItem.streamId;
        const setupSemesterNumber = setupItem.semesterNumber;
        return (
          String(setupCourseId) === String(courseId) &&
          String(setupStreamId) === String(streamId) &&
          setupSemesterNumber === Number(semesterNumber)
        );
      });

      // Extract unique subjects (lab names) from matching setups
      const labNameMap = new Map();
      matchingSetups.forEach((setupItem) => {
        const subjectId =
          typeof setupItem.subjectId === "object" && setupItem.subjectId?._id
            ? setupItem.subjectId._id
            : setupItem.subjectId;
        const subjectName =
          setupItem.subjectId?.name || setupItem.subjectId?.code || "";
        if (subjectId && subjectName && !labNameMap.has(subjectId)) {
          labNameMap.set(subjectId, {
            subjectId,
            subjectName,
            setupId: setupItem._id,
          });
        }
      });

      // Get stored lab name
      const storedLabName =
        setup?.subjectId?.name ||
        setup?.subjectId?.code ||
        (assignment.labName && assignment.labName !== "-"
          ? assignment.labName
          : "");

      // Find matching lab name from available labs
      const availableLabs = Array.from(labNameMap.values());
      const matchingLab = availableLabs.find(
        (lab) => lab.subjectName === storedLabName
      );
      finalLabName = matchingLab?.subjectName || storedLabName || "";
    } else {
      // Fallback if course/stream/semester not available
      finalLabName =
        setup?.subjectId?.name ||
        setup?.subjectId?.code ||
        (assignment.labName && assignment.labName !== "-"
          ? assignment.labName
          : "");
    }

    // Format classDate properly
    let formattedClassDate = "";
    if (assignment.classDate || assignment.bookingDate) {
      const dateValue = assignment.classDate || assignment.bookingDate;
      if (typeof dateValue === "string") {
        formattedClassDate = dateValue.split("T")[0];
      } else if (dateValue instanceof Date) {
        formattedClassDate = dateValue.toISOString().split("T")[0];
      } else {
        formattedClassDate = new Date(dateValue).toISOString().split("T")[0];
      }
    }

    // Format facultyId to string
    const facultyIdString = assignment.facultyId
      ? String(assignment.facultyId)
      : "";

    setEditFormData({
      _id: assignment._id,
      course: courseName,
      courseId: courseId,
      stream: streamName,
      streamId: streamId,
      year: year.toString(),
      semester: semesterDisplayLabel,
      semesterNumber: semesterNumber.toString(),
      labName: finalLabName,
      internalExamSetupId: internalExamSetupId,
      facultyName: assignment.facultyName || "",
      facultyId: facultyIdString,
      classDate: formattedClassDate || new Date().toISOString().split("T")[0],
      startTime: assignment.startTime || "",
      endTime: assignment.endTime || "",
      status: assignment.status || "active",
      studentCount: assignment.studentCount || 0,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await labBookingsApi.delete(id);
        setAssignments(
          assignments.filter((assignment) => assignment._id !== id)
        );
        showSuccessMessage("Booking deleted successfully");
      } catch (error) {
        console.error("Error deleting booking:", error);
        showAxiosError(error, "Failed to delete booking");
      }
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      // Get course and stream codes from the selected course and stream
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
      const courseCode = selectedCourse?.code || formData.courseCode || "-";
      const streamCode = selectedStream?.code || formData.streamCode || "-";

      // Generate className from course-stream-year-semester using codes
      let className = "";
      if (courseCode && streamCode && formData.semesterNumber) {
        const getOrdinalSuffix = (num) => {
          const j = num % 10;
          const k = num % 100;
          if (j === 1 && k !== 11) return num + "st";
          if (j === 2 && k !== 12) return num + "nd";
          if (j === 3 && k !== 13) return num + "rd";
          return num + "th";
        };
        const year = Math.ceil(Number(formData.semesterNumber) / 2);
        const yearText = getOrdinalSuffix(year) + " year";
        className = `${courseCode} ${streamCode} ${yearText}`;
      }

      // Remove IDs and frontend-only fields from formData before sending to backend
      const {
        _id,
        courseId,
        streamId,
        semesterNumber,
        year,
        internalExamSetupId,
        semester,
        ...updateData
      } = formData;
      // Map frontend fields to backend fields
      const backendData = {
        ...updateData,
        className: className,
        internalExamSetupId:
          internalExamSetupId || formData.internalExamSetupId,
        bookingDate: updateData.bookingDate || updateData.classDate,
      };

      const response = await labBookingsApi.update(_id, backendData);
      const updatedBooking = Array.isArray(response)
        ? response[0]
        : response.data || response;

      // Map backend response to frontend format (handle populated internalExamSetupId)
      const setup = updatedBooking.internalExamSetupId;
      const mappedBooking = {
        ...updatedBooking,
        className: className || updatedBooking.className || "",
        labName:
          updatedBooking.labId?.labName || // First try to get from populated labId
          setup?.subjectId?.name ||
          setup?.subjectId?.code ||
          updatedBooking.labName ||
          "-",
        bookingDate: updatedBooking.bookingDate || updatedBooking.classDate,
        classDate: updatedBooking.bookingDate || updatedBooking.classDate,
      };

      setAssignments(
        assignments.map((assignment) =>
          assignment._id === _id ? mappedBooking : assignment
        )
      );
      setShowEditModal(false);
      setEditFormData(null);
      showSuccessMessage("Booking updated successfully");
    } catch (error) {
      console.error("Error updating booking:", error);
      showAxiosError(error, "Failed to update booking");
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (formData) => {
    try {
      // Get course and stream codes from the selected course and stream
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
      const courseCode = selectedCourse?.code || formData.courseCode || "-";
      const streamCode = selectedStream?.code || formData.streamCode || "-";

      // Generate className from course-stream-year-semester using codes
      let className = "";
      if (courseCode && streamCode && formData.semesterNumber) {
        const getOrdinalSuffix = (num) => {
          const j = num % 10;
          const k = num % 100;
          if (j === 1 && k !== 11) return num + "st";
          if (j === 2 && k !== 12) return num + "nd";
          if (j === 3 && k !== 13) return num + "rd";
          return num + "th";
        };
        const year = Math.ceil(Number(formData.semesterNumber) / 2);
        const yearText = getOrdinalSuffix(year) + " year";
        className = `${courseCode} ${streamCode} ${yearText}`;
      }

      // Remove IDs and frontend-only fields from formData before sending to backend
      const {
        courseId,
        streamId,
        semesterNumber,
        year,
        internalExamSetupId,
        semester,
        ...backendData
      } = formData;
      // Map frontend fields to backend fields
      const submitData = {
        ...backendData,
        className: className,
        internalExamSetupId:
          internalExamSetupId || formData.internalExamSetupId || null, // May be null if selecting lab directly
        labId: formData.labId || backendData.labId, // Send labId directly from formData
        bookingDate: formData.bookingDate || formData.classDate,
      };

      const response = await labBookingsApi.create(submitData);
      const newBooking = Array.isArray(response)
        ? response[0]
        : response.data || response;

      // Map backend response to frontend format (handle populated internalExamSetupId)
      const setup = newBooking.internalExamSetupId;
      const mappedBooking = {
        ...newBooking,
        className: className || newBooking.className || "",
        labName:
          newBooking.labId?.labName || // First try to get from populated labId
          setup?.subjectId?.name ||
          setup?.subjectId?.code ||
          newBooking.labName ||
          "-",
        bookingDate: newBooking.bookingDate || newBooking.classDate,
        classDate: newBooking.bookingDate || newBooking.classDate,
      };

      setAssignments([mappedBooking, ...assignments]);
      setShowAddModal(false);
      showSuccessMessage("Booking created successfully");
    } catch (error) {
      console.error("Error creating booking:", error);
      showAxiosError(error, "Failed to create booking");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading class assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Class Assignments Management
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          title="Assign Class"
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign Class
        </button>
      </div>

      {/* Table */}
      <AssignmentsTable
        assignments={filteredAndSortedAssignments}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortConfig={sortConfig}
        requestSort={requestSort}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        getEmployeeIdFromFacultyId={getEmployeeIdFromFacultyId}
      />

      {/* View Modal */}
      {showViewModal &&
        selectedAssignment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Class Assignment Details
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
                        {selectedAssignment.className || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Course:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAssignment.course || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Semester:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAssignment.semesterNumber
                          ? `Semester ${selectedAssignment.semesterNumber}`
                          : selectedAssignment.semester || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Lab Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAssignment.labName || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Faculty Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAssignment.facultyName || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Faculty ID:
                      </label>
                      <p className="text-sm text-gray-900">
                        {getEmployeeIdFromFacultyId(
                          selectedAssignment.facultyId
                        ) ||
                          selectedAssignment.facultyId ||
                          "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Class Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAssignment.classDate
                          ? new Date(
                              selectedAssignment.classDate
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Time Slot:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAssignment.startTime} -{" "}
                        {selectedAssignment.endTime}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Student Count:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAssignment.studentCount !== undefined &&
                        selectedAssignment.studentCount !== null
                          ? selectedAssignment.studentCount
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Status:
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedAssignment.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedAssignment.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedAssignment.status || "active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <AddFormModal
          formType="labBookings"
          initialData={editFormData}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setShowEditModal(false);
            setEditFormData(null);
          }}
          courses={courses}
          streams={streams}
          courseStreamMappings={courseStreamMappings}
          streamSubjectMappings={streamSubjectMappings}
          internalExamSetups={internalExamSetups}
          labIncharges={labIncharges}
          labs={labs}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddFormModal
          formType="labBookings"
          initialData={null}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
          courses={courses}
          streams={streams}
          courseStreamMappings={courseStreamMappings}
          streamSubjectMappings={streamSubjectMappings}
          internalExamSetups={internalExamSetups}
          labIncharges={labIncharges}
          labs={labs}
        />
      )}
    </div>
  );
};

export default LabBookings;
