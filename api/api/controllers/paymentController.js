import { createRazorpayOrder } from "../services/razorpayService.js";
import TransactionLog from "../models/transactionLog.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = "INR",
      receipt,
      cid,
      crn,
      remarks,
      paymentStatus = "PENDING",
      paymentMode = "ONLINE",
      paymentGateway = "Razorpay",
      transactionType = "ORDER",
    } = req.body;

    if (!amount || !receipt) {
      return res
        .status(400)
        .json({ error: "Amount and receipt are required." });
    }

    const order = await createRazorpayOrder({ amount, currency, receipt });

    const newLog = new TransactionLog({
      cid: cid || null,
      crn: crn || null,
      rid: order?.id || null,
      refno: receipt,
      amount: amount.toString(),
      remarks: remarks || "Initiated via Razorpay",
      paymentStatus,
      paymentMode,
      paymentGateway,
      transactionType,
      insertdate: new Date(),
      meta: order,
    });

    await newLog.save();

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    try {
      await new TransactionLog({
        amount: req.body.amount?.toString() || null,
        remarks: "Failed to create Razorpay order",
        paymentStatus: "FAILED",
        paymentGateway: "Razorpay",
        errorMessage: error.message,
        transactionType: "ORDER",
        insertdate: new Date(),
      }).save();
    } catch (logError) {
      console.error("Failed to log transaction error:", logError);
    }

    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};
