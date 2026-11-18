import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { feePendingCommunicationsApi, collegesApi, streamsApi, coursesApi, studentsApi, courseStreamMappingsApi, academicYearsApi, courseAcademicYearMappingsApi } from "../../services/apiService";

const FeePendingComm = () => {
  const [communications, setCommunications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const data = await feePendingCommunicationsApi.getAll();
      setCommunications(data);
    } catch (error) {
      console.error("Error fetching communications:", error);
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const data = await feePendingCommunicationsApi.create(formData);
      toast.success("Fee reminders sent");
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
          <h2 className="text-xl font-semibold text-gray-800">Fees Pending Communication</h2>
          <p className="text-sm text-gray-500 mt-1">Send reminders to students with pending fees</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Send Fee Reminder
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stream</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sent Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sent Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : communications.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No previous reminders</td></tr>
            ) : (
              communications.map((comm) => (
                <tr key={comm._id} className="hover:bg-gray-50 transition-colors">

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comm.courseId ? comm.courseId.name : (comm.branchId ? "-" : "All")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comm.branchId ? comm.branchId.name : (comm.courseId ? "All" : "All")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comm.semesterNumber ? `Semester ${comm.semesterNumber}` : "All"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {comm.dueDate ? new Date(comm.dueDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(comm.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{comm.feeAmount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{comm.sentCount} Students</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <FeeReminderModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

const FeeReminderModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({

    courseId: "",
    branchId: "",
    academicYearId: "",
    semesterId: "",
    semesterNumber: "",
    registrationNumber: "", // Precise student targeting
    targetType: "Both", // Student only, Parent only, Both
    targets: ["Students", "Parents"],
    feeAmount: "",
    dueDate: "",
    paymentLink: "",
    title: "Urgent: Fee Payment Reminder",
    message: "",
    channels: ["Email"],
  });
  const [selectedYear, setSelectedYear] = useState("");
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);


  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courseAcademicYears, setCourseAcademicYears] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState({
    courses: false,
    branches: false,
    students: false,
  });

  const [searchRegNo, setSearchRegNo] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleAutofill = async () => {
    if (!searchRegNo) return;
    setIsSearching(true);
    try {
      const res = await studentsApi.getByRegistrationNumber(searchRegNo);
      // Backend returns { success: true, student: {...} } or { success: true, data: {...} }
      const student = res.student || res.data;

      if (student) {
        const mapping = student.courseStreamMappingId;
        if (!mapping) {
          alert("Student found, but they are not assigned to a Course/Stream/Semester mapping.");
          return;
        }

        setFormData(prev => ({
          ...prev,
          courseId: mapping.courseId?._id || mapping.courseId || "",
          branchId: mapping.streamId?._id || mapping.streamId || "",
          academicYearId: student.batch?._id || student.batch || "",
          semesterId: mapping.semesterId?._id || mapping.semesterId || "",
          semesterNumber: mapping.semesterNumber || "",
          registrationNumber: student.registrationNumber || ""
        }));
      } else {
        alert("No student found with this registration number.");
      }
    } catch (error) {
      console.error("Autofill error:", error);
      alert("Error searching student. Please check the registration number.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    generateFeeMessage();
  }, [formData.feeAmount, formData.dueDate, formData.courseId, formData.semesterNumber]);



  // 1. Course Change -> Fetch all Course Mappings
  useEffect(() => {
    const fetchCourseData = async () => {
      if (formData.courseId) {
        try {
          const [streamRes, ayRes] = await Promise.all([
            courseStreamMappingsApi.getByCourse(formData.courseId, true),
            courseAcademicYearMappingsApi.getAll({ courseId: formData.courseId })
          ]);

          const streamMappings = Array.isArray(streamRes.data) ? streamRes.data : (Array.isArray(streamRes) ? streamRes : []);
          setCourseStreamMappings(streamMappings);

          const ayMappings = Array.isArray(ayRes.data) ? ayRes.data : (Array.isArray(ayRes) ? ayRes : []);
          setCourseAcademicYears(ayMappings);

          // Extract unique branches (streams) from mappings
          const uniqueBranches = [];
          const seenBranchIds = new Set();
          streamMappings.forEach(m => {
            if (m.streamId && !seenBranchIds.has(m.streamId._id)) {
              seenBranchIds.add(m.streamId._id);
              uniqueBranches.push(m.streamId);
            }
          });
          setBranches(uniqueBranches.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
          console.error("Error fetching course data:", error);
          toast.error("Failed to load course details");
        }
      } else {
        setBranches([]);
        setCourseStreamMappings([]);
        setCourseAcademicYears([]);
      }
    };
    fetchCourseData();
    setFormData(prev => ({
      ...prev,
      branchId: "",
      academicYearId: "",
      semesterId: "",
      semesterNumber: ""
    }));
  }, [formData.courseId]);

  // 2. Stream (Branch) Change -> Reset Sem (Academic Year remains independent)
  useEffect(() => {
    setFormData(prev => ({ ...prev, semesterId: "", semesterNumber: "" }));
  }, [formData.branchId]);

  // 4. Update fetched students whenever filters change
  useEffect(() => {
    fetchFilteredStudents();
  }, [formData.courseId, formData.branchId, formData.academicYearId, formData.semesterId, formData.semesterNumber]);

  const fetchData = async () => {
    setLoading(prev => ({ ...prev, options: true }));
    try {
      const [co, ay] = await Promise.all([
        coursesApi.getAll(),
        academicYearsApi.getAll(),
      ]);

      const coursesData = Array.isArray(co) ? co : (co?.data || []);
      const academicYearsData = Array.isArray(ay) ? ay : (ay?.data || []);

      setAllCourses(coursesData);
      setCourses(coursesData);
      setAcademicYears(academicYearsData);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoading(prev => ({ ...prev, options: false }));
    }
  };

  const fetchFilteredStudents = async () => {
    if (!formData.courseId) {
      setFilteredStudents([]);
      return;
    }

    setLoading(prev => ({ ...prev, students: true }));
    try {
      const params = {
        status: "Admitted",
        excludePaid: "true"
      };
      if (formData.courseId) params.courseId = formData.courseId;
      if (formData.branchId) params.streamId = formData.branchId;
      if (formData.academicYearId) params.batchId = formData.academicYearId;
      if (formData.semesterId) params.semesterId = formData.semesterId;
      if (formData.semesterNumber) params.semesterNumber = formData.semesterNumber;
      if (formData.registrationNumber) params.registrationNumber = formData.registrationNumber;

      const res = await studentsApi.getByFilters(params);
      setFilteredStudents(res.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const generateFeeMessage = () => {
    const amount = formData.feeAmount ? `₹${formData.feeAmount}` : "[Amount]";
    const date = formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "[Date]";

    let courseInfo = "";
    if (formData.courseId) {
      const course = courses.find(c => c._id === formData.courseId);
      if (course) {
        courseInfo = ` for ${course.name}`;
        if (formData.semesterNumber) {
          courseInfo += ` (${Math.ceil(formData.semesterNumber / 2)} Year - ${formData.semesterNumber % 2 === 0 ? 2 : 1} Sem)`;
        }
      }
    }

    const msg = `Dear Student/Parent,\n\nThis is a reminder regarding the pending fee of ${amount}${courseInfo}. The due date for payment is ${date}.\n\nPlease ensure the payment is made to avoid any late fees.\n\nBest Regards,\nAccounts Office`;
    setFormData(prev => ({ ...prev, message: msg }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      sentCount: filteredStudents.length
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-500 sticky top-0 z-20 text-white">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">New Fee Reminder</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
              Target: {filteredStudents.length} Students
            </span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-900 mb-2">Autofill by Registration Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchRegNo}
                  onChange={(e) => setSearchRegNo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAutofill())}
                  className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Enter Registration Number (e.g. 2101001)"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutofill}
              disabled={isSearching || !searchRegNo}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:bg-emerald-300 shadow-sm whitespace-nowrap"
            >
              Search & Autofill
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl">


            <div>
              <label className="block text-sm font-semibold  mb-2">Course</label>
              <select
                value={formData.courseId}
                disabled={true}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none transition-all text-sm cursor-not-allowed"
              >
                <option value="">No Course Selected</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold  mb-2">Stream / Branch</label>
              <select
                value={formData.branchId}
                disabled={true}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none transition-all text-sm cursor-not-allowed"
              >
                <option value="">No Branch Selected</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>


          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {[
                  { id: "Students", label: "Students" },
                  { id: "Parents", label: "Parents" },
                ].map((target) => (
                  <label key={target.id} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.targets.includes(target.id)}
                      onChange={(e) => {
                        const newTargets = e.target.checked
                          ? [...formData.targets, target.id]
                          : formData.targets.filter((t) => t !== target.id);
                        setFormData({
                          ...formData,
                          targets: newTargets,
                          targetType:
                            newTargets.length === 2
                              ? "Both"
                              : newTargets.length === 1
                                ? newTargets[0] === "Students" ? "Student only" : "Parent only"
                                : "None",
                        });
                      }}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 transition-all"
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-600 transition-colors">
                      {target.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Communication Channels</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {["Email"].map((channel) => (
                  <label key={channel} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes(channel)}
                      onChange={(e) => {
                        const newChannels = e.target.checked
                          ? [...formData.channels, channel]
                          : formData.channels.filter((c) => c !== channel);
                        setFormData({ ...formData, channels: newChannels });
                      }}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 transition-all"
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-600 transition-colors">
                      {channel}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Amount</label>
              <input
                type="number"
                value={formData.feeAmount}
                onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  outline-none transition-all"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Link (Optional)</label>
                <input
                  type="url"
                  value={formData.paymentLink}
                  onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg  outline-none transition-all"
                  placeholder="https://pay.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message Content</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50  outline-none transition-all resize-none shadow-inner"
                  required
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">Recipient Preview ({filteredStudents.length})</label>
                {loading.students && <span className="text-xs text-emerald-600 animate-pulse font-medium">Updating...</span>}
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden h-[300px] flex flex-col bg-white shadow-sm">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Student Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Reg No</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, idx) => (
                          <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="px-3 py-2 font-medium">{student.firstName} {student.lastName}</td>
                            <td className="px-3 py-2 text-gray-500">{student.registrationNumber || student.hallTicketNo}</td>
                            <td className="px-3 py-2">{student.phone}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-10 text-center text-gray-400 italic bg-gray-50/50">
                            Select filters to see students
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
            <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg hover:from-emerald-700 hover:to-emerald-600 shadow-md transition-all">
              Send Fee Reminders
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeePendingComm;
