const IdeaSubmission = require("../models/IdeaSubmission");

exports.submitIdea = async (req, res) => {
  try {
    const { name, email, mobile, college, addr, agree } = req.body;
    // Validate required fields
    const idea = req.file;

    if (
      !name ||
      !email ||
      !mobile ||
      !college ||
      !addr ||
      !idea ||
      agree === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: name, email, mobile, college, addr, idea, agree",
      });
    }

    const saved = await IdeaSubmission.create({
      name,
      email,
      mobile,
      college,
      addr,
      idea,
      agree,
    });

    return res.status(201).json({
      success: true,
      message: "Idea submitted successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
