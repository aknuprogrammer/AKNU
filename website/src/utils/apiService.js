// Helper function for API calls
const apiRequest = async (endpoint, method = "GET", body = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}api/${endpoint}`,
    options
  );
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return await response.json();
};

// College API
export const collegeApi = {
  getAll: () => apiRequest("colleges"),
  create: (data) => apiRequest("colleges", "POST", data),
  update: (id, data) => apiRequest(`colleges/${id}`, "PUT", data),
  delete: (id) => apiRequest(`colleges/${id}`, "DELETE"),
};

// Course API
export const courseApi = {
  getAll: () => apiRequest("courses"),
  create: (data) => apiRequest("courses", "POST", data),
  update: (id, data) => apiRequest(`courses/${id}`, "PUT", data),
  delete: (id) => apiRequest(`courses/${id}`, "DELETE"),
};

// Application Purpose API
export const applicationPurposeApi = {
  getAll: () => apiRequest("application-purposes"),
  getById: (id) => apiRequest(`application-purposes/${id}`),
  create: (data) => apiRequest("application-purposes", "POST", data),
  update: (id, data) => apiRequest(`application-purposes/${id}`, "PUT", data),
  delete: (id) => apiRequest(`application-purposes/${id}`, "DELETE"),
};
