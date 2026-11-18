/**
 * Warden Service
 * Centralized service for fetching and managing warden data
 * Use this service wherever warden information is needed
 */
import { API } from "../../config/urls";

/**
 * Fetch all wardens
 */
export const fetchAllWardens = async () => {
  try {
    const response = await API.get("/hostel/wardens");
    return response.data.data || response.data; // Handle both response formats
  } catch (error) {
    console.error("Error fetching wardens:", error);
    throw error;
  }
};

/**
 * Fetch warden by ID
 */
export const fetchWardenById = async (wardenId) => {
  try {
    const response = await API.get(`/hostel/wardens/${wardenId}`);
    return response.data.data || response.data; // Handle both response formats
  } catch (error) {
    console.error("Error fetching warden:", error);
    throw error;
  }
};

/**
 * Fetch warden by hostel ID
 */
export const fetchWardenByHostelId = async (hostelId) => {
  try {
    const response = await API.get(`/hostel/wardens/hostel/${hostelId}`);
    return response.data.data || response.data; // Handle both response formats
  } catch (error) {
    console.error("Error fetching warden by hostel:", error);
    // Return null if not found instead of throwing
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Fetch wardens by designation
 */
export const fetchWardensByDesignation = async (designation) => {
  try {
    const response = await API.get(`/hostel/wardens/designation/${designation}`);
    return response.data.data || response.data; // Handle both response formats
  } catch (error) {
    console.error("Error fetching wardens by designation:", error);
    throw error;
  }
};

/**
 * Get warden options for dropdown
 * Returns formatted array for use in select components
 */
export const getWardenOptions = async () => {
  try {
    const wardens = await fetchAllWardens();
    // Handle both array and object with data property
    const wardenArray = Array.isArray(wardens) ? wardens : (wardens.data || []);
    return wardenArray
      .filter((w) => w.status === "active")
      .map((w) => ({
        value: w._id,
        label: `${w.name} - ${w.hostelName || (w.hostelId?.name || "")}`,
        warden: w, // Include full warden object for reference
      }));
  } catch (error) {
    console.error("Error getting warden options:", error);
    return [];
  }
};

/**
 * Get warden name by ID (helper function)
 * Can be used synchronously if warden data is already loaded
 */
export const getWardenName = async (wardenId) => {
  try {
    if (!wardenId) return "N/A";
    const warden = await fetchWardenById(wardenId);
    return warden?.name || "N/A";
  } catch (error) {
    return "N/A";
  }
};

/**
 * Get warden info by ID (returns full warden object)
 */
export const getWardenInfo = async (wardenId) => {
  try {
    if (!wardenId) return null;
    return await fetchWardenById(wardenId);
  } catch (error) {
    console.error("Error getting warden info:", error);
    return null;
  }
};

export default {
  fetchAllWardens,
  fetchWardenById,
  fetchWardenByHostelId,
  fetchWardensByDesignation,
  getWardenOptions,
  getWardenName,
  getWardenInfo,
};

