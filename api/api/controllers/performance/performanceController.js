const PerformanceCycle = require("../../models/performance/PerformanceCycle");
const PerformanceReview = require("../../models/performance/PerformanceReview");
const EmployeeRegistration = require("../../models/employee/EmployeeRegistration");

// --- Cycle Management ---

exports.createCycle = async (req, res) => {
  try {
    const { name, startDate, endDate, description } = req.body;
    const cycle = new PerformanceCycle({
      name,
      startDate,
      endDate,
      description,
      createdBy: req.user?._id, // Assuming auth middleware adds user
    });
    await cycle.save();
    res.status(201).json(cycle);
  } catch (error) {
    res.status(500).json({ message: "Error creating cycle", error: error.message });
  }
};

exports.getCycles = async (req, res) => {
  try {
    const cycles = await PerformanceCycle.find().sort({ createdAt: -1 });
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cycles", error: error.message });
  }
};

exports.getActiveCycle = async (req, res) => {
  try {
    const cycle = await PerformanceCycle.findOne({ status: "Active" }).sort({ createdAt: -1 });
    if (!cycle) return res.status(404).json({ message: "No active performance cycle found" });
    res.json(cycle);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active cycle", error: error.message });
  }
};

// --- Employee Actions ---

exports.getEmployeeReview = async (req, res) => {
  try {
    const { employeeId, cycleId } = req.params;
    
    // Find review for this employee in this cycle
    const review = await PerformanceReview.findOne({
      employeeId: employeeId,
      cycleId: cycleId,
    }).populate("employeeObjectId", "firstName lastName employeeId designation department");

    if (!review) {
       return res.status(200).json(null); // Return null if not started yet
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Error fetching review", error: error.message });
  }
};

exports.submitSelfAssessment = async (req, res) => {
  try {
    const { employeeId, cycleId, selfAssessment } = req.body;

    // Find the employee object ID first
    const employee = await EmployeeRegistration.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Check if review already exists
    let review = await PerformanceReview.findOne({ employeeId, cycleId });

    if (review) {
      // Update existing
      review.selfAssessment = { ...review.selfAssessment, ...selfAssessment, submissionDate: new Date() };
      review.status = "Submitted";
    } else {
      // Create new
      review = new PerformanceReview({
        employeeId,
        employeeObjectId: employee._id,
        cycleId,
        selfAssessment: { ...selfAssessment, submissionDate: new Date() },
        status: "Submitted",
      });
    }

    await review.save();
    res.status(200).json(review);
  } catch (error) {
      console.log(error);
    res.status(500).json({ message: "Error submitting self assessment", error: error.message });
  }
};

// --- Manager Actions ---

exports.getAllReviewsForCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const reviews = await PerformanceReview.find({ cycleId })
      .populate("employeeObjectId", "firstName lastName department designation joiningDate employeeId") // Populate employee details
      .populate("managerAssessment.reviewerId", "username"); // Optional
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

exports.updateManagerAssessment = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { managerAssessment, selfAssessment } = req.body;

    const review = await PerformanceReview.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (managerAssessment) {
        review.managerAssessment = {
            ...review.managerAssessment,
            ...managerAssessment,
            reviewerId: req.user?._id, // Capture who reviewed
            reviewDate: new Date()
        };
    }

    if (selfAssessment) {
        review.selfAssessment = {
            ...review.selfAssessment,
            ...selfAssessment
        };
    }
    
    // Determine status based on approval
    if (managerAssessment?.approvalStatus === "Approved" || managerAssessment?.approvalStatus === "Rejected") {
        review.status = "Completed";
    } else if (review.status === "Submitted") {
        review.status = "UnderReview";
    }

    await review.save();
    res.json(review);

  } catch (error) {
    res.status(500).json({ message: "Error updating manager assessment", error: error.message });
  }
};

exports.lockCycle = async (req, res) => {
    try {
        const { cycleId } = req.params;
        const cycle = await PerformanceCycle.findByIdAndUpdate(cycleId, { status: "Locked" }, { new: true });
        // Optionally lock all reviews in this cycle
        await PerformanceReview.updateMany({ cycleId }, { status: "Locked" });
        res.json(cycle);
    } catch (error) {
        res.status(500).json({ message: "Error locking cycle", error: error.message });
    }
}
