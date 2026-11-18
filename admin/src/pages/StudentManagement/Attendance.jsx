import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Filter, User, UserCheck, X, Calendar } from "lucide-react";
import {
  coursesApi,
  streamsApi,
  studentsApi,
  studentAttendanceApi,
  courseStreamMappingsApi,
  streamSubjectMappingsApi,
  absentNotificationsApi,
} from "../../services/apiService";

const getSemesterName = (num) => {
  if (!num) return "";
  const year = Math.ceil(num / 2);
  const sem = num % 2 === 0 ? 2 : 1;
  const getOrdinal = (n) => {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return n + "th";
  };
  return `${getOrdinal(year)} Year - ${getOrdinal(sem)} Sem`;
};

const AttendanceFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    courseId: "",
    branchId: "",
    semesterId: "",
    subjectId: "",
    date: new Date().toISOString().split("T")[0],
    employeeName: localStorage.getItem("name") || "",
    employeeId: localStorage.getItem("employeeId") || "",
  });

  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // Course Change -> Fetch Streams
  useEffect(() => {
    setBranches([]);
    setFormData((prev) => ({
      ...prev,
      branchId: "",
      semesterId: "",
      subjectId: "",
    }));
    setSelectedYear("");

    const fetchStreams = async () => {
      if (formData.courseId) {
        try {
          const response = await streamsApi.getByCourse(formData.courseId);
          setBranches(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
          console.error("Error fetching streams:", error);
          toast.error("Failed to load streams");
        }
      }
    };
    fetchStreams();
  }, [formData.courseId]);

  // Stream Change -> Fetch Semesters & Subjects
  useEffect(() => {
    setCourseStreamMappings([]);
    setSubjects([]);
    setSelectedYear("");
    setFormData((prev) => ({ ...prev, semesterId: "", subjectId: "" }));

    const fetchDependentData = async () => {
      if (formData.courseId && formData.branchId) {
        try {
          const csResponse = await courseStreamMappingsApi.getByCourseAndStream(
            formData.courseId,
            formData.branchId,
            true
          );
          setCourseStreamMappings(
            Array.isArray(csResponse) ? csResponse : csResponse?.data || []
          );

          const ssResponse = await streamSubjectMappingsApi.getByStream(
            formData.branchId,
            true
          );
          const ssMappings = Array.isArray(ssResponse)
            ? ssResponse
            : ssResponse?.data || [];

          const extractedSubjects = ssMappings
            .map((m) => m.subject || m.subjectId)
            .filter(Boolean);
          setSubjects(extractedSubjects);
        } catch (error) {
          console.error("Error fetching dependent data:", error);
          toast.error("Failed to load semesters/subjects");
        }
      }
    };

    fetchDependentData();
  }, [formData.courseId, formData.branchId]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, semesterId: "" }));
  }, [selectedYear]);

  const fetchCourses = async () => {
    try {
      const crs = await coursesApi.getAll();
      setCourses(crs.data || crs);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load courses");
    }
  };

  const fetchStudents = async () => {
    if (!formData.courseId || !formData.branchId || !formData.semesterId) {
      toast.error("Please select Course, Branch and Semester");
      return;
    }

    setLoading(true);
    try {
      const params = {
        courseId: formData.courseId,
        streamId: formData.branchId,
        semesterId: formData.semesterId,
      };

      const response = await studentsApi.getByFilters(params);
      const studentList = response.students || response.data || [];

      // Initialize with 'Present' status
      const initializedStudents = studentList.map((s) => ({
        ...s,
        attendanceStatus: "Present",
        remarks: "",
      }));

      // Check if attendance already exists for this date/subject
      if (formData.subjectId && formData.date) {
        try {
          const existingAttendance = await studentAttendanceApi.get({
            date: formData.date,
            subjectId: formData.subjectId,
            courseId: formData.courseId,
            branchId: formData.branchId,
            semesterId: formData.semesterId,
          });

          if (existingAttendance.data && existingAttendance.data.length > 0) {
            const existingMap = new Map(
              existingAttendance.data.map((a) => [
                a.studentId?._id || a.studentId,
                a,
              ])
            );

            const merged = initializedStudents.map((s) => {
              const existing = existingMap.get(s._id);
              if (existing) {
                return {
                  ...s,
                  attendanceStatus: existing.status,
                  remarks: existing.remarks || "",
                };
              }
              return s;
            });
            setStudents(merged);
            toast.success("Loaded existing attendance for this date");
            return;
          }
        } catch (err) {
          // Ignore if just fetching empty
        }
      }

      setStudents(initializedStudents);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentStatusChange = (studentId, status) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId ? { ...s, attendanceStatus: status } : s
      )
    );
  };

  const handleStudentRemarksChange = (studentId, remarks) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, remarks } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.courseId ||
      !formData.branchId ||
      !formData.semesterId ||
      !formData.subjectId
    ) {
      toast.error("Please select all required fields");
      return;
    }

    if (!formData.employeeName || !formData.employeeId) {
      toast.error("Please enter Employee Name and ID");
      return;
    }

    if (students.length === 0) {
      toast.error("Please fetch students first");
      return;
    }

    setLoading(true);
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        campusId: s.campus?._id || s.campus,
        courseId: formData.courseId,
        branchId: formData.branchId,
        semesterId: formData.semesterId,
        subjectId: formData.subjectId,
        date: formData.date,
        status: s.attendanceStatus,
        remarks: s.remarks || "",
        markedBy: `${formData.employeeName} (${formData.employeeId})`,
      }));

      const missingCampus = records.find((r) => !r.campusId);
      if (missingCampus) {
        toast.error(
          "Some students do not have a mapped Campus. Cannot save attendance."
        );
        setLoading(false);
        return;
      }

      await studentAttendanceApi.bulkCreate({
        records,
        date: formData.date,
        subjectId: formData.subjectId,
        markedBy: `${formData.employeeName} (${formData.employeeId})`,
      });

      // Trigger Absent Notifications
      const absentStudents = students.filter(
        (s) => s.attendanceStatus === "Absent"
      );
      const absentStudentIds = absentStudents.map((s) => s._id);

      if (absentStudentIds.length > 0) {
        try {
          const notificationPayload = {
            courseId: formData.courseId || null,
            branchId: formData.branchId || null,
            studentIds: absentStudentIds,
            absentDate: formData.date,
            title: "Absent Notification",
            message: `This is to inform you that your ward was marked absent on ${new Date(
              formData.date
            ).toLocaleDateString()}. Please ensure regular attendance for academic progress.`,
            remarks: `Automatically triggered during attendance marking for Subject ID: ${formData.subjectId}`,
            channels: ["Email"],
            targets: ["Students", "Parents"],
          };

          console.log(
            "Sending absent notification with payload:",
            notificationPayload
          );

          await absentNotificationsApi.create(notificationPayload);
          toast.success(
            `Sent absent notifications to ${absentStudentIds.length} student(s)`
          );
        } catch (notifError) {
          console.error("Failed to send absent notifications:", notifError);
          console.error("Error response:", notifError.response?.data);
          console.error("Error details:", {
            status: notifError.response?.status,
            data: notifError.response?.data,
            message: notifError.message,
          });

          let errorMessage = "Unknown error";
          if (notifError.response?.data) {
            errorMessage =
              notifError.response.data.error ||
              notifError.response.data.message ||
              JSON.stringify(notifError.response.data);
          } else if (notifError.message) {
            errorMessage = notifError.message;
          }

          toast.error(
            `Attendance saved, but failed to send notifications: ${errorMessage}`
          );
        }
      }

      toast.success("Attendance saved successfully!");
      onSubmit();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-500 sticky top-0 z-20 text-white">
          <h2 className="text-xl font-bold">Mark Attendance</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Course *
              </label>
              <select
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({ ...formData, courseId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Stream *
              </label>
              <select
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                disabled={!formData.courseId}
                required
              >
                <option value="">Select Stream</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Year *
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                disabled={
                  !formData.branchId || courseStreamMappings.length === 0
                }
                required
              >
                <option value="">Select Year</option>
                {(() => {
                  const years = [
                    ...new Set(
                      courseStreamMappings.map((m) =>
                        Math.ceil(m.semesterNumber / 2)
                      )
                    ),
                  ].sort((a, b) => a - b);
                  return years.map((year) => (
                    <option key={year} value={year}>
                      {year} Year
                    </option>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Semester *
              </label>
              <select
                value={formData.semesterId}
                onChange={(e) =>
                  setFormData({ ...formData, semesterId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                disabled={!selectedYear}
                required
              >
                <option value="">Select Semester</option>
                {(() => {
                  const filtered = courseStreamMappings
                    .filter(
                      (m) =>
                        Math.ceil(m.semesterNumber / 2) ===
                        parseInt(selectedYear)
                    )
                    .sort((a, b) => a.semesterNumber - b.semesterNumber);

                  const uniqueSemesters = [];
                  const seenIds = new Set();
                  filtered.forEach((m) => {
                    if (m.semesterId && !seenIds.has(m.semesterId._id)) {
                      seenIds.add(m.semesterId._id);
                      uniqueSemesters.push(m);
                    }
                  });

                  return uniqueSemesters.map((m) => (
                    <option key={m.semesterId._id} value={m.semesterId._id}>
                      {getSemesterName(m.semesterNumber).split(" - ")[1]}
                    </option>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Subject *
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Marked By (Employee Name) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeName: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Enter employee name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Employee ID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Enter employee ID"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fetch Students Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={fetchStudents}
              disabled={
                loading ||
                !formData.courseId ||
                !formData.branchId ||
                !formData.semesterId
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {loading ? "Loading..." : "Fetch Students"}
            </button>
          </div>

          {/* Students Table */}
          {students.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">
                  Students List ({students.length})
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">
                        S.No
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">
                        Student Name
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">
                        Reg No
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">
                        Status *
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {student.registrationNumber ||
                            student.hallTicketNo ||
                            "-"}
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={student.attendanceStatus}
                            onChange={(e) =>
                              handleStudentStatusChange(
                                student._id,
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            required
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="OnDuty">On Duty</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={student.remarks || ""}
                            onChange={(e) =>
                              handleStudentRemarksChange(
                                student._id,
                                e.target.value
                              )
                            }
                            placeholder="Optional remarks"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || students.length === 0}
              className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Attendance = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Filter states for the table
  const [filters, setFilters] = useState({
    courseId: "",
    branchId: "",
    semesterId: "",
    subjectId: "",
  });

  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  // Course Change -> Fetch Streams
  useEffect(() => {
    setBranches([]);
    setFilters((prev) => ({
      ...prev,
      branchId: "",
      semesterId: "",
      subjectId: "",
    }));
    setSelectedYear("");

    const fetchStreams = async () => {
      if (filters.courseId) {
        try {
          const response = await streamsApi.getByCourse(filters.courseId);
          setBranches(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
          console.error("Error fetching streams:", error);
        }
      }
    };
    fetchStreams();
  }, [filters.courseId]);

  // Stream Change -> Fetch Semesters & Subjects
  useEffect(() => {
    setCourseStreamMappings([]);
    setSubjects([]);
    setSelectedYear("");
    setFilters((prev) => ({ ...prev, semesterId: "", subjectId: "" }));

    const fetchDependentData = async () => {
      if (filters.courseId && filters.branchId) {
        try {
          const csResponse = await courseStreamMappingsApi.getByCourseAndStream(
            filters.courseId,
            filters.branchId,
            true
          );
          setCourseStreamMappings(
            Array.isArray(csResponse) ? csResponse : csResponse?.data || []
          );

          const ssResponse = await streamSubjectMappingsApi.getByStream(
            filters.branchId,
            true
          );
          const ssMappings = Array.isArray(ssResponse)
            ? ssResponse
            : ssResponse?.data || [];

          const extractedSubjects = ssMappings
            .map((m) => m.subject || m.subjectId)
            .filter(Boolean);
          setSubjects(extractedSubjects);
        } catch (error) {
          console.error("Error fetching dependent data:", error);
        }
      }
    };

    fetchDependentData();
  }, [filters.courseId, filters.branchId]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, semesterId: "" }));
  }, [selectedYear]);

  const fetchCourses = async () => {
    try {
      const crs = await coursesApi.getAll();
      setCourses(crs.data || crs);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!filters.courseId || !filters.branchId || !filters.semesterId) {
      setAttendanceRecords([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        courseId: filters.courseId,
        branchId: filters.branchId,
        semesterId: filters.semesterId,
      };
      if (filters.subjectId) {
        params.subjectId = filters.subjectId;
      }

      console.log("Fetching attendance with params:", params);
      const response = await studentAttendanceApi.get(params);
      console.log("Attendance response:", response);

      // Handle different response structures
      if (response.success && response.data) {
        setAttendanceRecords(response.data);
      } else if (Array.isArray(response)) {
        setAttendanceRecords(response);
      } else if (response.data) {
        setAttendanceRecords(response.data);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load attendance records";
      toast.error(errorMessage);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, [
    filters.courseId,
    filters.branchId,
    filters.semesterId,
    filters.subjectId,
  ]);

  const handleFormSubmit = () => {
    fetchAttendanceRecords();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">
            Student Attendance
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and view student attendance records
          </p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Mark Attendance
        </button>
      </div>

      {/* Filter Section for Table */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-700">
            Filter Attendance Records
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              value={filters.courseId}
              onChange={(e) =>
                setFilters({ ...filters, courseId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream
            </label>
            <select
              value={filters.branchId}
              onChange={(e) =>
                setFilters({ ...filters, branchId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled={!filters.courseId}
            >
              <option value="">All Streams</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled={!filters.branchId || courseStreamMappings.length === 0}
            >
              <option value="">All Years</option>
              {(() => {
                const years = [
                  ...new Set(
                    courseStreamMappings.map((m) =>
                      Math.ceil(m.semesterNumber / 2)
                    )
                  ),
                ].sort((a, b) => a - b);
                return years.map((year) => (
                  <option key={year} value={year}>
                    {year} Year
                  </option>
                ));
              })()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              value={filters.semesterId}
              onChange={(e) =>
                setFilters({ ...filters, semesterId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled={!selectedYear}
            >
              <option value="">All Semesters</option>
              {(() => {
                const filtered = courseStreamMappings
                  .filter(
                    (m) =>
                      Math.ceil(m.semesterNumber / 2) === parseInt(selectedYear)
                  )
                  .sort((a, b) => a.semesterNumber - b.semesterNumber);

                const uniqueSemesters = [];
                const seenIds = new Set();
                filtered.forEach((m) => {
                  if (m.semesterId && !seenIds.has(m.semesterId._id)) {
                    seenIds.add(m.semesterId._id);
                    uniqueSemesters.push(m);
                  }
                });

                return uniqueSemesters.map((m) => (
                  <option key={m.semesterId._id} value={m.semesterId._id}>
                    {getSemesterName(m.semesterNumber).split(" - ")[1]}
                  </option>
                ));
              })()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={filters.subjectId}
              onChange={(e) =>
                setFilters({ ...filters, subjectId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#525B88]">
            Attendance Records
          </h2>
          <div className="text-sm text-gray-500">
            Total Records: {attendanceRecords.length}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Reg No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Marked By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.date
                          ? new Date(record.date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.studentId?.firstName || "-"}{" "}
                        {record.studentId?.lastName || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.studentId?.registrationNumber ||
                          record.studentId?.hallTicketNo ||
                          "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.subjectId?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-800"
                              : record.status === "Absent"
                              ? "bg-red-100 text-red-800"
                              : record.status === "Late"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.status || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.remarks || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.markedBy || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {filters.courseId &&
                      filters.branchId &&
                      filters.semesterId
                        ? "No attendance records found for the selected filters"
                        : "Please select Course, Stream, and Semester to view attendance records"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AttendanceFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Attendance;
