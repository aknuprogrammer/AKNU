import React, { useState, useEffect } from "react";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import {
  Mail,
  MessageSquare,
  Users,
  User,
  Send,
  Filter,
  Search,
  CheckSquare,
  Square,
  X,
  MessageCircle,
  UserCircle,
  Building2,
} from "lucide-react";

export default function Communication() {
  const [activeTab, setActiveTab] = useState("student"); // student, parent, employee
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Student data
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Parent data
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);
  const [selectedParents, setSelectedParents] = useState([]);

  // Employee data
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Filters
  const [studentFilters, setStudentFilters] = useState({
    search: "",
    stream: "",
    course: "",
    class: "",
    section: "",
  });

  const [parentFilters, setParentFilters] = useState({
    search: "",
    studentStream: "",
    studentCourse: "",
  });

  const [employeeFilters, setEmployeeFilters] = useState({
    search: "",
    department: "",
    role: "",
  });

  // Message form
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
    sendEmail: true,
    sendWhatsApp: true,
  });

  // Static dummy data
  const staticStudents = [
    {
      _id: "1",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@student.aknu.edu.in",
      phone: "9876543210",
      registrationNumber: "AKNU2024001",
      stream: "Science",
      streamName: "Science",
      course: "B.Sc Computer Science",
      courseName: "B.Sc Computer Science",
      class: "1st Year",
      year: "1st Year",
      section: "A",
    },
    {
      _id: "2",
      name: "Priya Sharma",
      email: "priya.sharma@student.aknu.edu.in",
      phone: "9876543211",
      registrationNumber: "AKNU2024002",
      stream: "Science",
      streamName: "Science",
      course: "B.Sc Mathematics",
      courseName: "B.Sc Mathematics",
      class: "2nd Year",
      year: "2nd Year",
      section: "B",
    },
    {
      _id: "3",
      name: "Amit Patel",
      email: "amit.patel@student.aknu.edu.in",
      phone: "9876543212",
      registrationNumber: "AKNU2024003",
      stream: "Commerce",
      streamName: "Commerce",
      course: "B.Com",
      courseName: "B.Com",
      class: "1st Year",
      year: "1st Year",
      section: "A",
    },
    {
      _id: "4",
      name: "Sneha Reddy",
      email: "sneha.reddy@student.aknu.edu.in",
      phone: "9876543213",
      registrationNumber: "AKNU2024004",
      stream: "Arts",
      streamName: "Arts",
      course: "B.A English",
      courseName: "B.A English",
      class: "3rd Year",
      year: "3rd Year",
      section: "C",
    },
    {
      _id: "5",
      name: "Vikram Singh",
      email: "vikram.singh@student.aknu.edu.in",
      phone: "9876543214",
      registrationNumber: "AKNU2024005",
      stream: "Science",
      streamName: "Science",
      course: "B.Sc Physics",
      courseName: "B.Sc Physics",
      class: "2nd Year",
      year: "2nd Year",
      section: "A",
    },
    {
      _id: "6",
      name: "Anjali Mehta",
      email: "anjali.mehta@student.aknu.edu.in",
      phone: "9876543215",
      registrationNumber: "AKNU2024006",
      stream: "Commerce",
      streamName: "Commerce",
      course: "B.Com",
      courseName: "B.Com",
      class: "1st Year",
      year: "1st Year",
      section: "B",
    },
  ];

  const staticParents = [
    {
      _id: "p1",
      name: "Ramesh Kumar",
      email: "ramesh.kumar@email.com",
      phone: "9876543220",
      studentName: "Rajesh Kumar",
      relation: "Father",
      studentStream: "Science",
      studentCourse: "B.Sc Computer Science",
    },
    {
      _id: "p2",
      name: "Sunita Sharma",
      email: "sunita.sharma@email.com",
      phone: "9876543221",
      studentName: "Priya Sharma",
      relation: "Mother",
      studentStream: "Science",
      studentCourse: "B.Sc Mathematics",
    },
    {
      _id: "p3",
      name: "Mahesh Patel",
      email: "mahesh.patel@email.com",
      phone: "9876543222",
      studentName: "Amit Patel",
      relation: "Father",
      studentStream: "Commerce",
      studentCourse: "B.Com",
    },
    {
      _id: "p4",
      name: "Lakshmi Reddy",
      email: "lakshmi.reddy@email.com",
      phone: "9876543223",
      studentName: "Sneha Reddy",
      relation: "Mother",
      studentStream: "Arts",
      studentCourse: "B.A English",
    },
  ];

  const staticEmployees = [
    {
      _id: "e1",
      name: "Dr. Suresh Kumar",
      email: "suresh.kumar@aknu.edu.in",
      phone: "9876543301",
      employeeId: "EMP001",
      department: "Computer Science",
      departmentName: "Computer Science",
      role: "Professor",
      roleName: "Professor",
    },
    {
      _id: "e2",
      name: "Dr. Meera Devi",
      email: "meera.devi@aknu.edu.in",
      phone: "9876543302",
      employeeId: "EMP002",
      department: "Mathematics",
      departmentName: "Mathematics",
      role: "Associate Professor",
      roleName: "Associate Professor",
    },
    {
      _id: "e3",
      name: "Dr. Ravi Shankar",
      email: "ravi.shankar@aknu.edu.in",
      phone: "9876543303",
      employeeId: "EMP003",
      department: "Commerce",
      departmentName: "Commerce",
      role: "Assistant Professor",
      roleName: "Assistant Professor",
    },
    {
      _id: "e4",
      name: "Dr. Kavita Nair",
      email: "kavita.nair@aknu.edu.in",
      phone: "9876543304",
      employeeId: "EMP004",
      department: "English",
      departmentName: "English",
      role: "Professor",
      roleName: "Professor",
    },
    {
      _id: "e5",
      name: "Mr. Anil Kumar",
      email: "anil.kumar@aknu.edu.in",
      phone: "9876543305",
      employeeId: "EMP005",
      department: "Administration",
      departmentName: "Administration",
      role: "Admin Staff",
      roleName: "Admin Staff",
    },
  ];

  // Load static data
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      if (activeTab === "student") {
        setStudents(staticStudents);
        setFilteredStudents(staticStudents);
      } else if (activeTab === "parent") {
        setParents(staticParents);
        setFilteredParents(staticParents);
      } else if (activeTab === "employee") {
        setEmployees(staticEmployees);
        setFilteredEmployees(staticEmployees);
      }
      setLoading(false);
    }, 500);
  }, [activeTab]);

  // Filter students
  useEffect(() => {
    let filtered = students;

    if (studentFilters.search) {
      const searchTerm = studentFilters.search.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm) ||
          student.email?.toLowerCase().includes(searchTerm) ||
          student.registrationNumber?.toLowerCase().includes(searchTerm) ||
          student.studentId?.toLowerCase().includes(searchTerm)
      );
    }

    if (studentFilters.stream) {
      filtered = filtered.filter(
        (student) => student.stream?.toLowerCase() === studentFilters.stream.toLowerCase() ||
                    student.streamId === studentFilters.stream ||
                    student.streamName?.toLowerCase() === studentFilters.stream.toLowerCase()
      );
    }

    if (studentFilters.course) {
      filtered = filtered.filter(
        (student) => student.course?.toLowerCase() === studentFilters.course.toLowerCase() ||
                    student.courseId === studentFilters.course ||
                    student.courseName?.toLowerCase() === studentFilters.course.toLowerCase()
      );
    }

    if (studentFilters.class) {
      filtered = filtered.filter(
        (student) => student.class?.toLowerCase() === studentFilters.class.toLowerCase() ||
                    student.year?.toLowerCase() === studentFilters.class.toLowerCase()
      );
    }

    if (studentFilters.section) {
      filtered = filtered.filter(
        (student) => student.section?.toLowerCase() === studentFilters.section.toLowerCase()
      );
    }

    setFilteredStudents(filtered);
  }, [students, studentFilters]);

  // Filter parents
  useEffect(() => {
    let filtered = parents;

    if (parentFilters.search) {
      const searchTerm = parentFilters.search.toLowerCase();
      filtered = filtered.filter(
        (parent) =>
          parent.name?.toLowerCase().includes(searchTerm) ||
          parent.email?.toLowerCase().includes(searchTerm) ||
          parent.phone?.toLowerCase().includes(searchTerm) ||
          parent.studentName?.toLowerCase().includes(searchTerm)
      );
    }

    if (parentFilters.studentStream) {
      filtered = filtered.filter(
        (parent) => parent.studentStream?.toLowerCase() === parentFilters.studentStream.toLowerCase()
      );
    }

    if (parentFilters.studentCourse) {
      filtered = filtered.filter(
        (parent) => parent.studentCourse?.toLowerCase() === parentFilters.studentCourse.toLowerCase()
      );
    }

    setFilteredParents(filtered);
  }, [parents, parentFilters]);

  // Filter employees
  useEffect(() => {
    let filtered = employees;

    if (employeeFilters.search) {
      const searchTerm = employeeFilters.search.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(searchTerm) ||
          emp.email?.toLowerCase().includes(searchTerm) ||
          emp.employeeId?.toLowerCase().includes(searchTerm)
      );
    }

    if (employeeFilters.department) {
      filtered = filtered.filter(
        (emp) => emp.department?.toLowerCase() === employeeFilters.department.toLowerCase() ||
                 emp.departmentId === employeeFilters.department
      );
    }

    if (employeeFilters.role) {
      filtered = filtered.filter(
        (emp) => emp.role?.toLowerCase() === employeeFilters.role.toLowerCase() ||
                 emp.roleId === employeeFilters.role
      );
    }

    setFilteredEmployees(filtered);
  }, [employees, employeeFilters]);

  // Get unique filter values for dropdowns
  const getUniqueStreams = () => {
    const streams = students
      .map((s) => s.stream || s.streamName)
      .filter((s) => s);
    return [...new Set(streams)];
  };

  const getUniqueCourses = () => {
    const courses = students
      .map((s) => s.course || s.courseName)
      .filter((c) => c);
    return [...new Set(courses)];
  };

  const getUniqueClasses = () => {
    const classes = students
      .map((s) => s.class || s.year)
      .filter((c) => c);
    return [...new Set(classes)];
  };

  const getUniqueSections = () => {
    const sections = students
      .map((s) => s.section)
      .filter((s) => s);
    return [...new Set(sections)];
  };

  // Selection handlers
  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s._id || s.id));
    }
  };

  const handleSelectParent = (parentId) => {
    setSelectedParents((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  };

  const handleSelectAllParents = () => {
    if (selectedParents.length === filteredParents.length) {
      setSelectedParents([]);
    } else {
      setSelectedParents(filteredParents.map((p) => p._id || p.id));
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((e) => e._id || e.id));
    }
  };

  // Open message modal
  const handleOpenMessageModal = () => {
    if (activeTab === "student" && selectedStudents.length === 0) {
      showAxiosError({ response: { data: { message: "Please select at least one student" } } });
      return;
    }
    if (activeTab === "parent" && selectedParents.length === 0) {
      showAxiosError({ response: { data: { message: "Please select at least one parent" } } });
      return;
    }
    if (activeTab === "employee" && selectedEmployees.length === 0) {
      showAxiosError({ response: { data: { message: "Please select at least one employee" } } });
      return;
    }
    setShowMessageModal(true);
  };

  // Send message (static - no API call)
  const handleSendMessage = async () => {
    if (!messageForm.subject.trim() || !messageForm.message.trim()) {
      showAxiosError({ response: { data: { message: "Subject and message are required" } } });
      return;
    }

    if (!messageForm.sendEmail && !messageForm.sendWhatsApp) {
      showAxiosError({ response: { data: { message: "Please select at least one delivery method" } } });
      return;
    }

    setSending(true);
    
    // Simulate API delay
    setTimeout(() => {
      const recipientCount = getSelectedCount();
      const methods = [];
      if (messageForm.sendEmail) methods.push("Email");
      if (messageForm.sendWhatsApp) methods.push("WhatsApp");
      
      showSuccessMessage(
        `Message sent successfully to ${recipientCount} ${activeTab}${recipientCount !== 1 ? "s" : ""} via ${methods.join(" and ")}!`
      );
      
      // Reset form and selections
      setMessageForm({ subject: "", message: "", sendEmail: true, sendWhatsApp: true });
      setSelectedStudents([]);
      setSelectedParents([]);
      setSelectedEmployees([]);
      setShowMessageModal(false);
      setSending(false);
    }, 1500);
  };

  const resetFilters = () => {
    if (activeTab === "student") {
      setStudentFilters({ search: "", stream: "", course: "", class: "", section: "" });
    } else if (activeTab === "parent") {
      setParentFilters({ search: "", studentStream: "", studentCourse: "" });
    } else if (activeTab === "employee") {
      setEmployeeFilters({ search: "", department: "", role: "" });
    }
  };

  const getSelectedCount = () => {
    if (activeTab === "student") return selectedStudents.length;
    if (activeTab === "parent") return selectedParents.length;
    return selectedEmployees.length;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#525B88]">Communication</h1>
        <p className="text-gray-600 mt-1">
          Send messages to students, parents, or employees via Email and WhatsApp
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab("student");
              setSelectedStudents([]);
            }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "student"
                ? "text-[#525B88] border-b-2 border-[#525B88] bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              <span>Student</span>
              {activeTab === "student" && selectedStudents.length > 0 && (
                <span className="bg-[#525B88] text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedStudents.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("parent");
              setSelectedParents([]);
            }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "parent"
                ? "text-[#525B88] border-b-2 border-[#525B88] bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              <span>Parent</span>
              {activeTab === "parent" && selectedParents.length > 0 && (
                <span className="bg-[#525B88] text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedParents.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("employee");
              setSelectedEmployees([]);
            }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "employee"
                ? "text-[#525B88] border-b-2 border-[#525B88] bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building2 className="h-5 w-5" />
              <span>Employee</span>
              {activeTab === "employee" && selectedEmployees.length > 0 && (
                <span className="bg-[#525B88] text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedEmployees.length}
                </span>
              )}
            </div>
          </button>
        </div>

        <div className="p-4">
          {/* Filters - Student Tab */}
          {activeTab === "student" && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <div className="flex-1 min-w-[150px]">
                <input
                  type="text"
                  placeholder="Search by name, email, ID..."
                  value={studentFilters.search}
                  onChange={(e) =>
                    setStudentFilters({ ...studentFilters, search: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <select
                  value={studentFilters.stream}
                  onChange={(e) =>
                    setStudentFilters({ ...studentFilters, stream: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                  <option value="">All Streams</option>
                  {getUniqueStreams().map((stream) => (
                    <option key={stream} value={stream}>
                      {stream}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <select
                  value={studentFilters.course}
                  onChange={(e) =>
                    setStudentFilters({ ...studentFilters, course: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                  <option value="">All Courses</option>
                  {getUniqueCourses().map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <select
                  value={studentFilters.class}
                  onChange={(e) =>
                    setStudentFilters({ ...studentFilters, class: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                  <option value="">All Classes</option>
                  {getUniqueClasses().map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <select
                  value={studentFilters.section}
                  onChange={(e) =>
                    setStudentFilters({ ...studentFilters, section: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                  <option value="">All Sections</option>
                  {getUniqueSections().map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          )}

          {/* Filters - Parent Tab */}
          {activeTab === "parent" && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <div className="flex-1 min-w-[150px]">
                <input
                  type="text"
                  placeholder="Search parent..."
                  value={parentFilters.search}
                  onChange={(e) =>
                    setParentFilters({ ...parentFilters, search: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <select
                  value={parentFilters.studentStream}
                  onChange={(e) =>
                    setParentFilters({ ...parentFilters, studentStream: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                  <option value="">All Streams</option>
                  {getUniqueStreams().map((stream) => (
                    <option key={stream} value={stream}>
                      {stream}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <select
                  value={parentFilters.studentCourse}
                  onChange={(e) =>
                    setParentFilters({ ...parentFilters, studentCourse: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                  <option value="">All Courses</option>
                  {getUniqueCourses().map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          )}

          {/* Filters - Employee Tab */}
          {activeTab === "employee" && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <div className="flex-1 min-w-[150px]">
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={employeeFilters.search}
                  onChange={(e) =>
                    setEmployeeFilters({ ...employeeFilters, search: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <input
                  type="text"
                  placeholder="Department"
                  value={employeeFilters.department}
                  onChange={(e) =>
                    setEmployeeFilters({ ...employeeFilters, department: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <input
                  type="text"
                  placeholder="Role"
                  value={employeeFilters.role}
                  onChange={(e) =>
                    setEmployeeFilters({ ...employeeFilters, role: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {activeTab === "student" && (
                <>
                  Showing {filteredStudents.length} of {students.length} students
                  {selectedStudents.length > 0 && (
                    <span className="ml-2 font-semibold text-[#525B88]">
                      • {selectedStudents.length} selected
                    </span>
                  )}
                </>
              )}
              {activeTab === "parent" && (
                <>
                  Showing {filteredParents.length} of {parents.length} parents
                  {selectedParents.length > 0 && (
                    <span className="ml-2 font-semibold text-[#525B88]">
                      • {selectedParents.length} selected
                    </span>
                  )}
                </>
              )}
              {activeTab === "employee" && (
                <>
                  Showing {filteredEmployees.length} of {employees.length} employees
                  {selectedEmployees.length > 0 && (
                    <span className="ml-2 font-semibold text-[#525B88]">
                      • {selectedEmployees.length} selected
                    </span>
                  )}
                </>
              )}
            </div>
            {getSelectedCount() > 0 && (
              <button
                onClick={handleOpenMessageModal}
                className="flex items-center gap-2 bg-[#525B88] text-white px-4 py-2 rounded-md hover:bg-[#3a4166] transition-colors font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                Send Message ({getSelectedCount()})
              </button>
            )}
          </div>

          {/* Student List */}
          {activeTab === "student" && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#525b88]">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <button
                            onClick={handleSelectAllStudents}
                            className="text-white"
                          >
                            {selectedStudents.length === filteredStudents.length &&
                            filteredStudents.length > 0 ? (
                              <CheckSquare className="h-5 w-5" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Registration No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Stream/Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Class/Section
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => {
                          const isSelected = selectedStudents.includes(student._id || student.id);
                          return (
                            <tr
                              key={student._id || student.id}
                              className={`hover:bg-gray-50 transition-colors ${
                                isSelected ? "bg-blue-50" : ""
                              }`}
                            >
                              <td className="px-4 py-4">
                                <button
                                  onClick={() =>
                                    handleSelectStudent(student._id || student.id)
                                  }
                                  className="text-[#525B88]"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-5 w-5" />
                                  ) : (
                                    <Square className="h-5 w-5" />
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {student.name || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {student.email || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {student.phone || student.mobile || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {student.registrationNumber ||
                                  student.registrationNo ||
                                  student.studentId ||
                                  "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {student.stream || student.streamName || "-"} /{" "}
                                {student.course || student.courseName || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {student.class || student.year || "-"} /{" "}
                                {student.section || "-"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No students found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Parent List */}
          {activeTab === "parent" && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#525b88]">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <button
                            onClick={handleSelectAllParents}
                            className="text-white"
                          >
                            {selectedParents.length === filteredParents.length &&
                            filteredParents.length > 0 ? (
                              <CheckSquare className="h-5 w-5" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Parent Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Relation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredParents.length > 0 ? (
                        filteredParents.map((parent) => {
                          const isSelected = selectedParents.includes(parent._id || parent.id);
                          return (
                            <tr
                              key={parent._id || parent.id}
                              className={`hover:bg-gray-50 transition-colors ${
                                isSelected ? "bg-blue-50" : ""
                              }`}
                            >
                              <td className="px-4 py-4">
                                <button
                                  onClick={() =>
                                    handleSelectParent(parent._id || parent.id)
                                  }
                                  className="text-[#525B88]"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-5 w-5" />
                                  ) : (
                                    <Square className="h-5 w-5" />
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {parent.name || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {parent.email || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {parent.phone || parent.mobile || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {parent.studentName || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {parent.relation || parent.relationship || "-"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No parents found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Employee List */}
          {activeTab === "employee" && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#525b88]">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <button
                            onClick={handleSelectAllEmployees}
                            className="text-white"
                          >
                            {selectedEmployees.length === filteredEmployees.length &&
                            filteredEmployees.length > 0 ? (
                              <CheckSquare className="h-5 w-5" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Employee ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => {
                          const isSelected = selectedEmployees.includes(
                            employee._id || employee.id
                          );
                          return (
                            <tr
                              key={employee._id || employee.id}
                              className={`hover:bg-gray-50 transition-colors ${
                                isSelected ? "bg-blue-50" : ""
                              }`}
                            >
                              <td className="px-4 py-4">
                                <button
                                  onClick={() =>
                                    handleSelectEmployee(employee._id || employee.id)
                                  }
                                  className="text-[#525B88]"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-5 w-5" />
                                  ) : (
                                    <Square className="h-5 w-5" />
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {employee.name || employee.employeeName || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {employee.email || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {employee.phone || employee.mobile || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {employee.employeeId || employee.employeeID || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {employee.department || employee.departmentName || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {employee.role || employee.roleName || "-"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No employees found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                Send Message to {activeTab === "student" ? "Students" : activeTab === "parent" ? "Parents" : "Employees"}
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>{getSelectedCount()}</strong> {activeTab}
                  {getSelectedCount() !== 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Message will be sent to selected recipients via Email and/or WhatsApp
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, subject: e.target.value })
                  }
                  placeholder="Enter message subject"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, message: e.target.value })
                  }
                  rows={8}
                  placeholder="Enter your message here..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Methods
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageForm.sendEmail}
                      onChange={(e) =>
                        setMessageForm({
                          ...messageForm,
                          sendEmail: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-[#525B88] border-gray-300 rounded focus:ring-[#525B88]"
                    />
                    <Mail className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageForm.sendWhatsApp}
                      onChange={(e) =>
                        setMessageForm({
                          ...messageForm,
                          sendWhatsApp: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-[#525B88] border-gray-300 rounded focus:ring-[#525B88]"
                    />
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">WhatsApp</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending}
                className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-[#525B88]/20 bg-gradient-to-r from-[#525B88] to-[#3a4166] hover:from-[#3a4166] hover:to-[#2d3450] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88] disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

