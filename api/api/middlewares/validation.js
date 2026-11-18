const collegeValidation = (req, res, next) => {
  const {
    name,
    address,
    contactPerson,
    contactPersonPhone,
    contactPersonEmail,
    principal,
    principalEmail,
    principalPhone,
    collegePhone
  } = req.body;
  
  const errors = [];
  
  if (!name) errors.push('College name is required');
  if (!address) errors.push('Address is required');
  if (!contactPerson) errors.push('Contact person is required');
  if (!contactPersonPhone) errors.push('Contact person phone is required');
  if (!contactPersonEmail) errors.push('Contact person email is required');
  if (!principal) errors.push('Principal name is required');
  if (!principalEmail) errors.push('Principal email is required');
  if (!principalPhone) errors.push('Principal phone is required');
  if (!collegePhone) errors.push('College phone is required');
  
  // Email validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (contactPersonEmail && !emailRegex.test(contactPersonEmail)) {
    errors.push('Contact person email is invalid');
  }
  if (principalEmail && !emailRegex.test(principalEmail)) {
    errors.push('Principal email is invalid');
  }
  
  // Phone validation
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
  if (contactPersonPhone && !phoneRegex.test(contactPersonPhone)) {
    errors.push('Contact person phone is invalid');
  }
  if (principalPhone && !phoneRegex.test(principalPhone)) {
    errors.push('Principal phone is invalid');
  }
  if (collegePhone && !phoneRegex.test(collegePhone)) {
    errors.push('College phone is invalid');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

module.exports = {
  collegeValidation
};