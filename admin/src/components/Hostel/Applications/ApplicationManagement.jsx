/**
 * Hostel Application Management Component
 * Manages student/staff applications for hostel accommodation
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Plus, FileText, CheckCircle, XCircle, Clock, Users, DollarSign, AlertCircle } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [hostelTypes, setHostelTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("boys"); // boys, girls, all
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filters, setFilters] = useState({
    registrationNumber: "",
    name: "",
    course: "",
    hostelName: "",
    status: "",
    paymentStatus: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch hostels and hostel types
   */
  const fetchHostelsAndTypes = async () => {
    try {
      const [hostelsResponse, typesResponse] = await Promise.all([
        API.get("/hostel"),
        API.get("/hostel/types"),
      ]);

      let hostelsData = [];
      if (hostelsResponse.data) {
        if (hostelsResponse.data.success && hostelsResponse.data.data) {
          hostelsData = hostelsResponse.data.data;
        } else if (Array.isArray(hostelsResponse.data.data)) {
          hostelsData = hostelsResponse.data.data;
        } else if (Array.isArray(hostelsResponse.data)) {
          hostelsData = hostelsResponse.data;
        }
      }

      let typesData = [];
      if (typesResponse.data) {
        if (typesResponse.data.success && typesResponse.data.data) {
          typesData = typesResponse.data.data;
        } else if (Array.isArray(typesResponse.data.data)) {
          typesData = typesResponse.data.data;
        } else if (Array.isArray(typesResponse.data)) {
          typesData = typesResponse.data;
        }
      }

      setHostels(hostelsData);
      setHostelTypes(typesData);
    } catch (err) {
      console.error("Error fetching hostels/types:", err);
    }
  };

  /**
   * Fetch applications from API
   */
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/hostel-fee");
      let applicationsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          applicationsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          applicationsData = response.data.data;
        }
      }

      // Enrich applications with hostel type information
      const enrichedApplications = applicationsData.map((app) => {
        const hostel = hostels.find(
          (h) => h.name === app.hostelName || h._id === app.hostelId
        );
        let hostelType = null;
        let gender = null;

        if (hostel) {
          const typeId =
            typeof hostel.hostelTypeId === "object"
              ? hostel.hostelTypeId._id
              : hostel.hostelTypeId;
          hostelType = hostelTypes.find(
            (t) => t._id === typeId || t._id?.toString() === typeId?.toString()
          );

          // Determine gender based on hostel type name
          if (hostelType) {
            const typeName = (hostelType.name || "").toLowerCase();
            if (typeName.includes("boys") || typeName.includes("male")) {
              gender = "boys";
            } else if (
              typeName.includes("girls") ||
              typeName.includes("female") ||
              typeName.includes("women")
            ) {
              gender = "girls";
            }
          }
        }

        return {
          ...app,
          name: app.studentName || app.employeeName || app.name,
          hostelType: hostelType,
          gender: gender,
        };
      });

      setApplications(enrichedApplications);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelsAndTypes();
  }, []);

  useEffect(() => {
    if (hostels.length > 0 && hostelTypes.length > 0) {
      fetchApplications();
    }
  }, [hostels, hostelTypes]);

  /**
   * Filter applications by gender tab
   */
  const filteredByGender = useMemo(() => {
    if (activeTab === "all") return applications;
    return applications.filter((app) => app.gender === activeTab);
  }, [applications, activeTab]);

  /**
   * Filter and sort data
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = filteredByGender.filter((app) => {
      return (
        (filters.registrationNumber === "" ||
          (app.registrationNumber || app.employeeId || "")
            .toLowerCase()
            .includes(filters.registrationNumber.toLowerCase())) &&
        (filters.name === "" ||
          (app.name || "")
            .toLowerCase()
            .includes(filters.name.toLowerCase())) &&
        (filters.course === "" ||
          (app.course || "")
            .toLowerCase()
            .includes(filters.course.toLowerCase())) &&
        (filters.hostelName === "" ||
          (app.hostelName || "")
            .toLowerCase()
            .includes(filters.hostelName.toLowerCase())) &&
        (filters.status === "" || app.status === filters.status) &&
        (filters.paymentStatus === "" || app.paymentStatus === filters.paymentStatus)
      );
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === "joiningDate" || sortConfig.key === "createdAt") {
          const dateA = new Date(aValue || 0);
          const dateB = new Date(bValue || 0);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [filteredByGender, filters, sortConfig]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const boysApps = applications.filter((a) => a.gender === "boys");
    const girlsApps = applications.filter((a) => a.gender === "girls");

    return {
      total: applications.length,
      boys: boysApps.length,
      girls: girlsApps.length,
      active: applications.filter((a) => a.status === "active").length,
      inactive: applications.filter((a) => a.status === "inactive").length,
      paid: applications.filter((a) => a.paymentStatus === "paid").length,
      notPaid: applications.filter((a) => a.paymentStatus === "not_paid").length,
      partial: applications.filter((a) => a.paymentStatus === "partial").length,
    };
  }, [applications]);

  /**
   * Handle save application
   */
  const handleSaveApplication = async (formData) => {
    try {
      setLoading(true);
      let response;
      if (selectedApplication && selectedApplication._id) {
        // Update
        response = await API.put(`/hostel-fee/${selectedApplication._id}`, formData);
      } else {
        // Create
        response = await API.post("/hostel-fee", formData);
      }

      if (response.data) {
        setShowModal(false);
        setSelectedApplication(null);
        fetchApplications();
        alert(
          selectedApplication
            ? "Application updated successfully!"
            : "Application created successfully!"
        );
      } else {
        throw new Error("Failed to save application");
      }
    } catch (err) {
      console.error("Error saving application:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to save application";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete application
   */
  const handleDeleteApplication = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        setLoading(true);
        await API.delete(`/hostel-fee/${id}`);
        fetchApplications();
        alert("Application deleted successfully!");
      } catch (err) {
        console.error("Error deleting application:", err);
        alert(
          err.response?.data?.message || err.message || "Failed to delete application"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Table columns
   */
  const columns = [
    {
      key: "registrationNumber",
      title: "Reg No / Emp ID",
      cellType: "custom",
      render: (value, row) => row.registrationNumber || row.employeeId || "-",
    },
    {
      key: "name",
      title: "Name",
      cellType: "custom",
      render: (value, row) => row.studentName || row.employeeName || value || "-",
    },
    {
      key: "course",
      title: "Course / Department",
      cellType: "text",
    },
    {
      key: "yearSemester",
      title: "Year/Semester",
      cellType: "text",
    },
    {
      key: "hostelName",
      title: "Hostel",
      cellType: "text",
    },
    {
      key: "roomType",
      title: "Room Type",
      cellType: "text",
    },
    {
      key: "joiningDate",
      title: "Joining Date",
      cellType: "custom",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-IN") : "-",
    },
    {
      key: "duration",
      title: "Duration",
      cellType: "custom",
      render: (value) => (value ? `${value} months` : "-"),
    },
    {
      key: "status",
      title: "Hostel Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "paymentStatus",
      title: "Payment Status",
      cellType: "custom",
      render: (value) => {
        const statusMap = {
          paid: { label: "Paid", color: "green" },
          not_paid: { label: "Not Paid", color: "red" },
          partial: { label: "Partial", color: "yellow" },
        };
        const status = statusMap[value] || { label: value || "Unknown", color: "gray" };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${status.color === "green"
              ? "bg-green-100 text-green-800"
              : status.color === "red"
                ? "bg-red-100 text-red-800"
                : status.color === "yellow"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
          >
            {status.label}
          </span>
        );
      },
    },
    {
      key: "paymentDate",
      title: "Paid Date",
      cellType: "custom",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-IN") : "-",
    },
  ];

  /**
   * Filter configuration
   */
  const filterConfig = [
    {
      name: "registrationNumber",
      type: "text",
      placeholder: "Registration No / Emp ID",
    },
    {
      name: "name",
      type: "text",
      placeholder: "Student/Employee Name",
    },
    {
      name: "course",
      type: "text",
      placeholder: "Course / Department",
    },
    {
      name: "hostelName",
      type: "text",
      placeholder: "Hostel Name",
    },
    {
      name: "status",
      type: "select",
      placeholder: "All Hostel Statuses",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      name: "paymentStatus",
      type: "select",
      placeholder: "All Payment Statuses",
      options: [
        { value: "not_paid", label: "Not Paid" },
        { value: "paid", label: "Paid" },
        { value: "partial", label: "Partial" },
      ],
    },
  ];

  const tabs = [
    { id: "boys", label: "Boys", count: statistics.boys },
    { id: "girls", label: "Girls", count: statistics.girls },
    { id: "all", label: "All", count: statistics.total },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Hostel Applications
        </h2>
        <button
          onClick={() => {
            setSelectedApplication(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <SummaryCard
          title="Total Applications"
          value={statistics.total}
          icon={FileText}
          color="blue"
        />
        <SummaryCard
          title="Boys"
          value={statistics.boys}
          icon={Users}
          color="blue"
        />
        <SummaryCard
          title="Girls"
          value={statistics.girls}
          icon={Users}
          color="pink"
        />
        <SummaryCard
          title="Active"
          value={statistics.active}
          icon={CheckCircle}
          color="green"
        />
        <SummaryCard
          title="Paid"
          value={statistics.paid}
          icon={DollarSign}
          color="green"
        />
        <SummaryCard
          title="Not Paid"
          value={statistics.notPaid}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Gender Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                ${activeTab === tab.id
                  ? "border-[#525b88] text-[#525b88]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilter={setFilters}
        filterConfig={filterConfig}
        className="mb-4"
      />

      {/* Data Table */}
      <DataTable
        data={filteredAndSortedData}
        columns={columns}
        loading={loading}
        error={error}
        onView={(id) => {
          const app = applications.find((a) => a._id === id);
          setSelectedApplication(app);
          setShowModal(true);
        }}
        onEdit={(id) => {
          const app = applications.find((a) => a._id === id);
          setSelectedApplication(app);
          setShowModal(true);
        }}
        onDelete={handleDeleteApplication}
        sortConfig={sortConfig}
        onSort={setSortConfig}
        emptyState={{
          title: "No applications found",
          message: "Applications will appear here once submitted.",
        }}
      />

      {/* Application Form Modal */}
      {showModal && (
        <ApplicationForm
          application={selectedApplication}
          hostels={hostels}
          onSave={handleSaveApplication}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * Application Form Component
 */
const ApplicationForm = ({ application, hostels, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    applicationType: "student",
    registrationNumber: "",
    studentName: "",
    course: "",
    yearSemester: "",
    employeeId: "",
    employeeName: "",
    department: "",
    hostelId: "",
    hostelName: "",
    floorId: "",
    floorNumber: "",
    roomId: "",
    roomNumber: "",
    roomType: "",
    bedId: "",
    bedNumber: "",
    joiningDate: "",
    duration: "",
    feePerMonth: "",
    totalFee: "",
    status: "active",
    paymentStatus: "not_paid",
    paymentDate: "",
    paymentReference: "",
    remarks: "",
  });
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [loadingFeeStructure, setLoadingFeeStructure] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  /**
   * Fetch hostel availability (floors, rooms, beds)
   */
  const fetchHostelAvailability = useCallback(async (hostelId) => {
    if (!hostelId) {
      console.log("No hostelId provided to fetchHostelAvailability");
      setAvailabilityData(null);
      return;
    }

    setLoadingAvailability(true);
    try {
      console.log(`API Call: Fetching availability for hostelId: ${hostelId}`);
      const response = await API.get(`/hostel/availability/${hostelId}`);

      let data = null;
      if (response.data) {
        if (response.data.success && response.data.data) {
          data = response.data.data;
        } else if (response.data.data) {
          data = response.data.data;
        } else {
          data = response.data;
        }
      }

      console.log("Processed Availability Data:", data);

      if (!data || !data.floors) {
        console.warn("Availability data is missing floors:", data);
      }

      setAvailabilityData(data);
    } catch (err) {
      console.error("Error fetching hostel availability:", err);
      setAvailabilityData(null);
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  // Fetch availability whenever hostelId changes
  useEffect(() => {
    if (formData.hostelId) {
      fetchHostelAvailability(formData.hostelId);
    } else {
      setAvailabilityData(null);
    }
  }, [formData.hostelId, fetchHostelAvailability]);

  // Fetch fee structures on mount
  useEffect(() => {
    const fetchFeeStructures = async () => {
      try {
        setLoadingFeeStructure(true);
        const response = await API.get("/hostel/fee-structure");
        let structuresData = [];
        if (response.data) {
          if (response.data.success && response.data.data) {
            structuresData = response.data.data;
          } else if (Array.isArray(response.data.data)) {
            structuresData = response.data.data;
          } else if (Array.isArray(response.data)) {
            structuresData = response.data;
          }
        }
        setFeeStructures(structuresData);
      } catch (err) {
        console.error("Error fetching fee structures:", err);
      } finally {
        setLoadingFeeStructure(false);
      }
    };
    fetchFeeStructures();
  }, []);

  useEffect(() => {
    if (application) {
      const duration = application.duration || "";
      const feePerMonth = application.feePerMonth || "";
      const calculatedTotal = duration && feePerMonth ? (Number(duration) * Number(feePerMonth)).toFixed(2) : (application.totalFee || "");

      const hostelId = application.hostelId || (hostels.find(h => h.name === application.hostelName)?._id || "");

      setFormData({
        applicationType: application.applicationType || "student",
        registrationNumber: application.registrationNumber || "",
        studentName: application.studentName || "",
        course: application.course || "",
        yearSemester: application.yearSemester || "",
        employeeId: application.employeeId || "",
        employeeName: application.employeeName || "",
        department: application.department || "",
        hostelId: hostelId,
        hostelName: application.hostelName || "",
        floorId: application.floorId || "",
        floorNumber: application.floorNumber || "",
        roomId: application.roomId || "",
        roomNumber: application.roomNumber || "",
        roomType: application.roomType || "",
        bedId: application.bedId || "",
        bedNumber: application.bedNumber || "",
        joiningDate: application.joiningDate
          ? new Date(application.joiningDate).toISOString().split("T")[0]
          : "",
        duration: duration,
        feePerMonth: feePerMonth,
        totalFee: calculatedTotal,
        status: application.status || "active",
        paymentStatus: application.paymentStatus || "not_paid",
        paymentDate: application.paymentDate
          ? new Date(application.paymentDate).toISOString().split("T")[0]
          : "",
        paymentReference: application.paymentReference || "",
        remarks: application.remarks || "",
      });

      // Fetch availability if hostel ID exists
      if (hostelId) {
        fetchHostelAvailability(hostelId);
      }
    }
  }, [application, hostels, fetchHostelAvailability]);

  // Auto-select floor, room, and bed when in edit mode and availability data is loaded
  useEffect(() => {
    if (application && availabilityData && availabilityData.floors) {
      // Handle potential populated objects or raw IDs
      const floorId = application.floorId?._id || application.floorId;
      const roomId = application.roomId?._id || application.roomId;
      const bedId = application.bedId?._id || application.bedId;

      if (floorId) {
        const floor = availabilityData.floors.find(f =>
          f._id.toString() === floorId.toString()
        );
        if (floor) {
          setSelectedFloor(floor);
          if (roomId) {
            const room = floor.rooms?.find(r =>
              r._id.toString() === roomId.toString()
            );
            if (room) {
              setSelectedRoom(room);
              if (bedId || application.bedNumber) {
                const bed = room.beds?.find(b =>
                  (bedId && b._id.toString() === bedId.toString()) ||
                  (b.isVirtual && b.bedNumber === application.bedNumber)
                );
                if (bed) {
                  setSelectedBed(bed);
                }
              }
            }
          }
        }
      }
    }
  }, [application, availabilityData]);

  // Auto-calculate total fee when duration or feePerMonth changes
  useEffect(() => {
    const duration = Number(formData.duration) || 0;
    const feePerMonth = Number(formData.feePerMonth) || 0;

    if (duration > 0 && feePerMonth > 0) {
      const calculatedTotal = (duration * feePerMonth).toFixed(2);
      const currentTotal = formData.totalFee ? Number(formData.totalFee).toFixed(2) : "";

      if (currentTotal !== calculatedTotal) {
        setFormData((prev) => ({
          ...prev,
          totalFee: calculatedTotal,
        }));
      }
    } else if (formData.totalFee && (duration === 0 || feePerMonth === 0)) {
      // Clear total fee if duration or feePerMonth is cleared
      setFormData((prev) => ({
        ...prev,
        totalFee: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.duration, formData.feePerMonth]);

  // Auto-populate fee per month when hostel and room type are selected
  useEffect(() => {
    if (formData.hostelName && formData.roomType && feeStructures.length > 0 && !formData.feePerMonth) {
      const matchingFeeStructure = feeStructures.find((fs) => {
        const hostelMatch =
          fs.hostelName === formData.hostelName ||
          (typeof fs.hostelId === 'object' && fs.hostelId?.name === formData.hostelName) ||
          (hostels.find(h => h.name === formData.hostelName)?._id === (typeof fs.hostelId === 'object' ? fs.hostelId?._id : fs.hostelId));
        const roomTypeMatch = fs.roomType === formData.roomType;
        return hostelMatch && roomTypeMatch && fs.status === "active";
      });

      if (matchingFeeStructure && matchingFeeStructure.monthlyFee) {
        setFormData((prev) => ({
          ...prev,
          feePerMonth: matchingFeeStructure.monthlyFee,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hostelName, formData.roomType, feeStructures]);

  /**
   * Fetch student details by registration number
   */
  const fetchStudentDetails = useCallback(async (registrationNumber) => {
    if (!registrationNumber || registrationNumber.length < 3) {
      return;
    }

    setLoadingStudent(true);
    try {
      const response = await API.get(`/students/registration/${registrationNumber}`);
      if (response.data && response.data.success && response.data.data) {
        const student = response.data.data;

        // Get course name
        let courseName = "";
        if (student.courseStreamMappingId) {
          const mapping = student.courseStreamMappingId;
          if (mapping.courseId) {
            courseName = typeof mapping.courseId === "object"
              ? mapping.courseId.name
              : "";
          }
        }

        // Get year/semester
        let yearSemester = "";
        if (student.courseStreamMappingId) {
          const mapping = student.courseStreamMappingId;
          if (mapping.semesterNumber) {
            const year = Math.ceil(mapping.semesterNumber / 2);
            const semesterInYear = ((mapping.semesterNumber - 1) % 2) + 1;
            const yearOrdinal = year === 1 ? "1st" : year === 2 ? "2nd" : year === 3 ? "3rd" : `${year}th`;
            const semesterOrdinal = semesterInYear === 1 ? "1st" : semesterInYear === 2 ? "2nd" : `${semesterInYear}th`;
            yearSemester = `${yearOrdinal} Year - ${semesterOrdinal} Semester`;
          }
        }

        // Auto-populate form
        setFormData((prev) => ({
          ...prev,
          studentName: student.firstName
            ? `${student.firstName} ${student.middleName || ""} ${student.lastName || ""}`.trim()
            : prev.studentName,
          course: courseName || prev.course,
          yearSemester: yearSemester || prev.yearSemester,
        }));
      }
    } catch (err) {
      console.error("Error fetching student details:", err);
      // Don't show error if student not found (404)
      if (err.response?.status !== 404) {
        console.warn("Student not found or error:", err.message);
      }
    } finally {
      setLoadingStudent(false);
    }
  }, []);

  /**
   * Fetch employee details by employee ID
   */
  const fetchEmployeeDetails = useCallback(async (employeeId) => {
    if (!employeeId || employeeId.length < 3) {
      return;
    }

    setLoadingEmployee(true);
    try {
      // Try to get user by employeeId
      const response = await API.get("/authentication/users", {
        params: { employeeId },
      });

      let users = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          users = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          users = response.data.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          users = response.data.users;
        }
      }

      // Find user with matching employeeId
      const employee = users.find((u) => u.employeeId === employeeId);

      if (employee) {
        // Auto-populate form
        setFormData((prev) => ({
          ...prev,
          employeeName: employee.fullName || prev.employeeName,
          department: employee.department || employee.jobTitle || prev.department,
        }));
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      // Don't show error if employee not found
      if (err.response?.status !== 404) {
        console.warn("Employee not found or error:", err.message);
      }
    } finally {
      setLoadingEmployee(false);
    }
  }, []);


  // Use refs to store timeout IDs
  const studentTimeoutRef = useRef(null);
  const employeeTimeoutRef = useRef(null);

  // Debounced fetch student
  const debouncedFetchStudent = useCallback((registrationNumber) => {
    if (studentTimeoutRef.current) {
      clearTimeout(studentTimeoutRef.current);
    }
    studentTimeoutRef.current = setTimeout(() => {
      fetchStudentDetails(registrationNumber);
    }, 500);
  }, [fetchStudentDetails]);

  // Debounced fetch employee
  const debouncedFetchEmployee = useCallback((employeeId) => {
    if (employeeTimeoutRef.current) {
      clearTimeout(employeeTimeoutRef.current);
    }
    employeeTimeoutRef.current = setTimeout(() => {
      fetchEmployeeDetails(employeeId);
    }, 500);
  }, [fetchEmployeeDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-fetch student details when registration number changes
      if (name === "registrationNumber" && formData.applicationType === "student") {
        if (value && value.length >= 3) {
          debouncedFetchStudent(value);
        } else {
          // Clear student details if registration number is cleared
          updated.studentName = "";
          updated.course = "";
          updated.yearSemester = "";
        }
      }

      // Auto-fetch employee details when employee ID changes
      if (name === "employeeId" && formData.applicationType === "staff") {
        if (value && value.length >= 3) {
          debouncedFetchEmployee(value);
        } else {
          // Clear employee details if employee ID is cleared
          updated.employeeName = "";
          updated.department = "";
        }
      }

      // Update hostelId when hostelName changes
      if (name === "hostelName") {
        const selectedHostel = hostels.find((h) => h.name === value);
        if (selectedHostel) {
          updated.hostelId = selectedHostel._id;
        } else {
          // Clear availability data if hostel is cleared
          updated.hostelId = "";
          updated.floorId = "";
          updated.floorNumber = "";
          updated.roomId = "";
          updated.roomNumber = "";
          updated.bedId = "";
          updated.bedNumber = "";
          updated.roomType = "";
          updated.feePerMonth = "";
          updated.totalFee = "";
          setSelectedFloor(null);
          setSelectedRoom(null);
          setSelectedBed(null);
        }
      }

      // Auto-calculate total fee when duration or feePerMonth changes
      if (name === "duration" || name === "feePerMonth") {
        const duration = Number(updated.duration) || 0;
        const feePerMonth = Number(updated.feePerMonth) || 0;
        updated.totalFee = duration > 0 && feePerMonth > 0 ? (duration * feePerMonth).toFixed(2) : "";
      }

      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (formData.applicationType === "student") {
      if (!formData.registrationNumber || !formData.studentName || !formData.hostelName) {
        alert("Please fill all required fields for student application");
        return;
      }
    } else {
      if (!formData.employeeId || !formData.employeeName || !formData.hostelName) {
        alert("Please fill all required fields for staff application");
        return;
      }
    }

    // Calculate total fee if not already set
    let calculatedTotalFee = 0;
    if (formData.totalFee) {
      calculatedTotalFee = Number(formData.totalFee);
    } else {
      const duration = Number(formData.duration) || 0;
      const feePerMonth = Number(formData.feePerMonth) || 0;
      calculatedTotalFee = duration * feePerMonth;
    }

    // Build submit data, only including defined values
    const submitData = {
      applicationType: formData.applicationType,
      hostelId: formData.hostelId,
      hostelName: formData.hostelName,
      floorId: formData.floorId,
      floorNumber: formData.floorNumber,
      roomId: formData.roomId,
      roomNumber: formData.roomNumber,
      // Only send bedId if it's a real MongoDB ObjectId (not virtual)
      bedId: formData.bedId && !formData.bedId.startsWith('vbed-') ? formData.bedId : undefined,
      bedNumber: formData.bedNumber,
      status: formData.status || "active",
      paymentStatus: formData.paymentStatus || "not_paid",
    };

    // Add student fields if student application
    if (formData.applicationType === "student") {
      if (formData.registrationNumber) submitData.registrationNumber = formData.registrationNumber;
      if (formData.studentName) submitData.studentName = formData.studentName;
      if (formData.course) submitData.course = formData.course;
      if (formData.yearSemester) submitData.yearSemester = formData.yearSemester;
    } else {
      // Add staff fields if staff application
      if (formData.employeeId) submitData.employeeId = formData.employeeId;
      if (formData.employeeName) submitData.employeeName = formData.employeeName;
      if (formData.department) submitData.department = formData.department;
    }

    // Add common fields
    if (formData.roomType) submitData.roomType = formData.roomType;
    if (formData.joiningDate) submitData.joiningDate = formData.joiningDate;
    if (formData.paymentDate) submitData.paymentDate = formData.paymentDate;
    if (formData.paymentReference) submitData.paymentReference = formData.paymentReference;
    if (formData.duration) submitData.duration = Number(formData.duration);
    if (formData.feePerMonth) submitData.feePerMonth = Number(formData.feePerMonth);
    if (calculatedTotalFee > 0) submitData.totalFee = calculatedTotalFee;
    if (formData.remarks) submitData.remarks = formData.remarks;

    onSave(submitData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={application ? "Edit Application" : "Add Application"}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="application-form"
            className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
          >
            {application ? "Update" : "Save"}
          </button>
        </div>
      }
    >
      <form id="application-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Type *
          </label>
          <select
            name="applicationType"
            value={formData.applicationType}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {formData.applicationType === "student" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number *
                  {loadingStudent && (
                    <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  placeholder="Enter registration number to auto-fill details"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year/Semester
                </label>
                <input
                  type="text"
                  name="yearSemester"
                  value={formData.yearSemester}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                  {loadingEmployee && (
                    <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  placeholder="Enter employee ID to auto-fill details"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name *
                </label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hostel *
          </label>
          <select
            name="hostelName"
            value={formData.hostelName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          >
            <option value="">Select Hostel</option>
            {hostels.map((hostel) => (
              <option key={hostel._id} value={hostel.name}>
                {hostel.name} ({hostel.code})
              </option>
            ))}
          </select>
        </div>

        {/* Room and Bed Selection */}
        {formData.hostelId && availabilityData && (
          <RoomBedSelector
            availabilityData={availabilityData}
            loading={loadingAvailability}
            selectedFloor={selectedFloor}
            selectedRoom={selectedRoom}
            selectedBed={selectedBed}
            application={application}
            onFloorSelect={(floor) => {
              setSelectedFloor(floor);
              setSelectedRoom(null);
              setSelectedBed(null);
              setFormData((prev) => ({
                ...prev,
                floorId: floor._id,
                floorNumber: floor.floorNumber,
                roomId: "",
                roomNumber: "",
                bedId: "",
                bedNumber: "",
                roomType: "",
              }));
            }}
            onRoomSelect={(room) => {
              setSelectedRoom(room);
              setSelectedBed(null);
              // Find matching fee structure
              const matchingFeeStructure = feeStructures.find((fs) => {
                const hostelMatch =
                  fs.hostelName === formData.hostelName ||
                  (typeof fs.hostelId === 'object' && fs.hostelId?.name === formData.hostelName) ||
                  (hostels.find(h => h._id === formData.hostelId)?._id === (typeof fs.hostelId === 'object' ? fs.hostelId?._id : fs.hostelId));
                const roomTypeMatch = fs.roomType === room.roomType;
                return hostelMatch && roomTypeMatch && fs.status === "active";
              });

              setFormData((prev) => {
                const updated = {
                  ...prev,
                  roomId: room._id,
                  roomNumber: room.roomNumber,
                  roomType: room.roomType,
                  bedId: "",
                  bedNumber: "",
                };

                // Auto-fill fee per month if fee structure found
                if (matchingFeeStructure && matchingFeeStructure.monthlyFee) {
                  updated.feePerMonth = matchingFeeStructure.monthlyFee;
                  if (prev.duration) {
                    const duration = Number(prev.duration) || 0;
                    const feePerMonth = Number(matchingFeeStructure.monthlyFee) || 0;
                    updated.totalFee = duration > 0 && feePerMonth > 0 ? (duration * feePerMonth).toFixed(2) : "";
                  }
                }

                return updated;
              });
            }}
            onBedSelect={(bed) => {
              setSelectedBed(bed);
              setFormData((prev) => ({
                ...prev,
                bedId: bed._id,
                bedNumber: bed.bedNumber,
              }));
            }}
          />
        )}

        {formData.hostelId && loadingAvailability && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#525b88] mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading available rooms...</p>
          </div>
        )}

        {formData.hostelId && !loadingAvailability && (!availabilityData || !availabilityData.floors || availabilityData.floors.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">No available floors or rooms found for this hostel. Please check if floors and rooms are added in Hostel Master Data.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Joining Date
            </label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (months)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Per Month (₹)
              {loadingFeeStructure && (
                <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
              )}
            </label>
            <input
              type="number"
              name="feePerMonth"
              value={formData.feePerMonth}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              placeholder={formData.hostelName && formData.roomType ? "Auto-filled from fee structure" : "Select Hostel and Room Type to auto-fill"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Fee (₹) <span className="text-xs text-gray-500">(Auto-calculated)</span>
            </label>
            <input
              type="text"
              name="totalFee"
              value={formData.totalFee ? `₹${Number(formData.totalFee).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
              readOnly
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
              placeholder="Enter Duration and Fee Per Month to calculate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hostel Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Whether student is currently in hostel</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status *
            </label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
            >
              <option value="not_paid">Not Paid</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Payment status for hostel fees</p>
          </div>

          {(formData.paymentStatus === "paid" || formData.paymentStatus === "partial") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference
                </label>
                <input
                  type="text"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="e.g. UPI ID, Receipt No"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            placeholder="Optional remarks"
          />
        </div>
      </form>
    </Modal>
  );
};

/**
 * Room and Bed Selector Component (Bus Booking Style)
 */
const RoomBedSelector = ({
  availabilityData,
  loading,
  selectedFloor,
  selectedRoom,
  selectedBed,
  onFloorSelect,
  onRoomSelect,
  onBedSelect,
  application,
}) => {

  console.log("RoomBedSelector Render:", { availabilityData, selectedFloor: selectedFloor?._id });

  if (!availabilityData || !availabilityData.floors || !Array.isArray(availabilityData.floors)) {
    console.log("RoomBedSelector: No floors to display", availabilityData);
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Select Floor, Room & Bed
      </h3>

      {/* Floor Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Floor
        </label>
        <select
          value={selectedFloor?._id || ""}
          onChange={(e) => {
            const floor = availabilityData.floors.find(f => f._id === e.target.value);
            if (floor) onFloorSelect(floor);
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] bg-white"
        >
          <option value="">-- Choose Floor --</option>
          {availabilityData.floors.map((floor) => (
            <option key={floor._id} value={floor._id}>
              {floor.name || `Floor ${floor.floorNumber}`} ({floor.totalAvailableRooms} rooms available)
            </option>
          ))}
        </select>
      </div>

      {/* Room and Bed Selection Grid */}
      {selectedFloor && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Room & Bed (Floor {selectedFloor.floorNumber})
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFloor.rooms?.map((room) => (
              <div
                key={room._id}
                className={`border-2 rounded-xl p-4 transition-all ${selectedRoom?._id === room._id
                  ? "border-[#525b88] bg-white shadow-lg ring-1 ring-[#525b88]"
                  : "border-gray-200 bg-white hover:border-[#525b88]/30 hover:shadow-sm"
                  }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-gray-900">Room {room.roomNumber}</div>
                    <div className="text-xs text-gray-500">{room.roomType}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium ${room.availableBeds > 0 ? "text-green-600" : "text-red-500"}`}>
                      {room.availableBeds}/{room.totalBeds} Available
                    </div>
                  </div>
                </div>

                {/* Bed Icons Grid for this Room */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  {room.beds?.map((bed) => {
                    const isAvailable = bed.status === "available";
                    const isSelected = selectedBed?._id === bed._id;
                    const isOccupiedByMe = application && (
                      (application.bedId === bed._id || application.bedId?.toString() === bed._id.toString()) ||
                      (bed.isVirtual && application.bedNumber === bed.bedNumber)
                    );
                    const canSelect = isAvailable || isSelected || isOccupiedByMe;

                    return (
                      <button
                        key={bed._id}
                        type="button"
                        onClick={() => {
                          if (canSelect) {
                            onRoomSelect(room);
                            onBedSelect(bed);
                          }
                        }}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border-2 transition-all relative ${isSelected
                          ? "bg-[#525b88] border-[#525b88] text-white"
                          : canSelect
                            ? "bg-white border-green-200 text-green-700 hover:border-green-500 hover:bg-green-50"
                            : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        title={`Bed ${bed.bedNumber} - ${bed.status}`}
                      >
                        {/* Bed Icon */}
                        <svg className="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V5h16v2M4 9h16v10H4V9zm4 10v2m8-2v2" />
                        </svg>
                        <span className="text-[10px] font-bold">{bed.bedNumber.split('-').pop()}</span>

                        {isSelected && (
                          <div className="absolute -top-1 -right-1">
                            <CheckCircle className="w-4 h-4 text-white bg-[#525b88] rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend & Summary */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-white border-2 border-green-200 rounded"></div>
            <span>Available Bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-[#525b88] border-2 border-[#525b88] rounded"></div>
            <span>Selected</span>
          </div>
        </div>

        {(selectedRoom || selectedBed) && (
          <div className="text-sm font-medium text-[#525b88] px-3 py-1 bg-[#525b88]/10 rounded-full">
            Selection: Room {selectedRoom?.roomNumber} {selectedBed && `• Bed ${selectedBed.bedNumber}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;
