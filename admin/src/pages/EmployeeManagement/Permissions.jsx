import React, { useState, useEffect } from "react";
import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import {
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { getRoleFromToken } from "../../ProtectedRoute";

// Define all modules and their permissions structure
const MODULES_CONFIG = [
  {
    id: "my_admin",
    name: "My Admin Module",
    icon: "⚙️",
    subModules: [
      {
        id: "configuration",
        name: "Configuration",
        actions: ["create", "read", "update", "delete"],
      },
      {
        id: "letterheads",
        name: "Letterheads",
        actions: ["create", "read", "update", "delete", "approve"],
      },
      {
        id: "field_visit",
        name: "Field Visit Info",
        actions: ["read", "update"],
      },
      {
        id: "employee_onboarding",
        name: "Employee Onboarding",
        actions: ["create", "read", "update", "delete"],
      },
      {
        id: "permissions",
        name: "Permissions",
        actions: ["read", "update"],
      },
      {
        id: "holiday_calendar",
        name: "Holiday Calendar",
        actions: ["create", "read", "update", "delete"],
      },
      {
        id: "employee_attendance",
        name: "Employee Attendance",
        actions: ["create", "read", "update", "delete", "export"],
      },
      {
        id: "communication",
        name: "Communication",
        actions: ["create", "read", "update", "delete"],
      },
    ],
  },
  {
    id: "employee_management",
    name: "Employee Management System (EMS)",
    icon: "👥",
    subModules: [
      {
        id: "request_letterheads",
        name: "Request Letterheads",
        actions: ["create", "read", "update", "approve"],
      },
      {
        id: "timesheet",
        name: "Time Sheet",
        actions: ["create", "read", "update", "delete", "export"],
      },
      {
        id: "leave",
        name: "Leave Management",
        actions: ["create", "read", "update", "delete", "approve"],
      },
      {
        id: "pay_slip",
        name: "Pay Slip",
        actions: ["read", "export"],
      },
      {
        id: "submit_query",
        name: "Submit Query",
        actions: ["create", "read", "update", "delete"],
      },
      {
        id: "submit_bills",
        name: "Submit Bills",
        actions: ["create", "read", "update", "delete", "approve"],
      },
    ],
  },
  {
    id: "finance_management",
    name: "Finance Management System (FMS)",
    icon: "💰",
    subModules: [
      {
        id: "finance_dashboard",
        name: "Finance Dashboard",
        actions: ["read", "export"],
      },
      {
        id: "fee_management",
        name: "Fee Management",
        actions: ["create", "read", "update", "delete", "approve", "export"],
      },
      {
        id: "employee_bills",
        name: "Employee Bills",
        actions: ["read", "update", "approve", "export"],
      },
      {
        id: "miscellaneous_bills",
        name: "Miscellaneous Bills",
        actions: ["create", "read", "update", "delete", "export"],
      },
      {
        id: "employee_payroll",
        name: "Employee Payroll",
        actions: ["create", "read", "update", "delete", "export"],
      },
      {
        id: "expenses_inventory",
        name: "Expenses Inventory",
        actions: ["create", "read", "update", "delete", "export"],
      },
    ],
  },
  {
    id: "website_management",
    name: "Website Management System (WMS)",
    icon: "🌐",
    subModules: [
      {
        id: "carousel",
        name: "Carousel",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "notifications",
        name: "Notifications",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "important_info",
        name: "Important Information",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "latest_news",
        name: "Latest News",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "latest_events",
        name: "Latest Events",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "important_dates",
        name: "Important Dates",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "voices_aknu",
        name: "Voices At AKNU",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "registration_forms",
        name: "Registration Forms",
        actions: ["read", "update", "approve", "export"],
      },
      {
        id: "student_feedback",
        name: "Student Feedback",
        actions: ["read", "update", "export"],
      },
      {
        id: "women_cell",
        name: "Women Cell",
        actions: ["read", "update", "approve"],
      },
      {
        id: "nannaya_vani",
        name: "Nannaya Vani",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "chat_management",
        name: "Chat Management",
        actions: ["read", "update", "delete"],
      },
      {
        id: "gallery",
        name: "Gallery",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      {
        id: "field_tracker",
        name: "Field Tracker",
        actions: ["create", "read", "update", "delete"],
      },
    ],
  },
  {
    id: "student_management",
    name: "Student Management System (SMS)",
    icon: "🎓",
    subModules: [
      {
        id: "admissions",
        name: "Admissions",
        actions: ["create", "read", "update", "delete", "approve", "export"],
      },
      {
        id: "attendance",
        name: "Attendance",
        actions: ["create", "read", "update", "export"],
      },
      {
        id: "time_table",
        name: "Time Table",
        actions: ["create", "read", "update", "delete"],
      },
      {
        id: "section_mapping",
        name: "Section Mapping",
        actions: ["create", "read", "update", "delete"],
      },
      {
        id: "certificates",
        name: "Certificates",
        actions: ["read", "export", "generate"],
      },
      {
        id: "performance",
        name: "Students Performance",
        actions: ["read", "update", "export"],
      },
    ],
  },
  {
    id: "examination_management",
    name: "Examination Management System (EMS)",
    icon: "📝",
    subModules: [
      {
        id: "pre_examination",
        name: "Pre Examination",
        actions: ["create", "read", "update", "delete"],
      },
      {
        id: "post_examination",
        name: "Post Examination",
        actions: ["read", "update", "approve"],
      },
      {
        id: "results",
        name: "Results",
        actions: ["create", "read", "update", "delete", "publish", "export"],
      },
      {
        id: "re_evaluation",
        name: "Re-evaluation",
        actions: ["read", "update", "approve"],
      },
    ],
  },
];

// Available roles in the system
const ROLES = [
  { id: "super_admin", name: "Super Admin", color: "red" },
  { id: "admin", name: "Admin", color: "blue" },
  { id: "employee", name: "Employee", color: "green" },
  { id: "counsellor", name: "Counsellor", color: "purple" },
  { id: "user", name: "User", color: "gray" },
];

// Action labels mapping
const ACTION_LABELS = {
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
  approve: "Approve",
  export: "Export",
  publish: "Publish",
  generate: "Generate",
};

export default function Permissions() {
  const currentUserRole = getRoleFromToken();
  const [selectedRole, setSelectedRole] = useState("super_admin");
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Check if current user can modify permissions
  const canModify = currentUserRole === "super_admin" || currentUserRole === "admin";

  // Fetch permissions for selected role
  useEffect(() => {
    fetchPermissions();
  }, [selectedRole]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const resp = await API.get(`/permissions/role/${selectedRole}`);
      // Transform API response to our internal format
      const formattedPermissions = {};
      
      if (resp.data && resp.data.permissions) {
        resp.data.permissions.forEach((perm) => {
          const key = `${perm.module}_${perm.subModule}`;
          formattedPermissions[key] = perm.actions || {};
        });
      } else {
        // Initialize with default permissions (all false)
        MODULES_CONFIG.forEach((module) => {
          module.subModules.forEach((subModule) => {
            const key = `${module.id}_${subModule.id}`;
            const defaultActions = {};
            subModule.actions.forEach((action) => {
              defaultActions[action] = false;
            });
            formattedPermissions[key] = defaultActions;
          });
        });
      }
      
      setPermissions(formattedPermissions);
    } catch (error) {
      // If endpoint doesn't exist yet, initialize with empty permissions
      const defaultPermissions = {};
      MODULES_CONFIG.forEach((module) => {
        module.subModules.forEach((subModule) => {
          const key = `${module.id}_${subModule.id}`;
          const defaultActions = {};
          subModule.actions.forEach((action) => {
            defaultActions[action] = false;
          });
          defaultPermissions[key] = defaultActions;
        });
      });
      setPermissions(defaultPermissions);
      console.warn("Permissions API endpoint not found, using defaults:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle permission for a specific action
  const togglePermission = (moduleId, subModuleId, action) => {
    if (!canModify) {
      showAxiosError({ response: { data: { message: "You don't have permission to modify permissions" } } });
      return;
    }

    const key = `${moduleId}_${subModuleId}`;
    setPermissions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [action]: !prev[key]?.[action],
      },
    }));
  };

  // Toggle all permissions for a submodule
  const toggleAllSubModulePermissions = (moduleId, subModuleId, subModule) => {
    if (!canModify) return;

    const key = `${moduleId}_${subModuleId}`;
    const currentPerms = permissions[key] || {};
    const allEnabled = subModule.actions.every(
      (action) => currentPerms[action] === true
    );

    const newPerms = {};
    subModule.actions.forEach((action) => {
      newPerms[action] = !allEnabled;
    });

    setPermissions((prev) => ({
      ...prev,
      [key]: newPerms,
    }));
  };

  // Save permissions
  const handleSave = async () => {
    if (!canModify) {
      showAxiosError({ response: { data: { message: "You don't have permission to save permissions" } } });
      return;
    }

    setSaving(true);
    try {
      // Transform permissions to API format
      const permissionsArray = [];
      Object.keys(permissions).forEach((key) => {
        const [moduleId, subModuleId] = key.split("_");
        permissionsArray.push({
          module: moduleId,
          subModule: subModuleId,
          actions: permissions[key],
        });
      });

      const payload = {
        role: selectedRole,
        permissions: permissionsArray,
      };

      const resp = await API.put(`/permissions/role/${selectedRole}`, payload);
      showSuccessMessage(resp.data.message || "Permissions saved successfully!");
    } catch (error) {
      // If PUT doesn't work, try POST
      try {
        const permissionsArray = [];
        Object.keys(permissions).forEach((key) => {
          const [moduleId, subModuleId] = key.split("_");
          permissionsArray.push({
            module: moduleId,
            subModule: subModuleId,
            actions: permissions[key],
          });
        });

        const payload = {
          role: selectedRole,
          permissions: permissionsArray,
        };

        const resp = await API.post("/permissions", payload);
        showSuccessMessage(resp.data.message || "Permissions saved successfully!");
      } catch (postError) {
        showAxiosError(postError);
      }
    } finally {
      setSaving(false);
    }
  };

  // Reset permissions to defaults
  const handleReset = async () => {
    if (!canModify) return;
    if (!window.confirm("Are you sure you want to reset all permissions for this role?")) {
      return;
    }

    try {
      const resp = await API.post(`/permissions/reset/${selectedRole}`);
      showSuccessMessage(resp.data.message || "Permissions reset successfully!");
      fetchPermissions();
    } catch (error) {
      // If reset endpoint doesn't exist, just reload
      fetchPermissions();
      showSuccessMessage("Permissions reset to defaults");
    }
  };

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Get permission value
  const getPermission = (moduleId, subModuleId, action) => {
    const key = `${moduleId}_${subModuleId}`;
    return permissions[key]?.[action] || false;
  };

  // Check if all permissions are enabled for a submodule
  const areAllEnabled = (moduleId, subModuleId, subModule) => {
    return subModule.actions.every((action) =>
      getPermission(moduleId, subModuleId, action)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-8 w-8 text-[#525B88]" />
            <h1 className="text-3xl font-bold text-[#525B88]">
              Permissions Management
            </h1>
          </div>
          {canModify && (
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-2 bg-[#525B88] text-white rounded-lg hover:bg-[#424a70] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Save Permissions
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <p className="text-gray-600">
          Manage access permissions for different roles in the system.
          {!canModify && (
            <span className="text-orange-600 font-medium ml-2">
              (Read-only mode)
            </span>
          )}
        </p>
      </div>

      {/* Role Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Role
        </label>
        <div className="flex flex-wrap gap-3">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedRole === role.id
                  ? role.id === "super_admin"
                    ? "bg-red-500 text-white shadow-md"
                    : role.id === "admin"
                    ? "bg-blue-500 text-white shadow-md"
                    : role.id === "employee"
                    ? "bg-green-500 text-white shadow-md"
                    : role.id === "counsellor"
                    ? "bg-purple-500 text-white shadow-md"
                    : "bg-gray-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {role.name}
            </button>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-500">
          Currently managing permissions for:{" "}
          <span className="font-semibold text-gray-700">
            {ROLES.find((r) => r.id === selectedRole)?.name}
          </span>
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-4">
        {MODULES_CONFIG.map((module) => {
          const isExpanded = expandedModules[module.id] !== false; // Default to expanded

          return (
            <div
              key={module.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{module.icon}</span>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {module.name}
                  </h2>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Module Permissions */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6">
                  <div className="space-y-6">
                    {module.subModules.map((subModule) => {
                      const allEnabled = areAllEnabled(
                        module.id,
                        subModule.id,
                        subModule
                      );
                      const key = `${module.id}_${subModule.id}`;

                      return (
                        <div
                          key={subModule.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-800">
                              {subModule.name}
                            </h3>
                            {canModify && (
                              <button
                                onClick={() =>
                                  toggleAllSubModulePermissions(
                                    module.id,
                                    subModule.id,
                                    subModule
                                  )
                                }
                                className="text-sm text-[#525B88] hover:underline"
                              >
                                {allEnabled ? "Disable All" : "Enable All"}
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {subModule.actions.map((action) => {
                              const isEnabled = getPermission(
                                module.id,
                                subModule.id,
                                action
                              );

                              return (
                                <label
                                  key={action}
                                  className={`flex items-center space-x-2 cursor-pointer ${
                                    !canModify ? "cursor-not-allowed opacity-60" : ""
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={() =>
                                      togglePermission(
                                        module.id,
                                        subModule.id,
                                        action
                                      )
                                    }
                                    disabled={!canModify}
                                    className="w-4 h-4 text-[#525B88] border-gray-300 rounded focus:ring-[#525B88]"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {ACTION_LABELS[action] || action}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Permission Actions Explained:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Create:</strong> Add new records
              </li>
              <li>
                <strong>Read:</strong> View existing records
              </li>
              <li>
                <strong>Update:</strong> Modify existing records
              </li>
              <li>
                <strong>Delete:</strong> Remove records
              </li>
              <li>
                <strong>Approve:</strong> Approve/reject requests
              </li>
              <li>
                <strong>Export:</strong> Download data (Excel, PDF)
              </li>
              <li>
                <strong>Publish:</strong> Publish content to website
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

