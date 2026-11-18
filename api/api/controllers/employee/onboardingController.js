const Onboarding = require("../../models/employee/Onboarding");
const User = require("../../models/User");
const { hashPassword } = require("../../utils/password_validate");

// Create new onboarding record
const createOnboarding = async (req, res) => {
  try {
    const onboardingData = { ...req.body };
    console.log("_________onboardingData", onboardingData);
    // Handle email field - map 'email' to 'gmail' if needed
    if (onboardingData.email && !onboardingData.gmail) {
      onboardingData.gmail = onboardingData.email;
      delete onboardingData.email;
    }

    // Validate email/gmail is provided and not empty
    if (!onboardingData.gmail || onboardingData.gmail.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Email (gmail) is required and cannot be empty",
      });
    }

    // Normalize email
    onboardingData.gmail = onboardingData.gmail.trim().toLowerCase();

    // Check for duplicate email before saving
    const existingEmail = await Onboarding.findOne({
      gmail: onboardingData.gmail,
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: `Email ${onboardingData.gmail} is already registered`,
      });
    }

    // Check for duplicate Aadhar number if provided
    if (onboardingData.aadharNumber) {
      const existingAadhar = await Onboarding.findOne({
        aadharNumber: onboardingData.aadharNumber,
      });
      if (existingAadhar) {
        return res.status(400).json({
          success: false,
          error: `Aadhar number ${onboardingData.aadharNumber} is already registered`,
        });
      }
    }

    // Handle qualifications - parse if it's a string
    if (
      onboardingData.qualifications &&
      typeof onboardingData.qualifications === "string"
    ) {
      try {
        onboardingData.qualifications = JSON.parse(
          onboardingData.qualifications
        );
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid qualifications format. Must be valid JSON.",
        });
      }
    }

    // Handle experiences - parse if it's a string
    if (
      onboardingData.experiences &&
      typeof onboardingData.experiences === "string"
    ) {
      try {
        onboardingData.experiences = JSON.parse(onboardingData.experiences);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid experiences format. Must be valid JSON.",
        });
      }
    }

    // Handle skills - parse if it's a string
    if (onboardingData.skills && typeof onboardingData.skills === "string") {
      try {
        onboardingData.skills = JSON.parse(onboardingData.skills);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid skills format. Must be valid JSON.",
        });
      }
    }

    // Handle documents array - map frontend 'documents' to model 'additionalDocuments'
    // Frontend sends 'documents' array, we store it as 'additionalDocuments' in the model
    // Also clean up any documents[0][file] metadata objects from body (actual files come via Multer)
    if (onboardingData.documents && !onboardingData.additionalDocuments) {
      onboardingData.additionalDocuments = onboardingData.documents;
      delete onboardingData.documents;
    }

    // Remove any documents[X][file] metadata objects from body (these are just metadata, actual files come via Multer)
    Object.keys(onboardingData).forEach((key) => {
      if (key.match(/^documents\[\d+\]\[file\]$/)) {
        delete onboardingData[key];
      }
    });

    // Handle additionalDocuments/documents - parse if it's a string
    if (
      onboardingData.additionalDocuments &&
      typeof onboardingData.additionalDocuments === "string"
    ) {
      try {
        onboardingData.additionalDocuments = JSON.parse(
          onboardingData.additionalDocuments
        );
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid documents format. Must be valid JSON.",
        });
      }
    }

    // Handle date parsing for dob, joiningDate
    if (onboardingData.dob && typeof onboardingData.dob === "string") {
      onboardingData.dob = new Date(onboardingData.dob);
    }
    if (
      onboardingData.joiningDate &&
      typeof onboardingData.joiningDate === "string"
    ) {
      onboardingData.joiningDate = new Date(onboardingData.joiningDate);
    }

    // Handle date parsing for experiences
    if (
      onboardingData.experiences &&
      Array.isArray(onboardingData.experiences)
    ) {
      onboardingData.experiences = onboardingData.experiences.map((exp) => {
        if (exp.fromDate && typeof exp.fromDate === "string") {
          exp.fromDate = new Date(exp.fromDate);
        }
        if (exp.toDate && typeof exp.toDate === "string") {
          exp.toDate = new Date(exp.toDate);
        }
        return exp;
      });
    }

    // Handle declaration - convert string "true"/"false" to boolean
    if (onboardingData.declaration !== undefined) {
      onboardingData.declaration =
        onboardingData.declaration === "true" ||
        onboardingData.declaration === true ||
        onboardingData.declaration === "1";
    }

    // Handle photo metadata from request body (if sent as object, before file uploads)
    if (
      onboardingData.photo &&
      typeof onboardingData.photo === "object" &&
      !Buffer.isBuffer(onboardingData.photo)
    ) {
      // Extract photo metadata from object
      if (onboardingData.photo.name) {
        onboardingData.photoName = onboardingData.photo.name;
      }
      if (onboardingData.photo.size) {
        onboardingData.photoSize = onboardingData.photo.size;
      }
      if (onboardingData.photo.fileType) {
        onboardingData.photoContentType = onboardingData.photo.fileType;
      }
      // Remove the photo object from body - actual file should come via multer
      delete onboardingData.photo;
    }

    // Handle signature metadata from request body (if sent as object, before file uploads)
    if (
      onboardingData.signature &&
      typeof onboardingData.signature === "object" &&
      !Buffer.isBuffer(onboardingData.signature)
    ) {
      // Extract signature metadata from object
      if (onboardingData.signature.name) {
        onboardingData.signatureName = onboardingData.signature.name;
      }
      if (onboardingData.signature.size) {
        onboardingData.signatureSize = onboardingData.signature.size;
      }
      if (onboardingData.signature.fileType) {
        onboardingData.signatureContentType = onboardingData.signature.fileType;
      }
      // Remove the signature object from body - actual file should come via multer
      delete onboardingData.signature;
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

      // Photo - file upload takes precedence over body metadata
      if (filesMap.photo && filesMap.photo[0]) {
        onboardingData.photo = filesMap.photo[0].buffer;
        onboardingData.photoContentType = filesMap.photo[0].mimetype;
        onboardingData.photoName = filesMap.photo[0].originalname;
        onboardingData.photoSize = filesMap.photo[0].size;
      }

      // Signature - file upload takes precedence over body metadata
      if (filesMap.signature && filesMap.signature[0]) {
        onboardingData.signature = filesMap.signature[0].buffer;
        onboardingData.signatureContentType = filesMap.signature[0].mimetype;
        onboardingData.signatureName = filesMap.signature[0].originalname;
        onboardingData.signatureSize = filesMap.signature[0].size;
      }

      // Handle documents files - pattern: documents[0][file], documents[1][file], etc.
      // Frontend sends files as documents[0][file], we map to additionalDocuments in model
      if (
        onboardingData.additionalDocuments &&
        Array.isArray(onboardingData.additionalDocuments)
      ) {
        onboardingData.additionalDocuments =
          onboardingData.additionalDocuments.map((doc, index) => {
            // Check for both patterns: documents[0][file] and additionalDocuments[0][file]
            const fileFieldName1 = `documents[${index}][file]`;
            const fileFieldName2 = `additionalDocuments[${index}][file]`;

            let file = null;
            if (filesMap[fileFieldName1] && filesMap[fileFieldName1][0]) {
              file = filesMap[fileFieldName1][0];
            } else if (
              filesMap[fileFieldName2] &&
              filesMap[fileFieldName2][0]
            ) {
              file = filesMap[fileFieldName2][0];
            }

            if (file) {
              doc.file = file.buffer;
              doc.fileContentType = file.mimetype;
              doc.fileName = file.originalname;
              doc.fileSize = file.size;
            }
            return doc;
          });
      }
    }

    // Generate employeeId if not provided (auto-generate when all details are submitted)
    if (!onboardingData.employeeId) {
      // Find the highest existing employeeId number
      const lastEmployee = await Onboarding.findOne(
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

      onboardingData.employeeId = `EMP${String(newEmployeeNumber).padStart(
        6,
        "0"
      )}`;
    }

    // Create onboarding record
    const onboarding = new Onboarding(onboardingData);
    await onboarding.save();

    // Create or update User record and link via employeeId
    if (onboardingData.employeeId) {
      try {
        // Find existing user by employeeId or email
        let user = await User.findOne({
          $or: [
            { employeeId: onboardingData.employeeId },
            { email: onboardingData.gmail },
          ],
        });

        if (user) {
          // Update existing user with onboarding data
          user.employeeId = onboardingData.employeeId;
          user.email = onboardingData.gmail;
          user.fullName = `${onboardingData.firstName} ${onboardingData.lastName}`;
          user.phone = onboardingData.contactNumber;
          user.department = onboardingData.department || user.department;
          user.jobTitle = onboardingData.jobTitle || user.jobTitle;

          // Update credentials in User if provided
          if (onboardingData.username && onboardingData.pin) {
            // Convert pin to number (6 digits)
            const pinNumber = parseInt(onboardingData.pin, 10);
            if (isNaN(pinNumber) || pinNumber < 100000 || pinNumber > 999999) {
              return res.status(400).json({
                success: false,
                error: "PIN must be a 6-digit number (100000-999999)",
              });
            }
            user.username = onboardingData.username.toLowerCase().trim();
            user.pin = pinNumber;

            // Hash password if provided
            if (onboardingData.password) {
              if (onboardingData.password.length < 6) {
                return res.status(400).json({
                  success: false,
                  error: "Password must be at least 6 characters",
                });
              }
              user.password = await hashPassword(onboardingData.password);
            }
          }

          user.updatedAt = new Date();
          await user.save();
        } else {
          // Create new user
          let hashedPassword = null;
          let pinNumber = null;
          let username = null;

          // Handle credentials if provided
          if (onboardingData.username && onboardingData.pin) {
            // Convert pin to number (6 digits)
            pinNumber = parseInt(onboardingData.pin, 10);
            if (isNaN(pinNumber) || pinNumber < 100000 || pinNumber > 999999) {
              return res.status(400).json({
                success: false,
                error: "PIN must be a 6-digit number (100000-999999)",
              });
            }
            username = onboardingData.username.toLowerCase().trim();

            // Hash password if provided
            if (onboardingData.password) {
              if (onboardingData.password.length < 6) {
                return res.status(400).json({
                  success: false,
                  error: "Password must be at least 6 characters",
                });
              }
              hashedPassword = await hashPassword(onboardingData.password);
            }
          }

          user = new User({
            email: onboardingData.gmail,
            employeeId: onboardingData.employeeId,
            fullName: `${onboardingData.firstName} ${onboardingData.lastName}`,
            phone: onboardingData.contactNumber,
            department: onboardingData.department,
            jobTitle: onboardingData.jobTitle,
            role: "employee",
            username: username,
            pin: pinNumber,
            password: hashedPassword,
          });
          await user.save();
        }

        // Link onboarding to user
        onboarding.userId = user._id;
        await onboarding.save();
      } catch (userError) {
        console.error("Error creating/updating User record:", userError);
        // Don't fail the onboarding creation if user creation fails
        // The mapping can be done later via update
      }
    }

    // Exclude binary data from response
    const responseData = onboarding.toObject();
    delete responseData.photo;
    delete responseData.signature;
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
      delete responseData[field];
    });

    // Exclude binary data from additionalDocuments array and map to 'documents' for frontend
    if (
      responseData.additionalDocuments &&
      Array.isArray(responseData.additionalDocuments)
    ) {
      responseData.documents = responseData.additionalDocuments.map((doc) => {
        const { file, ...docWithoutFile } = doc;
        return docWithoutFile;
      });
      delete responseData.additionalDocuments;
    }

    res.status(201).json({
      success: true,
      message: "Onboarding record created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating onboarding:", error);

    // Handle duplicate key errors with more details
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      // Check if it's the old email_1 index issue
      if (field === "email" || field === "email_1") {
        return res.status(400).json({
          success: false,
          error: "Database index issue detected. Please contact the administrator.",
          details:
            "Old 'email' index exists. This needs to be dropped from MongoDB.",
        });
      }

      return res.status(400).json({
        success: false,
        error: `${field} '${value}' already exists`,
        field: field,
        value: value,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Error creating onboarding record",
      details: error.message,
    });
  }
};

// Get all onboarding records
const getOnboardingRecords = async (req, res) => {
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
      query.onboardingStatus = status;
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
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [records, total] = await Promise.all([
      Onboarding.find(query)
        .select("-photo -signature -additionalDocuments.file") // Exclude large binary data
        .populate(
          "userId",
          "email employeeId fullName phone department jobTitle role"
        )
        .sort(sort)
        .skip(skip)
        // .limit(parseInt(limit))
        .lean(),
      Onboarding.countDocuments(query),
    ]);

    // Map additionalDocuments to documents for frontend
    const mappedRecords = records.map((record) => {
      if (
        record.additionalDocuments &&
        Array.isArray(record.additionalDocuments)
      ) {
        record.documents = record.additionalDocuments.map((doc) => {
          const { file, ...docWithoutFile } = doc;
          return docWithoutFile;
        });
        delete record.additionalDocuments;
      }
      return record;
    });

    res.status(200).json({
      success: true,
      data: mappedRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching onboarding records:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching onboarding records",
      details: error.message,
    });
  }
};

// Get single onboarding record by ID
const getOnboardingById = async (req, res) => {
  try {
    const { id } = req.params;

    const onboarding = await Onboarding.findById(id)
      .select("-photo -signature -additionalDocuments.file") // Exclude large binary data
      .populate(
        "userId",
        "email employeeId fullName phone department jobTitle role"
      )
      .lean();

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        error: "Onboarding record not found",
      });
    }

    // Map additionalDocuments to documents for frontend
    if (
      onboarding.additionalDocuments &&
      Array.isArray(onboarding.additionalDocuments)
    ) {
      onboarding.documents = onboarding.additionalDocuments.map((doc) => {
        const { file, ...docWithoutFile } = doc;
        return docWithoutFile;
      });
      delete onboarding.additionalDocuments;
    }

    res.status(200).json({
      success: true,
      data: onboarding,
    });
  } catch (error) {
    console.error("Error fetching onboarding record:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching onboarding record",
      details: error.message,
    });
  }
};

// Update onboarding record
const updateOnboarding = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle email field - map 'email' to 'gmail' if needed
    if (updateData.email && !updateData.gmail) {
      updateData.gmail = updateData.email;
      delete updateData.email;
    }

    // Validate email/gmail if it's being updated
    if (updateData.gmail !== undefined) {
      if (!updateData.gmail || updateData.gmail.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Email (gmail) cannot be empty",
        });
      }
      // Normalize email
      updateData.gmail = updateData.gmail.trim().toLowerCase();
    }

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

    // Handle experiences - parse if it's a string
    if (updateData.experiences && typeof updateData.experiences === "string") {
      try {
        updateData.experiences = JSON.parse(updateData.experiences);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid experiences format. Must be valid JSON.",
        });
      }
    }

    // Handle skills - parse if it's a string
    if (updateData.skills && typeof updateData.skills === "string") {
      try {
        updateData.skills = JSON.parse(updateData.skills);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid skills format. Must be valid JSON.",
        });
      }
    }

    // Handle documents array - map frontend 'documents' to model 'additionalDocuments'
    // Frontend sends 'documents' array, we store it as 'additionalDocuments' in the model
    if (updateData.documents && !updateData.additionalDocuments) {
      updateData.additionalDocuments = updateData.documents;
      delete updateData.documents;
    }

    // Remove any documents[X][file] metadata objects from body (these are just metadata, actual files come via Multer)
    Object.keys(updateData).forEach((key) => {
      if (key.match(/^documents\[\d+\]\[file\]$/)) {
        delete updateData[key];
      }
    });

    // Handle additionalDocuments/documents - parse if it's a string
    if (
      updateData.additionalDocuments &&
      typeof updateData.additionalDocuments === "string"
    ) {
      try {
        updateData.additionalDocuments = JSON.parse(
          updateData.additionalDocuments
        );
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid documents format. Must be valid JSON.",
        });
      }
    }

    // Handle date parsing for dob, joiningDate
    if (updateData.dob && typeof updateData.dob === "string") {
      updateData.dob = new Date(updateData.dob);
    }
    if (updateData.joiningDate && typeof updateData.joiningDate === "string") {
      updateData.joiningDate = new Date(updateData.joiningDate);
    }

    // Handle date parsing for experiences
    if (updateData.experiences && Array.isArray(updateData.experiences)) {
      updateData.experiences = updateData.experiences.map((exp) => {
        if (exp.fromDate && typeof exp.fromDate === "string") {
          exp.fromDate = new Date(exp.fromDate);
        }
        if (exp.toDate && typeof exp.toDate === "string") {
          exp.toDate = new Date(exp.toDate);
        }
        return exp;
      });
    }

    // Handle declaration - convert string "true"/"false" to boolean
    if (updateData.declaration !== undefined) {
      updateData.declaration =
        updateData.declaration === "true" ||
        updateData.declaration === true ||
        updateData.declaration === "1";
    }

    // Handle photo metadata from request body (if sent as object, before file uploads)
    if (
      updateData.photo &&
      typeof updateData.photo === "object" &&
      !Buffer.isBuffer(updateData.photo)
    ) {
      // Extract photo metadata from object
      if (updateData.photo.name) {
        updateData.photoName = updateData.photo.name;
      }
      if (updateData.photo.size) {
        updateData.photoSize = updateData.photo.size;
      }
      if (updateData.photo.fileType) {
        updateData.photoContentType = updateData.photo.fileType;
      }
      // Remove the photo object from body - actual file should come via multer
      delete updateData.photo;
    }

    // Handle signature metadata from request body (if sent as object, before file uploads)
    if (
      updateData.signature &&
      typeof updateData.signature === "object" &&
      !Buffer.isBuffer(updateData.signature)
    ) {
      // Extract signature metadata from object
      if (updateData.signature.name) {
        updateData.signatureName = updateData.signature.name;
      }
      if (updateData.signature.size) {
        updateData.signatureSize = updateData.signature.size;
      }
      if (updateData.signature.fileType) {
        updateData.signatureContentType = updateData.signature.fileType;
      }
      // Remove the signature object from body - actual file should come via multer
      delete updateData.signature;
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

      // Photo - file upload takes precedence over body metadata
      if (filesMap.photo && filesMap.photo[0]) {
        updateData.photo = filesMap.photo[0].buffer;
        updateData.photoContentType = filesMap.photo[0].mimetype;
        updateData.photoName = filesMap.photo[0].originalname;
        updateData.photoSize = filesMap.photo[0].size;
      }

      // Signature - file upload takes precedence over body metadata
      if (filesMap.signature && filesMap.signature[0]) {
        updateData.signature = filesMap.signature[0].buffer;
        updateData.signatureContentType = filesMap.signature[0].mimetype;
        updateData.signatureName = filesMap.signature[0].originalname;
        updateData.signatureSize = filesMap.signature[0].size;
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

      // Handle documents files - pattern: documents[0][file], documents[1][file], etc.
      // Frontend sends files as documents[0][file], we map to additionalDocuments in model
      if (
        updateData.additionalDocuments &&
        Array.isArray(updateData.additionalDocuments)
      ) {
        updateData.additionalDocuments = updateData.additionalDocuments.map(
          (doc, index) => {
            // Check for both patterns: documents[0][file] and additionalDocuments[0][file]
            const fileFieldName1 = `documents[${index}][file]`;
            const fileFieldName2 = `additionalDocuments[${index}][file]`;

            let file = null;
            if (filesMap[fileFieldName1] && filesMap[fileFieldName1][0]) {
              file = filesMap[fileFieldName1][0];
            } else if (
              filesMap[fileFieldName2] &&
              filesMap[fileFieldName2][0]
            ) {
              file = filesMap[fileFieldName2][0];
            }

            if (file) {
              doc.file = file.buffer;
              doc.fileContentType = file.mimetype;
              doc.fileName = file.originalname;
              doc.fileSize = file.size;
            }
            return doc;
          }
        );
      }
    }

    // Update credentials in User if username, pin, or password is provided
    if (updateData.username || updateData.pin || updateData.password) {
      const onboarding = await Onboarding.findById(id);
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          error: "Onboarding record not found",
        });
      }

      // Find the user linked to this onboarding
      if (onboarding.userId) {
        const user = await User.findById(onboarding.userId);
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
        // This should not happen normally, but handle it just in case
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

          // Create user with credentials (will be linked in the user creation section below)
          const emailToUse = updateData.gmail || onboarding.gmail;
          const firstName = updateData.firstName || onboarding.firstName;
          const lastName = updateData.lastName || onboarding.lastName;
          const contactNumber =
            updateData.contactNumber || onboarding.contactNumber;
          const employeeIdToUse =
            updateData.employeeId || onboarding.employeeId;

          const newUser = new User({
            email: emailToUse,
            employeeId: employeeIdToUse,
            fullName: `${firstName} ${lastName}`,
            phone: contactNumber,
            department: updateData.department || onboarding.department,
            jobTitle: updateData.jobTitle || onboarding.jobTitle,
            role: "employee",
            username: updateData.username.toLowerCase().trim(),
            pin: pinNumber,
            password: hashedPassword,
          });
          await newUser.save();

          // Link onboarding to user
          onboarding.userId = newUser._id;
          await onboarding.save();
        }
      }

      // Remove from updateData as they're handled separately
      delete updateData.username;
      delete updateData.pin;
      delete updateData.password;
    }

    // Get the onboarding record first to check for employeeId
    const existingOnboarding = await Onboarding.findById(id);
    if (!existingOnboarding) {
      return res.status(404).json({
        success: false,
        error: "Onboarding record not found",
      });
    }

    // Update onboarding record
    const onboarding = await Onboarding.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select(
        "-photo -signature -document10th -documentInter -documentGraduation -documentPostGraduation -documentPhd -documentAadharCard -documentPanCard -documentBankDetails -documentResume -documentOtherCertificates -documentAppointment"
      )
      .populate(
        "userId",
        "email employeeId fullName phone department jobTitle role username"
      );

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        error: "Onboarding record not found",
      });
    }

    // Create or update User record and link via employeeId
    const employeeIdToUse = updateData.employeeId || onboarding.employeeId;
    if (employeeIdToUse) {
      try {
        const emailToUse = updateData.gmail || onboarding.gmail;
        const firstName = updateData.firstName || onboarding.firstName;
        const lastName = updateData.lastName || onboarding.lastName;
        const contactNumber =
          updateData.contactNumber || onboarding.contactNumber;

        // Find existing user by employeeId or email
        let user = await User.findOne({
          $or: [{ employeeId: employeeIdToUse }, { email: emailToUse }],
        });

        if (user) {
          // Update existing user with onboarding data
          if (updateData.employeeId) user.employeeId = updateData.employeeId;
          if (updateData.gmail) user.email = updateData.gmail;
          if (firstName && lastName) user.fullName = `${firstName} ${lastName}`;
          if (updateData.contactNumber) user.phone = updateData.contactNumber;
          if (updateData.department) user.department = updateData.department;
          if (updateData.jobTitle) user.jobTitle = updateData.jobTitle;

          // Note: Credentials (username, pin, password) are handled in the credentials update section above

          user.updatedAt = new Date();
          await user.save();
        } else {
          // Create new user if it doesn't exist
          // Note: Credentials will be set if provided in the credentials update section above
          user = new User({
            email: emailToUse,
            employeeId: employeeIdToUse,
            fullName: `${firstName} ${lastName}`,
            phone: contactNumber,
            department: updateData.department || onboarding.department,
            jobTitle: updateData.jobTitle || onboarding.jobTitle,
            role: "employee",
          });
          await user.save();
        }

        // Link onboarding to user if not already linked
        if (
          !onboarding.userId ||
          onboarding.userId.toString() !== user._id.toString()
        ) {
          onboarding.userId = user._id;
          await onboarding.save();
        }
      } catch (userError) {
        console.error("Error creating/updating User record:", userError);
        // Don't fail the onboarding update if user creation/update fails
      }
    }

    // Exclude binary data from response and map additionalDocuments to documents
    const responseData = onboarding.toObject();
    if (
      responseData.additionalDocuments &&
      Array.isArray(responseData.additionalDocuments)
    ) {
      responseData.documents = responseData.additionalDocuments.map((doc) => {
        const { file, ...docWithoutFile } = doc;
        return docWithoutFile;
      });
      delete responseData.additionalDocuments;
    }

    res.status(200).json({
      success: true,
      message: "Onboarding record updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error updating onboarding:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      error: "Error updating onboarding record",
      details: error.message,
    });
  }
};

// Delete onboarding record
const deleteOnboarding = async (req, res) => {
  try {
    const { id } = req.params;

    const onboarding = await Onboarding.findByIdAndDelete(id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        error: "Onboarding record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Onboarding record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting onboarding:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting onboarding record",
      details: error.message,
    });
  }
};

// Get document/file
const getDocument = async (req, res) => {
  try {
    const { id, docType } = req.params;
    const { index } = req.query; // For documents array, index is passed as query param

    // Validate docType
    const validDocTypes = [
      "photo",
      "signature",
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
      "documents", // For documents array
    ];

    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid document type",
        validTypes: validDocTypes,
      });
    }

    // Handle documents array - require index
    if (docType === "documents") {
      if (index === undefined || index === null) {
        return res.status(400).json({
          success: false,
          error: "Index is required for documents array",
          message: "Please provide index as query parameter: ?index=0",
        });
      }
    }

    // Fetch onboarding record - need to get all fields including binary data
    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        error: "Onboarding record not found",
      });
    }

    const documentMap = {
      photo: {
        buffer: onboarding.photo,
        contentType: onboarding.photoContentType || "image/jpeg",
      },
      signature: {
        buffer: onboarding.signature,
        contentType: onboarding.signatureContentType || "image/png",
      },
      document10th: {
        buffer: onboarding.document10th,
        contentType: onboarding.document10thContentType || "application/pdf",
      },
      documentInter: {
        buffer: onboarding.documentInter,
        contentType: onboarding.documentInterContentType || "application/pdf",
      },
      documentGraduation: {
        buffer: onboarding.documentGraduation,
        contentType:
          onboarding.documentGraduationContentType || "application/pdf",
      },
      documentPostGraduation: {
        buffer: onboarding.documentPostGraduation,
        contentType:
          onboarding.documentPostGraduationContentType || "application/pdf",
      },
      documentPhd: {
        buffer: onboarding.documentPhd,
        contentType: onboarding.documentPhdContentType || "application/pdf",
      },
      documentAadharCard: {
        buffer: onboarding.documentAadharCard,
        contentType:
          onboarding.documentAadharCardContentType || "application/pdf",
      },
      documentPanCard: {
        buffer: onboarding.documentPanCard,
        contentType: onboarding.documentPanCardContentType || "application/pdf",
      },
      documentBankDetails: {
        buffer: onboarding.documentBankDetails,
        contentType:
          onboarding.documentBankDetailsContentType || "application/pdf",
      },
      documentResume: {
        buffer: onboarding.documentResume,
        contentType: onboarding.documentResumeContentType || "application/pdf",
      },
      documentOtherCertificates: {
        buffer: onboarding.documentOtherCertificates,
        contentType:
          onboarding.documentOtherCertificatesContentType || "application/pdf",
      },
      documentAppointment: {
        buffer: onboarding.documentAppointment,
        contentType:
          onboarding.documentAppointmentContentType || "application/pdf",
      },
    };

    // Handle documents array separately
    if (docType === "documents") {
      const docIndex = parseInt(index, 10);
      if (isNaN(docIndex) || docIndex < 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid index",
          message: "Index must be a non-negative integer",
        });
      }

      if (
        !onboarding.additionalDocuments ||
        !Array.isArray(onboarding.additionalDocuments) ||
        !onboarding.additionalDocuments[docIndex]
      ) {
        return res.status(404).json({
          success: false,
          error: "Document not found",
          message: `Document at index ${docIndex} not found`,
        });
      }

      const doc = onboarding.additionalDocuments[docIndex];
      if (!doc.file || !Buffer.isBuffer(doc.file)) {
        return res.status(404).json({
          success: false,
          error: "Document file not found",
          message: `Document at index ${docIndex} does not have a file`,
        });
      }

      const contentType = doc.fileContentType || "application/pdf";
      const fileName = doc.fileName || `document_${docIndex}.pdf`;

      // Set appropriate headers
      res.set("Content-Type", contentType);
      res.set("Content-Disposition", `inline; filename="${fileName}"`);

      // Send the binary buffer
      return res.send(Buffer.from(doc.file));
    }

    // Handle other document types
    const document = documentMap[docType];

    if (!document || !document.buffer) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        message: `Document type '${docType}' not found for this onboarding record`,
      });
    }

    // Set appropriate headers for file download/view
    res.set("Content-Type", document.contentType);
    res.set("Content-Disposition", `inline; filename="${docType}"`);

    // For images, use inline; for PDFs, also use inline to view in browser
    const isImage = document.contentType.startsWith("image/");
    if (isImage) {
      res.set(
        "Content-Disposition",
        `inline; filename="${docType}.${document.contentType.split("/")[1]}"`
      );
    } else {
      res.set("Content-Disposition", `inline; filename="${docType}.pdf"`);
    }

    // Send the binary buffer
    res.send(Buffer.from(document.buffer));
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching document",
      details: error.message,
    });
  }
};

// Get all documents metadata (for listing in frontend)
const getDocumentsList = async (req, res) => {
  try {
    const { id } = req.params;

    const onboarding = await Onboarding.findById(id).lean();

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        error: "Onboarding record not found",
      });
    }

    // Map additionalDocuments to documents for frontend
    // Exclude file buffers from response (only return metadata)
    const documents = onboarding.additionalDocuments
      ? onboarding.additionalDocuments.map((doc, index) => {
          // Check if file exists by checking if file field is present
          const hasFile = doc.file !== undefined && doc.file !== null;

          return {
            index,
            name: doc.name || `Document ${index + 1}`,
            notes: doc.notes || "",
            fileName: doc.fileName || null,
            fileSize: doc.fileSize || null,
            fileContentType: doc.fileContentType || null,
            hasFile,
            // URL to view/download the document
            viewUrl: hasFile
              ? `/api/employee/onboarding/${id}/document/documents?index=${index}`
              : null,
          };
        })
      : [];

    res.status(200).json({
      success: true,
      data: {
        documents,
        count: documents.length,
      },
    });
  } catch (error) {
    console.error("Error fetching documents list:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching documents list",
      details: error.message,
    });
  }
};

module.exports = {
  createOnboarding,
  getOnboardingRecords,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  getDocument,
  getDocumentsList,
};
