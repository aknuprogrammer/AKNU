import { BASE_URL as CONFIG_BASE_URL } from "../config/urls";

export const BASE_URL = CONFIG_BASE_URL;

// Helper function for API calls
export const apiRequest = async (endpoint, method = "GET", body = null) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add Authorization header if token exists
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}/${endpoint}`, options);

  if (!response.ok) {
    // Try to parse error response
    let errorMessage = `API request failed: ${response.status}`;
    let errorData = null;
    let responseText = null;

    try {
      // First, try to get the response as text (in case it's not JSON)
      responseText = await response.clone().text();

      // Try to parse as JSON
      try {
        errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Handle validation errors with details
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorDetails = errorData.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join(", ");
          if (errorDetails) {
            errorMessage = `${errorMessage} - ${errorDetails}`;
          }
        }
        if (errorData.error) {
          // Handle MongoDB duplicate key errors
          if (
            typeof errorData.error === "string" &&
            errorData.error.includes("E11000") &&
            errorData.error.includes("duplicate key")
          ) {
            if (errorData.error.includes("invigilatorCode")) {
              errorMessage = `Invigilator code already exists. Please use a different code.`;
            } else if (errorData.error.includes("code")) {
              errorMessage = `Code already exists. Please use a different code.`;
            } else {
              errorMessage = `Duplicate entry. This record already exists.`;
            }
          } else {
            errorMessage =
              errorData.message ||
              (typeof errorData.error === "string"
                ? errorData.error
                : JSON.stringify(errorData.error)) ||
              errorMessage;
          }
        }
      } catch (jsonError) {
        // If JSON parsing fails, use the text response
        if (responseText) {
          errorMessage = responseText.substring(0, 500); // Limit length
        } else {
          errorMessage = response.statusText || errorMessage;
        }
      }
    } catch (parseError) {
      // If we can't even get the text, use status text
      errorMessage = response.statusText || errorMessage;
      console.error("Error parsing response:", parseError);
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.response = response;
    if (errorData) {
      error.errorData = errorData; // Store parsed error data
      error.responseData = errorData; // Also store as responseData for compatibility
    }
    if (responseText) {
      error.responseText = responseText; // Store raw response text for debugging
    }
    throw error;
  }
  return await response.json();
};

// Helper function for multipart/form-data requests
const apiMultipartRequest = async (endpoint, method = "POST", formData) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  const options = {
    method,
    body: formData, // let browser set correct headers
    headers: {},
  };

  // Add Authorization header if token exists
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/${endpoint}`, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }
  return await response.json();
};

export default apiMultipartRequest;

// College API
export const collegeApi = {
  getAll: () => apiRequest("colleges"),
  create: (data) => apiRequest("colleges", "POST", data),
  update: (id, data) => apiRequest(`colleges/${id}`, "PUT", data),
  delete: (id) => apiRequest(`colleges/${id}`, "DELETE"),
};

// Application Purpose API
export const applicationPurposeApi = {
  getAll: () => apiRequest("application-purposes"),
  getById: (id) => apiRequest(`application-purposes/${id}`),
  create: (data) => apiRequest("application-purposes", "POST", data),
  update: (id, data) => apiRequest(`application-purposes/${id}`, "PUT", data),
  delete: (id) => apiRequest(`application-purposes/${id}`, "DELETE"),
};

export const collegesApi = {
  getAll: () => apiRequest("colleges_data"),
  getById: (id) => apiRequest(`colleges_data/${id}`),
  getByType: (collegeTypeId) =>
    apiRequest(`colleges_data/type/${collegeTypeId}`),
  getByCategory: (collegeCategoryId) =>
    apiRequest(`colleges_data/category/${collegeCategoryId}`),
  getByCourseCategory: (courseCategoryId) =>
    apiRequest(`colleges_data/course-category/${courseCategoryId}`),
  getByLocation: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`colleges_data/location?${queryString}`);
  },
  getByStatus: (status) => apiRequest(`colleges_data/status/${status}`),
  getByClassification: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`colleges_data/classification?${queryString}`);
  },
  create: (data) => apiRequest("colleges_data", "POST", data),
  update: (id, data) => apiRequest(`colleges_data/${id}`, "PUT", data),
  delete: (id) => apiRequest(`colleges_data/${id}`, "DELETE"),
};

export const coursesApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(`courses_data${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiRequest(`courses_data/${id}`),
  create: (data) => apiRequest("courses_data", "POST", data),
  update: (id, data) => apiRequest(`courses_data/${id}`, "PUT", data),
  restore: (id) => apiRequest(`courses_data/${id}/restore`, "PUT"),
  delete: (id, params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `courses_data/${id}${queryString ? `?${queryString}` : ""}`,
      "DELETE"
    );
  },
};

export const collegeCourseMappingApi = {
  getAll: () => apiRequest("mappings"),
  getById: (id) => apiRequest(`mappings/${id}`),
  create: (data) => apiRequest("mappings", "POST", data),
  update: (id, data) => apiRequest(`mappings/${id}`, "PUT", data),
  delete: (id) => apiRequest(`mappings/${id}`, "DELETE"),
};

export const apscheAllotmentsApi = {
  getAll: () => apiRequest("apsche_allotements"),
  getById: (id) => apiRequest(`apsche_allotements/${id}`),
  create: (formData) =>
    apiMultipartRequest("apsche_allotements", "POST", formData),
  update: (id, data) => apiRequest(`apsche_allotements/${id}`, "PUT", data),
  delete: (id) => apiRequest(`apsche_allotements/${id}`, "DELETE"),
};

export const certificateChecklistApi = {
  getAll: () => apiRequest("certificate-checklist"),
  getById: (id) => apiRequest(`certificate-checklist/${id}`),
  create: (data) => apiRequest("certificate-checklist", "POST", data),
  update: (id, data) => apiRequest(`certificate-checklist/${id}`, "PUT", data),
  delete: (id) => apiRequest(`certificate-checklist/${id}`, "DELETE"),
};

export const admissionFeesApi = {
  getAll: () => apiRequest("admission_fees"),
  getById: (id) => apiRequest(`admission_fees/${id}`),
  getByCourseAndCampus: (courseId, campusId) =>
    apiRequest(`admission_fees/course/${courseId}/campus/${campusId}`),
  create: (data) => apiRequest("admission_fees", "POST", data),
  update: (id, data) => apiRequest(`admission_fees/${id}`, "PUT", data),
  delete: (id) => apiRequest(`admission_fees/${id}`, "DELETE"),
};

export const datePicker = {
  getAll: () => apiRequest("date-picker"),
  getById: (id) => apiRequest(`date-picker/${id}`),
  create: (data) => apiRequest("date-picker", "POST", data),
  update: (id, data) => apiRequest(`date-picker/${id}`, "PUT", data),
  delete: (id) => apiRequest(`date-picker/${id}`, "DELETE"),
};

export const otherFeesApi = {
  getAll: () => apiRequest("other_fee"),
  getById: (id) => apiRequest(`other_fee/${id}`),
  create: (data) => apiRequest("other_fee", "POST", data),
  update: (id, data) => apiRequest(`other_fee/${id}`, "PUT", data),
  delete: (id) => apiRequest(`other_fee/${id}`, "DELETE"),
};

export const studentsApi = {
  getAll: () => apiRequest("students/getAll"),
  getById: (id) => apiRequest(`students/${id}`),
  getByCollege: (collegeCode) => apiRequest(`students/college/${collegeCode}`), // 👈 needs backend support
  getByHallTicketRange: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`students/hall-ticket-range?${queryString}`);
  },
  getByFilters: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`students/by-filters?${queryString}`);
  },
  getByRegistrationNumber: (regNo) =>
    apiRequest(`students/registration/${regNo}`),
  create: (data) => apiRequest("students", "POST", data),
  update: (id, data) => apiRequest(`students/${id}`, "PUT", data),
  delete: (id) => apiRequest(`students/${id}`, "DELETE"),
};

// Examination Configuration APIs
export const collegeTypesApi = {
  getAll: () => apiRequest("examination/college-types"),
  getById: (id) => apiRequest(`examination/college-types/${id}`),
  create: (data) => apiRequest("examination/college-types", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/college-types/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/college-types/${id}`, "DELETE"),
};

export const collegeCategoriesApi = {
  getAll: () => apiRequest("examination/college-categories"),
  getById: (id) => apiRequest(`examination/college-categories/${id}`),
  create: (data) => apiRequest("examination/college-categories", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/college-categories/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/college-categories/${id}`, "DELETE"),
};

export const collegeOtherCategoriesApi = {
  getAll: () => apiRequest("examination/college-other-categories"),
  getById: (id) => apiRequest(`examination/college-other-categories/${id}`),
  create: (data) =>
    apiRequest("examination/college-other-categories", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/college-other-categories/${id}`, "PUT", data),
  delete: (id) =>
    apiRequest(`examination/college-other-categories/${id}`, "DELETE"),
};

export const examCategoriesApi = {
  getAll: () => apiRequest("examination/exam-categories"),
  getById: (id) => apiRequest(`examination/exam-categories/${id}`),
  create: (data) => apiRequest("examination/exam-categories", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/exam-categories/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/exam-categories/${id}`, "DELETE"),
};

export const examTypesApi = {
  getAll: () => apiRequest("examination/exam-types"),
  getById: (id) => apiRequest(`examination/exam-types/${id}`),
  create: (data) => apiRequest("examination/exam-types", "POST", data),
  update: (id, data) => apiRequest(`examination/exam-types/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/exam-types/${id}`, "DELETE"),
};

export const academicYearsApi = {
  getAll: () => apiRequest("examination/academic-years"),
  getById: (id) => apiRequest(`examination/academic-years/${id}`),
  create: (data) => apiRequest("examination/academic-years", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/academic-years/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/academic-years/${id}`, "DELETE"),
};

export const semestersApi = {
  getAll: () => apiRequest("examination/semesters"),
  getById: (id) => apiRequest(`examination/semesters/${id}`),
  create: (data) => apiRequest("examination/semesters", "POST", data),
  update: (id, data) => apiRequest(`examination/semesters/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/semesters/${id}`, "DELETE"),
};

export const streamsApi = {
  getAll: () => apiRequest("examination/streams"),
  getById: (id) => apiRequest(`examination/streams/${id}`),
  getByCourse: (courseId) =>
    apiRequest(`examination/streams/course/${courseId}`),
  create: (data) => apiRequest("examination/streams", "POST", data),
  update: (id, data) => apiRequest(`examination/streams/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/streams/${id}`, "DELETE"),
};

export const subjectsApi = {
  getAll: () => apiRequest("examination/subjects"),
  getById: (id) => apiRequest(`examination/subjects/${id}`),
  create: (data) => apiRequest("examination/subjects", "POST", data),
  update: (id, data) => apiRequest(`examination/subjects/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/subjects/${id}`, "DELETE"),
};

export const streamSubjectMappingsApi = {
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`examination/stream-subject-mappings?${queryString}`);
    }
    return apiRequest("examination/stream-subject-mappings");
  },
  getById: (id) => apiRequest(`examination/stream-subject-mappings/${id}`),
  getByStream: (streamId, activeOnly = false) => {
    const query = activeOnly ? "?activeOnly=true" : "";
    return apiRequest(
      `examination/stream-subject-mappings/stream/${streamId}${query}`
    );
  },
  getBySubject: (subjectId) =>
    apiRequest(`examination/stream-subject-mappings/subject/${subjectId}`),
  create: (data) =>
    apiRequest("examination/stream-subject-mappings", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/stream-subject-mappings/${id}`, "PUT", data),
  delete: (id) =>
    apiRequest(`examination/stream-subject-mappings/${id}`, "DELETE"),
};

export const professorsApi = {
  getAll: () => apiRequest("examination/professors"),
  getById: (id) => apiRequest(`examination/professors/${id}`),
  getBySubject: (subjectId) =>
    apiRequest(`examination/professors/subject/${subjectId}`),
  getByProfessorId: (professorId) =>
    apiRequest(`examination/professors/professor-id/${professorId}`),
  create: (data) => apiRequest("examination/professors", "POST", data),
  update: (id, data) => apiRequest(`examination/professors/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/professors/${id}`, "DELETE"),
};

export const examinationCentersApi = {
  getAll: () => apiRequest("examination/examination-centers"),
  getById: (id) => apiRequest(`examination/examination-centers/${id}`),
  getByCollege: (collegeId) =>
    apiRequest(`examination/examination-centers/college/${collegeId}`),
  create: (data) => apiRequest("examination/examination-centers", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/examination-centers/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/examination-centers/${id}`, "DELETE"),
};

export const examCenterCollegeMappingsApi = {
  getAll: () => apiRequest("examination/exam-center-college-mappings"),
  getById: (id) => apiRequest(`examination/exam-center-college-mappings/${id}`),
  getByExamCenter: (examCenterId) =>
    apiRequest(
      `examination/exam-center-college-mappings/exam-center/${examCenterId}`
    ),
  getByCollege: (collegeId) =>
    apiRequest(`examination/exam-center-college-mappings/college/${collegeId}`),
  getByInvigilator: (invigilatorId) =>
    apiRequest(
      `examination/exam-center-college-mappings/invigilator/${invigilatorId}`
    ),
  getByType: (mappingType) =>
    apiRequest(`examination/exam-center-college-mappings/type/${mappingType}`),
  create: (data) =>
    apiRequest("examination/exam-center-college-mappings", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/exam-center-college-mappings/${id}`, "PUT", data),
  delete: (id) =>
    apiRequest(`examination/exam-center-college-mappings/${id}`, "DELETE"),
};

export const invigilatorsApi = {
  getAll: () => apiRequest("examination/invigilators"),
  getById: (id) => apiRequest(`examination/invigilators/${id}`),
  getByCollege: (collegeId) =>
    apiRequest(`examination/invigilators/college/${collegeId}`),
  getByRole: (role) => apiRequest(`examination/invigilators/role/${role}`),
  getByYear: (year) => apiRequest(`examination/invigilators/year/${year}`),
  getByCode: (invigilatorCode) =>
    apiRequest(`examination/invigilators/code/${invigilatorCode}`),
  create: (data) => apiRequest("examination/invigilators", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/invigilators/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/invigilators/${id}`, "DELETE"),
};

export const timetableEntriesApi = {
  getAll: () => apiRequest("examination/timetable-entries"),
  getById: (id) => apiRequest(`examination/timetable-entries/${id}`),
  getBySection: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`examination/timetable-entries/section?${queryString}`);
  },
  getByExaminationType: (examinationType) =>
    apiRequest(
      `examination/timetable-entries/examination-type/${examinationType}`
    ),
  getBySemester: (semester) =>
    apiRequest(`examination/timetable-entries/semester/${semester}`),
  getByCourse: (courseId) =>
    apiRequest(`examination/timetable-entries/course/${courseId}`),
  getByAcademicYear: (academicYearId) =>
    apiRequest(`examination/timetable-entries/academic-year/${academicYearId}`),
  getBySubject: (subjectId) =>
    apiRequest(`examination/timetable-entries/subject/${subjectId}`),
  getByStream: (streamId) =>
    apiRequest(`examination/timetable-entries/stream/${streamId}`),
  getByDateRange: (startDate, endDate) =>
    apiRequest(
      `examination/timetable-entries/date-range/${startDate}/${endDate}`
    ),
  create: (data) => apiRequest("examination/timetable-entries", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/timetable-entries/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/timetable-entries/${id}`, "DELETE"),
  deleteBulk: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `examination/timetable-entries/bulk?${queryString}`,
      "DELETE"
    );
  },
};

export const courseStreamMappingsApi = {
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`examination/course-stream-mappings?${queryString}`);
    }
    return apiRequest("examination/course-stream-mappings");
  },
  getById: (id) => apiRequest(`examination/course-stream-mappings/${id}`),
  getByCourse: (courseId, activeOnly = false) => {
    const query = activeOnly ? "?activeOnly=true" : "";
    return apiRequest(
      `examination/course-stream-mappings/course/${courseId}${query}`
    );
  },
  getByCourseAndStream: (courseId, streamId, activeOnly = false) => {
    const query = activeOnly ? "?activeOnly=true" : "";
    return apiRequest(
      `examination/course-stream-mappings/course/${courseId}/stream/${streamId}${query}`
    );
  },
  create: (data) =>
    apiRequest("examination/course-stream-mappings", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/course-stream-mappings/${id}`, "PUT", data),
  restore: (id) =>
    apiRequest(`examination/course-stream-mappings/${id}/restore`, "PUT"),
  delete: (id, hardDelete = false) => {
    const query = hardDelete ? "?hardDelete=true" : "";
    return apiRequest(
      `examination/course-stream-mappings/${id}${query}`,
      "DELETE"
    );
  },
  deleteBulk: (data) =>
    apiRequest("examination/course-stream-mappings/bulk", "DELETE", data),
  deleteByCourse: (courseId, force = false) => {
    const query = force ? "?force=true" : "";
    return apiRequest(
      `examination/course-stream-mappings/course/${courseId}${query}`,
      "DELETE"
    );
  },
  deleteByStream: (streamId, force = false) => {
    const query = force ? "?force=true" : "";
    return apiRequest(
      `examination/course-stream-mappings/stream/${streamId}${query}`,
      "DELETE"
    );
  },
};

export const courseAcademicYearMappingsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/course-academic-year-mappings${
        queryString ? `?${queryString}` : ""
      }`
    );
  },
  create: (data) =>
    apiRequest("examination/course-academic-year-mappings", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/course-academic-year-mappings/${id}`, "PUT", data),
  delete: (id) =>
    apiRequest(`examination/course-academic-year-mappings/${id}`, "DELETE"),
};

export const internalExamSetupsApi = {
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`examination/internal-exam-setups?${queryString}`);
    }
    return apiRequest("examination/internal-exam-setups");
  },
  getById: (id) => apiRequest(`examination/internal-exam-setups/${id}`),
  getByCourse: (courseId) =>
    apiRequest(`examination/internal-exam-setups/course/${courseId}`),
  getBySubject: (subjectId) =>
    apiRequest(`examination/internal-exam-setups/subject/${subjectId}`),
  getStudents: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `examination/internal-exam-setups/students?${queryString}`
    );
  },
  create: (data) =>
    apiRequest("examination/internal-exam-setups", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/internal-exam-setups/${id}`, "PUT", data),
  delete: (id) =>
    apiRequest(`examination/internal-exam-setups/${id}`, "DELETE"),
};

export const internalMarksApi = {
  save: (data) => apiRequest("examination/internal-marks", "POST", data),
  getBySetup: (setupId) =>
    apiRequest(`examination/internal-marks/setup/${setupId}`),
  getByStudent: (studentId) =>
    apiRequest(`examination/internal-marks/student/${studentId}`),
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`examination/internal-marks?${queryString}`);
    }
    return apiRequest("examination/internal-marks");
  },
  delete: (id) => apiRequest(`examination/internal-marks/${id}`, "DELETE"),
};

export const notificationsApi = {
  getAll: () => apiRequest("notifications"),
  getById: (id) => apiRequest(`notifications/${id}`),
  getFile: (id) => `${BASE_URL}/notifications/file/${id}`,
  create: (formData) =>
    apiMultipartRequest(
      "notifications/create-new-notification",
      "POST",
      formData
    ),
  update: (id, formData) =>
    apiMultipartRequest(
      `notifications/update-notification/${id}`,
      "PUT",
      formData
    ),
  delete: (id) =>
    apiRequest(`notifications/delete-notification/${id}`, "DELETE"),
};

export const questionPapersApi = {
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`examination/question-papers?${queryString}`);
    }
    return apiRequest("examination/question-papers");
  },
  getById: (id) => apiRequest(`examination/question-papers/${id}`),
  getBySubject: (subjectId, status = null) => {
    const query = status ? `?status=${status}` : "";
    return apiRequest(
      `examination/question-papers/subject/${subjectId}${query}`
    );
  },
  getByAcademicYear: (academicYearId, status = null) => {
    const query = status ? `?status=${status}` : "";
    return apiRequest(
      `examination/question-papers/academic-year/${academicYearId}${query}`
    );
  },
  getByStatus: (status) =>
    apiRequest(`examination/question-papers/status/${status}`),
  create: (data) => apiRequest("examination/question-papers", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/question-papers/${id}`, "PUT", data),
  submit: (id, userId = null) => {
    const body = userId ? { userId } : {};
    return apiRequest(`examination/question-papers/${id}/submit`, "PUT", body);
  },
  approve: (id, userId = null) => {
    const body = userId ? { userId } : {};
    return apiRequest(`examination/question-papers/${id}/approve`, "PUT", body);
  },
  reject: (id, userId = null, reason = "") => {
    const body = userId ? { userId, reason } : { reason };
    return apiRequest(`examination/question-papers/${id}/reject`, "PUT", body);
  },
  delete: (id, hardDelete = false) => {
    const query = hardDelete ? "?hardDelete=true" : "";
    return apiRequest(`examination/question-papers/${id}${query}`, "DELETE");
  },
  // PDF operations
  uploadPdf: async (id, pdfFile) => {
    // Validate file type
    if (!pdfFile || pdfFile.type !== "application/pdf") {
      throw new Error("Please select a PDF file");
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile); // Field name must be 'pdf'

    try {
      const response = await fetch(
        `${BASE_URL}/examination/question-papers/${id}/upload-pdf`,
        {
          method: "POST",
          body: formData, // Let browser set Content-Type with boundary (multipart/form-data)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to upload PDF: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("PDF uploaded:", result);
      return result;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },
  downloadPdf: async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/examination/question-papers/${id}/download-pdf`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("PDF not found. Please upload the PDF first.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to download PDF: ${response.status}`
        );
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  },
  viewPdf: (id, cacheBust = true) => {
    // Returns URL for viewing PDF in browser
    // Add cache-busting parameter to ensure updated PDFs are shown
    const baseUrl = `${BASE_URL}/examination/question-papers/${id}/view-pdf`;
    if (cacheBust) {
      return `${baseUrl}?t=${Date.now()}`;
    }
    return baseUrl;
  },
  deletePdf: (id) => {
    return apiRequest(`examination/question-papers/${id}/delete-pdf`, "DELETE");
  },
};

export const questionPaperReviewsApi = {
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`examination/question-paper-reviews?${queryString}`);
    }
    return apiRequest("examination/question-paper-reviews");
  },
  getById: (id) => apiRequest(`examination/question-paper-reviews/${id}`),
  getByQuestionPaper: (questionPaperId) =>
    apiRequest(
      `examination/question-paper-reviews/question-paper/${questionPaperId}`
    ),
  getLatestReview: (questionPaperId) =>
    apiRequest(
      `examination/question-paper-reviews/question-paper/${questionPaperId}/latest`
    ),
  create: (data) =>
    apiRequest("examination/question-paper-reviews", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/question-paper-reviews/${id}`, "PUT", data),
  delete: (id) =>
    apiRequest(`examination/question-paper-reviews/${id}`, "DELETE"),
};

export const examCenterQuestionPaperMappingsApi = {
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(
        `examination/question-paper-exam-center-mappings?${queryString}`
      );
    }
    return apiRequest("examination/question-paper-exam-center-mappings");
  },
  getById: (id) =>
    apiRequest(`examination/question-paper-exam-center-mappings/${id}`),
  getByExamCenter: (examCenterId, includeInactive = false) => {
    const query = includeInactive ? "?includeInactive=true" : "";
    return apiRequest(
      `examination/question-paper-exam-center-mappings/exam-center/${examCenterId}${query}`
    );
  },
  getByQuestionPaper: (questionPaperId, includeInactive = false) => {
    const query = includeInactive ? "?includeInactive=true" : "";
    return apiRequest(
      `examination/question-paper-exam-center-mappings/question-paper/${questionPaperId}${query}`
    );
  },
  create: (data) =>
    apiRequest("examination/question-paper-exam-center-mappings", "POST", data),
  update: (id, data) =>
    apiRequest(
      `examination/question-paper-exam-center-mappings/${id}`,
      "PUT",
      data
    ),
  restore: (id) =>
    apiRequest(
      `examination/question-paper-exam-center-mappings/${id}/restore`,
      "PUT"
    ),
  delete: (id, hardDelete = false) => {
    const query = hardDelete ? "?hardDelete=true" : "";
    return apiRequest(
      `examination/question-paper-exam-center-mappings/${id}${query}`,
      "DELETE"
    );
  },
};

// Examination Payment Application APIs
export const examinationPaymentApi = {
  getAllPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `examination-application/payments${queryString ? `?${queryString}` : ""}`
    );
  },
  getPaymentStatus: (transactionId) => {
    return apiRequest(
      `examination-application/payment-status/${transactionId}`
    );
  },
  getPaymentHistory: (registrationNumber, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `examination-application/payments/${registrationNumber}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },
  getPaymentsByRegistrationRange: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `examination-application/payments/range${
        queryString ? `?${queryString}` : ""
      }`
    );
  },
  verifyTransaction: (transactionId) => {
    return apiRequest(
      `examination-application/verify-transaction/${transactionId}`
    );
  },
  updatePaymentStatus: (transactionId) => {
    return apiRequest(
      `examination-application/update-payment-status/${transactionId}`,
      "POST"
    );
  },
  updateHallTicketStatus: (transactionId, data) => {
    return apiRequest(
      `examination-application/payments/${transactionId}/hall-ticket`,
      "PUT",
      data
    );
  },
};

// Bundle Management API
export const bundlesApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/bundles${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`examination/bundles/${id}`),
  getByBarcode: (barcode) =>
    apiRequest(`examination/bundles/barcode/${barcode}`),
  create: (data) => apiRequest("examination/bundles", "POST", data),
  dispatch: (id) => apiRequest(`examination/bundles/${id}/dispatch`, "PUT"),
  receive: (data) => apiRequest("examination/bundles/receive", "PUT", data),
  delete: (id) => apiRequest(`examination/bundles/${id}`, "DELETE"),
};

// Script Registration API
export const scriptsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/scripts${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`examination/scripts/${id}`),
  getByBarcode: (barcode) =>
    apiRequest(`examination/scripts/barcode/${barcode}`),
  getByBundle: (bundleId) =>
    apiRequest(`examination/scripts/bundle/${bundleId}`),
  register: (data) => apiRequest("examination/scripts/register", "POST", data),
  update: (id, data) => apiRequest(`examination/scripts/${id}`, "PUT", data),
  evaluate: (id, data) =>
    apiRequest(`examination/scripts/${id}/evaluate`, "PUT", data),
};

// Combined Results API
export const combinedResultsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/combined-results${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`examination/combined-results/${id}`),
  save: (data) => apiRequest("examination/combined-results", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/combined-results/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/combined-results/${id}`, "DELETE"),
  deleteBySetup: (setupId) =>
    apiRequest(`examination/combined-results/setup/${setupId}`, "DELETE"),
};

export const evaluatorAllocationsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/evaluator-allocations${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`examination/evaluator-allocations/${id}`),
  getByEvaluator: (evaluatorId) =>
    apiRequest(`examination/evaluator-allocations/evaluator/${evaluatorId}`),
  create: (data) =>
    apiRequest("examination/evaluator-allocations", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/evaluator-allocations/${id}`, "PUT", data),
};

export const evaluatorsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/evaluators${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`examination/evaluators/${id}`),
  update: (id, data) => apiRequest(`examination/evaluators/${id}`, "PUT", data),
};

// Seating Arrangements API (Jumbling Centers)
export const seatingArrangementsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/seating-arrangements${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`examination/seating-arrangements/${id}`),
  getByCenter: (centerId, params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/seating-arrangements/center/${centerId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },
  getStatsByCenter: (centerId) =>
    apiRequest(`examination/seating-arrangements/center/${centerId}/stats`),
  create: (data) =>
    apiRequest("examination/seating-arrangements", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/seating-arrangements/${id}`, "PUT", data),
  delete: (id) =>
    apiRequest(`examination/seating-arrangements/${id}`, "DELETE"),
  deleteByCenter: (centerId) =>
    apiRequest(`examination/seating-arrangements/center/${centerId}`, "DELETE"),
};

// Exam Attendance API
export const examAttendanceApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/exam-attendance${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`examination/exam-attendance/${id}`),
  create: (data) => apiRequest("examination/exam-attendance", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/exam-attendance/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/exam-attendance/${id}`, "DELETE"),
};

// Exam Reports API (Malpractice Reports)
export const examReportsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `examination/malpractice-reports${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`examination/malpractice-reports/${id}`),
  create: (data) => apiRequest("examination/malpractice-reports", "POST", data),
  update: (id, data) =>
    apiRequest(`examination/malpractice-reports/${id}`, "PUT", data),
  delete: (id) => apiRequest(`examination/malpractice-reports/${id}`, "DELETE"),
};

// Labs API - Lab Types
export const labTypesApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(`labs/lab-types${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiRequest(`labs/lab-types/${id}`),
  create: (data) => apiRequest("labs/lab-types", "POST", data),
  update: (id, data) => apiRequest(`labs/lab-types/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/lab-types/${id}`, "DELETE"),
};

// Labs API - Labs
export const labsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(`labs/labs${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiRequest(`labs/labs/${id}`),
  create: (data) => apiRequest("labs/labs", "POST", data),
  update: (id, data) => apiRequest(`labs/labs/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/labs/${id}`, "DELETE"),
};

// Labs API - Equipment Categories
export const equipmentCategoriesApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/equipment-categories${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`labs/equipment-categories/${id}`),
  create: (data) => apiRequest("labs/equipment-categories", "POST", data),
  update: (id, data) =>
    apiRequest(`labs/equipment-categories/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/equipment-categories/${id}`, "DELETE"),
};

// Labs API - Lab Incharges
export const labInchargesApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/lab-incharges${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`labs/lab-incharges/${id}`),
  create: (data) => apiRequest("labs/lab-incharges", "POST", data),
  update: (id, data) => apiRequest(`labs/lab-incharges/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/lab-incharges/${id}`, "DELETE"),
};

// Labs API - Equipment
export const equipmentApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(`labs/equipment${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiRequest(`labs/equipment/${id}`),
  create: (data) => apiRequest("labs/equipment", "POST", data),
  update: (id, data) => apiRequest(`labs/equipment/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/equipment/${id}`, "DELETE"),
};

// Labs API - Consumables
export const consumableApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/consumables${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`labs/consumables/${id}`),
  getCategories: () => apiRequest("labs/consumables/categories"),
  create: (data) => apiRequest("labs/consumables", "POST", data),
  update: (id, data) => apiRequest(`labs/consumables/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/consumables/${id}`, "DELETE"),
};

// Labs API - Lab Bookings
export const labBookingsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/lab-bookings${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`labs/lab-bookings/${id}`),
  create: (data) => apiRequest("labs/lab-bookings", "POST", data),
  update: (id, data) => apiRequest(`labs/lab-bookings/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/lab-bookings/${id}`, "DELETE"),
};

// Labs API - Lab Schedules
export const labScheduleApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/lab-schedules${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`labs/lab-schedules/${id}`),
  create: (data) => apiRequest("labs/lab-schedules", "POST", data),
  update: (id, data) => apiRequest(`labs/lab-schedules/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/lab-schedules/${id}`, "DELETE"),
};

// Labs API - Maintenance Issues
export const maintenanceIssueApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/maintenance-issues${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`labs/maintenance-issues/${id}`),
  create: (data) => apiRequest("labs/maintenance-issues", "POST", data),
  update: (id, data) =>
    apiRequest(`labs/maintenance-issues/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/maintenance-issues/${id}`, "DELETE"),
};

// Labs API - Maintenance Logs
export const maintenanceLogApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/maintenance-logs${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`labs/maintenance-logs/${id}`),
  create: (data) => apiRequest("labs/maintenance-logs", "POST", data),
  update: (id, data) => apiRequest(`labs/maintenance-logs/${id}`, "PUT", data),
  delete: (id) => apiRequest(`labs/maintenance-logs/${id}`, "DELETE"),
  resolveIssue: (id, data) =>
    apiRequest(`labs/maintenance-logs/${id}/resolve-issue`, "PUT", data),
  rejectIssue: (id, data) =>
    apiRequest(`labs/maintenance-logs/${id}/reject-issue`, "PUT", data),
};

// Labs API - Reports
export const labReportsApi = {
  getUsageReport: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/reports/usage${queryString ? `?${queryString}` : ""}`
    );
  },
  getEquipmentReport: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/reports/equipment${queryString ? `?${queryString}` : ""}`
    );
  },
  getMaintenanceReport: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `labs/reports/maintenance${queryString ? `?${queryString}` : ""}`
    );
  },
};

// Revaluation API
export const revaluationApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `revaluation/requests${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`revaluation/requests/${id}`),
  create: (data) => apiRequest("revaluation/requests", "POST", data),
  update: (id, data) => apiRequest(`revaluation/requests/${id}`, "PUT", data),
  approve: (id, data) =>
    apiRequest(`revaluation/requests/${id}/approve`, "PUT", data),
  reject: (id, data) =>
    apiRequest(`revaluation/requests/${id}/reject`, "PUT", data),
  assignEvaluator: (id, data) =>
    apiRequest(`revaluation/requests/${id}/assign-evaluator`, "PUT", data),
  enterMarks: (id, data) =>
    apiRequest(`revaluation/requests/${id}/enter-marks`, "PUT", data),
  complete: (id) => apiRequest(`revaluation/requests/${id}/complete`, "PUT"),
  delete: (id) => apiRequest(`revaluation/requests/${id}`, "DELETE"),
  getStatistics: () => apiRequest("revaluation/statistics"),
  createFromPayment: (paymentTransactionId) =>
    apiRequest(
      `revaluation/create-from-payment/${paymentTransactionId}`,
      "POST"
    ),
};

// Library - Book Categories API
export const bookCategoriesApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `library/book-categories${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`library/book-categories/${id}`),
  create: (data) => apiRequest("library/book-categories", "POST", data),
  update: (id, data) =>
    apiRequest(`library/book-categories/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/book-categories/${id}`, "DELETE"),
};

// Library - Authors API
export const authorsApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(`library/authors${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiRequest(`library/authors/${id}`),
  create: (data) => apiRequest("library/authors", "POST", data),
  update: (id, data) => apiRequest(`library/authors/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/authors/${id}`, "DELETE"),
};

// Library - Publishers API
export const publishersApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `library/publishers${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`library/publishers/${id}`),
  create: (data) => apiRequest("library/publishers", "POST", data),
  update: (id, data) => apiRequest(`library/publishers/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/publishers/${id}`, "DELETE"),
};

// Library - Library Info API
export const libraryInfoApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `library/library-info${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`library/library-info/${id}`),
  create: (data) => apiRequest("library/library-info", "POST", data),
  update: (id, data) => apiRequest(`library/library-info/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/library-info/${id}`, "DELETE"),
};

// Library - Racks API
export const racksApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(`library/racks${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiRequest(`library/racks/${id}`),
  create: (data) => apiRequest("library/racks", "POST", data),
  update: (id, data) => apiRequest(`library/racks/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/racks/${id}`, "DELETE"),
};

// Library - Books API
export const booksApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(`library/books${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiRequest(`library/books/${id}`),
  create: (data) => apiRequest("library/books", "POST", data),
  update: (id, data) => apiRequest(`library/books/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/books/${id}`, "DELETE"),
};

// Library - Issued Books API
export const issuedBooksApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `library/issued-books${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`library/issued-books/${id}`),
  create: (data) => apiRequest("library/issued-books", "POST", data),
  update: (id, data) => apiRequest(`library/issued-books/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/issued-books/${id}`, "DELETE"),
  return: (id, data) =>
    apiRequest(`library/issued-books/${id}/return`, "PUT", data),
  renew: (id, data) =>
    apiRequest(`library/issued-books/${id}/renew`, "PUT", data),
};

// Library - Physical Inventory API
export const physicalInventoryApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `library/physical-inventory${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`library/physical-inventory/${id}`),
  create: (data) => apiRequest("library/physical-inventory", "POST", data),
  update: (id, data) =>
    apiRequest(`library/physical-inventory/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/physical-inventory/${id}`, "DELETE"),
  getByCategory: (category) =>
    apiRequest(`library/physical-inventory/category/${category}`),
  getByLocation: (location) =>
    apiRequest(`library/physical-inventory/location/${location}`),
  addMaintenance: (id, data) =>
    apiRequest(`library/physical-inventory/${id}/maintenance`, "POST", data),
};

// Library - Digital Resources API
export const digitalResourcesApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `library/digital-resources${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`library/digital-resources/${id}`),
  create: (data) => apiRequest("library/digital-resources", "POST", data),
  update: (id, data) =>
    apiRequest(`library/digital-resources/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/digital-resources/${id}`, "DELETE"),
  incrementView: (id) =>
    apiRequest(`library/digital-resources/${id}/view`, "POST"),
  incrementDownload: (id) =>
    apiRequest(`library/digital-resources/${id}/download`, "POST"),
  getByType: (type) => apiRequest(`library/digital-resources/type/${type}`),
  getPopular: (limit = 10) =>
    apiRequest(`library/digital-resources/popular?limit=${limit}`),
  search: (query) =>
    apiRequest(
      `library/digital-resources/search?q=${encodeURIComponent(query)}`
    ),
};

// Admission Communications API
export const admissionCommunicationsApi = {
  get: (type) => {
    const url = type
      ? `admission-communications?type=${type}`
      : "admission-communications";
    return apiRequest(url);
  },
  create: (data) => apiRequest("admission-communications", "POST", data),
  getAll: () => apiRequest("admission-communications"),
};

// Fee Pending Communications API
export const feePendingCommunicationsApi = {
  getAll: () => apiRequest("fee-pending-communications"),
  getById: (id) => apiRequest(`fee-pending-communications/${id}`),
  create: (data) => apiRequest("fee-pending-communications", "POST", data),
  delete: (id) => apiRequest(`fee-pending-communications/${id}`, "DELETE"),
};

// Exam Timetable Communications API
export const examTimetableCommunicationsApi = {
  getAll: () => apiRequest("exam-timetable-communications"),
  getByType: (type) => apiRequest(`exam-timetable-communications/type/${type}`),
  create: (formData) =>
    apiMultipartRequest("exam-timetable-communications", "POST", formData),
  update: (id, data) =>
    apiRequest(`exam-timetable-communications/${id}`, "PUT", data),
};

export const studentAttendanceApi = {
  get: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `student-attendance${queryString ? `?${queryString}` : ""}`
    );
  },
  bulkCreate: (data) => apiRequest("student-attendance/bulk", "POST", data),
};

// Event Communications API
export const eventCommunicationsApi = {
  getAll: () => apiRequest("event-communications"),
  getById: (id) => apiRequest(`event-communications/${id}`),
  create: (data) => apiRequest("event-communications", "POST", data),
  delete: (id) => apiRequest(`event-communications/${id}`, "DELETE"),
};

// Absent Notifications API
export const absentNotificationsApi = {
  getAll: () => apiRequest("absent-notifications"),
  getById: (id) => apiRequest(`absent-notifications/${id}`),
  create: (data) => apiRequest("absent-notifications", "POST", data),
  delete: (id) => apiRequest(`absent-notifications/${id}`, "DELETE"),
};

export const libraryRulesApi = {
  getActive: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(`library/rules${queryString ? `?${queryString}` : ""}`);
  },
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `library/rules/all${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`library/rules/${id}`),
  createOrUpdate: (data) => apiRequest("library/rules", "POST", data),
  update: (data) => apiRequest("library/rules", "PUT", data),
  createNew: (data) => apiRequest("library/rules/new", "POST", data),
  updateById: (id, data) => apiRequest(`library/rules/${id}`, "PUT", data),
  delete: (id) => apiRequest(`library/rules/${id}`, "DELETE"),
};

// Departments API
export const departmentsApi = {
  getAll: () => apiRequest("departments"),
  create: (data) => apiRequest("departments", "POST", data),
  update: (id, data) => apiRequest(`departments/${id}`, "PUT", data),
  delete: (id) => apiRequest(`departments/${id}`, "DELETE"),
};

// Hiring API
export const hiringApi = {
  getNotifications: () => apiRequest("hiring"),
  getNotificationById: (id) => apiRequest(`hiring/${id}`),
  createNotification: (data) => apiRequest("hiring", "POST", data),
  updateNotification: (id, data) => apiRequest(`hiring/${id}`, "PUT", data),
  deleteNotification: (id) => apiRequest(`hiring/${id}`, "DELETE"),
};

// Job Applications API
export const applicationsApi = {
  submit: (formData) =>
    apiMultipartRequest("hiring/applications", "POST", formData),
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return apiRequest(
      `hiring/applications${queryString ? `?${queryString}` : ""}`
    );
  },
  getById: (id) => apiRequest(`hiring/applications/${id}`),
  updateStatus: (id, data) =>
    apiRequest(`hiring/applications/${id}/status`, "PUT", data),
  getResume: (id) => `${BASE_URL}/hiring/applications/${id}/resume`,
  downloadResume: async (id) => {
    // Download resume with authentication token
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/hiring/applications/${id}/resume`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download resume");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${id}.pdf`; // Default filename
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  viewResume: async (id) => {
    // View resume in new tab with authentication token
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/hiring/applications/${id}/resume`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load resume");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Clean up the blob URL after a delay
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  },
};

// Transportation APIs
export const vehicleTypesApi = {
  getAll: () => apiRequest("transportation/vehicle-types"),
  getById: (id) => apiRequest(`transportation/vehicle-types/${id}`),
  create: (data) => apiRequest("transportation/vehicle-types", "POST", data),
  update: (id, data) => apiRequest(`transportation/vehicle-types/${id}`, "PUT", data),
  delete: (id) => apiRequest(`transportation/vehicle-types/${id}`, "DELETE"),
};

export const vehiclesApi = {
  getAll: () => apiRequest("transportation/vehicles"),
  getById: (id) => apiRequest(`transportation/vehicles/${id}`),
  create: (data) => apiRequest("transportation/vehicles", "POST", data),
  update: (id, data) => apiRequest(`transportation/vehicles/${id}`, "PUT", data),
  delete: (id) => apiRequest(`transportation/vehicles/${id}`, "DELETE"),
};

export const driversApi = {
  getAll: () => apiRequest("transportation/drivers"),
  getById: (id) => apiRequest(`transportation/drivers/${id}`),
  create: (data) => apiRequest("transportation/drivers", "POST", data),
  update: (id, data) => apiRequest(`transportation/drivers/${id}`, "PUT", data),
  delete: (id) => apiRequest(`transportation/drivers/${id}`, "DELETE"),
};

export const transportRoutesApi = {
  getAll: () => apiRequest("transportation/routes"),
  getById: (id) => apiRequest(`transportation/routes/${id}`),
  create: (data) => apiRequest("transportation/routes", "POST", data),
  update: (id, data) => apiRequest(`transportation/routes/${id}`, "PUT", data),
  delete: (id) => apiRequest(`transportation/routes/${id}`, "DELETE"),
};

export const transportAssignmentsApi = {
  getAll: () => apiRequest("transportation/transport-assignments"),
  create: (data) => apiRequest("transportation/transport-assignments", "POST", data),
  createBulk: (data) => apiRequest("transportation/transport-assignments/bulk", "POST", data),
  update: (id, data) => apiRequest(`transportation/transport-assignments/${id}`, "PUT", data),
  delete: (id) => apiRequest(`transportation/transport-assignments/${id}`, "DELETE"),
};

export const driverMappingsApi = {
  getAll: () => apiRequest("transportation/driver-mappings"),
  create: (data) => apiRequest("transportation/driver-mappings", "POST", data),
  update: (id, data) => apiRequest(`transportation/driver-mappings/${id}`, "PUT", data),
  delete: (id) => apiRequest(`transportation/driver-mappings/${id}`, "DELETE"),
};

export const routeMappingsApi = {
  getAll: () => apiRequest("transportation/route-mappings"),
  create: (data) => apiRequest("transportation/route-mappings", "POST", data),
  update: (id, data) => apiRequest(`transportation/route-mappings/${id}`, "PUT", data),
  delete: (id) => apiRequest(`transportation/route-mappings/${id}`, "DELETE"),
};
export const employeeRegistrationApi = {
  getAll: () => apiRequest("employee/registration"),
  getById: (id) => apiRequest(`employee/registration/${id}`),
  create: (data) => apiRequest("employee/registration", "POST", data),
  update: (id, data) => apiRequest(`employee/registration/${id}`, "PUT", data),
  delete: (id) => apiRequest(`employee/registration/${id}`, "DELETE"),
};
export const employeeResignationApi = {
  getAll: () => apiRequest("employee/resignation"),
  getById: (id) => apiRequest(`employee/resignation/${id}`),
  create: (data) => apiRequest("employee/resignation", "POST", data),
  update: (id, data) => apiRequest(`employee/resignation/${id}`, "PUT", data),
  delete: (id) => apiRequest(`employee/resignation/${id}`, "DELETE"),
};

export const syllabusApi = {
  getAll: (program) => apiRequest(`syllabus/all/${program}`),
  bulkCreate: (formData) => apiMultipartRequest("syllabus/bulk-create", "POST", formData),
  update: (id, formData) => apiMultipartRequest(`syllabus/${id}`, "PUT", formData),
  delete: (id) => apiRequest(`syllabus/${id}`, "DELETE"),
  getFileUrl: (id, fileId) => `${BASE_URL}/syllabus/file/view/${id}/${fileId}`
};

export const departmentSeminarApi = {
  getAll: (college, department) => {
    const params = new URLSearchParams();
    if (college) params.append("college", college);
    if (department) params.append("department", department);
    return apiRequest(`website/department-seminars?${params.toString()}`);
  },
  create: (data) => apiRequest("website/department-seminars", "POST", data),
  update: (id, data) => apiRequest(`website/department-seminars/${id}`, "PUT", data),
  delete: (id) => apiRequest(`website/department-seminars/${id}`, "DELETE"),
};
