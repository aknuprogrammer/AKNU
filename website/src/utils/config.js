const YOUTUBE_ID = "Xcfj6Hexj9A";

// ============================================
// Easebuzz Payment Gateway Configuration
// ============================================
// These values are read from environment variables (.env file)
// Make sure to add VITE_EASEBUZZ_MERCHANT_KEY and VITE_EASEBUZZ_SALT_KEY to your .env file
const EASEBUZZ_CONFIG = {
  MERCHANT_KEY: import.meta.env.VITE_EASEBUZZ_MERCHANT_KEY || "",
  SALT_KEY: import.meta.env.VITE_EASEBUZZ_SALT_KEY || "",
  // API Endpoints
  INITIATE_PAYMENT_URL: "https://testpay.easebuzz.in/payment/initiateLink",
  TRANSACTION_STATUS_URL: "https://testdashboard.easebuzz.in/transaction/v2.1/retrieve",
};

export { YOUTUBE_ID, EASEBUZZ_CONFIG };