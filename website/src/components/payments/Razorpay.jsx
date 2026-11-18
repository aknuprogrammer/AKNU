import axios from "axios";

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });
};

export const openRazorpay = async ({
  amountPaisa,
  currency = "INR",
  name = "",
  email = "",
  contact = "",
  cid,
  crn,
  remarks = "Initiated via Razorpay",
}) => {
  if (!amountPaisa || !currency) {
    return alert("Payment fields are required !!!");
  }

  await loadRazorpayScript();

  // Generate receipt / reference number
  const receipt = `S${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}api/payment/order`, {
      amount: amountPaisa,
      currency,
      receipt,
      remarks,
      cid,
      crn,
      paymentStatus: "PENDING",            // fixed for new orders
      paymentMode: "ONLINE",               // Razorpay = Online
      paymentGateway: "Razorpay",          // Gateway used
      transactionType: "ORDER",            // You can also use enums here if needed
    });

    const orderId = res?.data?.order?.id;

    if (!orderId) {
      alert("Failed to create payment order.");
      return;
    }

    const options = {
      key: "rzp_test_CIu8x9gDcAj3xf", // Your Razorpay key ID
      amount: amountPaisa,
      currency,
      name: "AKNU Certificates",
      description: "Registration Payment",
      order_id: orderId,
      handler: function (response) {
        alert("Payment Successful!");
        console.log("Razorpay Success Response:", response);
        // Optional: Send success response to backend to verify and update status
      },
      prefill: {
        name,
        email,
        contact,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Order creation error:", error);
    alert("Something went wrong during order creation.");
  }
};
