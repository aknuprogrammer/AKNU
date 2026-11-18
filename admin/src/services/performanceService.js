import apiMultipartRequest, { apiRequest } from "./apiService";

export const performanceApi = {
  // Cycle Management
  createCycle: (data) => apiRequest("performance/cycles", "POST", data),
  getCycles: () => apiRequest("performance/cycles"),
  getActiveCycle: () => apiRequest("performance/cycles/active"),
  lockCycle: (cycleId) => apiRequest(`performance/cycles/${cycleId}/lock`, "PUT"),

  // Employee Actions
  getEmployeeReview: (cycleId, employeeId) => 
    apiRequest(`performance/reviews/${cycleId}/${employeeId}`),
  submitSelfAssessment: (data) => 
    apiRequest("performance/reviews/submit", "POST", data),

  // Manager Actions
  getAllReviewsForCycle: (cycleId) => 
    apiRequest(`performance/reviews/cycle/${cycleId}`),
  updateManagerAssessment: (reviewId, data) => 
    apiRequest(`performance/reviews/${reviewId}/manager-assessment`, "PUT", data),
    
  // File Upload
  uploadProof: (formData) => apiMultipartRequest("performance/upload", "POST", formData),

  // Timesheet / Attendance integration
  getTimesheetsByEmployeeId: (employeeId) => 
    apiRequest(`timesheet/employee/${employeeId}`),
};
