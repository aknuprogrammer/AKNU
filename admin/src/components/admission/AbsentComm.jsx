import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  admissionCommunicationsApi,
  absentNotificationsApi,
  studentAttendanceApi,
  coursesApi,
  streamsApi,
  semestersApi,
  courseStreamMappingsApi,
  studentsApi,
} from "../../services/apiService";

const AbsentComm = () => {
  const [communications, setCommunications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const data = await absentNotificationsApi.getAll();
      // Handle both array and object with data property
      const notifications = Array.isArray(data) ? data : data?.data || [];
      console.log("20", notifications);
      setCommunications(notifications);
    } catch (error) {
      console.error("Error fetching absent notifications:", error);
      toast.error("Failed to load absent notifications");
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const data = await absentNotificationsApi.create(formData);
      toast.success("Absent notification sent");
      setShowAddForm(false);
      fetchCommunications();
    } catch (error) {
      toast.error(error.message || "Failed to send");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Absent Notifications
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Send notifications to absent students and their parents
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>System Active</span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Send Absent Notification
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Sent Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Absent Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Reg No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Channels
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                      <span className="ml-2">Loading notifications...</span>
                    </div>
                  </td>
                </tr>
              ) : communications.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No absent notifications sent yet
                  </td>
                </tr>
              ) : (
                communications.map((notification) => {
                  const student = notification.studentId;
                  const studentName = student
                    ? `${student.firstName || ""} ${
                        student.lastName || ""
                      }`.trim()
                    : "Unknown Student";
                  const regNo =
                    student?.registrationNumber || student?.hallTicketNo || "-";
                  const channels = Array.isArray(notification.channels)
                    ? notification.channels.join(", ")
                    : notification.channels || "Email";

                  return (
                    <tr
                      key={notification._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.absentDate
                          ? new Date(
                              notification.absentDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {regNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(notification.channels) ? (
                            notification.channels.map((ch, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                              >
                                {ch}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {channels}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            notification.status === "Sent"
                              ? "bg-green-100 text-green-800"
                              : notification.status === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {notification.status || "Sent"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 className="text-sm font-bold text-amber-800">Automation Note</h4>
          <p className="text-xs text-amber-700 mt-1">
            Absent notifications are triggered by the daily attendance module.
            When a teacher marks a student as "Absent", the system automatically
            sends a notification to both the parent and the student via the
            selected default channels (App & SMS).
          </p>
        </div>
      </div>

      {showAddForm && (
        <AbsentNotificationModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

const AbsentNotificationModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    courseId: "",
    branchId: "",
    semesterId: "",
    semesterNumber: "",
    absentDate: "",
    remarks: "",
    title: "Absent Notification",
    message: "",
    channels: ["Email"],
    targets: ["Parents"],
  });

  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [loading, setLoading] = useState({
    options: false,
    students: false,
  });

  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Course Change -> Fetch all Course Mappings
  useEffect(() => {
    const fetchCourseData = async () => {
      if (formData.courseId) {
        try {
          const response = await courseStreamMappingsApi.getByCourse(
            formData.courseId,
            true
          );
          const mappings = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [];
          setCourseStreamMappings(mappings);

          // Extract unique branches (streams) from mappings
          const uniqueBranches = [];
          const seenBranchIds = new Set();
          mappings.forEach((m) => {
            if (m.streamId && !seenBranchIds.has(m.streamId._id)) {
              seenBranchIds.add(m.streamId._id);
              uniqueBranches.push(m.streamId);
            }
          });
          setBranches(
            uniqueBranches.sort((a, b) => a.name.localeCompare(b.name))
          );
        } catch (error) {
          console.error("Error fetching course data:", error);
          toast.error("Failed to load course details");
        }
      } else {
        setBranches([]);
        setCourseStreamMappings([]);
      }
    };
    fetchCourseData();
    setFormData((prev) => ({ ...prev, branchId: "", semesterId: "" }));
    setSelectedYear("");
    fetchFilteredStudents();
  }, [formData.courseId]);

  // Branch Change -> Reset Year/Sem
  useEffect(() => {
    setFormData((prev) => ({ ...prev, semesterId: "" }));
    setSelectedYear("");
    fetchFilteredStudents();
  }, [formData.branchId]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, semesterId: "" }));
  }, [selectedYear]);

  useEffect(() => {
    fetchFilteredStudents();
  }, [formData.branchId, formData.semesterId, formData.absentDate]);

  const fetchData = async () => {
    setLoading((prev) => ({ ...prev, options: true }));
    try {
      const coRes = await coursesApi.getAll();
      const coursesData = Array.isArray(coRes) ? coRes : coRes?.data || [];
      setAllCourses(coursesData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoading((prev) => ({ ...prev, options: false }));
    }
  };

  const fetchFilteredStudents = async () => {
    if (!formData.courseId || !formData.branchId || !formData.absentDate) {
      setFilteredStudents([]);
      setSelectedStudentIds(new Set());
      return;
    }

    setLoading((prev) => ({ ...prev, students: true }));
    try {
      // First, get attendance records for the selected date and filters
      const attendanceParams = {
        date: formData.absentDate,
        courseId: formData.courseId,
        branchId: formData.branchId,
      };
      if (formData.semesterId) {
        attendanceParams.semesterId = formData.semesterId;
      }

      const attendanceRes = await studentAttendanceApi.get(attendanceParams);
      const attendanceRecords = attendanceRes.data || [];

      // Filter for absent students only
      const absentRecords = attendanceRecords.filter(
        (record) => record.status === "Absent"
      );

      // Extract unique student IDs from absent records
      const absentStudentIds = [
        ...new Set(
          absentRecords.map((record) => {
            return record.studentId?._id || record.studentId;
          })
        ),
      ];

      if (absentStudentIds.length === 0) {
        setFilteredStudents([]);
        setSelectedStudentIds(new Set());
        return;
      }

      // Fetch full student details for absent students
      const params = {
        status: "Admitted",
      };
      if (formData.courseId) params.courseId = formData.courseId;
      if (formData.branchId) params.streamId = formData.branchId;

      const studentsRes = await studentsApi.getByFilters(params);
      const allStudents = studentsRes.students || [];

      // Filter to only include students who are absent
      const absentStudents = allStudents.filter((student) =>
        absentStudentIds.includes(student._id)
      );

      setFilteredStudents(absentStudents);
      // Automatically select all absent students
      setSelectedStudentIds(new Set(absentStudents.map((s) => s._id)));
    } catch (error) {
      console.error("Error fetching absent students:", error);
      toast.error("Failed to load absent students");
    } finally {
      setLoading((prev) => ({ ...prev, students: false }));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s._id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const generateMessage = () => {
    const dateStr = formData.absentDate
      ? new Date(formData.absentDate).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "[Date]";

    let greeting = "Dear Parent/Student,";
    if (
      formData.targets.includes("Students") &&
      formData.targets.includes("Parents")
    ) {
      greeting = "Dear Parent/Student,";
    } else if (formData.targets.includes("Students")) {
      greeting = "Dear Student,";
    } else {
      greeting = "Dear Parent,";
    }

    const msg = `${greeting}\n\nThis is to inform you that your ward was marked absent on ${dateStr}.\n\n${
      formData.remarks ? `Remarks: ${formData.remarks}\n\n` : ""
    }Please ensure regular attendance for academic progress.\n\nRegards,\nAttendance Cell`;
    setFormData((prev) => ({ ...prev, message: msg }));
  };

  useEffect(() => {
    generateMessage();
  }, [formData.absentDate, formData.remarks, formData.targets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.targets.length === 0) {
      toast.error("Please select at least one target audience");
      return;
    }
    if (formData.channels.length === 0) {
      toast.error("Please select at least one communication channel");
      return;
    }
    if (selectedStudentIds.size === 0) {
      toast.error("Please select at least one recipient");
      return;
    }
    if (!formData.absentDate) {
      toast.error("Please select an absent date");
      return;
    }

    const payload = {
      ...formData,
      studentIds: Array.from(selectedStudentIds),
      sentCount: selectedStudentIds.size,
      targetType: formData.targets.join(", "),
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-500 sticky top-0 z-20 text-white">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Send Absent Notification</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
              Selected: {selectedStudentIds.size} / {filteredStudents.length}{" "}
              Absent Students
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl border border-emerald-100/50 p-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({ ...formData, courseId: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
              <label className="block text-sm font-semibold mb-1">Branch</label>
              <select
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                disabled={!formData.courseId}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                disabled={
                  !formData.branchId || courseStreamMappings.length === 0
                }
              >
                <option value="">Select Year</option>
                {(() => {
                  const years = [
                    ...new Set(
                      courseStreamMappings
                        .filter((m) => m.streamId?._id === formData.branchId)
                        .map((m) => Math.ceil(m.semesterNumber / 2))
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
              <label className="block text-sm font-semibold mb-1">
                Semester
              </label>
              <select
                value={formData.semesterId}
                onChange={(e) => {
                  const m = courseStreamMappings.find(
                    (mapping) => mapping.semesterId._id === e.target.value
                  );
                  setFormData({
                    ...formData,
                    semesterId: e.target.value,
                    semesterNumber: m ? m.semesterNumber : "",
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                disabled={!selectedYear}
              >
                <option value="">Select Semester</option>
                {(() => {
                  const filtered = courseStreamMappings
                    .filter(
                      (m) =>
                        m.streamId?._id === formData.branchId &&
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
                      Semester {m.semesterNumber}
                    </option>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Absent Date
              </label>
              <input
                type="date"
                value={formData.absentDate}
                onChange={(e) =>
                  setFormData({ ...formData, absentDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Remarks
              </label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder="Optional remarks"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Target Audience
              </label>
              <div className="flex flex-col space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.targets.includes("Students")}
                    onChange={(e) => {
                      const newTargets = e.target.checked
                        ? [...formData.targets, "Students"]
                        : formData.targets.filter((t) => t !== "Students");
                      setFormData({ ...formData, targets: newTargets });
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-emerald-700 font-medium">
                    Students
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.targets.includes("Parents")}
                    onChange={(e) => {
                      const newTargets = e.target.checked
                        ? [...formData.targets, "Parents"]
                        : formData.targets.filter((t) => t !== "Parents");
                      setFormData({ ...formData, targets: newTargets });
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-emerald-700 font-medium">
                    Parents
                  </span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Communication Method
              </label>
              <div className="flex flex-col space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes("Email")}
                    onChange={(e) => {
                      const newChannels = e.target.checked
                        ? [...formData.channels, "Email"]
                        : formData.channels.filter((c) => c !== "Email");
                      setFormData({ ...formData, channels: newChannels });
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-emerald-700 font-medium">
                    Email
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Message Preview
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none shadow-inner"
                required
              ></textarea>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">
                  Absent Students ({filteredStudents.length})
                </label>
                {loading.students && (
                  <span className="text-xs text-emerald-600 animate-pulse font-medium">
                    Loading...
                  </span>
                )}
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden h-[260px] flex flex-col bg-white shadow-sm">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          <input
                            type="checkbox"
                            checked={
                              filteredStudents.length > 0 &&
                              selectedStudentIds.size ===
                                filteredStudents.length
                            }
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          Student Name
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          Reg No
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          Contact
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, idx) => (
                          <tr
                            key={idx}
                            className={`hover:bg-emerald-50/30 transition-colors ${
                              selectedStudentIds.has(student._id)
                                ? "bg-emerald-50/20"
                                : ""
                            }`}
                          >
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.has(student._id)}
                                onChange={() =>
                                  handleSelectStudent(student._id)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                            <td
                              className="px-4 py-2 font-medium cursor-pointer"
                              onClick={() => handleSelectStudent(student._id)}
                            >
                              {student.firstName} {student.lastName}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500">
                              {student.registrationNumber ||
                                student.hallTicketNo}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {student.phone}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-10 text-center text-gray-400 italic bg-gray-50/50"
                          >
                            {formData.absentDate &&
                            formData.courseId &&
                            formData.branchId
                              ? "No absent students found for the selected filters and date"
                              : "Select filters and date to see absent students"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg hover:from-emerald-700 hover:to-emerald-600 shadow-md transition-all"
            >
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AbsentComm;
