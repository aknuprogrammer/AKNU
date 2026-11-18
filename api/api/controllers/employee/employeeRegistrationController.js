const EmployeeRegistration = require("../../models/employee/EmployeeRegistration");
const User = require("../../models/User");
const { hashPassword } = require("../../utils/password_validate");

// Create new employee registration
const createEmployeeRegistration = async (req, res) => {
  try {
    // Debug logging
    console.log(
      "Files received:",
      req.files
        ? Array.isArray(req.files)
          ? req.files.length
          : Object.keys(req.files).length
        : 0
    );
    console.log("Body keys:", Object.keys(req.body));

    const registrationData = { ...req.body };

    // Handle qualifications - parse if it's a string
    if (
      registrationData.qualifications &&
      typeof registrationData.qualifications === "string"
    ) {
      try {
        registrationData.qualifications = JSON.parse(
          registrationData.qualifications
        );
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid qualifications format. Must be valid JSON.",
        });
      }
    }

    // Handle declaration - convert string "true"/"false" to boolean
    if (registrationData.declaration !== undefined) {
      registrationData.declaration =
        registrationData.declaration === "true" ||
        registrationData.declaration === true ||
        registrationData.declaration === "1";
    }

    // Handle file uploads (req.files is an array when using upload.any())
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Convert array to object for easier access
      const filesMap = {};
      req.files.forEach((file) => {
        if (!filesMap[file.fieldname]) {
          filesMap[file.fieldname] = [];
        }
        filesMap[file.fieldname].push(file);
      });

      // Photo
      if (filesMap.photo && filesMap.photo[0]) {
        registrationData.photo = filesMap.photo[0].buffer;
        registrationData.photoContentType = filesMap.photo[0].mimetype;
      }

      // Signature
      if (filesMap.signature && filesMap.signature[0]) {
        registrationData.signature = filesMap.signature[0].buffer;
        registrationData.signatureContentType = filesMap.signature[0].mimetype;
      }

      // Documents
      const documentFields = [
        "document10th",
        "documentInter",
        "documentGraduation",
        "documentPostGraduation",
        "documentPhd",
        "documentAadharCard",
        "documentPanCard",
        "documentBankDetails",
        "documentResume",
        "documentOtherCertificates",
        "documentAppointment",
      ];

      documentFields.forEach((field) => {
        if (filesMap[field] && filesMap[field][0]) {
          registrationData[field] = filesMap[field][0].buffer;
          registrationData[field + "ContentType"] = filesMap[field][0].mimetype;
        }
      });
    }

    // Generate employeeId if not provided (auto-generate when all details are submitted)
    if (!registrationData.employeeId) {
      // Find the highest existing employeeId number
      const lastEmployee = await EmployeeRegistration.findOne(
        { employeeId: { $exists: true, $ne: null } },
        { employeeId: 1 }
      ).sort({ employeeId: -1 });

      let newEmployeeNumber = 1;
      if (lastEmployee && lastEmployee.employeeId) {
        const match = lastEmployee.employeeId.match(/EMP(\d+)/);
        if (match) {
          newEmployeeNumber = parseInt(match[1]) + 1;
        }
      }

      registrationData.employeeId = `EMP${String(newEmployeeNumber).padStart(
        6,
        "0"
      )}`;
    }

    // Create employee registration
    const employeeRegistration = new EmployeeRegistration(registrationData);
    await employeeRegistration.save();

    // Create or update User with credentials if username and pin are provided
    if (registrationData.username && registrationData.pin) {
      // Convert pin to number (6 digits)
      const pinNumber = parseInt(registrationData.pin, 10);
      if (isNaN(pinNumber) || pinNumber < 100000 || pinNumber > 999999) {
        return res.status(400).json({
          success: false,
          error: "PIN must be a 6-digit number (100000-999999)",
        });
      }

      // Hash password if provided
      let hashedPassword = null;
      if (registrationData.password) {
        if (registrationData.password.length < 6) {
          return res.status(400).json({
            success: false,
            error: "Password must be at least 6 characters",
          });
        }
        hashedPassword = await hashPassword(registrationData.password);
      }

      // Find or create user
      let user = await User.findOne({
        $or: [
          { employeeId: registrationData.employeeId },
          { email: registrationData.email || registrationData.gmail },
          { username: registrationData.username.toLowerCase().trim() },
        ],
      });

      if (user) {
        // Update existing user with credentials
        user.username = registrationData.username.toLowerCase().trim();
        user.pin = pinNumber;
        if (hashedPassword) {
          user.password = hashedPassword;
        }
        if (registrationData.employeeId)
          user.employeeId = registrationData.employeeId;
        if (registrationData.email || registrationData.gmail) {
          user.email = registrationData.email || registrationData.gmail;
        }
        user.updatedAt = new Date();
        await user.save();
      } else {
        // Create new user with credentials
        user = new User({
          username: registrationData.username.toLowerCase().trim(),
          pin: pinNumber,
          password: hashedPassword,
          email:
            registrationData.email ||
            registrationData.gmail ||
            `${registrationData.username}@example.com`,
          employeeId: registrationData.employeeId,
          role: "employee",
        });
        await user.save();
      }

      // Link employee registration to user
      employeeRegistration.userId = user._id;
      await employeeRegistration.save();
    }

    // Exclude binary data from response
    const responseData = employeeRegistration.toObject();
    delete responseData.photo;
    delete responseData.signature;
    documentFields.forEach((field) => {
      delete responseData[field];
    });

    res.status(201).json({
      success: true,
      message: "Employee registration created successfully",
      data: responseData,
      credentialsCreated: !!credentials,
    });
  } catch (error) {
    console.error("Error creating employee registration:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      error: "Error creating employee registration",
      details: error.message,
    });
  }
};

// Get all employee registrations
const getEmployeeRegistrations = async (req, res) => {
  try {
    const {
      status,
      department,
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { gmail: { $regex: search, $options: "i" } },
        { contactNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [records, total] = await Promise.all([
      EmployeeRegistration.find(query)
        // Exclude binary document fields for performance, but include all other data
        .select(
          "-photo -signature -document10th -documentInter -documentGraduation -documentPostGraduation -documentPhd -documentAadharCard -documentPanCard -documentBankDetails -documentResume -documentOtherCertificates -documentAppointment"
        )
        .populate(
          "userId",
          "username email employeeId fullName phone department jobTitle role"
        )
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      EmployeeRegistration.countDocuments(query),
    ]);

    // Transform data to include all employee details with document metadata
    const transformedRecords = records.map((record) => {
      // Create document metadata (check contentType to determine if document exists)
      const documents = {
        photo: {
          exists: !!record.photoContentType,
          contentType: record.photoContentType || null,
        },
        signature: {
          exists: !!record.signatureContentType,
          contentType: record.signatureContentType || null,
        },
        document10th: {
          exists: !!record.document10thContentType,
          contentType: record.document10thContentType || null,
        },
        documentInter: {
          exists: !!record.documentInterContentType,
          contentType: record.documentInterContentType || null,
        },
        documentGraduation: {
          exists: !!record.documentGraduationContentType,
          contentType: record.documentGraduationContentType || null,
        },
        documentPostGraduation: {
          exists: !!record.documentPostGraduationContentType,
          contentType: record.documentPostGraduationContentType || null,
        },
        documentPhd: {
          exists: !!record.documentPhdContentType,
          contentType: record.documentPhdContentType || null,
        },
        documentAadharCard: {
          exists: !!record.documentAadharCardContentType,
          contentType: record.documentAadharCardContentType || null,
        },
        documentPanCard: {
          exists: !!record.documentPanCardContentType,
          contentType: record.documentPanCardContentType || null,
        },
        documentBankDetails: {
          exists: !!record.documentBankDetailsContentType,
          contentType: record.documentBankDetailsContentType || null,
        },
        documentResume: {
          exists: !!record.documentResumeContentType,
          contentType: record.documentResumeContentType || null,
        },
        documentOtherCertificates: {
          exists: !!record.documentOtherCertificatesContentType,
          contentType: record.documentOtherCertificatesContentType || null,
        },
        documentAppointment: {
          exists: !!record.documentAppointmentContentType,
          contentType: record.documentAppointmentContentType || null,
        },
      };

      return {
        // Employee ID
        employeeId: record.employeeId,
        _id: record._id,

        // Personal Information
        firstName: record.firstName,
        lastName: record.lastName,
        employeeName: `${record.firstName} ${record.lastName}`, // Convenience field
        gender: record.gender,
        dob: record.dob,
        dateOfBirth: record.dob, // Alias for consistency
        contactNumber: record.contactNumber,
        phoneNumber: record.contactNumber, // Alias
        alternativeNumber: record.alternativeNumber,
        gmail: record.gmail,
        email: record.gmail, // Alias
        aadharNumber: record.aadharNumber,

        // Parent Information
        fatherName: record.fatherName,
        fatherPhoneNumber: record.fatherPhoneNumber,
        motherName: record.motherName,
        motherPhoneNumber: record.motherPhoneNumber,

        // Current Address
        currentAddress: {
          line1: record.currentAddressLine1,
          line2: record.currentAddressLine2,
          city: record.currentCity,
          state: record.currentState,
          pincode: record.currentPincode,
        },
        currentAddressLine1: record.currentAddressLine1,
        currentAddressLine2: record.currentAddressLine2,
        currentCity: record.currentCity,
        currentState: record.currentState,
        currentPincode: record.currentPincode,

        // Permanent Address
        permanentAddress: {
          line1: record.permanentAddressLine1,
          line2: record.permanentAddressLine2,
          city: record.permanentCity,
          state: record.permanentState,
          pincode: record.permanentPincode,
        },
        permanentAddressLine1: record.permanentAddressLine1,
        permanentAddressLine2: record.permanentAddressLine2,
        permanentCity: record.permanentCity,
        permanentState: record.permanentState,
        permanentPincode: record.permanentPincode,

        // Qualifications
        qualifications: record.qualifications || [],

        // Experience Details
        experience: {
          collegeName: record.experienceCollegeName,
          experience: record.experience,
          location: record.location,
          domain: record.domain,
        },
        experienceCollegeName: record.experienceCollegeName,
        experience: record.experience,
        location: record.location,
        domain: record.domain,
        skills: record.skills,

        // Job Details
        jobDetails: {
          title: record.jobTitle,
          role: record.jobRole,
          joiningDate: record.joiningDate,
          department: record.department,
        },
        jobTitle: record.jobTitle,
        jobRole: record.jobRole,
        joiningDate: record.joiningDate,
        department: record.department,

        // Bank Details
        bankDetails: {
          accountNumber: record.accountNumber,
          ifscCode: record.ifscCode,
          bankName: record.bankName,
          branchName: record.branchName,
          accountHolderName: record.accountHolderName,
          panCardNumber: record.panCardNumber,
        },
        accountNumber: record.accountNumber,
        ifscCode: record.ifscCode,
        bankName: record.bankName,
        branchName: record.branchName,
        accountHolderName: record.accountHolderName,
        panCardNumber: record.panCardNumber,

        // Documents Metadata (binary excluded for performance)
        documents,

        // Credentials Information
        credentials: record.userId
          ? {
              username: record.userId.username,
              email: record.userId.email,
              employeeId: record.userId.employeeId,
            }
          : null,

        // Declaration
        declaration: record.declaration || false,

        // Status
        status: record.status,

        // Timestamps
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: transformedRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching employee registrations:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching employee registrations",
      details: error.message,
    });
  }
};

// Get single employee registration by ID
const getEmployeeRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await EmployeeRegistration.findById(id)
      .select(
        "-photo -signature -document10th -documentInter -documentGraduation -documentPostGraduation -documentPhd -documentAadharCard -documentPanCard -documentBankDetails -documentResume -documentOtherCertificates -documentAppointment"
      )
      .populate(
        "userId",
        "username email employeeId fullName phone department jobTitle role"
      )
      .lean();

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Employee registration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Error fetching employee registration:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching employee registration",
      details: error.message,
    });
  }
};

// Update employee registration
const updateEmployeeRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle qualifications - parse if it's a string
    if (
      updateData.qualifications &&
      typeof updateData.qualifications === "string"
    ) {
      try {
        updateData.qualifications = JSON.parse(updateData.qualifications);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid qualifications format. Must be valid JSON.",
        });
      }
    }

    // Handle declaration - convert string "true"/"false" to boolean
    if (updateData.declaration !== undefined) {
      updateData.declaration =
        updateData.declaration === "true" ||
        updateData.declaration === true ||
        updateData.declaration === "1";
    }

    // Handle file uploads (req.files is an array when using upload.any())
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Convert array to object for easier access
      const filesMap = {};
      req.files.forEach((file) => {
        if (!filesMap[file.fieldname]) {
          filesMap[file.fieldname] = [];
        }
        filesMap[file.fieldname].push(file);
      });

      // Photo
      if (filesMap.photo && filesMap.photo[0]) {
        updateData.photo = filesMap.photo[0].buffer;
        updateData.photoContentType = filesMap.photo[0].mimetype;
      }

      // Signature
      if (filesMap.signature && filesMap.signature[0]) {
        updateData.signature = filesMap.signature[0].buffer;
        updateData.signatureContentType = filesMap.signature[0].mimetype;
      }

      // Documents
      const documentFields = [
        "document10th",
        "documentInter",
        "documentGraduation",
        "documentPostGraduation",
        "documentPhd",
        "documentAadharCard",
        "documentPanCard",
        "documentBankDetails",
        "documentResume",
        "documentOtherCertificates",
        "documentAppointment",
      ];

      documentFields.forEach((field) => {
        if (filesMap[field] && filesMap[field][0]) {
          updateData[field] = filesMap[field][0].buffer;
          updateData[field + "ContentType"] = filesMap[field][0].mimetype;
        }
      });
    }

    // Update credentials in User if username, pin, or password is provided
    if (updateData.username || updateData.pin || updateData.password) {
      const registration = await EmployeeRegistration.findById(id);
      if (!registration) {
        return res.status(404).json({
          success: false,
          error: "Employee registration not found",
        });
      }

      // Find the user linked to this registration
      if (registration.userId) {
        const user = await User.findById(registration.userId);
        if (user) {
          // Update credentials in User
          if (updateData.username) {
            user.username = updateData.username.toLowerCase().trim();
          }
          if (updateData.pin) {
            // Convert pin to number (6 digits)
            const pinNumber = parseInt(updateData.pin, 10);
            if (isNaN(pinNumber) || pinNumber < 100000 || pinNumber > 999999) {
              return res.status(400).json({
                success: false,
                error: "PIN must be a 6-digit number (100000-999999)",
              });
            }
            user.pin = pinNumber;
          }
          if (updateData.password) {
            // Validate and hash password
            if (updateData.password.length < 6) {
              return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters",
              });
            }
            user.password = await hashPassword(updateData.password);
          }
          user.updatedAt = new Date();
          await user.save();
        }
      } else {
        // If no user exists, create one with credentials
        if (updateData.username && updateData.pin) {
          const pinNumber = parseInt(updateData.pin, 10);
          if (isNaN(pinNumber) || pinNumber < 100000 || pinNumber > 999999) {
            return res.status(400).json({
              success: false,
              error: "PIN must be a 6-digit number (100000-999999)",
            });
          }

          let hashedPassword = null;
          if (updateData.password) {
            if (updateData.password.length < 6) {
              return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters",
              });
            }
            hashedPassword = await hashPassword(updateData.password);
          }

          const newUser = new User({
            username: updateData.username.toLowerCase().trim(),
            pin: pinNumber,
            password: hashedPassword,
            email:
              updateData.email ||
              updateData.gmail ||
              `${updateData.username}@example.com`,
            employeeId: registration.employeeId,
            role: "employee",
          });
          await newUser.save();

          // Link registration to user
          registration.userId = newUser._id;
          await registration.save();
        }
      }

      // Remove from updateData as they're handled separately
      delete updateData.username;
      delete updateData.pin;
      delete updateData.password;
    }

    const registration = await EmployeeRegistration.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select(
        "-photo -signature -document10th -documentInter -documentGraduation -documentPostGraduation -documentPhd -documentAadharCard -documentPanCard -documentBankDetails -documentResume -documentOtherCertificates -documentAppointment"
      )
      .populate(
        "userId",
        "username email employeeId fullName phone department jobTitle role"
      );

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Employee registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee registration updated successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Error updating employee registration:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      error: "Error updating employee registration",
      details: error.message,
    });
  }
};

// Delete employee registration
const deleteEmployeeRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await EmployeeRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Employee registration not found",
      });
    }

    // Delete associated credentials if exists
    // Note: User record is not deleted here to preserve login credentials
    // If you want to delete user, uncomment below:
    // if (registration.userId) {
    //   await User.findByIdAndDelete(registration.userId);
    // }

    // Delete registration
    await EmployeeRegistration.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Employee registration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee registration:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting employee registration",
      details: error.message,
    });
  }
};

// Get document/file
const getDocument = async (req, res) => {
  try {
    const { id, docType } = req.params;

    const registration = await EmployeeRegistration.findById(id).select(
      "+photo +signature +document10th +documentInter +documentGraduation +documentPostGraduation +documentPhd +documentAadharCard +documentPanCard +documentBankDetails +documentResume +documentOtherCertificates +documentAppointment"
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Employee registration not found",
      });
    }

    const documentMap = {
      photo: {
        buffer: registration.photo,
        contentType: registration.photoContentType || "image/jpeg",
      },
      signature: {
        buffer: registration.signature,
        contentType: registration.signatureContentType || "image/png",
      },
      document10th: {
        buffer: registration.document10th,
        contentType: registration.document10thContentType || "application/pdf",
      },
      documentInter: {
        buffer: registration.documentInter,
        contentType: registration.documentInterContentType || "application/pdf",
      },
      documentGraduation: {
        buffer: registration.documentGraduation,
        contentType:
          registration.documentGraduationContentType || "application/pdf",
      },
      documentPostGraduation: {
        buffer: registration.documentPostGraduation,
        contentType:
          registration.documentPostGraduationContentType || "application/pdf",
      },
      documentPhd: {
        buffer: registration.documentPhd,
        contentType: registration.documentPhdContentType || "application/pdf",
      },
      documentAadharCard: {
        buffer: registration.documentAadharCard,
        contentType:
          registration.documentAadharCardContentType || "application/pdf",
      },
      documentPanCard: {
        buffer: registration.documentPanCard,
        contentType:
          registration.documentPanCardContentType || "application/pdf",
      },
      documentBankDetails: {
        buffer: registration.documentBankDetails,
        contentType:
          registration.documentBankDetailsContentType || "application/pdf",
      },
      documentResume: {
        buffer: registration.documentResume,
        contentType:
          registration.documentResumeContentType || "application/pdf",
      },
      documentOtherCertificates: {
        buffer: registration.documentOtherCertificates,
        contentType:
          registration.documentOtherCertificatesContentType ||
          "application/pdf",
      },
      documentAppointment: {
        buffer: registration.documentAppointment,
        contentType:
          registration.documentAppointmentContentType || "application/pdf",
      },
    };

    const document = documentMap[docType];

    if (!document || !document.buffer) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    res.set("Content-Type", document.contentType);
    res.set("Content-Disposition", `inline; filename="${docType}.pdf"`);
    res.send(document.buffer);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching document",
      details: error.message,
    });
  }
};

module.exports = {
  createEmployeeRegistration,
  getEmployeeRegistrations,
  getEmployeeRegistrationById,
  updateEmployeeRegistration,
  deleteEmployeeRegistration,
  getDocument,
};
