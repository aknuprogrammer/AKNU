import React, { useState, useEffect } from "react";
import { API } from "../../../config/urls";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";
import {
  seatingArrangementsApi,
  coursesApi,
  courseStreamMappingsApi,
  examinationCentersApi,
} from "../../../services/apiService";

const BundleManagement = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [scriptsWithDetails, setScriptsWithDetails] = useState([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examinationCenters, setExaminationCenters] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);

  const [newBundle, setNewBundle] = useState({
    courseId: "",
    streamId: "",
    semesterId: "",
    semesterNumber: "",
    subjectCode: "",
    subjectId: "",
    centerCode: "",
    scripts: [], // Array of selected script codes from seating arrangements
  });
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [seatingArrangements, setSeatingArrangements] = useState([]);
  const [loadingSeatingArrangements, setLoadingSeatingArrangements] =
    useState(false);
  const [availableScriptCodes, setAvailableScriptCodes] = useState([]);

  // Fetch bundles on component mount and when search term changes
  useEffect(() => {
    fetchBundles();
  }, [searchTerm]);

  // Fetch courses and centers on component mount
  useEffect(() => {
    fetchCourses();
    fetchExaminationCenters();
  }, []);

  // Fetch course-stream mappings when course is selected
  useEffect(() => {
    if (newBundle.courseId) {
      fetchCourseStreamMappings(newBundle.courseId);
    } else {
      setStreams([]);
      setSubjects([]);
      setNewBundle((prev) => ({
        ...prev,
        streamId: "",
        subjectCode: "",
        subjectId: "",
      }));
    }
  }, [newBundle.courseId]);

  // Fetch course-stream mappings when course and stream are selected
  useEffect(() => {
    if (newBundle.courseId && newBundle.streamId) {
      fetchCourseStreamMappingsForSemesters(newBundle.courseId, newBundle.streamId);
    } else {
      setAvailableSemesters([]);
      setSubjects([]);
      setNewBundle((prev) => ({
        ...prev,
        semesterId: "",
        semesterNumber: "",
        subjectCode: "",
        subjectId: "",
      }));
    }
  }, [newBundle.courseId, newBundle.streamId]);

  // Fetch subjects when semester is selected (from course-stream mappings)
  useEffect(() => {
    if (newBundle.courseId && newBundle.streamId && newBundle.semesterNumber && courseStreamMappings.length > 0) {
      fetchSubjectsFromMapping(newBundle.courseId, newBundle.streamId, newBundle.semesterNumber);
    } else {
      setSubjects([]);
      setNewBundle((prev) => ({ ...prev, subjectCode: "", subjectId: "" }));
    }
  }, [newBundle.semesterNumber, newBundle.streamId, newBundle.courseId, courseStreamMappings]);

  // Fetch scripts with details when modal opens
  useEffect(() => {
    if (showScriptsModal && selectedBundle?._id) {
      fetchScriptsForBundle(selectedBundle._id);
    } else {
      setScriptsWithDetails([]);
    }
  }, [showScriptsModal, selectedBundle]);

  // Fetch seating arrangements when center code is selected
  useEffect(() => {
    if (newBundle.centerCode && showCreateModal) {
      fetchSeatingArrangements();
    } else {
      setSeatingArrangements([]);
      setAvailableScriptCodes([]);
    }
  }, [newBundle.centerCode, showCreateModal]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await coursesApi.getAll();
      console.log("Courses Response:", response);
      // Handle both response formats: {success, data} or {statusCode, data}
      if (response.success || response.statusCode === 200 || response.data) {
        const coursesData = response.data || [];
        // Filter out courses that don't have required fields
        const validCourses = coursesData.filter(
          (course) => course && course._id && (course.name || course.code)
        );
        console.log(
          "Valid courses:",
          validCourses.length,
          "out of",
          coursesData.length
        );
        console.log("Sample course:", validCourses[0]);
        setCourses(validCourses);
      } else {
        console.warn("Unexpected response format:", response);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      showErrorMessage("Failed to load courses");
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchExaminationCenters = async () => {
    try {
      setLoadingCenters(true);
      const response = await examinationCentersApi.getAll();
      console.log("Examination Centers Response:", response);
      
      // Handle different response formats
      // API returns array directly: [{...}, {...}]
      // Or wrapped: {success: true, data: [...]} or {data: [...]}
      let centersData = [];
      
      if (Array.isArray(response)) {
        // Response is an array directly
        centersData = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Response is wrapped in data property
        centersData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        // Response has success flag and data array
        centersData = response.data;
      } else {
        console.warn("Unexpected response format for centers:", response);
        setExaminationCenters([]);
        return;
      }
      
      // Filter active centers and ensure they have code
      const validCenters = centersData.filter(
        (center) => 
          center && 
          center._id && 
          center.code && 
          (center.status === "Active" || !center.status)
      );
      
      console.log(
        "Valid examination centers:",
        validCenters.length,
        "out of",
        centersData.length
      );
      setExaminationCenters(validCenters);
    } catch (error) {
      console.error("Error fetching examination centers:", error);
      showErrorMessage("Failed to load examination centers");
      setExaminationCenters([]);
    } finally {
      setLoadingCenters(false);
    }
  };

  const fetchCourseStreamMappings = async (courseId) => {
    try {
      setLoadingStreams(true);
      const response = await courseStreamMappingsApi.getByCourse(
        courseId,
        true
      );
      console.log("Course-Stream Mappings Response:", response);

      if (response.success || response.data) {
        // Extract unique streams from course-stream mappings
        const mappings = response.data || [];
        console.log("Mappings found:", mappings.length);
        const streamMap = new Map();

        mappings.forEach((mapping) => {
          // streamId is populated as an object with _id, name, code
          if (mapping.streamId && mapping.status === "Active") {
            const streamId = mapping.streamId._id || mapping.streamId;
            const streamName = mapping.streamId.name;
            const streamCode = mapping.streamId.code;

            if (
              streamId &&
              streamName &&
              streamCode &&
              !streamMap.has(streamId.toString())
            ) {
              streamMap.set(streamId.toString(), {
                _id: streamId,
                name: streamName,
                code: streamCode,
              });
            }
          }
        });

        const uniqueStreams = Array.from(streamMap.values());
        console.log("Unique streams extracted:", uniqueStreams.length);
        setStreams(uniqueStreams);
      } else {
        console.warn("Unexpected response format for streams:", response);
        setStreams([]);
      }
    } catch (error) {
      console.error("Error fetching course-stream mappings:", error);
      showErrorMessage("Failed to load streams");
      setStreams([]);
    } finally {
      setLoadingStreams(false);
    }
  };

  // Fetch course-stream mappings to get available semesters
  const fetchCourseStreamMappingsForSemesters = async (courseId, streamId) => {
    try {
      const response = await courseStreamMappingsApi.getByCourseAndStream(
        courseId,
        streamId,
        true
      );
      console.log("Course-Stream Mappings for Semesters Response:", response);

      if (response.success || response.data) {
        const mappings = response.data || [];
        setCourseStreamMappings(mappings);

        // Extract unique semesters from mappings
        const semesterMap = new Map();
        mappings.forEach((mapping) => {
          const semesterNumber = mapping.semesterNumber;
          const semesterId =
            typeof mapping.semesterId === "object" && mapping.semesterId?._id
              ? mapping.semesterId._id
              : mapping.semesterId;

          if (semesterNumber && !semesterMap.has(semesterNumber)) {
            // Format semester display string
            const year = Math.ceil(semesterNumber / 2);
            const semesterInYear = ((semesterNumber - 1) % 2) + 1;
            const yearOrdinal =
              year === 1
                ? "1st"
                : year === 2
                ? "2nd"
                : year === 3
                ? "3rd"
                : `${year}th`;
            const semesterOrdinal =
              semesterInYear === 1
                ? "1st"
                : semesterInYear === 2
                ? "2nd"
                : semesterInYear === 3
                ? "3rd"
                : `${semesterInYear}th`;
            const semesterYear = `${yearOrdinal} Year - ${semesterOrdinal} Semester`;

            semesterMap.set(semesterNumber, {
              semesterNumber,
              semesterId,
              semesterYear,
            });
          }
        });

        const semesterArray = Array.from(semesterMap.values()).sort(
          (a, b) => a.semesterNumber - b.semesterNumber
        );
        setAvailableSemesters(semesterArray);
      } else {
        setAvailableSemesters([]);
        setCourseStreamMappings([]);
      }
    } catch (error) {
      console.error("Error fetching semesters from mapping:", error);
      setAvailableSemesters([]);
      setCourseStreamMappings([]);
    }
  };

  const fetchSubjectsFromMapping = async (courseId, streamId, semesterNumber) => {
    try {
      setLoadingSubjects(true);
      
      // Filter mappings by course, stream, and semesterNumber
      const relevantMappings = courseStreamMappings.filter((mapping) => {
        const mappingCourseId =
          typeof mapping.courseId === "object" && mapping.courseId?._id
            ? mapping.courseId._id
            : mapping.courseId;
        const mappingStreamId =
          typeof mapping.streamId === "object" && mapping.streamId?._id
            ? mapping.streamId._id
            : mapping.streamId;
        const mappingSemesterNumber = mapping.semesterNumber;

        return (
          mappingCourseId === courseId &&
          mappingStreamId === streamId &&
          mappingSemesterNumber === Number(semesterNumber) &&
          (mapping.status === "Active" || mapping.status === undefined)
        );
      });

      console.log("Relevant mappings for subjects:", relevantMappings.length);
      const subjectMap = new Map();

      relevantMappings.forEach((mapping) => {
        if (mapping.subjects && Array.isArray(mapping.subjects)) {
          mapping.subjects.forEach((subjectItem) => {
            // subjectId is populated as an object with _id, name, code
            if (subjectItem.subjectId) {
              const subjectId =
                subjectItem.subjectId._id || subjectItem.subjectId;
              const subjectName = subjectItem.subjectId.name;
              const subjectCode = subjectItem.subjectId.code;

              if (
                subjectId &&
                subjectName &&
                subjectCode &&
                !subjectMap.has(subjectId.toString())
              ) {
                subjectMap.set(subjectId.toString(), {
                  _id: subjectId,
                  name: subjectName,
                  code: subjectCode,
                });
              }
            }
          });
        }
      });

      const uniqueSubjects = Array.from(subjectMap.values());
      console.log("Unique subjects extracted:", uniqueSubjects.length);
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error("Error fetching subjects from mapping:", error);
      showErrorMessage("Failed to load subjects");
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchScriptsForBundle = async (bundleId) => {
    try {
      setLoadingScripts(true);
      const response = await API.get(`/examination/scripts/bundle/${bundleId}`);
      if (response.data.success) {
        setScriptsWithDetails(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching scripts:", error);
      setScriptsWithDetails([]);
    } finally {
      setLoadingScripts(false);
    }
  };

  const fetchSeatingArrangements = async () => {
    if (!newBundle.centerCode) {
      setSeatingArrangements([]);
      setAvailableScriptCodes([]);
      return;
    }

    try {
      setLoadingSeatingArrangements(true);
      // First, get all centers to find the center ID by code
      const centersResponse = await API.get("/examination/examination-centers");
      const centers = centersResponse.data || [];
      const center = centers.find(
        (c) => c.code?.toUpperCase() === newBundle.centerCode.toUpperCase()
      );

      if (!center) {
        setSeatingArrangements([]);
        setAvailableScriptCodes([]);
        return;
      }

      // Fetch seating arrangements for this center
      const response = await seatingArrangementsApi.getByCenter(center._id, {
        status: "Active",
      });

      if (response.success) {
        const arrangements = response.data || [];
        setSeatingArrangements(arrangements);

        // Extract unique script codes
        const scriptCodes = arrangements
          .map((arr) => arr.scriptCode)
          .filter((code) => code && code.trim() !== "")
          .filter((code, index, self) => self.indexOf(code) === index)
          .sort();

        setAvailableScriptCodes(scriptCodes);
      } else {
        setSeatingArrangements([]);
        setAvailableScriptCodes([]);
      }
    } catch (error) {
      console.error("Error fetching seating arrangements:", error);
      setSeatingArrangements([]);
      setAvailableScriptCodes([]);
    } finally {
      setLoadingSeatingArrangements(false);
    }
  };

  const fetchBundles = async () => {
    try {
      // Only show loader on initial load when there's no data
      if (initialLoading && bundles.length === 0) {
        setInitialLoading(true);
      }
      const params = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await API.get("/examination/bundles", { params });
      if (response.data.success) {
        setBundles(response.data.data || []);
      }
    } catch (error) {
      showAxiosError(error);
    } finally {
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  };

  // Handle script selection from dropdown
  const handleScriptSelection = (scriptCode) => {
    if (!scriptCode) return;

    const scriptCodeUpper = scriptCode.toUpperCase();
    if (newBundle.scripts.includes(scriptCodeUpper)) {
      // Remove if already selected
      setNewBundle({
        ...newBundle,
        scripts: newBundle.scripts.filter((s) => s !== scriptCodeUpper),
      });
    } else {
      // Add if not selected
      setNewBundle({
        ...newBundle,
        scripts: [...newBundle.scripts, scriptCodeUpper],
      });
    }
  };

  const handleCreateBundle = async () => {
    // Validate required fields
    if (
      !newBundle.courseId ||
      !newBundle.streamId ||
      !newBundle.semesterId ||
      !newBundle.subjectCode ||
      !newBundle.centerCode
    ) {
      showErrorMessage(
        "Please fill all required fields (Course, Stream, Semester, Subject, and Center Code)"
      );
      return;
    }

    // Validate scripts selection
    if (!newBundle.scripts || newBundle.scripts.length === 0) {
      showErrorMessage(
        "Please select at least one script number from seating arrangements"
      );
      return;
    }

    // Filter and validate script codes
    const validScripts = newBundle.scripts
      .map((s) => String(s).trim().toUpperCase())
      .filter((s) => s !== "");

    if (validScripts.length === 0) {
      showErrorMessage("Please select at least one script number");
      return;
    }

    // Check for duplicates (shouldn't happen with dropdown, but just in case)
    const uniqueScripts = [...new Set(validScripts)];
    if (uniqueScripts.length !== validScripts.length) {
      showErrorMessage(
        "Duplicate script numbers found. Please ensure all script numbers are unique."
      );
      return;
    }

    if (uniqueScripts.length > 50) {
      showErrorMessage(
        `Maximum 50 scripts allowed. You have selected ${uniqueScripts.length} scripts.`
      );
      return;
    }

    try {
      setLoading(true);
      const bundleData = {
        courseId: newBundle.courseId,
        streamId: newBundle.streamId,
        semesterId: newBundle.semesterId,
        subjectCode: newBundle.subjectCode,
        subjectId: newBundle.subjectId,
        centerCode: newBundle.centerCode,
        scripts: uniqueScripts,
        scriptCount: uniqueScripts.length,
      };
      console.log("Sending bundle data:", bundleData);
      const response = await API.post("/examination/bundles", bundleData);
      if (response.data.success) {
        showSuccessMessage(
          `Bundle created with ${uniqueScripts.length} script barcodes!`
        );
        setShowCreateModal(false);
        setNewBundle({
          courseId: "",
          streamId: "",
          semesterId: "",
          semesterNumber: "",
          subjectCode: "",
          subjectId: "",
          centerCode: "",
          scripts: [],
        });
        setStreams([]);
        setAvailableSemesters([]);
        setSubjects([]);
        setCourseStreamMappings([]);
        setSeatingArrangements([]);
        setAvailableScriptCodes([]);
        fetchBundles();
      }
    } catch (error) {
      console.error("Bundle creation error:", error);
      console.error("Error response:", error.response?.data);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (bundleId) => {
    try {
      setLoading(true);
      const response = await API.put(
        `/examination/bundles/${bundleId}/dispatch`
      );
      if (response.data.success) {
        showSuccessMessage("Bundle dispatched successfully");
        fetchBundles();
      }
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering is now done on the backend, but we can add client-side filtering if needed
  const filteredBundles = bundles;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Bundle Management
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Create, track, and manage script bundles from collection to spot
            valuation centre
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
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
            Create Bundle
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by barcode, subject code, or center code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bundles Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        <div className="overflow-y-auto max-h-[600px] thin-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Bundle Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Center
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Script Count
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Received At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialLoading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading bundles...
                  </td>
                </tr>
              ) : filteredBundles?.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No bundles found
                  </td>
                </tr>
              ) : (
                filteredBundles?.map((bundle) => (
                  <tr key={bundle._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bundle.barcode}
                      </div>
                      <div className="text-xs text-gray-500">
                        Bundle #{bundle.bundleNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bundle.subjectId?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {bundle.subjectCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bundle.centerId?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {bundle.centerCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {bundle.scriptCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          bundle.status === "AllScriptsRegistered"
                            ? "bg-purple-100 text-purple-800"
                            : bundle.status === "Received"
                            ? "bg-green-100 text-green-800"
                            : bundle.status === "Dispatched"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {bundle.status === "AllScriptsRegistered"
                          ? "All Scripts Registered"
                          : bundle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bundle.createdAt
                        ? new Date(bundle.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bundle.receivedAtSpotCentre
                        ? new Date(bundle.receivedAtSpotCentre).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {bundle.status === "Created" && (
                          <button
                            onClick={() => handleDispatch(bundle._id)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="Dispatch Bundle"
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
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Bundle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Create New Bundle</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
        setNewBundle({
          courseId: "",
          streamId: "",
          semesterId: "",
          semesterNumber: "",
          subjectCode: "",
          subjectId: "",
          centerCode: "",
          scripts: [],
        });
        setStreams([]);
        setAvailableSemesters([]);
        setSubjects([]);
        setCourseStreamMappings([]);
                  setSeatingArrangements([]);
                  setAvailableScriptCodes([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  {loadingCourses ? (
                    <div className="w-full px-3 py-2 border rounded-lg text-gray-500">
                      Loading courses...
                    </div>
                  ) : (
                    <select
                      value={newBundle.courseId}
                      onChange={(e) =>
                        setNewBundle({
                          ...newBundle,
                          courseId: e.target.value,
                          streamId: "",
                          semesterId: "",
                          semesterNumber: "",
                          subjectCode: "",
                          subjectId: "",
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a course</option>
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <option
                            key={course._id || course.id}
                            value={course._id || course.id}
                          >
                            {course.name || "Unnamed"} ({course.code || "N/A"})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No courses available
                        </option>
                      )}
                    </select>
                  )}
                </div>

                {/* Stream Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stream <span className="text-red-500">*</span>
                  </label>
                  {!newBundle.courseId ? (
                    <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Please select a course first
                    </div>
                  ) : loadingStreams ? (
                    <div className="w-full px-3 py-2 border rounded-lg text-gray-500">
                      Loading streams...
                    </div>
                  ) : (
                    <select
                      value={newBundle.streamId}
                      onChange={(e) =>
                        setNewBundle({
                          ...newBundle,
                          streamId: e.target.value,
                          semesterId: "",
                          semesterNumber: "",
                          subjectCode: "",
                          subjectId: "",
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a stream</option>
                      {streams.map((stream) => (
                        <option key={stream._id} value={stream._id}>
                          {stream.name} ({stream.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Semester Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  {!newBundle.streamId ? (
                    <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Please select a stream first
                    </div>
                  ) : availableSemesters.length === 0 ? (
                    <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm">
                      No semesters available
                    </div>
                  ) : (
                    <select
                      value={newBundle.semesterNumber}
                      onChange={(e) => {
                        const selectedSemester = availableSemesters.find(
                          (s) => s.semesterNumber === Number(e.target.value)
                        );
                        setNewBundle({
                          ...newBundle,
                          semesterNumber: e.target.value,
                          semesterId: selectedSemester?.semesterId || "",
                          subjectCode: "",
                          subjectId: "",
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a semester</option>
                      {availableSemesters.map((semester) => (
                        <option
                          key={semester.semesterNumber}
                          value={semester.semesterNumber}
                        >
                          {semester.semesterYear}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Subject Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  {!newBundle.semesterNumber ? (
                    <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Please select a semester first
                    </div>
                  ) : loadingSubjects ? (
                    <div className="w-full px-3 py-2 border rounded-lg text-gray-500">
                      Loading subjects...
                    </div>
                  ) : (
                    <select
                      value={newBundle.subjectCode}
                      onChange={(e) => {
                        const selectedSubject = subjects.find(
                          (s) => s.code === e.target.value
                        );
                        setNewBundle({
                          ...newBundle,
                          subjectCode: e.target.value,
                          subjectId: selectedSubject?._id || "",
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject.code}>
                          {subject.code} - {subject.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Center Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Center Code <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newBundle.centerCode}
                    onChange={(e) =>
                      setNewBundle({ ...newBundle, centerCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingCenters}
                  >
                    <option value="">
                      {loadingCenters ? "Loading centers..." : "Select Center Code"}
                    </option>
                    {examinationCenters.map((center) => (
                      <option key={center._id} value={center.code}>
                        {center.code} - {center.name || center.centerName || ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Script Numbers - Full Width */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Script Numbers <span className="text-red-500">*</span>
                </label>
                {!newBundle.centerCode ? (
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm">
                    Please enter Center Code first to load available script
                    numbers
                  </div>
                ) : loadingSeatingArrangements ? (
                  <div className="w-full px-3 py-2 border rounded-lg text-gray-500 text-sm">
                    Loading script numbers from seating arrangements...
                  </div>
                ) : availableScriptCodes.length === 0 ? (
                  <div className="w-full px-3 py-2 border rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                    No script numbers found for this center code. Please check
                    the center code or ensure seating arrangements are saved.
                  </div>
                ) : (
                  <>
                    <select
                      multiple
                      size={Math.min(10, availableScriptCodes.length)}
                      value={newBundle.scripts}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setNewBundle({ ...newBundle, scripts: selected });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {availableScriptCodes.map((scriptCode) => (
                        <option key={scriptCode} value={scriptCode}>
                          {scriptCode}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                      scripts. {newBundle.scripts.length} script(s) selected.
                      Maximum 50 scripts allowed.
                    </p>
                    {newBundle.scripts.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          Selected Scripts:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {newBundle.scripts.map((script) => (
                            <span
                              key={script}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                            >
                              {script}
                              <button
                                type="button"
                                onClick={() => handleScriptSelection(script)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Preview */}
              {newBundle.subjectCode && newBundle.scripts.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-900 mb-1">
                    Preview:
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    {newBundle.courseId && (
                      <div>
                        Course:{" "}
                        <span className="font-mono">
                          {courses.find((c) => c._id === newBundle.courseId)
                            ?.name || "N/A"}
                        </span>
                      </div>
                    )}
                    {newBundle.streamId && (
                      <div>
                        Stream:{" "}
                        <span className="font-mono">
                          {streams.find((s) => s._id === newBundle.streamId)
                            ?.name || "N/A"}
                        </span>
                      </div>
                    )}
                    <div>
                      Subject:{" "}
                      <span className="font-mono">{newBundle.subjectCode}</span>
                      {subjects.find(
                        (s) => s.code === newBundle.subjectCode
                      ) && (
                        <span className="ml-1">
                          (
                          {
                            subjects.find(
                              (s) => s.code === newBundle.subjectCode
                            ).name
                          }
                          )
                        </span>
                      )}
                    </div>
                    <div>
                      Center Code:{" "}
                      <span className="font-mono">{newBundle.centerCode}</span>
                    </div>
                    <div className="text-blue-600 font-medium mt-2">
                      Total: {newBundle.scripts.length} script(s) will be
                      created
                      {newBundle.scripts.length > 50 && (
                        <span className="block text-red-600">
                          ⚠ Maximum 50 scripts allowed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
        setNewBundle({
          courseId: "",
          streamId: "",
          semesterId: "",
          semesterNumber: "",
          subjectCode: "",
          subjectId: "",
          centerCode: "",
          scripts: [],
        });
        setStreams([]);
        setAvailableSemesters([]);
        setSubjects([]);
        setCourseStreamMappings([]);
                  setSeatingArrangements([]);
                  setAvailableScriptCodes([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBundle}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Bundle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Scripts Modal */}
      {showScriptsModal && selectedBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-xl font-semibold">Scripts in Bundle</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedBundle.barcode} -{" "}
                  {selectedBundle.registeredScriptsCount || 0} scripts
                  registered
                </p>
              </div>
              <button
                onClick={() => {
                  setShowScriptsModal(false);
                  setSelectedBundle(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <div className="p-6 overflow-y-auto flex-1">
              {loadingScripts ? (
                <div className="text-center text-gray-500 py-8">
                  Loading scripts...
                </div>
              ) : scriptsWithDetails.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Total Scripts:{" "}
                      <span className="font-semibold">
                        {scriptsWithDetails.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const scriptList = scriptsWithDetails
                          .map(
                            (s) =>
                              `${s.scriptBarcode}\t${
                                s.hallTicketNumber || "N/A"
                              }`
                          )
                          .join("\n");
                        navigator.clipboard.writeText(scriptList);
                        showSuccessMessage(
                          "Script details copied to clipboard!"
                        );
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                            Script Barcode
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Hall Ticket Number
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scriptsWithDetails.map((script, index) => (
                          <tr
                            key={script._id || index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 border-r border-gray-200">
                              <div className="flex items-center justify-between">
                                <span>{script.scriptBarcode}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      script.scriptBarcode
                                    );
                                    showSuccessMessage(
                                      `Copied: ${script.scriptBarcode}`
                                    );
                                  }}
                                  className="text-gray-400 hover:text-gray-600 ml-2"
                                  title="Copy Barcode"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {script.hallTicketNumber || (
                                <span className="text-gray-400 italic">
                                  N/A
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No scripts found in this bundle
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end flex-shrink-0">
              <button
                onClick={() => {
                  setShowScriptsModal(false);
                  setSelectedBundle(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleManagement;
