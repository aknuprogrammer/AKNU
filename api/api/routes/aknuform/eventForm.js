
const express = require("express");
const eventFormSchema = require("../../models/examination/aknuform/eventForm");
const authenticationMiddleware = require("../../middlewares/authentication");
const Razorpay = require("razorpay");
const { AlumniEventAddModel } = require("../../models/examination/aknuform/Alumni_Related_Models");
const eventForm = require("../../models/examination/aknuform/eventForm");
const dotenv = require("dotenv");
const { v4 : uuidv4 } = require("uuid");

const eventFormRouter = express.Router();

dotenv.config(); // ✅ Load .env before anything else

// POST request to create a new event form entry
eventFormRouter.post("/create-new-form", async (req, res) => {
  try {
    const { eventId, ...formData } = req.body;
    // if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    //   throw new Error("Razorpay API keys are missing in .env");
    // }
    
    // // ✅ Initialize Razorpay client
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });
    // ✅ Fetch event by ID (Check Alumni Event first, then General Event)
    let event = await AlumniEventAddModel.findById(eventId);
    let eventCreatedBy = "ALUMNI";
    
    if (!event) {
      const generalEventSchema = require("../../models/LatestEvents");
      event = await generalEventSchema.findById(eventId);
      eventCreatedBy = "GENERAL";
    }

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    let razorpayOrder = null;
    
    // ✅ If event is paid, create a Razorpay order
    if (event.eventType === "paid") {
      // Ensure Razorpay keys are available in .env
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay API keys are missing in .env");
      }
      
      // Initialize Razorpay client
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      if (!event.amount || isNaN(event.amount)) {
        return res.status(400).json({ error: "Invalid event amount" });
      }
      
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(event.amount * 100), // Razorpay requires amount in paisa
        currency: "INR",
        receipt: `receipt_${uuidv4()}`.slice(0, 40), // keep receipt within 40 chars
        notes: {
          eventId: event._id.toString(),
          studentName: formData.name || "Anonymous",
        },
      });

      // Attach payment details to form
      formData.paymentAmountRs = event.amount;
      formData.razorpayOrderId = razorpayOrder.id;
    }

    // ✅ Save form entry in DB
    const newForm = new eventForm({
      ...formData,
      eventTitle: event.title,
      eventCreatedBy: eventCreatedBy,
    });
    const savedForm = await newForm.save();

    // ✅ Send response back to frontend
    res.status(201).json({
      success: true,
      form: JSON.parse(JSON.stringify(savedForm)),
      razorpayOrder: JSON.parse(JSON.stringify(razorpayOrder)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


eventFormRouter.post("/confirm-payment", async (req, res) => {
  console.log("BABABABABAB")
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, docId } = req.body;

    // const body = razorpay_order_id + "|" + razorpay_payment_id;
    // const expectedSignature = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    //   .update(body.toString())
    //   .digest("hex");

    // if (expectedSignature !== razorpay_signature) {
    //   return res.status(400).json({ error: "Invalid signature" });
    // }

    // Update student registration
    console.log("YYYYYY",docId);
    const form = await eventForm.findOneAndUpdate(
      { _id: docId },
      {
        paymentStatus: "SUCCESS",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    res.json({ success: true, form });
  } catch (error) {
    console.log("JJJJJ", error)
    res.status(500).json({ error: error.message });
  }
});


// PUT request to update decision status
eventFormRouter.put("/update-decision/:id",authenticationMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.query;

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Invalid action. Use 'approve' or 'reject'." });
    }

    const updatedForm = await eventFormSchema.findByIdAndUpdate(
      id,
      { decision: action === "approve" ? "approve" : "rejected" },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ error: "Form not found." });
    }

    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET request to fetch all event form entries
eventFormRouter.get("/", async (req, res) => {
  try {
    // Find forms where the decision is 'pending'
    const forms = await eventFormSchema.find();
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET request to fetch filtered event form entries based on branch (and optionally other fields)



module.exports = eventFormRouter;
