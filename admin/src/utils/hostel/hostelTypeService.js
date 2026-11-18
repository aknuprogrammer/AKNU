/**
 * Hostel Type Service
 * Centralized service for fetching hostel type data
 */
import { API } from "../../config/urls";

/**
 * Fetch all hostel types
 */
export const fetchAllHostelTypes = async () => {
  try {
    const response = await API.get("/hostel/types");
    return response.data.data || response.data; // Handle both response formats
  } catch (error) {
    console.error("Error fetching hostel types:", error);
    throw error;
  }
};

/**
 * Get hostel type options for dropdown
 * Returns formatted array for use in select components
 */
export const getHostelTypeOptions = async () => {
  try {
    const types = await fetchAllHostelTypes();
    // Handle both array and object with data property
    const typeArray = Array.isArray(types) ? types : (types.data || []);
    return typeArray
      .filter((t) => t.status === "active")
      .map((t) => ({
        value: t._id,
        label: t.name,
        code: t.code,
        hostelType: t, // Include full type object for reference
      }));
  } catch (error) {
    console.error("Error getting hostel type options:", error);
    return [];
  }
};

export default {
  fetchAllHostelTypes,
  getHostelTypeOptions,
};

