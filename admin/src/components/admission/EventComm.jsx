import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { eventCommunicationsApi, collegesApi, streamsApi, coursesApi, studentsApi } from "../../services/apiService";

const EventComm = () => {
  const [communications, setCommunications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const data = await eventCommunicationsApi.getAll();
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
      const data = await eventCommunicationsApi.create(formData);
      toast.success("Event notification sent");
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
          <h2 className="text-xl font-semibold text-gray-800">Events Communication</h2>
          <p className="text-sm text-gray-500 mt-1">Announce campus events and updates</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Announce Event
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stream</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Event Name</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Audience</th> */}
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sent Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sent Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : communications.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No event announcements</td></tr>
            ) : (
              communications.map((comm) => (
                <tr key={comm._id} className="hover:bg-gray-50 transition-colors">

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comm.courseId ? comm.courseId.name : (comm.branchId ? "-" : "All")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comm.branchId ? comm.branchId.name : (comm.courseId ? "All" : "All")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{comm.title}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comm.targetType}</td> */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sent</td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(comm.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{comm.sentCount} Students</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <EventNotificationModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

const EventNotificationModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({

    courseId: "",
    branchId: "",
    targetType: "Both", // Students, Parents, Both
    targets: ["Students"], // Actual array to send to backend
    title: "",
    eventDate: "",
    message: "",
    channels: ["Email"],
  });


  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [loading, setLoading] = useState({
    options: false,
    students: false
  });

  useEffect(() => {
    fetchData();
  }, []);



  useEffect(() => {
    if (formData.courseId) {
      // Filter branches (streams) based on course
      const filteredBranches = allBranches.filter(b => {
        const bCourseId = typeof b.courseId === 'object' ? b.courseId?._id : b.courseId;
        return bCourseId === formData.courseId;
      });
      setBranches(filteredBranches);
    } else {
      setBranches(allBranches);
    }
    // Reset branch dropdown
    setFormData(prev => ({ ...prev, branchId: "" }));
    fetchFilteredStudents();
  }, [formData.courseId, allBranches]);

  useEffect(() => {
    fetchFilteredStudents();
  }, [formData.branchId, formData.targets]);

  const fetchData = async () => {
    setLoading(prev => ({ ...prev, options: true }));
    try {
      const [b, co] = await Promise.all([
        streamsApi.getAll(),
        coursesApi.getAll(),
      ]);

      const coursesData = Array.isArray(co) ? co : (co?.data || []);
      const branchesData = Array.isArray(b) ? b : (b?.data || []);
      setAllCourses(coursesData);
      setCourses(coursesData);
      setAllBranches(branchesData);
      setBranches(branchesData);
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


      // Apply filters if selected, otherwise it fetches all for campus
      if (formData.courseId) params.courseId = formData.courseId;
      if (formData.branchId) params.streamId = formData.branchId;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure targets includes at least one group
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

    onSubmit({
      ...formData,
      studentIds: Array.from(selectedStudentIds),
      sentCount: selectedStudentIds.size,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-500 sticky top-0 z-20 text-white">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Announce New Event</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl border border-emerald-100/50">


            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg  outline-none transition-all"
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg  outline-none transition-all"
                disabled={!formData.courseId}
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                placeholder="e.g. Annual Sports Meet 2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                required
              />
            </div>

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
                              : newTargets[0] || "None",
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Channels</label>
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Details</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50  outline-none transition-all resize-none shadow-inner"
                  placeholder="Describe the event, date, venue, etc."
                  required
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">Recipient Preview ({filteredStudents.length})</label>
                {loading.students && <span className="text-xs text-emerald-600 animate-pulse font-medium">Updating...</span>}
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden h-[340px] flex flex-col bg-white shadow-sm">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          <input
                            type="checkbox"
                            checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Student Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Reg No</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, idx) => (
                          <tr key={idx} className={`hover:bg-emerald-50/30 transition-colors ${selectedStudentIds.has(student._id) ? 'bg-emerald-50/20' : ''}`}>
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.has(student._id)}
                                onChange={() => handleSelectStudent(student._id)}
                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="px-3 py-2 font-medium cursor-pointer" onClick={() => handleSelectStudent(student._id)}>{student.firstName} {student.lastName}</td>
                            <td className="px-3 py-2 text-gray-500">{student.registrationNumber || student.hallTicketNo}</td>
                            <td className="px-3 py-2">{student.phone}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-10 text-center text-gray-400 italic bg-gray-50/50">
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
              Send Event Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventComm;
