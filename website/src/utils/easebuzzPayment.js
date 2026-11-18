import axios from "axios";
import CryptoJS from "crypto-js";

/**
 * Easebuzz Payment Gateway Integration Utility
 * 
 * This utility handles payment initiation and transaction status checking
 * for the Easebuzz payment gateway.
 * 
 * Documentation:
 * - Initiate Payment API: https://docs.easebuzz.in/docs/payment-gateway/8ec545c331e6f-initiate-payment-api
 * - Transaction Status API V2.1: https://docs.easebuzz.in/docs/payment-gateway/6il9ej80xoydr-transaction-api-v2-1
 *   Endpoint: POST https://testdashboard.easebuzz.in/transaction/v2.1/retrieve
 * - Transaction Webhook: https://docs.easebuzz.in/docs/payment-gateway/paw9n1qc3kuoz-transaction-webhook
 * 
 * Test Credentials:
 * - Dashboard: https://auth.easebuzz.in/easebuzz/login
 * - Email: registrar@aknu.edu.in
 */

// ============================================
// EASEBUZZ CONFIGURATION (TEST MODE)
// ============================================
const EASEBUZZ_CONFIG = {
  // Test Mode Configuration
  SALT_KEY: import.meta.env.VITE_EASEBUZZ_SALT_KEY || "YOUR_TEST_SALT_KEY", // Get from Easebuzz dashboard
  MERCHANT_KEY: import.meta.env.VITE_EASEBUZZ_MERCHANT_KEY || "YOUR_TEST_MERCHANT_KEY", // Get from Easebuzz dashboard
  
  // API Endpoints
  INITIATE_PAYMENT_URL: "https://testpay.easebuzz.in/payment/initiateLink",
  TRANSACTION_STATUS_URL: "https://testdashboard.easebuzz.in/transaction/v2.1/retrieve",
  
  // Production URLs (uncomment when going live)
  // INITIATE_PAYMENT_URL: "https://pay.easebuzz.in/payment/initiateLink",
  // TRANSACTION_STATUS_URL: "https://dashboard.easebuzz.in/transaction/v2.1/retrieve",
};

/**
 * Trim string - Remove leading and trailing whitespaces
 * Easebuzz requires all parameters to be trimmed before hash generation
 * 
 * @param {string} str - String to trim
 * @returns {string} - Trimmed string
 */
const trimParam = (str) => {
  return str ? String(str).trim() : "";
};

/**
 * Validate phone number format
 * Format: ^(\+\d{1,4}[-]?)?\d{5,20}$
 * Examples: "+91-9876543210", "+919876543210", "9876543210"
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
const validatePhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^(\+\d{1,4}[-]?)?\d{5,20}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Generate hash for Easebuzz API requests
 * Hash is generated using SHA512 algorithm with the provided data and salt key
 * 
 * IMPORTANT: All parameters must be trimmed before hash generation
 * 
 * @param {string} dataString - Stringified data object (pipe-separated)
 * @param {string} saltKey - Salt key from Easebuzz dashboard
 * @returns {string} - SHA512 hash (lowercase)
 */
const generateHash = (dataString, saltKey) => {
  try {
    // Hash format: SHA512(dataString + saltKey)
    const hash = CryptoJS.SHA512(dataString + saltKey).toString();
    return hash;
  } catch (error) {
    console.error("Error generating hash:", error);
    throw new Error("Failed to generate payment hash");
  }
};

/**
 * Initiate Payment - Creates a payment link via backend API
 * 
 * NOTE: This function calls our backend API endpoint, which then calls Easebuzz.
 * This avoids CORS issues since payment gateway APIs should be called from the backend.
 * 
 * Backend Endpoint: POST /api/examination-application/initiate-payment
 * 
 * The backend will then call: POST https://testpay.easebuzz.in/payment/initiateLink
 * 
 * Required Parameters (*):
 * - key*: Merchant Key from Easebuzz dashboard
 * - txnid*: Unique transaction ID (string)
 * - amount*: Amount in INR, format: ^[0-9.]*$ (e.g., "1000.00")
 * - productinfo*: Product/Service description (string)
 * - firstname*: Customer first name (string)
 * - phone*: Customer phone number, format: ^(\+\d{1,4}[-]?)?\d{5,20}$ (e.g., "+91-9876543210" or "9876543210")
 * - email*: Customer email (string)
 * - surl*: Success URL (redirect after successful payment)
 * - furl*: Failure URL (redirect after failed payment)
 * - hash*: SHA512 hash (auto-generated)
 * 
 * Optional Parameters:
 * - udf1-udf7: User defined fields (string)
 * - address1, address2, city, state, country, zipcode: Address fields
 * - show_payment_mode, split_payments, request_flow, etc.
 * 
 * IMPORTANT: All parameters are automatically trimmed (leading/trailing whitespaces removed) before hash generation
 * 
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.amount - Amount in INR, format: ^[0-9.]*$ (e.g., "1000.00")
 * @param {string} paymentData.firstname - Customer first name
 * @param {string} paymentData.email - Customer email
 * @param {string} paymentData.phone - Customer phone, format: ^(\+\d{1,4}[-]?)?\d{5,20}$ (e.g., "+91-9876543210")
 * @param {string} paymentData.productinfo - Product/Service description
 * @param {string} paymentData.txnid - Unique transaction ID
 * @param {string} paymentData.surl - Success URL
 * @param {string} paymentData.furl - Failure URL
 * @param {string} [paymentData.udf1] - Optional user defined field 1
 * @param {string} [paymentData.udf2] - Optional user defined field 2
 * @param {string} [paymentData.udf3] - Optional user defined field 3
 * @param {string} [paymentData.udf4] - Optional user defined field 4
 * @param {string} [paymentData.udf5] - Optional user defined field 5
 * @param {string} [paymentData.udf6] - Optional user defined field 6
 * @param {string} [paymentData.udf7] - Optional user defined field 7
 * 
 * @returns {Promise<Object>} - Response with payment link
 * @returns {boolean} returns.success - Whether payment initiation was successful
 * @returns {string} returns.paymentLink - Payment link URL (if successful)
 * @returns {string} returns.message - Response message
 */
export const initiateEasebuzzPayment = async (paymentData) => {
  try {
    // Validate required fields based on backend API
    const requiredFields = ['amount', 'firstname', 'email', 'phone', 'registration_number', 'course', 'semester', 'productinfo', 'surl', 'furl'];
    const missingFields = requiredFields.filter(field => !paymentData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate amount
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount. Amount must be a positive number.");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.email)) {
      throw new Error("Invalid email format");
    }

    // Prepare request payload matching backend API structure
    const requestPayload = {
      amount: amount, // Number, not string
      firstname: paymentData.firstname,
      email: paymentData.email,
      phone: paymentData.phone,
      registration_number: paymentData.registration_number,
      course: paymentData.course,
      semester: paymentData.semester,
      regular_subjects: paymentData.regular_subjects || [],
      supplementary_subjects: paymentData.supplementary_subjects || [],
      revaluation_subjects: paymentData.revaluation_subjects || [], // For revaluation applications
      productinfo: paymentData.productinfo,
      surl: paymentData.surl,
      furl: paymentData.furl,
    };

    // Call backend API endpoint
    // Determine endpoint based on payment type (revaluation vs examination)
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4567';
    apiUrl = apiUrl.replace(/\/+$/, ''); // Remove trailing slashes
    
    // Use revaluation endpoint if revaluation_subjects are present, otherwise use examination endpoint
    const isRevaluation = paymentData.revaluation_subjects && paymentData.revaluation_subjects.length > 0;
    const backendEndpoint = isRevaluation 
      ? `${apiUrl}/api/revaluation-application/initiate-payment`
      : `${apiUrl}/api/examination-application/initiate-payment`;

    console.log("Calling backend payment initiation endpoint:", backendEndpoint);
    console.log("Payment data:", requestPayload);

    // Send payment data to backend
    const response = await axios.post(backendEndpoint, requestPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check response - backend returns { success: true, data: { paymentUrl, transactionId, paymentData } }
    if (response.data && response.data.success && response.data.data?.paymentUrl) {
      return {
        success: true,
        paymentUrl: response.data.data.paymentUrl,
        transactionId: response.data.data.transactionId,
        paymentData: response.data.data.paymentData,
        message: response.data.message || "Payment initiated successfully",
      };
    } else {
      const errorMessage = response.data?.message || "Failed to initiate payment";
      
      if (errorMessage.includes("credentials not configured") || errorMessage.includes("Easebuzz credentials")) {
        throw new Error("Backend Easebuzz credentials not configured. Please add EASEBUZZ_MERCHANT_KEY and EASEBUZZ_SALT_KEY to the backend .env file.");
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Easebuzz Payment Initiation Error:", error);
    
    // Handle 404 - Endpoint not found
    if (error.response?.status === 404) {
      return {
        success: false,
        message: "Payment endpoint not found. Please contact the backend team to implement '/api/examination-application/initiate-payment' endpoint. See EASEBUZZ_CREDENTIALS_SETUP.md for implementation details.",
        error: error,
      };
    }
    
    // Handle credentials error from backend
    if (error.response?.data?.message?.includes("credentials not configured") || 
        error.response?.data?.message?.includes("Easebuzz credentials")) {
      return {
        success: false,
        message: "Backend Easebuzz credentials not configured. Please add EASEBUZZ_MERCHANT_KEY=QD9MQ0VA7 and EASEBUZZ_SALT_KEY=I7N9XGX7B to the backend .env file and restart the backend server. See EASEBUZZ_CREDENTIALS_SETUP.md for details.",
        error: error,
      };
    }
    
    // Handle CORS or network errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.code === 'ERR_FAILED') {
      return {
        success: false,
        message: "Unable to connect to payment server. Please ensure the backend server is running and the endpoint '/api/examination-application/initiate-payment' is configured correctly.",
        error: error,
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Payment initiation failed",
      error: error,
    };
  }
};

/**
 * Check Payment Status - Uses backend API
 * 
 * Backend Endpoint: GET /api/examination-application/payment-status/:transactionId
 * 
 * Fetches payment status from backend which has the transaction details.
 * 
 * @param {string} transactionId - Transaction ID to check
 * @returns {Promise<Object>} - Transaction status details
 * @returns {boolean} returns.success - Whether the API call was successful
 * @returns {Object} returns.data - Transaction details
 * @returns {string} returns.message - Response message (if error)
 */
export const checkTransactionStatus = async (transactionId) => {
  try {
    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    // Call backend API endpoint
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4567';
    apiUrl = apiUrl.replace(/\/+$/, ''); // Remove trailing slashes
    const backendEndpoint = `${apiUrl}/api/examination-application/payment-status/${transactionId}`;

    console.log("Checking payment status:", backendEndpoint);

    const response = await axios.get(backendEndpoint);

    // Backend returns { success: true, data: {...} }
    if (response.data && response.data.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: "Payment status retrieved successfully",
      };
    } else {
      throw new Error(response.data?.message || "Failed to retrieve payment status");
    }
  } catch (error) {
    console.error("Payment Status Check Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to check payment status",
      error: error,
      data: error.response?.data || null,
    };
  }
};

/**
 * Generate unique transaction ID
 * Format: EXAM_{timestamp}_{random}
 * 
 * @returns {string} - Unique transaction ID
 */
export const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EXAM_${timestamp}_${random}`;
};

/**
 * Redirect to Easebuzz payment page
 * 
 * @param {string} paymentLink - Payment link received from initiate payment API
 */
export const redirectToPayment = (paymentLink) => {
  if (paymentLink) {
    window.location.href = paymentLink;
  } else {
    throw new Error("Payment link is required");
  }
};

export default {
  initiateEasebuzzPayment,
  checkTransactionStatus,
  generateTransactionId,
  redirectToPayment,
};

