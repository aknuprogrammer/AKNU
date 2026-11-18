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
    orderId,
    name = "",
    email = "",
    contact = "",
    onSuccess = () => {},
    onFailure = () => {},
}) => {
    if (!orderId || !amountPaisa || !currency) {
        alert("Payment fields are required !!!");
        return;
    }

    await loadRazorpayScript();

    const options = {
        key: "rzp_test_CIu8x9gDcAj3xf",
        amount: amountPaisa, // in paisa
        currency: currency,
        method: {
            upi: true,
        },
        name: "AKNU",
        description: "Donation Payment",
        order_id: orderId,
        handler: function (response) {
            console.log("RAZORPAY Payment Success:", response);
            onSuccess(response);
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

    // Failure / Cancellation
    rzp.on("payment.failed", function (response) {
        console.error("RAZORPAY Payment Failed:", response.error);
        onFailure(response.error);
    });

    rzp.open();
};