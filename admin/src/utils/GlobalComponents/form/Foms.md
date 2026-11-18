# GlobalForm Component - Complete Documentation

## 📋 Overview

GlobalForm is a highly customizable, reusable form component for React that supports all input types with comprehensive validation, styling, and layout options.

## 🚀 Installation

```jsx
// Import the component
import GlobalForm from './components/GlobalForm';
```

## 🎯 Basic Usage

### Simple Form Example

```jsx
import React from 'react';
import GlobalForm from './components/GlobalForm';

const SimpleForm = () => {
  const formInputs = [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      required: true,
      placeholder: 'Enter your first name'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      placeholder: 'your.email@example.com'
    }
  ];

  const handleSubmit = (formData) => {
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <GlobalForm
      inputs={formInputs}
      onSubmit={handleSubmit}
      formTitle="User Information"
      submitButtonText="Submit"
    />
  );
};

export default SimpleForm;
```

## ⚙️ Props Reference

### Main Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inputs` | Array | `[]` | Array of input configurations (required) |
| `onSubmit` | Function | - | Form submission handler (required) |
| `formTitle` | String | `"Form"` | Form title text |
| `submitButtonText` | String | `"Submit"` | Submit button text |
| `formLayout` | String | `"vertical"` | Layout type: `'vertical'`, `'horizontal'`, `'grid'` |
| `gridColumns` | Number | `2` | Number of columns for grid layout |
| `showSubmitButton` | Boolean | `true` | Whether to show submit button |
| `resetAfterSubmit` | Boolean | `false` | Reset form after successful submission |
| `className` | String | `""` | Additional CSS classes |
| `cancelButton` | Object | `null` | Cancel button configuration |
| `editingId` | String/Number | `null` | ID for edit mode |
| `customValidation` | Object | `null` | Custom validation functions |

## 📝 Input Configuration

### Common Input Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | **Required** - Field identifier |
| `type` | String | **Required** - Input type |
| `label` | String | **Required** - Display label |
| `required` | Boolean | `false` | Whether field is required |
| `placeholder` | String | `""` | Input placeholder text |
| `defaultValue` | Any | `""` | Default value |
| `disabled` | Boolean | `false` | Disable the input |
| `helperText` | String | `""` | Helper text below input |
| `fullWidth` | Boolean | `false` | Span full width in grid layout |

### Validation Properties

| Property | Type | Description |
|----------|------|-------------|
| `required` | Boolean | `false` | Required field validation |
| `requiredMessage` | String | Auto-generated | Custom required error message |
| `minLength` | Number | - | Minimum character length |
| `minLengthMessage` | String | Auto-generated | Custom min length message |
| `maxLength` | Number | - | Maximum character length |
| `maxLengthMessage` | String | Auto-generated | Custom max length message |
| `exactLength` | Number | - | Exact character length |
| `exactLengthMessage` | String | Auto-generated | Custom exact length message |
| `min` | Number | - | Minimum value (for numbers) |
| `minMessage` | String | Auto-generated | Custom min value message |
| `max` | Number | - | Maximum value (for numbers) |
| `maxMessage` | String | Auto-generated | Custom max value message |
| `pattern` | RegExp | - | Custom regex pattern |
| `patternMessage` | String | Auto-generated | Custom pattern message |
| `validationType` | String | - | Predefined validation type |

## 🎨 Input Types & Examples

### 1. Basic Inputs

#### Text Input
```jsx
{
  name: 'firstName',
  type: 'text',
  label: 'First Name',
  required: true,
  placeholder: 'Enter your first name',
  minLength: 2,
  maxLength: 50
}
```

#### Email Input
```jsx
{
  name: 'email',
  type: 'email',
  label: 'Email Address',
  required: true,
  validationType: 'email',
  placeholder: 'your.email@example.com'
}
```

#### Password Input
```jsx
{
  name: 'password',
  type: 'password',
  label: 'Password',
  required: true,
  validationType: 'password',
  minLength: 8,
  placeholder: 'Enter your password'
}
```

#### Phone Input (10 digits exactly)
```jsx
{
  name: 'phone',
  type: 'tel',
  label: 'Phone Number',
  required: true,
  validationType: 'phone',
  exactLength: 10,
  placeholder: 'Enter 10-digit phone number',
  patternMessage: 'Phone number must be exactly 10 digits'
}
```

### 2. Selection Inputs

#### Select Dropdown
```jsx
{
  name: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'other', label: 'Other', disabled: true }
  ]
}
```

#### Multiple Select
```jsx
{
  name: 'languages',
  type: 'select',
  label: 'Languages',
  multiple: true,
  options: [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ]
}
```

#### Checkbox
```jsx
{
  name: 'agreeToTerms',
  type: 'checkbox',
  label: 'I agree to the terms and conditions',
  required: true
}
```

#### Checkbox Group
```jsx
{
  name: 'hobbies',
  type: 'checkbox-group',
  label: 'Hobbies',
  required: true,
  options: [
    { value: 'reading', label: 'Reading' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'sports', label: 'Sports' }
  ]
}
```

#### Radio Group
```jsx
{
  name: 'gender',
  type: 'radio-group',
  label: 'Gender',
  required: true,
  options: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]
}
```

### 3. Grid Selection

#### Single Selection Grid
```jsx
{
  name: 'plan',
  type: 'grid-select',
  label: 'Choose Your Plan',
  required: true,
  multiple: false,
  gridColumns: 3,
  options: [
    {
      value: 'basic',
      label: 'Basic',
      description: '$9.99/month',
      icon: '⭐'
    },
    {
      value: 'pro',
      label: 'Professional',
      description: '$19.99/month',
      icon: '🚀'
    },
    {
      value: 'enterprise',
      label: 'Enterprise',
      description: '$49.99/month',
      icon: '🏢'
    }
  ]
}
```

#### Multiple Selection Grid
```jsx
{
  name: 'interests',
  type: 'grid-select',
  label: 'Select Interests',
  required: true,
  multiple: true,
  minSelection: 2,
  maxSelection: 4,
  gridColumns: 4,
  options: [
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'travel', label: 'Travel', icon: '✈️' }
  ]
}
```

### 4. File Upload

```jsx
{
  name: 'profilePicture',
  type: 'file',
  label: 'Profile Picture',
  required: true,
  accept: ['image/jpeg', 'image/png', 'image/gif'],
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptMessage: 'Only JPG, PNG, and GIF images are allowed',
  maxSizeMessage: 'File size must be less than 5MB'
}
```

### 5. Special Inputs

#### Textarea
```jsx
{
  name: 'bio',
  type: 'textarea',
  label: 'Biography',
  required: true,
  maxLength: 500,
  rows: 4,
  placeholder: 'Tell us about yourself...'
}
```

#### Number Input
```jsx
{
  name: 'age',
  type: 'number',
  label: 'Age',
  required: true,
  min: 16,
  max: 100,
  step: 1,
  minMessage: 'You must be at least 18 years old',
  maxMessage: 'Age cannot exceed 100 years'
}
```

#### Range Slider
```jsx
{
  name: 'volume',
  type: 'range',
  label: 'Volume',
  min: 0,
  max: 100,
  step: 5,
  defaultValue: 50
}
```

#### Color Picker
```jsx
{
  name: 'favoriteColor',
  type: 'color',
  label: 'Favorite Color',
  defaultValue: '#3B82F6'
}
```

#### Switch/Toggle
```jsx
{
  name: 'notifications',
  type: 'switch',
  label: 'Enable Notifications',
  defaultValue: true
}
```

### 6. Date & Time Inputs

```jsx
// Date
{
  name: 'birthdate',
  type: 'date',
  label: 'Birth Date',
  required: true
}

// Date and Time
{
  name: 'appointment',
  type: 'datetime-local',
  label: 'Appointment Date & Time'
}

// Month
{
  name: 'month',
  type: 'month',
  label: 'Month'
}

// Week
{
  name: 'week',
  type: 'week',
  label: 'Week'
}

// Time
{
  name: 'time',
  type: 'time',
  label: 'Time'
}
```

## 🔒 Validation Types

### Predefined Validation Types

```javascript
// Use these validationType values for common validations

// Phone: Exactly 10 digits
validationType: 'phone'

// Email: Standard email format
validationType: 'email'

// Password: 8+ chars, 1 uppercase, 1 lowercase, 1 number
validationType: 'password'

// URL: Valid URL format
validationType: 'url'

// Name: Only letters, spaces, apostrophes
validationType: 'name'

// Username: 3-20 chars, alphanumeric + underscore
validationType: 'username'

// ZIP Code: US format (5 or 9 digits)
validationType: 'zipCode'

// Numbers only
validationType: 'numbersOnly'

// Letters only
validationType: 'lettersOnly'

// No special characters
validationType: 'noSpecialChars'
```

### Custom Validation Functions

```jsx
const customValidation = {
  // Field-specific validation
  phone: (value) => {
    if (value && !/^\d{10}$/.test(value)) {
      return 'Phone number must be exactly 10 digits';
    }
    return null;
  },
  
  // Cross-field validation
  confirmPassword: (value, formData) => {
    if (value !== formData.password) {
      return 'Passwords do not match';
    }
    return null;
  },
  
  // Complex validation
  age: (value) => {
    if (value < 18) {
      return 'You must be at least 18 years old';
    }
    if (value > 100) {
      return 'Age cannot exceed 100 years';
    }
    return null;
  }
};

// Usage
<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  customValidation={customValidation}
/>
```

## 🎨 Layout Options

### Vertical Layout (Default)
```jsx
<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  formLayout="vertical"
/>
```

### Horizontal Layout
```jsx
<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  formLayout="horizontal"
/>
```

### Grid Layout
```jsx
// 2-column grid
<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  formLayout="grid"
  gridColumns={2}
/>

// 3-column grid
<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  formLayout="grid"
  gridColumns={3}
/>

// 4-column grid
<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  formLayout="grid"
  gridColumns={4}
/>
```

## 📋 Complete Example

```jsx
import React from 'react';
import GlobalForm from './components/GlobalForm';

const CompleteUserRegistration = () => {
  const formInputs = [
    // Personal Information
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      required: true,
      validationType: 'name',
      minLength: 2,
      placeholder: 'Enter your first name'
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      required: true,
      validationType: 'name',
      minLength: 2,
      placeholder: 'Enter your last name'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      validationType: 'email',
      placeholder: 'your.email@example.com'
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Phone Number',
      required: true,
      validationType: 'phone',
      exactLength: 10,
      placeholder: 'Enter 10-digit phone number'
    },
    
    // Account Information
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      required: true,
      validationType: 'username',
      minLength: 3,
      maxLength: 20,
      placeholder: 'Choose a username'
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
      validationType: 'password',
      minLength: 8,
      placeholder: 'Create a password'
    },
    
    // Preferences
    {
      name: 'plan',
      type: 'grid-select',
      label: 'Choose Your Plan',
      required: true,
      multiple: false,
      gridColumns: 3,
      options: [
        {
          value: 'basic',
          label: 'Basic',
          description: '$9.99/month',
          icon: '⭐'
        },
        {
          value: 'pro',
          label: 'Professional',
          description: '$19.99/month',
          icon: '🚀'
        },
        {
          value: 'enterprise',
          label: 'Enterprise',
          description: '$49.99/month',
          icon: '🏢'
        }
      ]
    },
    {
      name: 'interests',
      type: 'grid-select',
      label: 'Select Your Interests',
      multiple: true,
      minSelection: 2,
      maxSelection: 4,
      gridColumns: 4,
      options: [
        { value: 'technology', label: 'Technology', icon: '💻' },
        { value: 'sports', label: 'Sports', icon: '⚽' },
        { value: 'music', label: 'Music', icon: '🎵' },
        { value: 'travel', label: 'Travel', icon: '✈️' },
        { value: 'reading', label: 'Reading', icon: '📚' },
        { value: 'gaming', label: 'Gaming', icon: '🎮' },
        { value: 'cooking', label: 'Cooking', icon: '👨‍🍳' },
        { value: 'art', label: 'Art', icon: '🎨' }
      ]
    },
    
    // Additional Information
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biography',
      maxLength: 500,
      rows: 4,
      placeholder: 'Tell us about yourself...',
      helperText: 'Maximum 500 characters'
    },
    {
      name: 'profilePicture',
      type: 'file',
      label: 'Profile Picture',
      accept: ['image/jpeg', 'image/png'],
      maxSize: 5 * 1024 * 1024,
      helperText: 'JPG or PNG, max 5MB'
    },
    
    // Terms Agreement
    {
      name: 'agreeToTerms',
      type: 'checkbox',
      label: 'I agree to the terms and conditions',
      required: true,
      requiredMessage: 'You must agree to the terms and conditions'
    }
  ];

  const customValidation = {
    password: (value) => {
      if (value) {
        if (value.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])/.test(value)) {
          return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(value)) {
          return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(value)) {
          return 'Password must contain at least one number';
        }
      }
      return null;
    }
  };

  const handleSubmit = async (formData) => {
    console.log('Form submitted:', formData);
    
    // Simulate API call
    try {
      // Your API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Registration successful!');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <GlobalForm
        inputs={formInputs}
        onSubmit={handleSubmit}
        formTitle="Complete User Registration"
        submitButtonText="Create Account"
        customValidation={customValidation}
        formLayout="grid"
        gridColumns={2}
        resetAfterSubmit={true}
        className="max-w-6xl mx-auto"
      />
    </div>
  );
};

export default CompleteUserRegistration;
```

## 🎯 Advanced Features

### Edit Mode with Cancel Button

```jsx
const [editingId, setEditingId] = useState(null);

const cancelButton = {
  onClick: () => {
    setEditingId(null);
    // Reset form or navigate away
  },
  text: 'Cancel Edit'
};

<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  formTitle={editingId ? "Edit User" : "Create User"}
  submitButtonText={editingId ? "Update User" : "Create User"}
  cancelButton={editingId ? cancelButton : null}
  editingId={editingId}
/>
```

### Custom Styling

```jsx
<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  className="custom-form-styles shadow-2xl border-2 border-blue-200"
/>
```

### Form Reset After Submission

```jsx
<GlobalForm
  inputs={formInputs}
  onSubmit={handleSubmit}
  resetAfterSubmit={true}
/>
```

## 🔧 Troubleshooting

### Common Issues

1. **Input not updating**: Ensure `name` property matches the field identifier
2. **Validation not working**: Check that `required` is set to `true` and validation rules are correct
3. **File upload issues**: Verify `accept` array and `maxSize` are properly configured
4. **Grid layout not working**: Ensure `formLayout="grid"` and `gridColumns` are set

### Debug Tips

```jsx
// Add console logs to debug
const handleSubmit = (formData) => {
  console.log('Form Data:', formData);
  console.log('Form Errors:', errors); // Access errors if needed
};
```

This documentation covers all aspects of the GlobalForm component. The component is production-ready and handles all common form scenarios with comprehensive validation and styling options!