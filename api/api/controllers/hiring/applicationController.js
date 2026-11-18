const JobApplication = require("../../models/hiring/JobApplication");

exports.submitApplication = async (req, res) => {
  try {
    const applicationData = { ...req.body };
    
    // Handle file upload (resume) if provided (multer)
    if (req.files && req.files.resume) {
      const resume = req.files.resume[0];
      applicationData.resume = resume.buffer;
      applicationData.resumeContentType = resume.mimetype;
      applicationData.resumeName = resume.originalname;
    } else if (req.file) { // if using upload.single('resume')
      applicationData.resume = req.file.buffer;
      applicationData.resumeContentType = req.file.mimetype;
      applicationData.resumeName = req.file.originalname;
    }

    const application = new JobApplication(applicationData);
    const savedApplication = await application.save();
    res.status(201).json({
      success: true,
      data: savedApplication,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.notificationId) {
      filter.notificationId = req.query.notificationId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await JobApplication.find(filter)
      .populate({
        path: "notificationId",
        select: "jobTitle departmentId",
        populate: {
          path: "departmentId",
          select: "title shortCode"
        }
      })
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate({
        path: "notificationId",
        select: "jobTitle departmentId",
        populate: {
          path: "departmentId",
          select: "title shortCode"
        }
      });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application || !application.resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    res.set("Content-Type", application.resumeContentType);
    res.set("Content-Disposition", `inline; filename="${application.resumeName}"`);
    res.send(application.resume);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
