const Payment = require("../../models/admission/Payment");

exports.createPayment = async (req, res) => {
  try {
    const {
      studentId,
      selectedFees,
      paymentMethod,
      paymentDetails,
      referenceNumber,
      totalAmount,
    } = req.body;

    if (
      !studentId ||
      !selectedFees ||
      !paymentMethod ||
      !referenceNumber ||
      !totalAmount
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔹 Normalize paymentMethod (map challanNo → challan)
    let normalizedMethod = paymentMethod;
    let normalizedDetails = paymentDetails || {};

    if (paymentMethod === "challanNo") {
      normalizedMethod = "challan";
      normalizedDetails = { ...normalizedDetails, challanNo: referenceNumber };
      // optional: use referenceNumber as challanNo if not provided
    }

    const payment = new Payment({
      studentId,
      selectedFees,
      paymentMethod: normalizedMethod,
      paymentDetails: normalizedDetails,
      referenceNumber,
      totalAmount,
    });

    await payment.save();

    res.status(201).json({ message: "Payment recorded successfully", payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all Payments (optional)
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate(
      "studentId",
      "firstName lastName hallTicketNo"
    );
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Payment by ID (optional)
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      "studentId",
      "firstName lastName hallTicketNo"
    );
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPaymentsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const payments = await Payment.find({ studentId }).populate(
      "studentId",
      "firstName lastName hallTicketNo course campus"
    );

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments by studentId:", error);
    res.status(500).json({ message: "Server error" });
  }
};
