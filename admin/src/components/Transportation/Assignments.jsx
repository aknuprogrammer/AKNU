import { useState, useEffect } from "react";
import { transportAssignmentsApi, transportRoutesApi, studentsApi, employeeRegistrationApi } from "../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [formData, setFormData] = useState({
    userType: "Student",
    userId: "",
    userName: "",
    routeId: "",
    pickupPoint: "",
    dropPoint: "",
    status: "active"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, routesData, studentsData, staffData] = await Promise.all([
        transportAssignmentsApi.getAll(),
        transportRoutesApi.getAll(),
        studentsApi.getAll(),
        employeeRegistrationApi.getAll()
      ]);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      // Handle both raw array and { success, data } formats
      setStudents(Array.isArray(studentsData) ? studentsData : (studentsData?.data || []));
      setStaff(Array.isArray(staffData) ? staffData : (staffData?.data || []));
      setError(null);
    } catch (err) {
      setError("Failed to load assignments data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await transportAssignmentsApi.update(editingAssignment._id, formData);
        showSuccessMessage("Assignment updated successfully");
      } else if (selectedUserIds.length > 0) {
        // Bulk Creation
        await transportAssignmentsApi.createBulk({
          userType: formData.userType.toLowerCase(),
          selectedUsers: selectedUserIds,
          routeId: formData.routeId,
          pickupPoint: formData.pickupPoint,
          dropPoint: formData.dropPoint,
          status: formData.status
        });
        showSuccessMessage(`Successfully assigned ${selectedUserIds.length} users`);
      } else {
        // Single Creation (if they didn't use bulk select but filled manual fields)
        await transportAssignmentsApi.create({
          ...formData,
          studentId: formData.userType === 'Student' ? formData.userId : undefined,
          staffId: formData.userType === 'Staff' ? formData.userId : undefined,
        });
        showSuccessMessage("Assignment created successfully");
      }
      fetchData();
      handleCloseForm();
    } catch (err) {
      showErrorMessage(err.message || "Failed to save assignment");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await transportAssignmentsApi.delete(id);
        showSuccessMessage("Assignment deleted successfully");
        fetchData();
      } catch (err) {
        showErrorMessage("Failed to delete assignment");
      }
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    const isStudent = assignment.userType?.toLowerCase() === "student";

    const name = isStudent
      ? (assignment.studentId ? `${assignment.studentId.firstName} ${assignment.studentId.lastName}` : (assignment.userName || "N/A"))
      : (assignment.staffId ? `${assignment.staffId.firstName} ${assignment.staffId.lastName}` : (assignment.employeeName || assignment.userName || "N/A"));

    const id = isStudent
      ? assignment.studentId?.hallTicketNo
      : assignment.staffId?.employeeId;

    setFormData({
      userType: isStudent ? "Student" : "Staff",
      userId: id || assignment.userId || "",
      userName: name,
      routeId: typeof assignment.routeId === 'object' ? assignment.routeId._id : assignment.routeId,
      pickupPoint: assignment.pickupPoint || "",
      dropPoint: assignment.dropPoint || "",
      status: assignment.status || "active"
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAssignment(null);
    setFormData({
      userType: "Student",
      userId: "",
      userName: "",
      routeId: "",
      pickupPoint: "",
      dropPoint: "",
      status: "active"
    });
    setSelectedUserIds([]);
    setSearchTerm("");
  };

  const toggleUserSelection = (id) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const getFilteredUsers = () => {
    const list = formData.userType === "Student" ? students : staff;
    if (!searchTerm) return list;
    return list.filter(u => {
      const name = u.firstName ? `${u.firstName} ${u.lastName}`.toLowerCase() : (u.employeeName || "").toLowerCase();
      const id = (u.hallTicketNo || u.employeeId || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase());
    });
  };

  const selectedRoute = routes.find(r => r._id === formData.routeId);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Student/Staff Boarding</h2>
          <p className="text-sm text-gray-500">Manage user assignments to transport routes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Assignment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Point</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drop Point</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => {
              const isStudent = assignment.userType?.toLowerCase() === "student";
              const name = isStudent
                ? (assignment.studentId ? `${assignment.studentId.firstName} ${assignment.studentId.lastName}` : (assignment.userName || "N/A"))
                : (assignment.staffId ? `${assignment.staffId.firstName} ${assignment.staffId.lastName}` : (assignment.employeeName || assignment.userName || "N/A"));

              const id = isStudent
                ? assignment.studentId?.hallTicketNo
                : assignment.staffId?.employeeId;

              return (
                <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{name}</span>
                      <span className={`text-[10px] w-fit px-1.5 rounded-full ${isStudent ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"}`}>
                        {assignment.userType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{id || assignment.userId || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium text-blue-600">
                    {typeof assignment.routeId === 'object' ? assignment.routeId.routeName : (routes.find(r => r._id === assignment.routeId)?.routeName || assignment.routeId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {assignment.pickupPoint}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {assignment.dropPoint || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="p-1 px-3 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="p-1 px-3 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{editingAssignment ? "Edit Assignment" : "Add Assignment"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type *</label>
                <select
                  value={formData.userType}
                  onChange={(e) => {
                    setFormData({ ...formData, userType: e.target.value, userId: "", userName: "" });
                    setSelectedUserIds([]);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Route *</label>
                <select
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value, pickupPoint: "", dropPoint: "" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Route</option>
                  {routes.map(r => (
                    <option key={r._id} value={r._id}>{r.routeName}</option>
                  ))}
                </select>
              </div>

              {editingAssignment ? (
                <>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                    <input
                      type="text"
                      value={formData.userName}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select {formData.userType}s *</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="p-2 bg-gray-50 border-b">
                      <input
                        type="text"
                        placeholder={`Search ${formData.userType}s...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-2">
                      {getFilteredUsers().length === 0 && <p className="text-gray-400 text-sm text-center py-4">No users found</p>}
                      {getFilteredUsers().map(user => {
                        const fullName = user.firstName ? `${user.firstName} ${user.lastName}` : (user.employeeName || user.firstName);
                        const id = user.hallTicketNo || user.employeeId || user._id;
                        return (
                          <label key={user._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user._id)}
                              onChange={() => toggleUserSelection(user._id)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{fullName}</span>
                              <span className="text-xs text-gray-500">{id}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div className="p-2 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500">
                      <span>{selectedUserIds.length} selected</span>
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = getFilteredUsers().map(u => u._id);
                          setSelectedUserIds(prev => prev.length === allIds.length ? [] : allIds);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedUserIds.length === getFilteredUsers().length ? "Unselect All" : "Select All Visible"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Stop *</label>
                <select
                  value={formData.pickupPoint}
                  onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.routeId}
                >
                  <option value="">Select Stop</option>
                  {selectedRoute?.stops?.map((stop, idx) => (
                    <option key={idx} value={stop}>{stop}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Drop Stop *</label>
                <select
                  value={formData.dropPoint}
                  onChange={(e) => setFormData({ ...formData, dropPoint: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.routeId}
                >
                  <option value="">Select Stop</option>
                  {selectedRoute?.stops?.map((stop, idx) => (
                    <option key={idx} value={stop}>{stop}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={handleCloseForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
                  {editingAssignment ? "Update" : "Save Assignments"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
