// components/CompleteFormExample.jsx
import React from "react";
import GlobalForm from "./Foms";

const CompleteFormExample = () => {
  const handleSubmit = (formData) => {
    console.log("Form submitted:", formData);
    alert("Form submitted! Check console for data.");
  };

  // Example 1: User Registration with Validations
  const userRegistrationInputs = [
    {
      name: "firstName",
      type: "text",
      label: "First Name",
      required: true,
      validationType: "name",
      minLength: 2,
      maxLength: 50,
      placeholder: "Enter your first name",
      patternMessage: "First name can only contain letters and spaces",
    },
    {
      name: "lastName",
      type: "text",
      label: "Last Name",
      required: true,
      validationType: "name",
      minLength: 2,
      maxLength: 50,
      placeholder: "Enter your last name",
    },
    {
      name: "email",
      type: "email",
      label: "Email Address",
      required: true,
      validationType: "email",
      placeholder: "your.email@example.com",
      patternMessage: "Please enter a valid email address",
    },
    {
      name: "phone",
      type: "tel",
      label: "Phone Number",
      required: true,
      validationType: "phone",
      exactLength: 10,
      placeholder: "Enter 10-digit phone number",
      patternMessage: "Phone number must be exactly 10 digits",
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      required: true,
      validationType: "password",
      minLength: 8,
      placeholder: "Create a strong password",
      patternMessage:
        "Password must contain uppercase, lowercase, number and be at least 8 characters",
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirm Password",
      required: true,
      placeholder: "Confirm your password",
    },
  ];

  // Example 2: Profile Information with Advanced Fields
  const profileInformationInputs = [
    {
      name: "username",
      type: "text",
      label: "Username",
      required: true,
      validationType: "username",
      minLength: 3,
      maxLength: 20,
      placeholder: "Choose a username",
      patternMessage:
        "Username must be 3-20 characters (letters, numbers, underscore)",
    },
    {
      name: "age",
      type: "number",
      label: "Age",
      required: true,
      min: 16,
      max: 100,
      minMessage: "You must be at least 16 years old",
      maxMessage: "Age cannot exceed 100 years",
      placeholder: "Enter your age",
    },
    {
      name: "birthdate",
      type: "date",
      label: "Birth Date",
      required: true,
      placeholder: "Select your birth date",
    },
    {
      name: "country",
      type: "select",
      label: "Country",
      required: true,
      options: [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
        { value: "uk", label: "United Kingdom" },
        { value: "au", label: "Australia" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "city",
      type: "text",
      label: "City",
      required: true,
      placeholder: "Enter your city",
    },
    {
      name: "zipcode",
      type: "text",
      label: "ZIP Code",
      validationType: "zipCode",
      placeholder: "Enter 6-digit ZIP code",
      patternMessage: "Please enter a valid ZIP code",
    },
    {
      name: "website",
      type: "url",
      label: "Website",
      validationType: "url",
      placeholder: "https://example.com",
      patternMessage: "Please enter a valid URL",
    },
    {
      name: "salary",
      type: "number",
      label: "Expected Salary",
      min: 0,
      max: 1000000,
      step: 1000,
      placeholder: "Enter expected salary",
      helperText: "Enter your expected annual salary",
    },
  ];

  // Example 3: User Profile with Mixed Input Types
  const userProfileInputs = [
    {
      name: "firstName",
      type: "text",
      label: "First Name",
      required: true,
      validationType: "name",
      placeholder: "Enter your first name",
    },
    {
      name: "lastName",
      type: "text",
      label: "Last Name",
      required: true,
      validationType: "name",
      placeholder: "Enter your last name",
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      required: true,
      validationType: "email",
      placeholder: "your.email@example.com",
    },
    {
      name: "bio",
      type: "textarea",
      label: "Biography",
      required: true,
      maxLength: 500,
      rows: 4,
      fullWidth: true,
      placeholder: "Tell us about yourself...",
      helperText: "Maximum 500 characters",
      maxLengthMessage: "Biography cannot exceed 500 characters",
    },
    {
      name: "skills",
      type: "grid-select",
      label: "Technical Skills",
      required: true,
      multiple: true,
      minSelection: 1,
      maxSelection: 5,
      gridColumns: 4,
      helperText: "Select 1 to 5 technical skills",
      minSelectionMessage: "Please select at least 1 skill",
      maxSelectionMessage: "Please select no more than 5 skills",
      options: [
        { value: "javascript", label: "JavaScript", icon: "⚡" },
        { value: "react", label: "React", icon: "⚛️" },
        { value: "node", label: "Node.js", icon: "🟢" },
        { value: "python", label: "Python", icon: "🐍" },
        { value: "java", label: "Java", icon: "☕" },
        { value: "html", label: "HTML", icon: "🌐" },
        { value: "css", label: "CSS", icon: "🎨" },
        { value: "sql", label: "SQL", icon: "🗃️" },
      ],
    },
    {
      name: "experienceLevel",
      type: "radio-group",
      label: "Experience Level",
      required: true,
      options: [
        { value: "junior", label: "Junior (0-2 years)" },
        { value: "mid", label: "Mid-level (2-5 years)" },
        { value: "senior", label: "Senior (5+ years)" },
      ],
    },
    {
      name: "profilePicture",
      type: "file",
      label: "Profile Picture",
      accept: ["image/jpeg", "image/png", "image/gif"],
      maxSize: 5 * 1024 * 1024,
      helperText: "JPG, PNG or GIF, max 5MB",
      acceptMessage: "Only JPG, PNG, and GIF images are allowed",
      maxSizeMessage: "File size must be less than 5MB",
    },
    {
      name: "notifications",
      type: "switch",
      label: "Enable Email Notifications",
      defaultValue: true,
    },
    {
      name: "newsletter",
      type: "checkbox",
      label: "Subscribe to newsletter",
      defaultValue: false,
    },
  ];

  // Example 4: Product Configuration Form
  const productConfigurationInputs = [
    {
      name: "productName",
      type: "text",
      label: "Product Name",
      required: true,
      minLength: 3,
      maxLength: 100,
      placeholder: "Enter product name",
    },
    {
      name: "category",
      type: "grid-select",
      label: "Product Category",
      required: true,
      multiple: false,
      gridColumns: 3,
      options: [
        {
          value: "electronics",
          label: "Electronics",
          description: "Electronic devices and accessories",
          icon: "📱",
        },
        {
          value: "clothing",
          label: "Clothing",
          description: "Apparel and fashion items",
          icon: "👕",
        },
        {
          value: "home",
          label: "Home & Garden",
          description: "Home improvement and garden",
          icon: "🏠",
        },
        {
          value: "sports",
          label: "Sports",
          description: "Sports equipment and gear",
          icon: "⚽",
        },
        {
          value: "books",
          label: "Books & Media",
          description: "Books, movies, and music",
          icon: "📚",
        },
        {
          value: "beauty",
          label: "Beauty",
          description: "Cosmetics and personal care",
          icon: "💄",
        },
      ],
    },
    {
      name: "price",
      type: "number",
      label: "Price ($)",
      required: true,
      min: 0,
      max: 10000,
      step: 0.01,
      placeholder: "0.00",
      minMessage: "Price cannot be negative",
    },
    {
      name: "quantity",
      type: "number",
      label: "Stock Quantity",
      required: true,
      min: 0,
      max: 100000,
      placeholder: "Enter stock quantity",
    },
    {
      name: "tags",
      type: "checkbox-group",
      label: "Product Tags",
      required: true,
      options: [
        { value: "new", label: "New Arrival" },
        { value: "sale", label: "On Sale" },
        { value: "featured", label: "Featured" },
        { value: "bestseller", label: "Bestseller" },
      ],
    },
    {
      name: "description",
      type: "textarea",
      label: "Product Description",
      required: true,
      maxLength: 1000,
      rows: 4,
      fullWidth: true,
      placeholder: "Describe your product...",
      helperText: "Maximum 1000 characters",
    },
    {
      name: "images",
      type: "file",
      label: "Product Images",
      multiple: true,
      accept: ["image/jpeg", "image/png"],
      maxSize: 10 * 1024 * 1024,
      helperText: "Upload product images (JPG/PNG, max 10MB each)",
      acceptMessage: "Only JPG and PNG images are allowed",
    },
  ];

  // Custom validation for cross-field validation
  const customValidation = {
    confirmPassword: (value, formData) => {
      if (value !== formData.password) {
        return "Passwords do not match";
      }
      return null;
    },
    birthdate: (value) => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          return "You must be at least 18 years old";
        }
      }
      return null;
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 space-y-8">
      {/* Example 1: User Registration - 2 Column Grid */}
      <GlobalForm
        inputs={userRegistrationInputs}
        onSubmit={handleSubmit}
        formTitle="User  1"
        gridColumns={2}
        submitButtonText="Create Account"
        formLayout="grid"
        customValidation={customValidation}
        resetAfterSubmit={true}
      />

      {/* Example 2: Profile Information - 4 Column Grid */}
      <GlobalForm
        inputs={profileInformationInputs}
        onSubmit={handleSubmit}
        formTitle="Profile Information"
        gridColumns={2}
        submitButtonText="Update Profile"
        formLayout="grid"
        customValidation={customValidation}
      />

      {/* Example 3: User Profile - 3 Column Grid with Full-width Elements */}
      <GlobalForm
        inputs={userProfileInputs}
        onSubmit={handleSubmit}
        formTitle="User Profile"
        gridColumns={3}
        submitButtonText="Save Profile"
        formLayout="grid"
      />

      {/* Example 4: Product Configuration - Mixed Layout */}
      <GlobalForm
        inputs={productConfigurationInputs}
        onSubmit={handleSubmit}
        formTitle="Product Configuration"
        gridColumns={2}
        submitButtonText="Save Product"
        formLayout="grid"
      />

      {/* Example 5: Horizontal Layout Form */}
      <GlobalForm
        inputs={[
          {
            name: "quickName",
            type: "text",
            label: "Quick Name",
            required: true,
            placeholder: "Enter your name",
          },
          {
            name: "quickEmail",
            type: "email",
            label: "Quick Email",
            required: true,
            placeholder: "your.email@example.com",
          },
          {
            name: "quickMessage",
            type: "textarea",
            label: "Quick Message",
            required: true,
            rows: 3,
            placeholder: "Enter your message...",
          },
        ]}
        onSubmit={handleSubmit}
        formTitle="Quick Contact Form"
        submitButtonText="Send Message"
        formLayout="horizontal"
      />

      {/* Example 6: Vertical Layout Form */}
      <GlobalForm
        inputs={[
          {
            name: "simpleField1",
            type: "text",
            label: "Simple Field 1",
            required: true,
            placeholder: "Enter something",
          },
          {
            name: "simpleField2",
            type: "email",
            label: "Simple Field 2",
            required: true,
            placeholder: "Enter email",
          },
          {
            name: "simpleField3",
            type: "select",
            label: "Simple Field 3",
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
              { value: "option3", label: "Option 3" },
            ],
          },
        ]}
        onSubmit={handleSubmit}
        formTitle="Simple Vertical Form"
        submitButtonText="Submit Form"
        formLayout="vertical"
      />
    </div>
  );
};

export default CompleteFormExample;
