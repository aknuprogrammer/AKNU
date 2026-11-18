import { useEffect, useState } from "react";

export default function ContactInfo({
  form,
  handleChange,
  nextPage,
  prevPage,
}) {
  // Validation function
  const isFormValid = () => {
    // Validate mobile number (10 digits)
    const mobileValid = form.mobileNumber && /^\d{10}$/.test(form.mobileNumber);

    // Validate email format
    const emailValid =
      form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

    // Validate address (minimum 10 characters)
    const addressValid = form.address && form.address.trim().length >= 10;
    return mobileValid && emailValid && addressValid;
  };

  return (
    <div className="space-y-4 font-sans">
      <h3 className="text-lg font-bold mb-4 text-yellow-500 border-b pb-2">
        Contact Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium ">
            Mobile Number*
          </label>
          <input
            name="mobileNumber"
            placeholder="Mobile Number"
            type="tel"
            inputMode="numeric"
            maxLength="10"
            required
            value={form.mobileNumber}
            onChange={handleChange}
            
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />

          {form.mobileNumber && form.mobileNumber.length !== 10 && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a valid 10-digit mobile number
            </p>
          )}

          {!form.mobileNumber && (
            <p className="text-xs text-red-500 mt-1">
              Mobile number is required
            </p>
          )}
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium ">
            Alternate Mobile Number
          </label>
          <input
            name="alternateMobileNumber"
            placeholder="Alternate Mobile Number"
            type="tel"
            inputMode="numeric"
            maxLength="10"
            value={form.alternateMobileNumber}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, ""); // \D = non-digits
              handleChange({
                target: { name: "alternateMobileNumber", value: numericValue },
              });
            }}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />

          {form.alternateMobileNumber &&
            !/^\d{10}$/.test(form.alternateMobileNumber) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid 10-digit number
              </p>
            )}
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium ">
            Email*
          </label>
          <input
            name="email"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a valid email address
            </p>
          )}
          {!form.email && (
            <p className="text-xs text-red-500 mt-1">Email is required</p>
          )}
          <p className="text-xs mt-1">
            To change email address, please contact Computer Centre.
          </p>
        </div>
        <div className="md:col-span-2 mb-3">
          <label className="block mb-1 text-sm font-medium ">
            Address*
          </label>
          <textarea
            name="address"
            placeholder="Full address with postal code"
            required
            minLength="10"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            maxLength="200"
          />
          {!form.address && (
            <p className="text-xs text-red-500 mt-1">Address is required</p>
          )}
          {form.address && form.address.trim().length < 10 && (
            <p className="text-xs text-red-500 mt-1">
              Address should be at least 10 characters
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevPage}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={nextPage}
          disabled={!isFormValid()}
          className={`bg-blue-600 text-white font-bold py-2 px-4 rounded ${
            isFormValid()
              ? "hover:bg-blue-700"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
