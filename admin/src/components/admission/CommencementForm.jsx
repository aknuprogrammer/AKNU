import { useState, useEffect } from "react";
import { coursesApi, streamsApi, studentsApi, courseStreamMappingsApi } from "../../services/apiService";

const CommencementForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({

    courseId: "",
    streamId: "",
    targets: ["Students"],
    title: "Notice: College Commencement and Timings",
    message: "",
    startDate: "",
    timings: "09:00 AM - 04:00 PM",
    channels: ["Email"],
  });


  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allStreams, setAllStreams] = useState([]);
  const [streams, setStreams] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [loading, setLoading] = useState({
    options: false,
    students: false
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    generateMessage();
  }, [formData.startDate, formData.timings, formData.targets]);



  useEffect(() => {
    const fetchStreamsForCourse = async () => {
      if (formData.courseId) {
        try {
          const response = await courseStreamMappingsApi.getByCourse(formData.courseId, true);
          const mappings = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);

          // Extract unique branches (streams) from mappings
          const uniqueStreams = [];
          const seenStreamIds = new Set();
          mappings.forEach(m => {
            if (m.streamId && !seenStreamIds.has(m.streamId._id)) {
              seenStreamIds.add(m.streamId._id);
              uniqueStreams.push(m.streamId);
            }
          });
          setStreams(uniqueStreams.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
          console.error("Error fetching streams:", error);
          setStreams([]);
        }
      } else {
        setStreams([]);
      }
    };
    fetchStreamsForCourse();
    // Reset stream dropdown
    setFormData(prev => ({ ...prev, streamId: "" }));
    fetchFilteredStudents();
  }, [formData.courseId]);

  useEffect(() => {
    fetchFilteredStudents();
  }, [formData.streamId]);

  const fetchOptions = async () => {
    setLoading(prev => ({ ...prev, options: true }));
    try {
      const coRes = await coursesApi.getAll();
      const coursesData = Array.isArray(coRes) ? coRes : (coRes?.data || []);
      setAllCourses(coursesData);
      setCourses(coursesData);
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
        status: "Admitted"
      };
      if (formData.courseId) params.courseId = formData.courseId;
      if (formData.streamId) params.streamId = formData.streamId;

      const res = await studentsApi.getByFilters(params);
      const students = res.students || [];
      setFilteredStudents(students);
      // Automatically select all students when a new filter is applied
      setSelectedStudentIds(new Set(students.map(s => s._id)));
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s._id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds(prev => {
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
    const dateStr = formData.startDate
      ? new Date(formData.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
      : "[Start Date]";

    let greeting = "Dear Student,";
    if (formData.targets.includes("Students") && formData.targets.includes("Parents")) {
      greeting = "Dear Student/Parent,";
    } else if (formData.targets.includes("Parents")) {
      greeting = "Dear Parent,";
    }

    const msg = `${greeting}\n\nWe are pleased to inform you that the college commencement for the new academic session is scheduled for ${dateStr}. \n\nThe daily college timings will be ${formData.timings}.\n\nPlease ensure you report to your respective campus on time.\n\nBest Regards,\nAdmissions Office`;
    setFormData(prev => ({ ...prev, message: msg }));
  };

  const handleTargetChange = (target) => {
    setFormData(prev => {
      const newTargets = prev.targets.includes(target)
        ? prev.targets.filter(t => t !== target)
        : [...prev.targets, target];
      return { ...prev, targets: newTargets };
    });
  };

  const handleChannelChange = (channel) => {
    setFormData(prev => {
      const newChannels = prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels: newChannels };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.targets.length === 0) {
      alert("Please select at least one target audience");
      return;
    }
    if (selectedStudentIds.size === 0) {
      alert("Please select at least one recipient");
      return;
    }

    const payload = {
      ...formData,
      studentIds: Array.from(selectedStudentIds),
      branchId: formData.streamId, // Map streamId to branchId for backend
      targetType: formData.targets.join(", "),
      sentCount: selectedStudentIds.size
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-500 sticky top-0 z-20 text-white">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">New Commencement Notice</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
              Selected: {selectedStudentIds.size} / {filteredStudents.length} Students
            </span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6  rounded-xl border border-emerald-100/50">

            <div>
              <label className="block text-sm font-semibold  mb-2">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold  mb-2">Stream / Branch</label>
              <select
                value={formData.streamId}
                onChange={(e) => setFormData({ ...formData, streamId: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                disabled={!formData.courseId}
              >
                <option value="">Select Stream</option>
                {streams.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">Target Audience</label>
              <div className="flex flex-col space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.targets.includes("Students")}
                    onChange={() => handleTargetChange("Students")}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-emerald-700 font-medium">Students</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.targets.includes("Parents")}
                    onChange={() => handleTargetChange("Parents")}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-emerald-700 font-medium">Parents</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">Communication Method</label>
              <div className="flex flex-col space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes("Email")}
                    onChange={() => handleChannelChange("Email")}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-emerald-700 font-medium">Email</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Timings</label>
              <input
                type="text"
                value={formData.timings}
                onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                placeholder="e.g. 09:00 AM - 04:00 PM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Message Preview</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none shadow-inner"
                required
              ></textarea>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">Recipient Preview ({filteredStudents.length})</label>
                {loading.students && <span className="text-xs text-emerald-600 animate-pulse font-medium">Updating...</span>}
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden h-[260px] flex flex-col bg-white shadow-sm">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          <input
                            type="checkbox"
                            checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Student Name</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Reg No</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, idx) => (
                          <tr key={idx} className={`hover:bg-emerald-50/30 transition-colors ${selectedStudentIds.has(student._id) ? 'bg-emerald-50/20' : ''}`}>
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.has(student._id)}
                                onChange={() => handleSelectStudent(student._id)}
                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="px-4 py-2 font-medium" onClick={() => handleSelectStudent(student._id)}>{student.firstName} {student.lastName}</td>
                            <td className="px-4 py-2 text-xs text-gray-500">{student.registrationNumber || student.hallTicketNo}</td>
                            <td className="px-4 py-2 text-xs">{student.phone}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-10 text-center text-gray-400 italic bg-gray-50/50">
                            {"No students match these criteria"}
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
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommencementForm;
