import React, { useState, useEffect } from "react";
import { coursesApi, courseStreamMappingsApi, streamsApi, semestersApi, subjectsApi } from "../../../services/apiService";
import AddFormModal from "./AddFormModal";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

const CoursesTable = ({ tabKey }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showMasterMappingForm, setShowMasterMappingForm] = useState(false);
  const [selectedCourseForMapping, setSelectedCourseForMapping] = useState(null);
  const [editingMasterMapping, setEditingMasterMapping] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedMappings, setExpandedMappings] = useState({});
  const [masterMappings, setMasterMappings] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchMasterMappings();
    fetchStreams();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsApi.getAll();
      const subjectsData = Array.isArray(response) ? response : (response?.data || []);
      // Filter active subjects
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          if (item.status !== undefined) {
            return item.status === 'Active';
          }
          return true;
        });
      };
      setSubjects(filterActive(subjectsData));
    } catch (err) {
      console.error("Failed to load subjects", err);
      setSubjects([]);
    }
  };

  const fetchMasterMappings = async () => {
    try {
      const response = await courseStreamMappingsApi.getAll();
      // Handle nested response structure
      const mappingsData = Array.isArray(response) 
        ? response 
        : (response?.data || []);
      setMasterMappings(mappingsData);
    } catch (err) {
      console.error("Failed to load course stream mappings", err);
      setMasterMappings([]);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await streamsApi.getAll();
      const streamsData = Array.isArray(response) ? response : (response?.data || []);
      // Filter active streams
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          if (item.status !== undefined) {
            return item.status === 'Active';
          }
          return true;
        });
      };
      setStreams(filterActive(streamsData));
    } catch (err) {
      console.error("Failed to load streams", err);
      setStreams([]);
    }
  };

  const toggleExpand = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const toggleMappingExpand = (mappingId) => {
    setExpandedMappings(prev => ({
      ...prev,
      [mappingId]: !prev[mappingId]
    }));
  };

  const getCourseMappings = (courseId) => {
    return masterMappings.filter(mapping => {
      // Handle both populated objects and IDs
      const mappingCourseId = typeof mapping.courseId === 'object' && mapping.courseId?._id 
        ? mapping.courseId._id 
        : mapping.courseId;
      return (mappingCourseId === courseId) && (mapping.status === 'Active' || mapping.status === undefined);
    });
  };

  const handleDeleteMasterMapping = async (mappingId) => {
    if (window.confirm("Are you sure you want to delete this mapping? This will set it to Inactive.")) {
      try {
        await courseStreamMappingsApi.delete(mappingId);
        await fetchMasterMappings(); // Refresh from API
        showSuccessMessage("Mapping deleted successfully (set to Inactive)");
      } catch (err) {
        const errorMessage = err.message || "Failed to delete mapping";
        showErrorMessage(errorMessage);
      }
    }
  };

  const handleEditMasterMapping = async (mapping) => {
    // Handle both populated objects and IDs
    const courseId = typeof mapping.courseId === 'object' && mapping.courseId?._id 
      ? mapping.courseId._id 
      : mapping.courseId;
    const streamId = typeof mapping.streamId === 'object' && mapping.streamId?._id 
      ? mapping.streamId._id 
      : mapping.streamId;
    const semesterId = typeof mapping.semesterId === 'object' && mapping.semesterId?._id 
      ? mapping.semesterId._id 
      : mapping.semesterId;
    
    // Fetch all mappings for this course-stream-semesterType combination
    try {
      const allMappings = await courseStreamMappingsApi.getAll({
        courseId: courseId,
        streamId: streamId,
        semesterId: semesterId
      });
      
      // Handle different response structures
      let mappingsData = [];
      if (Array.isArray(allMappings)) {
        mappingsData = allMappings;
      } else if (allMappings?.data) {
        if (Array.isArray(allMappings.data)) {
          mappingsData = allMappings.data;
        } else if (allMappings.data?.data && Array.isArray(allMappings.data.data)) {
          mappingsData = allMappings.data.data;
        }
      }
      
      // Create a combined mapping object with all semesters
      const combinedMapping = {
        ...mapping,
        _allMappings: mappingsData, // Store all mappings for reference
        courseId: courseId,
        streamId: streamId,
        semesterId: semesterId
      };
      
      setEditingMasterMapping(combinedMapping);
      setSelectedCourseForMapping(courses.find(c => (c._id || c.id) === courseId));
      setShowMasterMappingForm(true);
    } catch (err) {
      console.error("Failed to fetch all mappings:", err);
      // Fallback to single mapping edit
    setEditingMasterMapping(mapping);
      setSelectedCourseForMapping(courses.find(c => (c._id || c.id) === courseId));
    setShowMasterMappingForm(true);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use coursesApi which points to /api/courses_data endpoint
      const response = await coursesApi.getAll();
      
      // Handle nested response structure: { statusCode, data: [...], message }
      const coursesData = Array.isArray(response) 
        ? response 
        : (response?.data || []);
      
      // Filter out inactive records for display
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          if (item.status !== undefined) {
            return item.status === 'Active';
          }
          return true;
        });
      };
      
      setCourses(filterActive(coursesData));
      setError(null);
    } catch (err) {
      setError("Failed to load courses");
      showErrorMessage("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course? This will also set related Course Stream Mappings to Inactive.")) {
      try {
        // Use coursesApi which points to /api/courses_data endpoint (soft delete by default)
        await coursesApi.delete(id);
        await fetchCourses();
        showSuccessMessage("Course deleted successfully (set to Inactive)");
      } catch (err) {
        const errorMessage = err.message || "Failed to delete course";
        showErrorMessage(errorMessage);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Prepare payload
      const payload = {
        code: formData.code?.trim().toUpperCase() || "",
        name: formData.name?.trim() || "",
        duration: formData.duration ? (typeof formData.duration === 'string' ? parseInt(formData.duration) : formData.duration) : undefined,
        status: formData.status || "Active",
        comments: formData.comments?.trim() || "",
      };

      if (editingCourse) {
        const courseId = editingCourse._id || editingCourse.id;
        // Use coursesApi which points to /api/courses_data endpoint
        await coursesApi.update(courseId, payload);
        showSuccessMessage("Course updated successfully");
      } else {
        // Use coursesApi which points to /api/courses_data endpoint
        await coursesApi.create(payload);
        showSuccessMessage("Course created successfully");
      }
      
      await fetchCourses();
      setShowAddForm(false);
      setEditingCourse(null);
    } catch (err) {
      const errorMessage = err.message || "Failed to save course";
      showErrorMessage(errorMessage);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Courses</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage courses and programs
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null);
            setShowAddForm(true);
          }}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Course
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-12">
                
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Course Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Course Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Comments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                const courseId = course._id || course.id;
                const isExpanded = expandedCourses[courseId];
                const courseMappings = getCourseMappings(courseId);
                const hasMappings = courseMappings.length > 0;
                
                return (
                  <React.Fragment key={courseId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasMappings && (
                          <button
                            onClick={() => toggleExpand(courseId)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            <svg
                              className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.duration || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.comments || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            course.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {course.status || "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCourseForMapping(course);
                              setShowMasterMappingForm(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50 transition-colors"
                            title="Add Master Mapping"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingCourse(course);
                              setShowAddForm(true);
                            }}
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
                            onClick={() => handleDelete(course._id || course.id)}
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
                    {isExpanded && hasMappings && (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-6">
                            {(() => {
                              // Group mappings by stream
                              const groupedByStream = {};
                              courseMappings.forEach((mapping, mapIndex) => {
                                const streamId = typeof mapping.streamId === 'object' && mapping.streamId?._id 
                                  ? mapping.streamId._id 
                                  : mapping.streamId;
                                
                                if (!groupedByStream[streamId]) {
                                  groupedByStream[streamId] = [];
                                }
                                groupedByStream[streamId].push({ mapping, mapIndex });
                              });

                              // Render each stream group
                              return Object.entries(groupedByStream).map(([streamId, streamMappings]) => {
                                const firstMapping = streamMappings[0].mapping;
                                const stream = typeof firstMapping.streamId === 'object' && firstMapping.streamId?.name
                                  ? firstMapping.streamId
                                  : streams.find(s => (s._id || s.id) === streamId);
                                
                                // Get exam pattern from first mapping (should be same for all semesters in stream)
                                const examPattern = firstMapping.timePeriod || "-";
                                
                                // Sort mappings by semester number for better display
                                const sortedMappings = [...streamMappings].sort((a, b) => {
                                  const semA = a.mapping.semesterNumber || 0;
                                  const semB = b.mapping.semesterNumber || 0;
                                  return semA - semB;
                                });

                                return (
                                  <div key={streamId} className="bg-white border border-gray-200 rounded-lg p-4">
                                    {/* Stream Header */}
                                    <div className="mb-4 pb-3 border-b-2 border-gray-300">
                                      <div className="flex justify-between items-center">
                                        <h3 className="text-base font-semibold text-gray-800">
                                          Stream: {stream?.name || "-"}
                                        </h3>
                                        <div>
                                          <span className="text-xs font-medium text-gray-500">Exam Pattern:</span>
                                          <span className="ml-2 text-sm text-gray-700">{examPattern}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Semesters for this stream */}
                                    <div className="space-y-4">
                                      {sortedMappings.map(({ mapping, mapIndex }) => {
                                        const semesterId = typeof mapping.semesterId === 'object' && mapping.semesterId?._id 
                                          ? mapping.semesterId._id 
                                          : mapping.semesterId;
                                        
                                        const semester = typeof mapping.semesterId === 'object' && mapping.semesterId?._id
                                          ? mapping.semesterId
                                          : null;
                                        
                                        const subjectCount = Array.isArray(mapping.subjects) ? mapping.subjects.length : 0;
                                        const mappingId = mapping._id || mapping.id || `mapping_${mapIndex}`;
                                        const isMappingExpanded = expandedMappings[mappingId];
                                        
                                        return (
                                          <div key={mappingId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                                              <div className="flex items-start gap-3 flex-1">
                                                {subjectCount > 0 && (
                                                  <button
                                                    onClick={() => toggleMappingExpand(mappingId)}
                                                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors mt-1"
                                                    title={isMappingExpanded ? "Collapse subjects" : "Expand subjects"}
                                                  >
                                                    <svg
                                                      className={`w-4 h-4 transition-transform ${isMappingExpanded ? "rotate-90" : ""}`}
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                      />
                                                    </svg>
                                                  </button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                                  <div>
                                                    <span className="text-xs font-medium text-gray-500">Semester:</span>
                                                    <p className="text-sm text-gray-700">
                                                      {semester?.description || semester?.name || semester?.code || "-"}
                                                      {mapping.semesterNumber && (
                                                        <span className="ml-1 text-emerald-600 font-medium">
                                                          (Semester {mapping.semesterNumber})
                                                        </span>
                                                      )}
                                                    </p>
                                                    {subjectCount > 0 && (
                                                      <p className="text-xs text-gray-500 mt-1">{subjectCount} subject{subjectCount !== 1 ? 's' : ''}</p>
                                                    )}
                                                  </div>
                                                  {mapping.notes && (
                                                    <div>
                                                      <span className="text-xs font-medium text-gray-500">Notes:</span>
                                                      <p className="text-sm text-gray-700">{mapping.notes}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex items-center justify-end gap-2">
                                                <button
                                                  onClick={() => handleEditMasterMapping(mapping)}
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
                                                  onClick={() => handleDeleteMasterMapping(mapping._id)}
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
                                            </div>
                                            
                                            {/* Subjects - Collapsible */}
                                            {isMappingExpanded && Array.isArray(mapping.subjects) && mapping.subjects.length > 0 && (
                                              <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Subjects</h4>
                                                <div className="space-y-2">
                                                  {mapping.subjects.map((subj, subjIndex) => {
                                                    // Handle both populated objects and IDs
                                                    const subjectId = typeof subj.subjectId === 'object' && subj.subjectId?._id
                                                      ? subj.subjectId._id
                                                      : subj.subjectId;
                                                    const subject = typeof subj.subjectId === 'object' && subj.subjectId?.name
                                                      ? subj.subjectId
                                                      : subjects.find(s => (s._id || s.id) === subjectId);
                                                    
                                                    return (
                                                      <div key={subjIndex} className="bg-white p-3 rounded border border-gray-200">
                                                        <div className="flex justify-between items-start gap-4">
                                                          <div className="flex-1">
                                                            <p className="text-xs font-semibold text-gray-700 mb-1">
                                                              {subject ? `${subject.name} (${subject.code})` : `Subject ID: ${subjectId}`}
                                                            </p>
                                                            <div className="flex gap-4">
                                                              {subj.maxMarks !== undefined && (
                                                                <p className="text-xs text-gray-600">
                                                                  <span className="font-medium">Max Marks:</span> {subj.maxMarks}
                                                                </p>
                                                              )}
                                                              {subj.passMarks !== undefined && (
                                                                <p className="text-xs text-gray-600">
                                                                  <span className="font-medium">Pass Marks:</span> {subj.passMarks}
                                                                </p>
                                                              )}
                                                            </div>
                                                          </div>
                                                          {subject?.syllabus && (
                                                            <div className="flex-1 min-w-0">
                                                              <p className="text-xs font-medium text-gray-500 mb-1">Syllabus:</p>
                                                              <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">{subject.syllabus}</p>
                                                            </div>
                                                          )}
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
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <p className="text-gray-600">No courses found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add Course" to create one
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey="courses"
          initialData={editingCourse}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingCourse(null);
          }}
        />
      )}

      {showMasterMappingForm && (
        <AddFormModal
          tabKey="courseStreamMapping"
          initialData={editingMasterMapping ? editingMasterMapping : (selectedCourseForMapping ? { 
            courseId: selectedCourseForMapping._id || selectedCourseForMapping.id,
            course: selectedCourseForMapping // Pass full course object for display
          } : null)}
          onSubmit={async (formData) => {
            try {
              // Validate required fields
              if (!formData.courseId || !formData.streamId || !formData.semesterId) {
                showErrorMessage("Please fill in all required fields (Course, Stream, Semester Type)");
                return;
              }

              // Get semester object to validate semesterNumber
              const semesters = await semestersApi.getAll();
              const semestersData = Array.isArray(semesters) ? semesters : (semesters?.data || []);
              const selectedSemester = semestersData.find(s => (s._id || s.id) === formData.semesterId);
              
              if (!selectedSemester || !selectedSemester.numberOfSemesters) {
                showErrorMessage("Invalid semester type selected");
                return;
              }

              if (editingMasterMapping) {
                // Editing: Update/create/delete mappings for ALL semesters
                const semesterSubjects = formData.semesterSubjects || [];
                const allMappings = editingMasterMapping._allMappings || [editingMasterMapping];
                
                // Validate at least one semester has subjects
                const semestersWithSubjects = semesterSubjects.filter(s => 
                  Array.isArray(s.subjects) && s.subjects.length > 0
                );

                if (semestersWithSubjects.length === 0) {
                  showErrorMessage("Please select at least one subject for at least one semester");
                  return;
                }

                const updatedMappings = [];
                const createdMappings = [];
                const deletedMappings = [];
                const errors = [];

                // Process each semester
                for (const semData of semesterSubjects) {
                  const semesterNumber = semData.semester;
                  const hasSubjects = Array.isArray(semData.subjects) && semData.subjects.length > 0;
                  
                  // Validate semesterNumber
                  if (semesterNumber > selectedSemester.numberOfSemesters) {
                    errors.push(`Semester number ${semesterNumber} cannot exceed ${selectedSemester.numberOfSemesters}`);
                    continue;
                  }

                  // Find existing mapping for this semester
                  const existingMapping = allMappings.find(m => {
                    // Normalize semesterNumber from existing mapping
                    const mappingSemesterNumber = m.semesterNumber !== undefined && m.semesterNumber !== null
                      ? m.semesterNumber
                      : (typeof m.semesterId === 'object' && m.semesterId?.numberOfSemesters ? 1 : null);
                    return mappingSemesterNumber === semesterNumber;
                  });

                  if (hasSubjects) {
                    // Deduplicate subjects by subjectId
                    const uniqueSubjects = [];
                    const seenSubjectIds = new Set();
                    
                    semData.subjects.forEach(subj => {
                      const subjectId = typeof subj.subjectId === 'object' && subj.subjectId?._id
                        ? subj.subjectId._id
                        : subj.subjectId;
                      
                      if (subjectId && !seenSubjectIds.has(subjectId)) {
                        seenSubjectIds.add(subjectId);
                        uniqueSubjects.push({
                          subjectId: subjectId,
                          maxMarks: subj.maxMarks || 100,
                          passMarks: subj.passMarks || 40
                        });
                      }
                    });

                    // Validate at least one subject after deduplication
                    if (uniqueSubjects.length === 0) {
                      errors.push(`At least one subject is required for Semester ${semesterNumber}`);
                      continue;
                    }

                    // Prepare payload
              const payload = {
                courseId: formData.courseId,
                streamId: formData.streamId,
                      semesterId: formData.semesterId,
                      semesterNumber: semesterNumber,
                      subjects: uniqueSubjects,
                      timePeriod: formData.timePeriod?.trim() || "",
                      status: formData.status || "Active",
                      notes: formData.notes?.trim() || "",
                    };

                    if (existingMapping) {
                // Update existing mapping
                      try {
                        const mappingId = existingMapping._id || existingMapping.id;
                        await courseStreamMappingsApi.update(mappingId, payload);
                        updatedMappings.push(semesterNumber);
                      } catch (err) {
                        errors.push(`Semester ${semesterNumber}: ${err.message || 'Update failed'}`);
                      }
              } else {
                // Create new mapping
                      try {
                        await courseStreamMappingsApi.create(payload);
                        createdMappings.push(semesterNumber);
                      } catch (err) {
                        // Extract error message from various possible structures
                        let errorMsg = '';
                        if (typeof err === 'string') {
                          errorMsg = err;
                        } else if (err?.message) {
                          errorMsg = err.message;
                        } else if (err?.error) {
                          errorMsg = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
                        } else if (err?.response?.data) {
                          errorMsg = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
                        } else {
                          errorMsg = JSON.stringify(err);
                        }
                        
                        const errorMsgLower = errorMsg.toLowerCase();
                        if (errorMsgLower.includes('duplicate') || 
                            errorMsgLower.includes('already exists') ||
                            errorMsgLower.includes('e11000')) {
                          // Try to fetch and update existing mapping
                          try {
                            const existingResponse = await courseStreamMappingsApi.getAll({
                              courseId: formData.courseId,
                              streamId: formData.streamId,
                              semesterId: formData.semesterId
                            });
                            
                            // Handle different response structures
                            let existingData = [];
                            if (Array.isArray(existingResponse)) {
                              existingData = existingResponse;
                            } else if (existingResponse?.data && Array.isArray(existingResponse.data)) {
                              existingData = existingResponse.data;
                            } else if (existingResponse?.data?.data && Array.isArray(existingResponse.data.data)) {
                              existingData = existingResponse.data.data;
                            }
                            
                            // Normalize semesterNumber for comparison
                            const foundMapping = existingData.find(m => {
                              // Normalize IDs for comparison
                              const existingCourseId = typeof m.courseId === 'object' && m.courseId?._id
                                ? m.courseId._id
                                : m.courseId;
                              const existingStreamId = typeof m.streamId === 'object' && m.streamId?._id
                                ? m.streamId._id
                                : m.streamId;
                              const existingSemesterId = typeof m.semesterId === 'object' && m.semesterId?._id
                                ? m.semesterId._id
                                : m.semesterId;
                              
                              const mappingSemesterNumber = m.semesterNumber !== undefined && m.semesterNumber !== null
                                ? m.semesterNumber
                                : (typeof m.semesterId === 'object' && m.semesterId?.numberOfSemesters ? 1 : null);
                              
                              return existingCourseId === formData.courseId &&
                                     existingStreamId === formData.streamId &&
                                     existingSemesterId === formData.semesterId &&
                                     mappingSemesterNumber === semesterNumber;
                            });
                            
                            if (foundMapping) {
                              const mappingId = foundMapping._id || foundMapping.id;
                              if (mappingId) {
                                await courseStreamMappingsApi.update(mappingId, payload);
                                updatedMappings.push(semesterNumber);
                              } else {
                                errors.push(`Semester ${semesterNumber}: Found mapping but missing ID`);
                              }
                            } else {
                              // Mapping doesn't exist but duplicate error - might be a race condition
                              // Try creating again, or just report the error
                              console.warn(`Semester ${semesterNumber}: Duplicate error but mapping not found in existing data`, {
                                existingDataCount: existingData.length,
                                semesterNumber,
                                payload
                              });
                              errors.push(`Semester ${semesterNumber}: Mapping may already exist. Please refresh and try again.`);
                            }
                          } catch (updateErr) {
                            // Extract update error message
                            const updateErrorMsg = updateErr?.message || updateErr?.error || JSON.stringify(updateErr);
                            console.error(`Error updating Semester ${semesterNumber}:`, updateErr);
                            errors.push(`Semester ${semesterNumber}: ${updateErrorMsg}`);
                          }
                        } else {
                          errors.push(`Semester ${semesterNumber}: ${errorMsg}`);
                        }
                      }
                    }
                  } else if (existingMapping) {
                    // No subjects but mapping exists - delete it (soft delete)
                    try {
                      const mappingId = existingMapping._id || existingMapping.id;
                      await courseStreamMappingsApi.delete(mappingId);
                      deletedMappings.push(semesterNumber);
                    } catch (err) {
                      errors.push(`Semester ${semesterNumber}: ${err.message || 'Delete failed'}`);
                    }
                  }
                }

                // Show results
                if (errors.length > 0) {
                  showErrorMessage(`Some errors occurred: ${errors.join('; ')}`);
                }
                
                const successParts = [];
                if (updatedMappings.length > 0) {
                  successParts.push(`Updated ${updatedMappings.length} mapping(s) for semester(s): ${updatedMappings.join(', ')}`);
                }
                if (createdMappings.length > 0) {
                  successParts.push(`Created ${createdMappings.length} mapping(s) for semester(s): ${createdMappings.join(', ')}`);
                }
                if (deletedMappings.length > 0) {
                  successParts.push(`Deleted ${deletedMappings.length} empty mapping(s) for semester(s): ${deletedMappings.join(', ')}`);
                }
                
                if (successParts.length > 0) {
                  showSuccessMessage(successParts.join('. '));
                } else if (errors.length === 0) {
                  showSuccessMessage("No changes to save");
                }
              } else {
                // Adding: Create one mapping per semester number that has subjects
                const semesterSubjects = formData.semesterSubjects || [];
                console.log("Form data semesterSubjects:", semesterSubjects);
                console.log("Full formData:", formData);
                
                // Validate at least one semester has subjects
                const semestersWithSubjects = semesterSubjects.filter(s => {
                  const hasSubjects = Array.isArray(s.subjects) && s.subjects.length > 0;
                  console.log(`Semester ${s.semester}: hasSubjects=${hasSubjects}, subjects=`, s.subjects);
                  return hasSubjects;
                });

                if (semestersWithSubjects.length === 0) {
                  showErrorMessage("Please select at least one subject for at least one semester");
                  return;
                }

                // Check for existing mappings first to avoid duplicates
                let existingMappings = [];
                try {
                  const existingResponse = await courseStreamMappingsApi.getAll({
                    courseId: formData.courseId,
                    streamId: formData.streamId,
                    semesterId: formData.semesterId
                  });
                  const responseData = Array.isArray(existingResponse) 
                    ? existingResponse 
                    : (existingResponse?.data || []);
                  
                  // Normalize existing mappings to extract semesterNumber
                  existingMappings = responseData.map(m => ({
                    ...m,
                    semesterNumber: m.semesterNumber || 
                      (typeof m.semesterId === 'object' && m.semesterId?.numberOfSemesters ? 1 : null)
                  }));
                } catch (err) {
                  console.warn("Could not fetch existing mappings:", err);
                }

                // Track created and skipped mappings
                const createdMappings = [];
                const skippedMappings = [];
                const errors = [];

                // Process each semester sequentially to handle errors better
                console.log("Processing semesters with subjects:", semestersWithSubjects);
                for (const semData of semestersWithSubjects) {
                  const semesterNumber = semData.semester;
                  console.log(`Processing Semester ${semesterNumber}`, semData);
                  
                  // Validate semesterNumber
                  if (semesterNumber > selectedSemester.numberOfSemesters) {
                    errors.push(`Semester number ${semesterNumber} cannot exceed ${selectedSemester.numberOfSemesters}`);
                    continue;
                  }

                  // Check if mapping already exists
                  const existingMapping = existingMappings.find(m => {
                    // Normalize semesterNumber from existing mapping
                    const existingSemesterNumber = m.semesterNumber !== undefined && m.semesterNumber !== null
                      ? m.semesterNumber
                      : (typeof m.semesterId === 'object' && m.semesterId?.numberOfSemesters ? 1 : null);
                    
                    // Normalize IDs for comparison
                    const existingCourseId = typeof m.courseId === 'object' && m.courseId?._id
                      ? m.courseId._id
                      : m.courseId;
                    const existingStreamId = typeof m.streamId === 'object' && m.streamId?._id
                      ? m.streamId._id
                      : m.streamId;
                    const existingSemesterId = typeof m.semesterId === 'object' && m.semesterId?._id
                      ? m.semesterId._id
                      : m.semesterId;
                    
                    return existingCourseId === formData.courseId &&
                           existingStreamId === formData.streamId &&
                           existingSemesterId === formData.semesterId &&
                           existingSemesterNumber === semesterNumber;
                  });

                  if (existingMapping) {
                    console.log(`Semester ${semesterNumber} already exists, skipping`);
                    skippedMappings.push({
                      semesterNumber,
                      reason: "Mapping already exists"
                    });
                    continue;
                  }

                  // Deduplicate subjects by subjectId
                  const uniqueSubjects = [];
                  const seenSubjectIds = new Set();
                  
                  semData.subjects.forEach(subj => {
                    const subjectId = typeof subj.subjectId === 'object' && subj.subjectId?._id
                      ? subj.subjectId._id
                      : subj.subjectId;
                    
                    if (subjectId && !seenSubjectIds.has(subjectId)) {
                      seenSubjectIds.add(subjectId);
                      uniqueSubjects.push({
                        subjectId: subjectId,
                        maxMarks: subj.maxMarks || 100,
                        passMarks: subj.passMarks || 40
                      });
                    }
                  });

                  // Validate at least one subject after deduplication
                  if (uniqueSubjects.length === 0) {
                    errors.push(`At least one subject is required for Semester ${semesterNumber}`);
                    continue;
                  }

                  // Validate payload before sending
                  if (!formData.courseId || !formData.streamId || !formData.semesterId) {
                    errors.push(`Semester ${semesterNumber}: Missing required fields (courseId, streamId, or semesterId)`);
                    continue;
                  }
                  
                  if (semesterNumber < 1 || semesterNumber > selectedSemester.numberOfSemesters) {
                    errors.push(`Semester ${semesterNumber}: Invalid semester number (must be between 1 and ${selectedSemester.numberOfSemesters})`);
                    continue;
                  }
                  
                  if (uniqueSubjects.length === 0) {
                    errors.push(`Semester ${semesterNumber}: At least one subject is required`);
                    continue;
                  }
                  
                  // Validate each subject has required fields
                  const invalidSubjects = uniqueSubjects.filter(s => !s.subjectId || !s.maxMarks || s.passMarks === undefined);
                  if (invalidSubjects.length > 0) {
                    errors.push(`Semester ${semesterNumber}: Some subjects are missing required fields (subjectId, maxMarks, or passMarks)`);
                    continue;
                  }

                  // Prepare payload according to API structure
                  const payload = {
                    courseId: formData.courseId,
                    streamId: formData.streamId,
                    semesterId: formData.semesterId,
                    semesterNumber: semesterNumber,
                    subjects: uniqueSubjects,
                    timePeriod: formData.timePeriod?.trim() || "",
                    status: formData.status || "Active",
                    notes: formData.notes?.trim() || "",
                  };

                  console.log(`Creating mapping for Semester ${semesterNumber}:`, JSON.stringify(payload, null, 2));
                  try {
                    const response = await courseStreamMappingsApi.create(payload);
                    console.log(`Successfully created mapping for Semester ${semesterNumber}:`, response);
                    createdMappings.push(semesterNumber);
                  } catch (err) {
                    // apiRequest already parses the error and puts it in err.message
                    const errorMsg = err?.message || 'Unknown error';
                    console.error(`Error creating mapping for Semester ${semesterNumber}:`, {
                      error: err,
                      message: errorMsg,
                      status: err?.status,
                      payload: payload
                    });
                    
                    const errorMsgLower = errorMsg.toLowerCase();
                    if (errorMsgLower.includes('duplicate') || 
                        errorMsgLower.includes('already exists') ||
                        errorMsgLower.includes('e11000')) {
                      skippedMappings.push({
                        semesterNumber,
                        reason: "Mapping already exists"
                      });
                    } else {
                      errors.push(`Semester ${semesterNumber}: ${errorMsg}`);
                    }
                  }
                }

                // Show appropriate message based on results
                if (errors.length > 0) {
                  showErrorMessage(`Errors: ${errors.join('; ')}`);
                } else if (createdMappings.length === 0 && skippedMappings.length > 0) {
                  showErrorMessage("All mappings already exist. Please edit existing mappings instead.");
                } else if (createdMappings.length > 0) {
                  const message = `Successfully created ${createdMappings.length} mapping(s) for semester(s): ${createdMappings.join(', ')}`;
                  const skipMsg = skippedMappings.length > 0 
                    ? ` (${skippedMappings.length} already existed and were skipped)`
                    : '';
                  showSuccessMessage(message + skipMsg);
                }
              }
              
              await fetchMasterMappings(); // Refresh from API
              setShowMasterMappingForm(false);
              setSelectedCourseForMapping(null);
              setEditingMasterMapping(null);
            } catch (err) {
              const errorMessage = err.message || "Failed to save mapping";
              showErrorMessage(errorMessage);
            }
          }}
          onClose={() => {
            setShowMasterMappingForm(false);
            setSelectedCourseForMapping(null);
            setEditingMasterMapping(null);
          }}
        />
      )}
    </div>
  );
};

export default CoursesTable;

