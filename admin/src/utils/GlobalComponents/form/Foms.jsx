// components/GlobalForm.jsx
import React, { useState, useEffect } from 'react';

// Validation patterns
const validationPatterns = {
  phone: /^\d{10}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  name: /^[a-zA-Z' ]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  zipCode: /^\d{6}(-\d{4})?$/,
  numbersOnly: /^\d+$/,
  lettersOnly: /^[a-zA-Z]+$/,
  noSpecialChars: /^[a-zA-Z0-9 ]+$/
};

const GlobalForm = ({
  inputs = [],
  onSubmit,
  formTitle = "Form",
  submitButtonText = "Submit",
  customValidation = null,
  formLayout = 'vertical',
  gridColumns = 2,
  showSubmitButton = true,
  resetAfterSubmit = false,
  className = "",
  cancelButton = null,
  editingId = null
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    const initialData = {};
    inputs.forEach(input => {
      if (input.type === 'checkbox-group') {
        initialData[input.name] = input.defaultValue || [];
      } else if (input.type === 'radio-group') {
        initialData[input.name] = input.defaultValue || '';
      } else if (input.type === 'file') {
        initialData[input.name] = input.defaultValue || null;
      } else if (input.type === 'switch') {
        initialData[input.name] = input.defaultValue || false;
      } else if (input.type === 'grid-select') {
        initialData[input.name] = input.defaultValue || (input.multiple ? [] : '');
      } else {
        initialData[input.name] = input.defaultValue || '';
      }
    });
    setFormData(initialData);
  }, [inputs]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    let inputValue;
    if (type === 'checkbox') {
      inputValue = checked;
    } else if (type === 'file') {
      inputValue = files[0] || null;
    } else {
      inputValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));

    if (touched[name]) {
      validateField(name, inputValue);
    }
  };

  const handleCheckboxGroupChange = (name, value, isChecked) => {
    setFormData(prev => {
      const currentArray = prev[name] || [];
      let newArray;
      
      if (isChecked) {
        newArray = [...currentArray, value];
      } else {
        newArray = currentArray.filter(item => item !== value);
      }
      
      return {
        ...prev,
        [name]: newArray
      };
    });

    if (touched[name]) {
      validateField(name, isChecked ? [...(formData[name] || []), value] : formData[name]?.filter(item => item !== value));
    }
  };

  const handleGridSelectChange = (name, value, isMultiple = false) => {
    setFormData(prev => {
      if (isMultiple) {
        const currentArray = prev[name] || [];
        const newArray = currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value];
        
        return {
          ...prev,
          [name]: newArray
        };
      } else {
        return {
          ...prev,
          [name]: value
        };
      }
    });

    if (touched[name]) {
      if (isMultiple) {
        const currentArray = formData[name] || [];
        const newArray = currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value];
        validateField(name, newArray);
      } else {
        validateField(name, value);
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const inputConfig = inputs.find(input => input.name === name);
    if (!inputConfig) return;

    const newErrors = { ...errors };
    let errorMessage = '';

    // Required validation
    if (inputConfig.required) {
      if (inputConfig.type === 'checkbox-group' && (!value || value.length === 0)) {
        errorMessage = inputConfig.requiredMessage || `At least one ${inputConfig.label} must be selected`;
      } else if (inputConfig.type === 'grid-select' && inputConfig.multiple && (!value || value.length === 0)) {
        errorMessage = inputConfig.requiredMessage || `At least one ${inputConfig.label} must be selected`;
      } else if (inputConfig.type === 'grid-select' && !inputConfig.multiple && !value) {
        errorMessage = inputConfig.requiredMessage || `${inputConfig.label} is required`;
      } else if (inputConfig.type === 'file' && !value) {
        errorMessage = inputConfig.requiredMessage || `${inputConfig.label} is required`;
      } else if (!value && value !== false && value !== 0) {
        errorMessage = inputConfig.requiredMessage || `${inputConfig.label} is required`;
      }
    }

    if (!errorMessage && value && value !== '') {
      // Min length validation
      if (inputConfig.minLength && value.length < inputConfig.minLength) {
        errorMessage = inputConfig.minLengthMessage || 
          `${inputConfig.label} must be at least ${inputConfig.minLength} characters`;
      }
      // Max length validation
      else if (inputConfig.maxLength && value.length > inputConfig.maxLength) {
        errorMessage = inputConfig.maxLengthMessage || 
          `${inputConfig.label} must be less than ${inputConfig.maxLength} characters`;
      }
      // Exact length validation
      else if (inputConfig.exactLength && value.length !== inputConfig.exactLength) {
        errorMessage = inputConfig.exactLengthMessage || 
          `${inputConfig.label} must be exactly ${inputConfig.exactLength} characters`;
      }
      // Min value validation (for numbers)
      else if (inputConfig.min !== undefined && Number(value) < inputConfig.min) {
        errorMessage = inputConfig.minMessage || 
          `${inputConfig.label} must be at least ${inputConfig.min}`;
      }
      // Max value validation (for numbers)
      else if (inputConfig.max !== undefined && Number(value) > inputConfig.max) {
        errorMessage = inputConfig.maxMessage || 
          `${inputConfig.label} must be at most ${inputConfig.max}`;
      }
      // Pattern validation
      else if (inputConfig.pattern && !inputConfig.pattern.test(value)) {
        errorMessage = inputConfig.patternMessage || 
          `${inputConfig.label} format is invalid`;
      }
      // Predefined pattern validation
      else if (inputConfig.validationType && validationPatterns[inputConfig.validationType] && !validationPatterns[inputConfig.validationType].test(value)) {
        errorMessage = inputConfig.patternMessage || getDefaultPatternMessage(inputConfig.validationType, inputConfig);
      }
      // Email validation
      else if (inputConfig.type === 'email' && !validationPatterns.email.test(value)) {
        errorMessage = inputConfig.patternMessage || 'Please enter a valid email address';
      }
      // URL validation
      else if (inputConfig.type === 'url' && !validationPatterns.url.test(value)) {
        errorMessage = inputConfig.patternMessage || 'Please enter a valid URL';
      }
      // File validation
      else if (inputConfig.type === 'file' && value) {
        if (inputConfig.accept && !inputConfig.accept.includes(value.type)) {
          errorMessage = inputConfig.acceptMessage || 
            `File type not allowed. Allowed types: ${inputConfig.accept.join(', ')}`;
        }
        if (inputConfig.maxSize && value.size > inputConfig.maxSize) {
          errorMessage = inputConfig.maxSizeMessage || 
            `File size must be less than ${(inputConfig.maxSize / 1024 / 1024).toFixed(1)}MB`;
        }
      }
      // Grid selection validation
      else if (inputConfig.type === 'grid-select' && inputConfig.multiple && inputConfig.minSelection && value.length < inputConfig.minSelection) {
        errorMessage = inputConfig.minSelectionMessage || 
          `Please select at least ${inputConfig.minSelection} options`;
      }
      else if (inputConfig.type === 'grid-select' && inputConfig.multiple && inputConfig.maxSelection && value.length > inputConfig.maxSelection) {
        errorMessage = inputConfig.maxSelectionMessage || 
          `Please select at most ${inputConfig.maxSelection} options`;
      }
      // Custom validation
      else if (customValidation && customValidation[name]) {
        const customError = customValidation[name](value, formData);
        if (customError) {
          errorMessage = customError;
        }
      }
    }

    if (errorMessage) {
      newErrors[name] = errorMessage;
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors);
  };

  const getDefaultPatternMessage = (validationType, inputConfig) => {
    const messages = {
      phone: `${inputConfig.label} must be exactly 10 digits`,
      email: 'Please enter a valid email address',
      password: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number',
      url: 'Please enter a valid URL',
      name: `${inputConfig.label} can only contain letters, spaces, and apostrophes`,
      username: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores',
      zipCode: 'Please enter a valid ZIP code',
      numbersOnly: `${inputConfig.label} can only contain numbers`,
      lettersOnly: `${inputConfig.label} can only contain letters`,
      noSpecialChars: `${inputConfig.label} cannot contain special characters`
    };
    return messages[validationType] || 'Invalid format';
  };

  const validateForm = () => {
    const newTouched = {};
    inputs.forEach(input => {
      newTouched[input.name] = true;
    });
    setTouched(newTouched);

    inputs.forEach(input => {
      validateField(input.name, formData[input.name]);
    });

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        await onSubmit(formData);
        if (resetAfterSubmit) {
          const resetData = {};
          inputs.forEach(input => {
            resetData[input.name] = input.defaultValue || (input.type === 'checkbox' ? false : '');
          });
          setFormData(resetData);
          setTouched({});
        }
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    setIsSubmitting(false);
  };

  // Your exact styling classes
  const getInputClassName = (hasError, inputType = 'default') => {
    const baseClasses = "w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 text-sm";
    
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-red-200`;
    }
    
    const typeSpecificClasses = {
      default: "border-gray-300 focus:ring-blue-200",
      file: "border-gray-300 focus:ring-blue-200",
      range: "h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
      color: "h-10 w-full px-1 border border-gray-300 rounded cursor-pointer",
      search: "border-gray-300 focus:ring-blue-200"
    };
    
    return `${baseClasses} ${typeSpecificClasses[inputType] || typeSpecificClasses.default}`;
  };

  const renderGridSelect = (input) => {
    const selectedValues = formData[input.name] || (input.multiple ? [] : '');
    const isSelected = (value) => 
      input.multiple ? selectedValues.includes(value) : selectedValues === value;

    const gridColsClass = input.gridColumns 
      ? `grid-cols-${input.gridColumns}`
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

    return (
      <div className={`grid gap-3 ${gridColsClass}`}>
        {input.options?.map((option, index) => (
          <div
            key={option.value}
            className={`
              relative border rounded-lg p-3 cursor-pointer transition-all duration-200 text-center
              ${isSelected(option.value)
                ? 'border-[#525B88] bg-blue-50 ring-2 ring-[#525B88] ring-opacity-50'
                : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
              }
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !option.disabled && handleGridSelectChange(input.name, option.value, input.multiple)}
          >
            {option.icon && (
              <div className="text-2xl mb-2">{option.icon}</div>
            )}
            <div className="font-medium text-sm text-gray-800">{option.label}</div>
            {option.description && (
              <div className="text-xs text-gray-600 mt-1">{option.description}</div>
            )}
            {isSelected(option.value) && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-[#525B88] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInput = (input) => {
    const commonProps = {
      name: input.name,
      onChange: handleChange,
      onBlur: handleBlur,
      className: getInputClassName(errors[input.name], input.type),
      placeholder: input.placeholder,
      disabled: input.disabled || isSubmitting
    };

    switch (input.type) {
      case 'grid-select':
        return renderGridSelect(input);
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={formData[input.name] || ''}
            rows={input.rows || 4}
            maxLength={input.maxLength}
          />
        );
      
      case 'select':
        return (
          <select
            {...commonProps}
            value={formData[input.name] || ''}
            multiple={input.multiple}
          >
            <option value="">Select {input.label}</option>
            {input.options?.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              {...commonProps}
              checked={formData[input.name] || false}
              className="w-4 h-4 text-[#525B88] border-gray-300 rounded focus:ring-[#525B88]"
            />
          </div>
        );

      case 'checkbox-group':
        return (
          <div className="space-y-2">
            {input.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  name={input.name}
                  value={option.value}
                  checked={(formData[input.name] || []).includes(option.value)}
                  onChange={(e) => handleCheckboxGroupChange(input.name, option.value, e.target.checked)}
                  className="w-4 h-4 text-[#525B88] border-gray-300 rounded focus:ring-[#525B88]"
                  disabled={input.disabled || isSubmitting}
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'radio-group':
        return (
          <div className="space-y-2">
            {input.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer text-sm">
                <input
                  type="radio"
                  name={input.name}
                  value={option.value}
                  checked={formData[input.name] === option.value}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#525B88] border-gray-300 focus:ring-[#525B88]"
                  disabled={input.disabled || isSubmitting}
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center">
            <label className="flex flex-col items-center px-3 py-3 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 w-full">
              <svg className="h-5 w-5 text-[#525B88] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs text-gray-600">
                {formData[input.name] instanceof File
                  ? formData[input.name].name
                  : formData[input.name] && formData[input.name].fileName
                  ? formData[input.name].fileName
                  : "Choose a file"}
              </span>
              <input
                type="file"
                {...commonProps}
                accept={input.accept?.join(',')}
                className="hidden"
              />
            </label>

            {formData[input.name] && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, [input.name]: null }))}
                className="ml-3 p-1.5 text-red-500 hover:text-red-700"
                title="Remove file"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      
      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              {...commonProps}
              value={formData[input.name] || input.min || 0}
              min={input.min}
              max={input.max}
              step={input.step}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{input.min || 0}</span>
              <span className="font-medium">{formData[input.name] || input.min || 0}</span>
              <span>{input.max || 100}</span>
            </div>
          </div>
        );
      
      case 'color':
        return (
          <input
            type="color"
            {...commonProps}
            value={formData[input.name] || '#000000'}
            className="h-10 w-full px-1 border border-gray-300 rounded cursor-pointer"
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            {...commonProps}
            value={formData[input.name] || ''}
            min={input.min}
            max={input.max}
          />
        );

      case 'datetime-local':
        return (
          <input
            type="datetime-local"
            {...commonProps}
            value={formData[input.name] || ''}
            min={input.min}
            max={input.max}
          />
        );

      case 'month':
        return (
          <input
            type="month"
            {...commonProps}
            value={formData[input.name] || ''}
            min={input.min}
            max={input.max}
          />
        );

      case 'week':
        return (
          <input
            type="week"
            {...commonProps}
            value={formData[input.name] || ''}
            min={input.min}
            max={input.max}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            {...commonProps}
            value={formData[input.name] || ''}
            min={input.min}
            max={input.max}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
            value={formData[input.name] || ''}
            min={input.min}
            max={input.max}
            step={input.step}
          />
        );

      case 'switch':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...commonProps}
              checked={formData[input.name] || false}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#525B88] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#525B88]"></div>
          </label>
        );

      case 'search':
        return (
          <div className="relative">
            <input
              type="search"
              {...commonProps}
              value={formData[input.name] || ''}
              className={`${commonProps.className} pr-10`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        );

      case 'email':
        return (
          <input
            type="email"
            {...commonProps}
            value={formData[input.name] || ''}
            pattern={input.pattern}
            onInput={(e) => {
              if (input.validationType === 'email') {
                // Basic email input cleaning
                e.target.value = e.target.value.toLowerCase();
              }
            }}
          />
        );

      case 'password':
        return (
          <input
            type="password"
            {...commonProps}
            value={formData[input.name] || ''}
            minLength={input.minLength}
            maxLength={input.maxLength}
          />
        );

      case 'tel':
        return (
          <input
            type="tel"
            {...commonProps}
            value={formData[input.name] || ''}
            pattern={input.pattern}
            maxLength={input.maxLength || input.exactLength || 15}
            onInput={(e) => {
              // Restrict to numbers only for phone
              if (input.validationType === 'phone' || input.numbersOnly) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
              }
            }}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            {...commonProps}
            value={formData[input.name] || ''}
            pattern={input.pattern}
          />
        );

      case 'hidden':
        return (
          <input
            type="hidden"
            {...commonProps}
            value={formData[input.name] || ''}
          />
        );

      case 'text':
        return (
          <input
            type="text"
            {...commonProps}
            value={formData[input.name] || ''}
            minLength={input.minLength}
            maxLength={input.maxLength}
            pattern={input.pattern}
            onInput={(e) => {
              // Apply input restrictions based on validation type
              if (input.validationType === 'numbersOnly') {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
              } else if (input.validationType === 'lettersOnly') {
                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');
              } else if (input.validationType === 'name') {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, '');
              } else if (input.validationType === 'noSpecialChars') {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
              } else if (input.validationType === 'username') {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
              }
            }}
          />
        );

      default:
        return (
          <input
            type={input.type || 'text'}
            {...commonProps}
            value={formData[input.name] || ''}
            minLength={input.minLength}
            maxLength={input.maxLength}
            pattern={input.pattern}
          />
        );
    }
  };

  const getFormLayoutClass = () => {
    switch (formLayout) {
      case 'horizontal':
        return 'space-y-4';
      case 'grid':
        return `grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`;
      default:
        return 'space-y-4';
    }
  };

  // Determine if input should span full width
  const shouldSpanFullWidth = (input) => {
    return input.fullWidth || 
           input.type === 'grid-select' || 
           input.type === 'textarea' || 
           input.type === 'file';
  };

  return (
    <div className={`bg-white rounded-lg p-4 mb-4 ${className}`}>
      {formTitle && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{formTitle}</h2>
        </div>
      )}

      <form onSubmit={handleSubmit} className={getFormLayoutClass()}>
        {inputs.map((input) => (
          <div 
            key={input.name} 
            className={`
              ${formLayout === 'horizontal' && input.type !== 'grid-select' ? 'grid grid-cols-1 md:grid-cols-3 gap-4 items-start' : ''}
              ${shouldSpanFullWidth(input) ? 'col-span-full' : ''}
              ${input.type === 'hidden' ? 'hidden' : ''}
            `}
          >
            {input.type !== 'checkbox' && input.type !== 'switch' && input.type !== 'hidden' && input.type !== 'grid-select' && (
              <label 
                htmlFor={input.name} 
                className={`
                  block text-gray-700 font-medium mb-1.5 text-sm
                  ${formLayout === 'horizontal' ? 'pt-1.5' : ''}
                `}
              >
                {input.label}
                {input.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            
            {input.type === 'grid-select' && (
              <label className="block text-gray-700 font-medium mb-3 text-sm col-span-full">
                {input.label}
                {input.required && <span className="text-red-500 ml-1">*</span>}
                {input.helperText && (
                  <p className="text-xs text-gray-500 font-normal mt-1">{input.helperText}</p>
                )}
              </label>
            )}
            
            <div className={
              formLayout === 'horizontal' && input.type !== 'checkbox' && input.type !== 'switch' && input.type !== 'grid-select' 
                ? 'col-span-2' 
                : formLayout === 'grid' && shouldSpanFullWidth(input)
                ? 'col-span-full'
                : ''
            }>
              {(input.type === 'checkbox' || input.type === 'switch') && (
                <div className="flex items-center">
                  {renderInput(input)}
                  <label 
                    htmlFor={input.name} 
                    className="ml-2 block text-gray-700 font-medium text-sm"
                  >
                    {input.label}
                    {input.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                </div>
              )}
              
              {input.type !== 'checkbox' && input.type !== 'switch' && renderInput(input)}
              
              {input.helperText && !errors[input.name] && input.type !== 'grid-select' && (
                <p className="mt-1 text-xs text-gray-500">{input.helperText}</p>
              )}
              
              {errors[input.name] && (
                <p className="mt-1 text-sm text-red-500">{errors[input.name]}</p>
              )}

              {input.type === 'grid-select' && input.multiple && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600">
                    Selected: {(formData[input.name] || []).length} item(s)
                    {input.maxSelection && ` (Max: ${input.maxSelection})`}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {showSubmitButton && (
          <div className={`flex justify-end space-x-3 ${formLayout === 'horizontal' || formLayout === 'grid' ? 'col-span-full' : 'pt-2'}`}>
            {cancelButton && (
              <button
                type="button"
                onClick={cancelButton.onClick}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                {cancelButton.text || 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              disabled={Object.keys(errors).length > 0 || isSubmitting}
              className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-[#454d75] focus:outline-none focus:ring-2 focus:ring-[#525B88] focus:ring-offset-2 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default GlobalForm;