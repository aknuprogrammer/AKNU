import React, { useState, useEffect } from "react";
import { useFormHook } from "../../Hooks/FormHook";
import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { z } from "zod";

// Validation schema for roles form
const rolesSchema = z.object({
  employeeName: z.string().min(1, "Employee Name is required"),
  employeeID: z.string().min(1, "Employee ID is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  specialization: z.string().min(1, "Specialization is required"),
  description: z.string().min(1, "Description is required"),
});

export default function Roles() {
  const { FormWrapper, errors, register, reset, setValue } = useFormHook({
    validation: rolesSchema,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch departments for dropdown
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const resp = await API.get("/departments/");
        const formatted = resp.data.map((dept) => ({
          label: `${dept.title} - (${dept.shortCode})`,
          value: dept._id,
        }));
        setDepartments(formatted);
      } catch (error) {
        showAxiosError(error);
      }
    };

    getDepartments();
  }, []);

  // Fetch roles data
  const fetchRolesData = async () => {
    setLoading(true);
    try {
      const resp = await API.get("/employee/roles");
      setRolesList(resp.data.data || resp.data || []);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let resp;
      if (editingId) {
        resp = await API.put(`/employee/roles/${editingId}`, data);
        showSuccessMessage(resp.data.message || "Role updated successfully!");
      } else {
        resp = await API.post("/employee/roles", data);
        showSuccessMessage(resp.data.message || "Role assigned successfully!");
      }
      reset();
      setEditingId(null);
      fetchRolesData();
    } catch (error) {
      showAxiosError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setValue("employeeName", item.employeeName || "");
    setValue("employeeID", item.employeeID || "");
    setValue("designation", item.designation || "");
    setValue("department", item.department || "");
    setValue("specialization", item.specialization || "");
    setValue("description", item.description || "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }
    try {
      const resp = await API.delete(`/employee/roles/${id}`);
      showSuccessMessage(resp.data.message || "Role deleted successfully!");
      fetchRolesData();
    } catch (error) {
      showAxiosError(error);
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
  };

  // Get department name by ID
  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d.value === deptId);
    return dept ? dept.label : "-";
  };

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Employee Role" : "Employee Roles"}
      </h1>

      {/* Roles Form */}
      <FormWrapper
        submitFn={handleSubmit}
        className="bg-white rounded-lg p-4 mb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name
            </label>
            <input
              type="text"
              {...register("employeeName")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.employeeName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter employee name"
            />
            {errors.employeeName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.employeeName.message}
              </p>
            )}
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              {...register("employeeID")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.employeeID
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter employee ID"
            />
            {errors.employeeID && (
              <p className="mt-1 text-sm text-red-500">
                {errors.employeeID.message}
              </p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <input
              type="text"
              {...register("designation")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.designation
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter designation"
            />
            {errors.designation && (
              <p className="mt-1 text-sm text-red-500">
                {errors.designation.message}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              {...register("department")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.department
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-500">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              {...register("specialization")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.specialization
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter specialization"
            />
            {errors.specialization && (
              <p className="mt-1 text-sm text-red-500">
                {errors.specialization.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.description
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            placeholder="Enter description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
            disabled={isSubmitting}
          >
            {editingId ? (
              <>
                <CheckIcon className="h-4 w-4 inline mr-1.5" />
                Update Role
              </>
            ) : (
              "Add Role"
            )}
          </button>
        </div>
      </FormWrapper>

      {/* Roles Table */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Assigned Roles</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage all assigned roles
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rolesList.length > 0 ? (
                  rolesList.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.employeeName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.employeeID || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.designation || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDepartmentName(item.department)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.specialization || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-md">{item.description || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 text-gray-300 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <p className="text-gray-600">No roles assigned yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Add your first role to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

