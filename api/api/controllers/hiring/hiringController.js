const HiringNotification = require("../../models/hiring/HiringNotification");

exports.createNotification = async (req, res) => {
  try {
    const notification = new HiringNotification(req.body);
    const savedNotification = await notification.save();
    res.status(201).json({
      success: true,
      data: savedNotification,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await HiringNotification.find()
      .populate("departmentId", "title shortCode")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await HiringNotification.findById(req.params.id)
      .populate("departmentId", "title shortCode");
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const { Model_Jobs } = require("../../models/Important_Information");

exports.updateNotification = async (req, res) => {
  try {
    const existingNotification = await HiringNotification.findById(req.params.id);
    if (!existingNotification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const notification = await HiringNotification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Sync with Model_Jobs
    if (req.body.status && req.body.status !== existingNotification.status) {
      if (req.body.status === "Open") {
        // Publish: Create in Model_Jobs
        const newJob = new Model_Jobs({
          title: notification.jobTitle,
          date: new Date(),
          link: `/jobs/notification/${notification._id}`
        });
        const savedJob = await newJob.save();
        notification.publishedJobId = savedJob._id;
        await notification.save();
      } else if (req.body.status === "Closed" || req.body.status === "Archived") {
        // Unpublish: Remove from Model_Jobs
        if (notification.publishedJobId) {
          await Model_Jobs.findByIdAndDelete(notification.publishedJobId);
          notification.publishedJobId = undefined;
          await notification.save();
        }
      }
    } else if (notification.status === "Open" && notification.publishedJobId && req.body.jobTitle) {
      // If already published and title changed, sync the title
      await Model_Jobs.findByIdAndUpdate(notification.publishedJobId, {
        title: notification.jobTitle
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await HiringNotification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Remove from Model_Jobs if it was published
    if (notification.publishedJobId) {
      await Model_Jobs.findByIdAndDelete(notification.publishedJobId);
    }

    await HiringNotification.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
