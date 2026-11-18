import React, { useEffect } from "react";

const ValidationAlert = ({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  type = "default", // Can be: default, success, warning, error, info
  showIcon = true,
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Define styles based on alert type
  const typeStyles = {
    default: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primaryBtn: "bg-[#525B88] hover:bg-blue-700 text-white",
      secondaryBtn: "bg-[#525B88] hover:bg-gray-200 text-gray-800"
    },
    success: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primaryBtn: "bg-green-600 hover:bg-green-700 text-white",
      secondaryBtn: "bg-gray-100 hover:bg-gray-200 text-gray-800"
    },
    warning: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      primaryBtn: "bg-yellow-500 hover:bg-yellow-600 text-white",
      secondaryBtn: "bg-gray-100 hover:bg-gray-200 text-gray-800"
    },
    error: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primaryBtn: "bg-red-600 hover:bg-red-700 text-white",
      secondaryBtn: "bg-gray-100 hover:bg-gray-200 text-gray-800"
    },
    info: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primaryBtn: "bg-indigo-600 hover:bg-indigo-700 text-white",
      secondaryBtn: "bg-gray-100 hover:bg-gray-200 text-gray-800"
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {showIcon && <div className="flex-shrink-0">{currentStyle.icon}</div>}
              {title && (
                <h2 className={`text-xl font-semibold ${showIcon ? '' : 'ml-2'} text-gray-900`}>
                  {title}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100 p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="mb-6 text-gray-600">
            {children}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-reverse space-y-2 sm:space-y-0">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className={`px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 ${currentStyle.secondaryBtn}`}
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className={`px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 ${currentStyle.primaryBtn}`}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationAlert;