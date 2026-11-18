import { isAxiosError } from "axios";
import toast, { Toaster } from "react-hot-toast";

export const showSuccessMessage = (message) => {
  toast.success(message, {
    position: "top-center",
    duration: 1500,
  });
};
export const showErrorMessage = (message) => {
  toast.error(message, {
    position: "top-center",
    duration: 1500,
  });
};

export const showAxiosError = (error) => {
  console.log("Error From Toast : ", error);

  if (isAxiosError(error)) {
    // Handle network errors (no response from server)
    if (error.code === 'ERR_NETWORK' || !error.response) {
      showErrorMessage("Cannot connect to server. Please ensure the backend server is running.");
      return;
    }
    
    // Handle HTTP errors with response
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || error.response.data.error || "An error occurred";
      showErrorMessage(errorMessage);
    } else {
      showErrorMessage(error.message || "Something Went Wrong");
    }
  } else {
    showErrorMessage(error.message || "Something Went Wrong");
  }
};
