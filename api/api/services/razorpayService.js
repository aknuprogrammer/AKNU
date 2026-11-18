import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

/**
 * Create a Razorpay order
 * @param {number} amount - in paisa
 * @param {string} currency - e.g., "INR"
 * @param {string} receipt - your internal reference, like registration number
 */
export const createRazorpayOrder = async ({ amount, currency = "INR", receipt }) => {
  const options = {
    amount,
    currency,
    receipt,
    payment_capture: 1,
  };

  const order = await razorpayInstance.orders.create(options);
  return order;
};
