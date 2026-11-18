import React, { useState, useEffect } from "react";
import { useFormHook } from "../../Hooks/FormHook";
import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  Filter,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Eye,
} from "lucide-react";
import { z } from "zod";
import { coursesApi, streamsApi } from "../../services/apiService";

// Validation schema for attendance form
const attendanceSchema = z.object({
  employeeName: z.string().min(1, "Employee Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().min(1, "Date is required"),
  inTime: z.string().min(1, "In Time is required"),
  outTime: z.string().min(1, "Out Time is required"),
  status: z.enum(["Present", "Absent", "Half Day", "Late"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
  department: z.string().min(1, "Department is required"),
  remarks: z.string().optional(),
});

export default function Attendance() {
  const { FormWrapper, errors, register, reset, setValue } = useFormHook({
    validation: attendanceSchema,
  });

  // Main tab state - Employee or Student
  const [mainTab, setMainTab] = useState("employee"); // "employee" or "student"

  // Employee sub-tab state
  const [activeTab, setActiveTab] = useState("timesheet"); // "timesheet" or "leave"

  // Student attendance state
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [students, setStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendanceList, setStudentAttendanceList] = useState([]);
  const [studentAttendanceLoading, setStudentAttendanceLoading] =
    useState(false);
  const [showStudentAttendanceForm, setShowStudentAttendanceForm] =
    useState(false);
  const [studentAttendanceForm, setStudentAttendanceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "Present",
    subject: "",
    remarks: "",
  });
  const [attendanceCheckDate, setAttendanceCheckDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Timesheet state
  const [timesheetList, setTimesheetList] = useState([]);
  const [timesheetLoading, setTimesheetLoading] = useState(false);
  const [timesheetFilteredList, setTimesheetFilteredList] = useState([]);
  const [timesheetSearchQuery, setTimesheetSearchQuery] = useState("");
  const [timesheetDate, setTimesheetDate] = useState("");
  const [selectedTimesheetRecord, setSelectedTimesheetRecord] = useState(null);
  const [showTimesheetViewModal, setShowTimesheetViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingTimesheetId, setRejectingTimesheetId] = useState(null);
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
  const [rejectingRecordType, setRejectingRecordType] = useState(null); // "timesheet" or "leave"
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Leave state
  const [leaveList, setLeaveList] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveFilteredList, setLeaveFilteredList] = useState([]);
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("");
  const [leaveFromDate, setLeaveFromDate] = useState("");
  const [leaveToDate, setLeaveToDate] = useState("");
  const [selectedLeaveRecord, setSelectedLeaveRecord] = useState(null);
  const [showLeaveViewModal, setShowLeaveViewModal] = useState(false);

  // Attendance state (keeping for backward compatibility if needed)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filteredList, setFilteredList] = useState([]);
  const [viewMode, setViewMode] = useState("today"); // "today", "all", "date"
  const [searchFilters, setSearchFilters] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    status: "",
  });

  // Fetch timesheet data
  const fetchTimesheetData = async () => {
    setTimesheetLoading(true);
    try {
      const resp = await API.get("/timesheet");
      setTimesheetList(resp.data.data || resp.data || []);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setTimesheetLoading(false);
    }
  };

  // Fetch leave data
  const fetchLeaveData = async () => {
    setLeaveLoading(true);
    try {
      const resp = await API.get("/employee/leave");
      setLeaveList(resp.data.data || resp.data || []);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLeaveLoading(false);
    }
  };

  // Fetch attendance data
  // const fetchAttendanceData = async () => {
  //   setLoading(true);
  //   try {
  //     const resp = await API.get("/employee/attendance");
  //     setAttendanceList(resp.data.data || resp.data || []);
  //   } catch (error) {
  //     // If endpoint doesn't exist, use sample data
  //     const today = new Date().toISOString().split("T")[0];
  //     setAttendanceList([
  //       {
  //         _id: 1,
  //         employeeName: "John Doe",
  //         employeeId: "EMP001",
  //         date: today,
  //         inTime: "09:00",
  //         outTime: "18:00",
  //         status: "Present",
  //         department: "IT",
  //         remarks: "",
  //       },
  //       {
  //         _id: 2,
  //         employeeName: "Jane Smith",
  //         employeeId: "EMP002",
  //         date: today,
  //         inTime: "09:30",
  //         outTime: "17:30",
  //         status: "Late",
  //         department: "HR",
  //         remarks: "Traffic delay",
  //       },
  //       {
  //         _id: 3,
  //         employeeName: "Rajesh Kumar",
  //         employeeId: "EMP003",
  //         date: today,
  //         inTime: "09:15",
  //         outTime: "18:15",
  //         status: "Present",
  //         department: "Finance",
  //         remarks: "",
  //       },
  //       {
  //         _id: 4,
  //         employeeName: "Priya Sharma",
  //         employeeId: "EMP004",
  //         date: today,
  //         inTime: "-",
  //         outTime: "-",
  //         status: "Absent",
  //         department: "Marketing",
  //         remarks: "Sick leave",
  //       },
  //       {
  //         _id: 5,
  //         employeeName: "Amit Patel",
  //         employeeId: "EMP005",
  //         date: today,
  //         inTime: "09:00",
  //         outTime: "13:00",
  //         status: "Half Day",
  //         department: "IT",
  //         remarks: "Personal work",
  //       },
  //       {
  //         _id: 6,
  //         employeeName: "Sneha Reddy",
  //         employeeId: "EMP006",
  //         date: today,
  //         inTime: "09:45",
  //         outTime: "18:00",
  //         status: "Late",
  //         department: "HR",
  //         remarks: "Vehicle breakdown",
  //       },
  //       {
  //         _id: 7,
  //         employeeName: "Karan Singh",
  //         employeeId: "EMP007",
  //         date: today,
  //         inTime: "09:00",
  //         outTime: "18:00",
  //         status: "Present",
  //         department: "Operations",
  //         remarks: "",
  //       },
  //       {
  //         _id: 8,
  //         employeeName: "Anjali Verma",
  //         employeeId: "EMP008",
  //         date: today,
  //         inTime: "09:20",
  //         outTime: "18:20",
  //         status: "Present",
  //         department: "Finance",
  //         remarks: "",
  //       },
  //       {
  //         _id: 9,
  //         employeeName: "Vikram Mehta",
  //         employeeId: "EMP009",
  //         date: today,
  //         inTime: "-",
  //         outTime: "-",
  //         status: "Absent",
  //         department: "IT",
  //         remarks: "Emergency leave",
  //       },
  //       {
  //         _id: 10,
  //         employeeName: "Deepika Nair",
  //         employeeId: "EMP010",
  //         date: today,
  //         inTime: "09:00",
  //         outTime: "14:00",
  //         status: "Half Day",
  //         department: "Marketing",
  //         remarks: "Medical appointment",
  //       },
  //       {
  //         _id: 11,
  //         employeeName: "Rahul Gupta",
  //         employeeId: "EMP011",
  //         date: today,
  //         inTime: "09:00",
  //         outTime: "18:00",
  //         status: "Present",
  //         department: "Operations",
  //         remarks: "",
  //       },
  //       {
  //         _id: 12,
  //         employeeName: "Meera Joshi",
  //         employeeId: "EMP012",
  //         date: today,
  //         inTime: "09:35",
  //         outTime: "17:45",
  //         status: "Late",
  //         department: "HR",
  //         remarks: "Public transport delay",
  //       },
  //       {
  //         _id: 13,
  //         employeeName: "Arjun Desai",
  //         employeeId: "EMP013",
  //         date: today,
  //         inTime: "09:00",
  //         outTime: "18:00",
  //         status: "Present",
  //         department: "Finance",
  //         remarks: "",
  //       },
  //       {
  //         _id: 14,
  //         employeeName: "Kavita Rao",
  //         employeeId: "EMP014",
  //         date: today,
  //         inTime: "09:00",
  //         outTime: "18:00",
  //         status: "Present",
  //         department: "IT",
  //         remarks: "",
  //       },
  //       {
  //         _id: 15,
  //         employeeName: "Suresh Iyer",
  //         employeeId: "EMP015",
  //         date: today,
  //         inTime: "-",
  //         outTime: "-",
  //         status: "Absent",
  //         department: "Operations",
  //         remarks: "Family emergency",
  //       },
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchTimesheetData();
    fetchLeaveData();
    // fetchAttendanceData();
  }, []);

  // Filter timesheet data based on search query and date range
  useEffect(() => {
    let filtered = timesheetList;

    // Apply search query filter
    if (timesheetSearchQuery.trim()) {
      const query = timesheetSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((record) => {
        const employeeName = (record.employeeName || "").toLowerCase();
        const employeeId = (
          record.employeeId ||
          record.employeeID ||
          ""
        ).toLowerCase();
        const subject = (record.subject || "").toLowerCase();
        const status = (record.status || "").toLowerCase();
        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          subject.includes(query) ||
          status.includes(query)
        );
      });
    }

    // Apply date filter
    if (timesheetDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.date ? record.date.split("T")[0] : "";
        return recordDate === timesheetDate;
      });
    }

    setTimesheetFilteredList(filtered);
  }, [timesheetList, timesheetSearchQuery, timesheetDate]);

  // Filter leave data based on search query and date range
  useEffect(() => {
    let filtered = leaveList;

    // Apply search query filter
    if (leaveSearchQuery.trim()) {
      const query = leaveSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((record) => {
        const employeeName = (record.employeeName || "").toLowerCase();
        const employeeId = (
          record.employeeId ||
          record.employeeID ||
          ""
        ).toLowerCase();
        const leaveType = (record.leaveType || "").toLowerCase();
        const leaveDuration = (record.leaveDuration || "").toLowerCase();
        const status = (record.status || "").toLowerCase();
        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          leaveType.includes(query) ||
          leaveDuration.includes(query) ||
          status.includes(query)
        );
      });
    }

    // Apply date range filter
    if (leaveFromDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.startDate
          ? record.startDate.split("T")[0]
          : record.startDate;
        return recordDate >= leaveFromDate;
      });
    }
    if (leaveToDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.endDate
          ? record.endDate.split("T")[0]
          : record.endDate;
        return recordDate <= leaveToDate;
      });
    }

    setLeaveFilteredList(filtered);
  }, [leaveList, leaveSearchQuery, leaveFromDate, leaveToDate]);

  // Filter attendance by selected date and search filters
  useEffect(() => {
    let filtered = attendanceList;

    // Apply date filter based on view mode
    if (viewMode === "today") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter((record) => {
        const recordDate = record.date
          ? record.date.split("T")[0]
          : record.date;
        return recordDate === today;
      });
    } else if (viewMode === "date") {
      filtered = filtered.filter((record) => {
        const recordDate = record.date
          ? record.date.split("T")[0]
          : record.date;
        return recordDate === selectedDate;
      });
    }

    // Apply search filters
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
    if (searchFilters.department) {
      filtered = filtered.filter((record) =>
        record.department
          ?.toLowerCase()
          .includes(searchFilters.department.toLowerCase())
      );
    }
    if (searchFilters.status) {
      filtered = filtered.filter((record) =>
        record.status
          ?.toLowerCase()
          .includes(searchFilters.status.toLowerCase())
      );
    }

    setFilteredList(filtered);
  }, [attendanceList, selectedDate, viewMode, searchFilters]);

  // Calculate daily statistics
  const getDailyStats = () => {
    const today =
      viewMode === "today"
        ? new Date().toISOString().split("T")[0]
        : selectedDate;

    const todayRecords = attendanceList.filter((record) => {
      const recordDate = record.date ? record.date.split("T")[0] : record.date;
      return recordDate === today;
    });

    return {
      total: todayRecords.length,
      present: todayRecords.filter((r) => r.status === "Present").length,
      absent: todayRecords.filter((r) => r.status === "Absent").length,
      late: todayRecords.filter((r) => r.status === "Late").length,
      halfDay: todayRecords.filter((r) => r.status === "Half Day").length,
    };
  };

  const stats = getDailyStats();

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let resp;
      if (editingId) {
        resp = await API.put(`/employee/attendance/${editingId}`, data);
        showSuccessMessage(
          resp.data.message || "Attendance updated successfully!"
        );
      } else {
        resp = await API.post("/employee/attendance", data);
        showSuccessMessage(
          resp.data.message || "Attendance created successfully!"
        );
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      // fetchAttendanceData();
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
    setValue("date", item.date ? item.date.split("T")[0] : "");
    setValue("inTime", item.inTime || "");
    setValue("outTime", item.outTime || "");
    setValue("status", item.status || "Present");
    setValue("department", item.department || "");
    setValue("remarks", item.remarks || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this attendance record?")
    ) {
      try {
        await API.delete(`/employee/attendance/${id}`);
        showSuccessMessage("Attendance deleted successfully!");
        // fetchAttendanceData();
      } catch (error) {
        showAxiosError(error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  // Handle approve leave record
  const handleApproveLeave = async (leaveId) => {
    if (
      !window.confirm("Are you sure you want to approve this leave request?")
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      // Use PUT /employee/leave/:id with status in body
      const resp = await API.put(`/employee/leave/${leaveId}`, {
        status: "approved",
      });
      showSuccessMessage(
        resp.data.message || "Leave request approved successfully!"
      );
      // Close modal and refresh data
      setShowLeaveViewModal(false);
      setSelectedLeaveRecord(null);
      fetchLeaveData();
    } catch (error) {
      showAxiosError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject leave record - open modal
  const handleRejectLeave = (leaveId) => {
    setRejectingLeaveId(leaveId);
    setRejectingRecordType("leave");
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Submit rejection with reason
  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim()) {
      showAxiosError({
        response: { data: { message: "Please provide a rejection reason" } },
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (rejectingRecordType === "leave") {
        // Use PUT /employee/leave/:id with status in body
        const resp = await API.put(`/employee/leave/${rejectingLeaveId}`, {
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
        });
        showSuccessMessage(
          resp.data.message ||
            "Leave request rejected and notification sent to employee!"
        );
        // Close leave view modal if open
        setShowLeaveViewModal(false);
        setSelectedLeaveRecord(null);
        fetchLeaveData();
      }

      setShowRejectModal(false);
      setRejectionReason("");
      setRejectingLeaveId(null);
      setRejectingRecordType(null);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate total days between start and end date
  const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return "-";
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      return diffDays;
    } catch (error) {
      return "-";
    }
  };

  // Format hours for display (convert decimal to HH:MM if needed)
  const formatHoursForDisplay = (hours) => {
    if (!hours && hours !== 0) return "-";

    // If it's already in HH:MM format, return as is
    if (typeof hours === "string" && hours.includes(":")) {
      return hours;
    }

    // Convert decimal to HH:MM format
    try {
      const decimalHours = Number(hours);
      if (isNaN(decimalHours)) return "-";

      const hoursPart = Math.floor(decimalHours);
      const minutesPart = Math.round((decimalHours - hoursPart) * 60);
      return `${hoursPart}:${minutesPart.toString().padStart(2, "0")}`;
    } catch (error) {
      return hours?.toString() || "-";
    }
  };

  // Fetch courses and streams for student attendance
  useEffect(() => {
    if (mainTab === "student") {
      fetchCourses();
    }
  }, [mainTab]);

  useEffect(() => {
    if (mainTab === "student" && selectedCourse) {
      fetchStreamsByCourse(selectedCourse);
    } else {
      setStreams([]);
      setSelectedStream("");
    }
  }, [mainTab, selectedCourse]);

  useEffect(() => {
    if (mainTab === "student" && selectedCourse && selectedStream) {
      fetchStudentsByCourseAndStream(selectedCourse, selectedStream);
    } else {
      setStudents([]);
      setSelectedStudent(null);
      setStudentAttendanceList([]);
    }
  }, [mainTab, selectedCourse, selectedStream]);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      const coursesData = Array.isArray(response)
        ? response
        : response?.data || [];
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter((item) => {
          if (item.status !== undefined) {
            return item.status === "Active";
          }
          return true;
        });
      };
      setCourses(filterActive(coursesData));
    } catch (error) {
      console.error("Failed to load courses", error);
      showAxiosError(error);
      setCourses([]);
    }
  };

  const fetchStreamsByCourse = async (courseId) => {
    try {
      const response = await streamsApi.getByCourse(courseId);
      const streamsData = Array.isArray(response)
        ? response
        : response?.data || [];
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter((item) => {
          if (item.status !== undefined) {
            return item.status === "Active";
          }
          return true;
        });
      };
      setStreams(filterActive(streamsData));
    } catch (error) {
      console.error("Failed to load streams", error);
      showAxiosError(error);
      setStreams([]);
    }
  };

  const fetchStudentsByCourseAndStream = async (courseId, streamId) => {
    setStudentLoading(true);
    try {
      // Using static data for now - replace with API call when backend is ready
      // const response = await API.get(`/students/course/${courseId}/stream/${streamId}`);
      // const studentsData = response.data?.data || response.data || [];

      // Static student data for demonstration - 50 students
      const firstNames = [
        "John",
        "Jane",
        "Robert",
        "Emily",
        "Michael",
        "Sarah",
        "David",
        "Lisa",
        "James",
        "Maria",
        "William",
        "Jennifer",
        "Richard",
        "Jessica",
        "Joseph",
        "Ashley",
        "Thomas",
        "Amanda",
        "Charles",
        "Melissa",
        "Christopher",
        "Deborah",
        "Daniel",
        "Stephanie",
        "Matthew",
        "Rebecca",
        "Anthony",
        "Sharon",
        "Mark",
        "Cynthia",
        "Donald",
        "Kathleen",
        "Steven",
        "Amy",
        "Paul",
        "Angela",
        "Andrew",
        "Brenda",
        "Joshua",
        "Emma",
        "Kenneth",
        "Olivia",
        "Kevin",
        "Catherine",
        "Brian",
        "Christine",
        "George",
        "Samantha",
        "Edward",
        "Patricia",
      ];

      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
        "Hernandez",
        "Lopez",
        "Wilson",
        "Anderson",
        "Thomas",
        "Taylor",
        "Moore",
        "Jackson",
        "Martin",
        "Lee",
        "Thompson",
        "White",
        "Harris",
        "Sanchez",
        "Clark",
        "Ramirez",
        "Lewis",
        "Robinson",
        "Walker",
        "Young",
        "Allen",
        "King",
        "Wright",
        "Scott",
        "Torres",
        "Nguyen",
        "Hill",
        "Flores",
        "Green",
        "Adams",
        "Nelson",
        "Baker",
        "Hall",
        "Rivera",
        "Campbell",
        "Mitchell",
        "Carter",
        "Roberts",
        "Gomez",
      ];

      const staticStudents = Array.from({ length: 50 }, (_, index) => {
        const firstName = firstNames[index % firstNames.length];
        const lastName = lastNames[index % lastNames.length];
        const studentNum = String(index + 1).padStart(3, "0");
        return {
          _id: String(index + 1),
          name: `${firstName} ${lastName}`,
          studentName: `${firstName} ${lastName}`,
          firstName: firstName,
          registrationNumber: `REG${studentNum}`,
          registrationNo: `REG${studentNum}`,
          studentId: `STU${studentNum}`,
        };
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStudents(staticStudents);
    } catch (error) {
      console.error("Failed to load students", error);
      setStudents([]);
    } finally {
      setStudentLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    // Reset form and open attendance form modal
    setStudentAttendanceForm({
      date: new Date().toISOString().split("T")[0],
      status: "Present",
      subject: "",
      remarks: "",
    });
    setShowStudentAttendanceForm(true);
  };

  const handleStudentAttendanceSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    // Create new attendance record
    const newAttendance = {
      _id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId:
        selectedStudent.studentId ||
        selectedStudent.id ||
        selectedStudent.registrationNumber ||
        selectedStudent.registrationNo,
      studentName:
        selectedStudent.name ||
        selectedStudent.studentName ||
        selectedStudent.firstName,
      name:
        selectedStudent.name ||
        selectedStudent.studentName ||
        selectedStudent.firstName,
      registrationNumber:
        selectedStudent.registrationNumber ||
        selectedStudent.registrationNo ||
        selectedStudent.studentId,
      date: new Date(studentAttendanceForm.date).toISOString(),
      status: studentAttendanceForm.status,
      subject: studentAttendanceForm.subject,
      subjectName: studentAttendanceForm.subject,
      remarks: studentAttendanceForm.remarks,
      remark: studentAttendanceForm.remarks,
    };

    // Add to attendance list
    setStudentAttendanceList((prev) => [newAttendance, ...prev]);

    // Close modal and reset form
    setShowStudentAttendanceForm(false);
    setStudentAttendanceForm({
      date: new Date().toISOString().split("T")[0],
      status: "Present",
      subject: "",
      remarks: "",
    });

    showSuccessMessage("Attendance recorded successfully!");
  };

  const handleCloseStudentAttendanceForm = () => {
    setShowStudentAttendanceForm(false);
    setStudentAttendanceForm({
      date: new Date().toISOString().split("T")[0],
      status: "Present",
      subject: "",
      remarks: "",
    });
  };

  // Check if student has attendance on a specific date
  const hasAttendanceOnDate = (student, date) => {
    if (!date || !student) return false;

    const studentId =
      student._id ||
      student.id ||
      student.studentId ||
      student.registrationNumber ||
      student.registrationNo;

    if (!studentId) return false;

    const checkDate = new Date(date).toISOString().split("T")[0];

    return studentAttendanceList.some((record) => {
      const recordDate = record.date
        ? new Date(record.date).toISOString().split("T")[0]
        : record.date;

      const recordStudentId =
        record.studentId ||
        record._id ||
        record.registrationNumber ||
        record.registrationNo;

      return (
        recordDate === checkDate &&
        (recordStudentId === studentId ||
          record.studentName ===
            (student.name || student.studentName || student.firstName))
      );
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#525B88]">Attendance</h1>
        <p className="text-gray-600 mt-1">
          {mainTab === "employee"
            ? "View employee timesheet and leave records"
            : "Manage student attendance"}
        </p>
      </div>

      {/* Main Tabs - Employee and Student */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setMainTab("employee");
              setActiveTab("timesheet");
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              mainTab === "employee"
                ? "border-[#525B88] text-[#525B88]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Employee
          </button>
          <button
            onClick={() => setMainTab("student")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              mainTab === "student"
                ? "border-[#525B88] text-[#525B88]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Student
          </button>
        </nav>
      </div>

      {/* Employee Tab Content */}
      {mainTab === "employee" && (
        <>
          {/* Employee Sub-tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("timesheet")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "timesheet"
                    ? "border-[#525B88] text-[#525B88]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Timesheet
              </button>
              <button
                onClick={() => setActiveTab("leave")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "leave"
                    ? "border-[#525B88] text-[#525B88]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Leave Records
              </button>
            </nav>
          </div>

          {/* Timesheet Tab Content */}
          {activeTab === "timesheet" && (
            <>
              {/* Timesheet Table */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
                  {/* Search Input - Same style as PaySlip */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by Employee Name, ID, Subject, Status..."
                        value={timesheetSearchQuery}
                        onChange={(e) => setTimesheetSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
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
                      {timesheetSearchQuery && (
                        <button
                          onClick={() => setTimesheetSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={timesheetDate}
                      onChange={(e) => setTimesheetDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
                    />
                  </div>
                </div>
                {timesheetLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525B88]"></div>
                  </div>
                ) : (
                  <div className="table-scroll-container">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#525b88]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Employee Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Employee ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            In Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Out Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Hours
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {timesheetFilteredList.length > 0 ? (
                          timesheetFilteredList.map((item) => (
                            <tr
                              key={item._id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.employeeName || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.employeeId || item.employeeID || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.date ? item.date.split("T")[0] : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.inTime || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.outTime || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatHoursForDisplay(item.hours)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : item.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "in_progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : item.status === "not_started"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.status
                                    ? item.status.charAt(0).toUpperCase() +
                                      item.status.slice(1).replace("_", " ")
                                    : "-"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.subject || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedTimesheetRecord(item);
                                    setShowTimesheetViewModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="9"
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No timesheet records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Leave Records Tab Content */}
          {activeTab === "leave" && (
            <>
              {/* Leave Records Table */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
                  {/* Search Input - Same style as PaySlip */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by Employee Name, ID, Leave Type, Status..."
                        value={leaveSearchQuery}
                        onChange={(e) => setLeaveSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
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
                      {leaveSearchQuery && (
                        <button
                          onClick={() => setLeaveSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* From Date */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={leaveFromDate}
                      onChange={(e) => setLeaveFromDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={leaveToDate}
                      onChange={(e) => setLeaveToDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
                    />
                  </div>
                </div>
                {leaveLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525B88]"></div>
                  </div>
                ) : (
                  <div className="table-scroll-container">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#525b88]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Employee Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Employee ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Start Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            End Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Leave Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {leaveFilteredList.length > 0 ? (
                          leaveFilteredList.map((item) => (
                            <tr
                              key={item._id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.employeeName || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.employeeId || item.employeeID || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.startDate
                                  ? item.startDate.split("T")[0]
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.endDate
                                  ? item.endDate.split("T")[0]
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {item.leaveType
                                    ? item.leaveType.charAt(0).toUpperCase() +
                                      item.leaveType.slice(1)
                                    : "-"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {item.leaveDuration
                                    ? item.leaveDuration
                                        .charAt(0)
                                        .toUpperCase() +
                                      item.leaveDuration.slice(1)
                                    : "-"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" title={item.reason}>
                                {item.reason || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.status === "approved" ||
                                    item.status?.toLowerCase() === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "rejected" ||
                                        item.status?.toLowerCase() ===
                                          "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.status
                                    ? item.status.charAt(0).toUpperCase() +
                                      item.status.slice(1)
                                    : "Pending"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedLeaveRecord(item);
                                      setShowLeaveViewModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                  {item.status !== "approved" &&
                                    item.status !== "rejected" &&
                                    item.status?.toLowerCase() !== "approved" &&
                                    item.status?.toLowerCase() !==
                                      "rejected" && (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleApproveLeave(item._id)
                                          }
                                          disabled={isProcessing}
                                          className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          title="Approve"
                                        >
                                          <CheckIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleRejectLeave(item._id)
                                          }
                                          disabled={isProcessing}
                                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          title="Reject"
                                        >
                                          <XMarkIcon className="w-5 h-5" />
                                        </button>
                                      </>
                                    )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="9"
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No leave records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Student Tab Content */}
      {mainTab === "student" && (
        <>
          {/* Course and Stream Selection */}
          <div className="mb-6 p-4 bg-white border border-[#525b88] rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedStream("");
                    setStudents([]);
                    setSelectedStudent(null);
                    setStudentAttendanceList([]);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name || course.courseName}{" "}
                      {course.code ? `(${course.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStream}
                  onChange={(e) => {
                    setSelectedStream(e.target.value);
                    setSelectedStudent(null);
                    setStudentAttendanceList([]);
                  }}
                  disabled={!selectedCourse}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Stream</option>
                  {streams.map((stream) => (
                    <option key={stream._id} value={stream._id}>
                      {stream.name || stream.streamName}{" "}
                      {stream.code ? `(${stream.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Selector for Attendance Check */}
          {selectedCourse && selectedStream && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check Attendance for Date
              </label>
              <input
                type="date"
                value={attendanceCheckDate}
                onChange={(e) => setAttendanceCheckDate(e.target.value)}
                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              />
            </div>
          )}

          {/* Student Grid - Movie Theater Style */}
          {selectedCourse && selectedStream && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#525b88] mb-4">
                Students ({students.length})
              </h2>
              {studentLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : students.length > 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Student seating arrangement */}
                  <div
                    className="grid gap-2 justify-center"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(2.5rem, 2.5rem))",
                      maxWidth: "100%",
                    }}
                  >
                    {students.map((student, index) => {
                      const hasAttendance = hasAttendanceOnDate(
                        student,
                        attendanceCheckDate
                      );
                      const isSelected =
                        selectedStudent?._id === student._id ||
                        selectedStudent?.id === student.id;

                      return (
                        <div
                          key={student._id || student.id || index}
                          onClick={() => handleStudentClick(student)}
                          className={`
                            relative aspect-square rounded-md cursor-pointer transition-all duration-200
                            flex items-center justify-center
                            ${
                              hasAttendance
                                ? "bg-green-500 border-2 border-green-600 shadow-md"
                                : "bg-gray-200 border-2 border-gray-300 hover:border-gray-400"
                            }
                            ${
                              isSelected
                                ? "ring-4 ring-[#525b88] ring-opacity-60 scale-110 z-10 shadow-lg"
                                : "hover:scale-105"
                            }
                          `}
                          title={`Student ${index + 1}${
                            hasAttendance ? " - Attendance Marked" : ""
                          }`}
                        >
                          {/* Serial number */}
                          <span
                            className={`
                            text-xs font-bold
                            ${hasAttendance ? "text-white" : "text-gray-700"}
                          `}
                          >
                            {index + 1}
                          </span>

                          {/* Attendance indicator icon */}
                          {hasAttendance && (
                            <div className="absolute top-0 right-0 -mt-1 -mr-1">
                              <div className="bg-green-600 rounded-full p-0.5">
                                <svg
                                  className="w-2 h-2 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded-md"></div>
                      <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 border-2 border-green-600 rounded-md"></div>
                      <span className="text-gray-600">Attendance Marked</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No students found for the selected course and stream.
                </div>
              )}
            </div>
          )}

          {/* Student Attendance Table */}
          {selectedStudent && (
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-[#525b88]">
                  Attendance Records -{" "}
                  {selectedStudent.name ||
                    selectedStudent.studentName ||
                    selectedStudent.firstName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Registration:{" "}
                  {selectedStudent.registrationNumber ||
                    selectedStudent.registrationNo ||
                    selectedStudent.studentId ||
                    "-"}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#525b88]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {studentAttendanceList.length > 0 ? (
                      studentAttendanceList.map((record, index) => (
                        <tr
                          key={record._id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {record.studentName || record.name || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.studentId ||
                              record.registrationNumber ||
                              record.registrationNo ||
                              "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {record.date
                              ? new Date(record.date).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === "Present" ||
                                record.status?.toLowerCase() === "present"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "Absent" ||
                                    record.status?.toLowerCase() === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : record.status === "Late" ||
                                    record.status?.toLowerCase() === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {record.status || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.subject || record.subjectName || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.remarks || record.remark || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No attendance records found for this student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Student Attendance Form Modal */}
          {showStudentAttendanceForm && selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
              <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[95vh] my-4 overflow-hidden">
                <div className="flex-shrink-0 flex justify-between items-center p-4 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
                  <h3 className="text-lg font-semibold text-white">
                    Mark Attendance
                  </h3>
                  <button
                    onClick={handleCloseStudentAttendanceForm}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <form
                  onSubmit={handleStudentAttendanceSubmit}
                  className="flex flex-col h-full"
                >
                  <div
                    className="flex-1 overflow-y-auto p-6 min-h-0 custom-scrollbar"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#9ca3af #f3f4f6",
                      maxHeight: "calc(95vh - 180px)",
                    }}
                  >
                    <style>{`
                      .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f3f4f6;
                        border-radius: 4px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #9ca3af;
                        border-radius: 4px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #6b7280;
                      }
                    `}</style>
                    <div className="space-y-4">
                      {/* Student Name (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student Name
                        </label>
                        <input
                          type="text"
                          value={
                            selectedStudent.name ||
                            selectedStudent.studentName ||
                            selectedStudent.firstName ||
                            "-"
                          }
                          disabled
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                      </div>

                      {/* Registration Number (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          value={
                            selectedStudent.registrationNumber ||
                            selectedStudent.registrationNo ||
                            selectedStudent.studentId ||
                            "-"
                          }
                          disabled
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                      </div>

                      {/* Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={studentAttendanceForm.date}
                          onChange={(e) =>
                            setStudentAttendanceForm({
                              ...studentAttendanceForm,
                              date: e.target.value,
                            })
                          }
                          max={new Date().toISOString().split("T")[0]}
                          required
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={studentAttendanceForm.status}
                          onChange={(e) =>
                            setStudentAttendanceForm({
                              ...studentAttendanceForm,
                              status: e.target.value,
                            })
                          }
                          required
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={studentAttendanceForm.subject}
                          onChange={(e) =>
                            setStudentAttendanceForm({
                              ...studentAttendanceForm,
                              subject: e.target.value,
                            })
                          }
                          placeholder="Enter subject name"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        />
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remarks
                        </label>
                        <textarea
                          value={studentAttendanceForm.remarks}
                          onChange={(e) =>
                            setStudentAttendanceForm({
                              ...studentAttendanceForm,
                              remarks: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Enter any remarks (optional)"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseStudentAttendanceForm}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#525B88] text-white rounded-lg hover:bg-[#3a4166] transition-colors font-medium"
                    >
                      Submit Attendance
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Timesheet View Modal */}
      {showTimesheetViewModal && selectedTimesheetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                Timesheet Details
              </h3>
              <button
                onClick={() => {
                  setShowTimesheetViewModal(false);
                  setSelectedTimesheetRecord(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Employee Name:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTimesheetRecord.employeeName || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Employee ID:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTimesheetRecord.employeeId ||
                        selectedTimesheetRecord.employeeID ||
                        "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTimesheetRecord.date
                        ? selectedTimesheetRecord.date.split("T")[0]
                        : "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      In Time:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTimesheetRecord.inTime || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Out Time:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTimesheetRecord.outTime || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Break (minutes):
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTimesheetRecord.breakMinutes ?? "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Hours:
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatHoursForDisplay(selectedTimesheetRecord.hours)}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Status:
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedTimesheetRecord.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedTimesheetRecord.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : selectedTimesheetRecord.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : selectedTimesheetRecord.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : selectedTimesheetRecord.status === "not_started"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedTimesheetRecord.status
                        ? selectedTimesheetRecord.status
                            .charAt(0)
                            .toUpperCase() +
                          selectedTimesheetRecord.status
                            .slice(1)
                            .replace("_", " ")
                        : "-"}
                    </span>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Subject:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTimesheetRecord.subject || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Chapter:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTimesheetRecord.chapter || "-"}
                    </p>
                  </div>
                </div>

                {/* Task - Full Width */}
                <div className="mb-5 flex items-start gap-3">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                    Task:
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                    {selectedTimesheetRecord.task || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowTimesheetViewModal(false);
                  setSelectedTimesheetRecord(null);
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave View Modal */}
      {showLeaveViewModal && selectedLeaveRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                Leave Details
              </h3>
              <button
                onClick={() => {
                  setShowLeaveViewModal(false);
                  setSelectedLeaveRecord(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Approve/Reject Actions - Only show if status is pending */}
                {selectedLeaveRecord.status !== "approved" &&
                  selectedLeaveRecord.status !== "rejected" &&
                  selectedLeaveRecord.status?.toLowerCase() !== "approved" &&
                  selectedLeaveRecord.status?.toLowerCase() !== "rejected" && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Admin Actions
                      </h4>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleApproveLeave(selectedLeaveRecord._id)
                          }
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckIcon className="w-5 h-5" />
                          Approve Leave
                        </button>
                        <button
                          onClick={() =>
                            handleRejectLeave(selectedLeaveRecord._id)
                          }
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XMarkIcon className="w-5 h-5" />
                          Reject Leave
                        </button>
                      </div>
                    </div>
                  )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Employee Name:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLeaveRecord.employeeName || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Employee ID:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLeaveRecord.employeeId ||
                        selectedLeaveRecord.employeeID ||
                        "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Start Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLeaveRecord.startDate
                        ? selectedLeaveRecord.startDate.split("T")[0]
                        : "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      End Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLeaveRecord.endDate
                        ? selectedLeaveRecord.endDate.split("T")[0]
                        : "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Total Days:
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {calculateTotalDays(
                        selectedLeaveRecord.startDate,
                        selectedLeaveRecord.endDate
                      )}
                      {calculateTotalDays(
                        selectedLeaveRecord.startDate,
                        selectedLeaveRecord.endDate
                      ) !== "-" && (
                        <span className="text-gray-500 ml-1">
                          {calculateTotalDays(
                            selectedLeaveRecord.startDate,
                            selectedLeaveRecord.endDate
                          ) === 1
                            ? "day"
                            : "days"}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Leave Type:
                    </label>
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
                      {selectedLeaveRecord.leaveType || "-"}
                    </span>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Leave Duration:
                    </label>
                    <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 capitalize">
                      {selectedLeaveRecord.leaveDuration || "-"}
                    </span>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Status:
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedLeaveRecord.status === "approved" ||
                        selectedLeaveRecord.status?.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedLeaveRecord.status === "rejected" ||
                            selectedLeaveRecord.status?.toLowerCase() ===
                              "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedLeaveRecord.status
                        ? selectedLeaveRecord.status.charAt(0).toUpperCase() +
                          selectedLeaveRecord.status.slice(1)
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Reason - Full Width */}
                <div className="mb-5 flex items-start gap-3">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                    Reason:
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                    {selectedLeaveRecord.reason || "-"}
                  </p>
                </div>

                {/* Rejection Reason - Show if rejected */}
                {selectedLeaveRecord.rejectionReason && (
                  <div className="mb-5 flex items-start gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                      Rejection Reason:
                    </label>
                    <p className="text-sm text-red-600 whitespace-pre-wrap flex-1">
                      {selectedLeaveRecord.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowLeaveViewModal(false);
                  setSelectedLeaveRecord(null);
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-md border border-gray-100 rounded-xl shadow-2xl bg-white">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-red-600 to-red-700">
              <h3 className="text-lg font-semibold text-white">
                Reject{" "}
                {rejectingRecordType === "leave"
                  ? "Leave Request"
                  : "Timesheet"}
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setRejectingTimesheetId(null);
                  setRejectingLeaveId(null);
                  setRejectingRecordType(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting this{" "}
                  {rejectingRecordType === "leave"
                    ? "leave request"
                    : "timesheet"}
                  . This reason will be sent to the employee.
                </p>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                  placeholder="Enter the reason for rejection..."
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setRejectingTimesheetId(null);
                  setRejectingLeaveId(null);
                  setRejectingRecordType(null);
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRejection}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-5 py-2.5 transition-all bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Submitting..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Statistics Cards - Same design as Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 hidden">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-[#525b88]">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.present}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Half Day</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.halfDay}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Old Attendance Form and Table - Hidden */}
      <div className="hidden">
        {/* Date Filter Section - Same design as EmployeeBills */}
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
                setSearchFilters({
                  ...searchFilters,
                  employeeId: e.target.value,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          {/* Department */}
          <div className="flex-1 min-w-[120px]">
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={searchFilters.department}
              onChange={(e) =>
                setSearchFilters({
                  ...searchFilters,
                  department: e.target.value,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          {/* Status */}
          <div className="flex-1 min-w-[120px]">
            <select
              name="status"
              value={searchFilters.status}
              onChange={(e) =>
                setSearchFilters({ ...searchFilters, status: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex-1 min-w-[120px]">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setViewMode("date");
              }}
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

        {/* Form Modal - Hidden for now */}
        {false && showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
                <h3 className="text-lg font-semibold text-white">
                  Timesheet Details
                </h3>
                <button
                  onClick={() => {
                    setShowTimesheetViewModal(false);
                    setSelectedTimesheetRecord(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Employee Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedTimesheetRecord.employeeName || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Employee ID:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedTimesheetRecord.employeeId ||
                          selectedTimesheetRecord.employeeID ||
                          "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedTimesheetRecord.date
                          ? selectedTimesheetRecord.date.split("T")[0]
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        In Time:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedTimesheetRecord.inTime || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Out Time:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedTimesheetRecord.outTime || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Break (minutes):
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedTimesheetRecord.breakMinutes ?? "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Hours:
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatHoursForDisplay(selectedTimesheetRecord.hours)}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Status:
                      </label>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          selectedTimesheetRecord.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : selectedTimesheetRecord.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : selectedTimesheetRecord.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : selectedTimesheetRecord.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : selectedTimesheetRecord.status === "not_started"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedTimesheetRecord.status
                          ? selectedTimesheetRecord.status
                              .charAt(0)
                              .toUpperCase() +
                            selectedTimesheetRecord.status
                              .slice(1)
                              .replace("_", " ")
                          : "-"}
                      </span>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Subject:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedTimesheetRecord.subject || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Chapter:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedTimesheetRecord.chapter || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Task - Full Width */}
                  <div className="mb-5 flex items-start gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                      Task:
                    </label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                      {selectedTimesheetRecord.task || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTimesheetViewModal(false);
                    setSelectedTimesheetRecord(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-md border border-gray-100 rounded-xl shadow-2xl bg-white">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-red-600 to-red-700">
                <h3 className="text-lg font-semibold text-white">
                  Reject{" "}
                  {rejectingRecordType === "leave"
                    ? "Leave Request"
                    : "Timesheet"}
                </h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setRejectingTimesheetId(null);
                    setRejectingLeaveId(null);
                    setRejectingRecordType(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                  disabled={isProcessing}
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Please provide a reason for rejecting this{" "}
                    {rejectingRecordType === "leave"
                      ? "leave request"
                      : "timesheet"}
                    . This reason will be sent to the employee.
                  </p>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                    placeholder="Enter the reason for rejection..."
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex-shrink-0 flex justify-end space-x-3 p-6 pt-0 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setRejectingTimesheetId(null);
                    setRejectingLeaveId(null);
                    setRejectingRecordType(null);
                  }}
                  disabled={isProcessing}
                  className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRejection}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-red-500/20 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Submitting..." : "Reject & Notify Employee"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave View Modal */}
        {showLeaveViewModal && selectedLeaveRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
                <h3 className="text-lg font-semibold text-white">
                  Leave Details
                </h3>
                <button
                  onClick={() => {
                    setShowLeaveViewModal(false);
                    setSelectedLeaveRecord(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  {/* Approve/Reject Actions - Only show if status is pending */}
                  {selectedLeaveRecord.status !== "approved" &&
                    selectedLeaveRecord.status !== "rejected" &&
                    selectedLeaveRecord.status?.toLowerCase() !== "approved" &&
                    selectedLeaveRecord.status?.toLowerCase() !==
                      "rejected" && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Admin Actions
                        </h4>
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleApproveLeave(selectedLeaveRecord._id)
                            }
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckIcon className="w-5 h-5" />
                            Approve Leave
                          </button>
                          <button
                            onClick={() =>
                              handleRejectLeave(selectedLeaveRecord._id)
                            }
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XMarkIcon className="w-5 h-5" />
                            Reject Leave
                          </button>
                        </div>
                      </div>
                    )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Employee Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLeaveRecord.employeeName || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Employee ID:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLeaveRecord.employeeId ||
                          selectedLeaveRecord.employeeID ||
                          "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Start Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLeaveRecord.startDate
                          ? selectedLeaveRecord.startDate.split("T")[0]
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        End Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLeaveRecord.endDate
                          ? selectedLeaveRecord.endDate.split("T")[0]
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Total Days:
                      </label>
                      <p className="text-sm text-gray-900 font-medium">
                        {calculateTotalDays(
                          selectedLeaveRecord.startDate,
                          selectedLeaveRecord.endDate
                        )}
                        {calculateTotalDays(
                          selectedLeaveRecord.startDate,
                          selectedLeaveRecord.endDate
                        ) !== "-" && (
                          <span className="text-gray-500 ml-1">
                            {calculateTotalDays(
                              selectedLeaveRecord.startDate,
                              selectedLeaveRecord.endDate
                            ) === 1
                              ? "day"
                              : "days"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Leave Type:
                      </label>
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
                        {selectedLeaveRecord.leaveType || "-"}
                      </span>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Leave Duration:
                      </label>
                      <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 capitalize">
                        {selectedLeaveRecord.leaveDuration || "-"}
                      </span>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Status:
                      </label>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedLeaveRecord.status === "approved" ||
                          selectedLeaveRecord.status?.toLowerCase() ===
                            "approved"
                            ? "bg-green-100 text-green-800"
                            : selectedLeaveRecord.status === "rejected" ||
                              selectedLeaveRecord.status?.toLowerCase() ===
                                "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedLeaveRecord.status
                          ? selectedLeaveRecord.status.charAt(0).toUpperCase() +
                            selectedLeaveRecord.status.slice(1)
                          : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Reason - Full Width */}
                  <div className="mb-5 flex items-start gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                      Reason:
                    </label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                      {selectedLeaveRecord.reason || "-"}
                    </p>
                  </div>

                  {/* Rejection Reason - Show if rejected */}
                  {selectedLeaveRecord.rejectionReason && (
                    <div className="mb-5 flex items-start gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                        Rejection Reason:
                      </label>
                      <p className="text-sm text-red-600 whitespace-pre-wrap flex-1">
                        {selectedLeaveRecord.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveViewModal(false);
                    setSelectedLeaveRecord(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal - Hidden for now */}
        {false && showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
                <h3 className="text-lg font-semibold text-white">
                  {editingId ? "Edit Attendance" : "Add Attendance"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Employee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("employeeName")}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                        errors.employeeName
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter employee name"
                    />
                    {errors.employeeName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.employeeName.message}
                      </p>
                    )}
                  </div>

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

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("date")}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                        errors.date ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("department")}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                        errors.department ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Enter department"
                    />
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.department.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      In Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("inTime")}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                        errors.inTime ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.inTime && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.inTime.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Out Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("outTime")}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                        errors.outTime ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.outTime && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.outTime.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("status")}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                        errors.status ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Late">Late</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.status.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Remarks
                    </label>
                    <textarea
                      {...register("remarks")}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                      placeholder="Enter remarks (optional)"
                    />
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
                    className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-[#525B88]/20 bg-gradient-to-r from-[#525B88] to-[#3a4166] hover:from-[#3a4166] hover:to-[#2d3450] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88] disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : editingId
                      ? "Update"
                      : "Create"}
                  </button>
                </div>
              </FormWrapper>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#525b88]">
              Attendance Records
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      In Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Out Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredList.length > 0 ? (
                    filteredList.map((record) => (
                      <tr
                        key={record._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {record.employeeName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.employeeId || record.employeeID}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.date
                            ? record.date.split("T")[0]
                            : record.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.inTime}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.outTime}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === "Present"
                                ? "bg-green-100 text-green-800"
                                : record.status === "Absent"
                                ? "bg-red-100 text-red-800"
                                : record.status === "Late"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {record.remarks || "-"}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-[#525b88] hover:text-[#3a4166]"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record._id)}
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
                        colSpan="9"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {viewMode === "today"
                          ? "No attendance records found for today"
                          : viewMode === "date"
                          ? `No attendance records found for ${new Date(
                              selectedDate
                            ).toLocaleDateString()}`
                          : "No attendance records found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
