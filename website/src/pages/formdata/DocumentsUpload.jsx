import { RefreshCw } from "lucide-react";
import React, { useState } from "react";

export default function DocumentsUpload({
  form,
  files,
  handleFileChange,
  setFirDescription,
  setHasFIR,
  firDescription,
  hasFIR,
  prevPage,
  handleSubmit,
}) {
  const [isChecked, setIsChecked] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileSizeErrors, setFileSizeErrors] = useState({});

  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const [captcha, setCaptcha] = React.useState(generateCaptcha());
  const [input, setInput] = React.useState("");
  const [verified, setVerified] = React.useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const validateFiles = () => {
    const errors = {};
    const sizeErrors = {};
    const requiredFiles = fileInputs.filter((file) => file.required);
    let isValid = true;

    requiredFiles.forEach((file) => {
      if (!files[file.name] || !files[file.name].name) {
        errors[file.name] = `${file.label.replace(" (PDF)*", "")} is required`;
        isValid = false;
      }
    });

    // Check file sizes for all uploaded files
    Object.entries(files).forEach(([name, file]) => {
      if (file && file.size > 100 * 1024) {
        // 100KB in bytes
        sizeErrors[name] = "File size must be less than 100KB";
        isValid = false;
      }
    });

    setValidationErrors(errors);
    setFileSizeErrors(sizeErrors);
    return isValid;
  };

  const handleFileUpload = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file && file.size > 100 * 1024) {
      setFileSizeErrors((prev) => ({
        ...prev,
        [name]: "File size must be less than 100KB",
      }));
      e.target.value = ""; // Clear the file input
      return;
    } else {
      setFileSizeErrors((prev) => ({ ...prev, [name]: undefined }));
      handleFileChange(e); // Proceed with normal handling if size is valid
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();

    const isValidCaptcha = input === captcha;
    setVerified(isValidCaptcha);

    if (!isValidCaptcha) {
      alert("Please enter the correct CAPTCHA code.");
      return;
    }

    if (!isChecked) {
      alert("Please agree to the declaration before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      await handleSubmit(); // 🚀 wait for upload to complete
    } catch (err) {
      console.error("❌ Error during handleSubmit:", err);
      alert("Something went wrong during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileInputs = [
    {
      label: "Photo",
      name: "photo",
      required: true,
      accept: "image/png, image/jpeg",
    },
    {
      label: "signature",
      name: "signature",
      required: true,
      accept: "image/png, image/jpeg",
    },
    // {
    //   label: "Patents Proof (JPG/PNG)*",
    //   name: "patentsProof",
    //   required: true,
    //   accept: "image/png, image/jpeg",
    // },
  ];

  const errors = {};
  fileInputs.forEach((file) => {
    if (file.required && (!files[file.name] || !files[file.name].name)) {
      errors[file.name] = `${file.label.replace(" (PDF)*", "")} is required`;
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-yellow-500">Submit</h3>
      <div className="mt-6">
        <label className="block font-medium mb-1">
          FIR / Any Pending Enquiry (If any){" "}
          <span className="text-red-600">*</span>
        </label>
        <select
          value={hasFIR}
          onChange={(e) => setHasFIR(e.target.value)}
          required
          className="border border-gray-400 p-2 rounded w-full md:w-1/2"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>

        {hasFIR === "Yes" && (
          <div className="mt-3">
            <label className="block mb-1 font-medium">
              Please specify the enquiry details:
            </label>
            <div className="mb-2">
              <textarea
                value={firDescription}
                onChange={(e) => setFirDescription(e.target.value)}
                required
                maxLength={200}
                className="w-full md:w-3/4 border border-gray-400 rounded p-2"
                rows={4}
                placeholder="Enter details about any FIR or pending enquiry..."
              />
              <p className="text-sm text-gray-500 text-right">
                {firDescription.length}/200 characters
              </p>
            </div>
          </div>
        )}
      </div>
      {/* ------------------------- MAIN FILES CODE ------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fileInputs.map((file, index) => {
          if (file.show === false) return null;

          return (
            <div key={index} className="mb-4">
              <label className="block mb-1 font-medium">
                {file.label}
                {file.required && <span className="text-red-600">*</span>}
              </label>
              <div className="flex items-center">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 text-sm">
                  Choose File
                  <input
                    type="file"
                    name={file.name || "photo"}
                    accept={file.accept || "application/pdf"}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span
                  className={`text-sm ${!files[file.name]?.name ? "" : ""}`}
                >
                  {files[file.name]?.name || "No file chosen"}
                </span>
              </div>
              {validationErrors[file.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors[file.name]}
                </p>
              )}
              {fileSizeErrors[file.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {fileSizeErrors[file.name]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="declaration"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="mt-1"
          />
          <label htmlFor="declaration" className="ml-2 text-sm">
            I declare that all the information provided above is true to the
            best of my knowledge and all uploaded documents are genuine.
            <span className="text-red-600">*</span>
          </label>
        </div>

        <div className="w-72 flex items-center gap-2">
          <span className="font-semibold tracking-widest text-black px-3 py-2 border border-gray-400 rounded bg-gray-200">
            {captcha}
          </span>
          <button
            type="button"
            onClick={() => setCaptcha(generateCaptcha())}
            className="p-2 border border-gray-300 rounded hover:bg-gray-100"
            aria-label="Refresh Captcha"
          >
            <RefreshCw size={22} stroke="#4887ae" />
          </button>
          <input
            type="text"
            placeholder="Enter captcha"
            value={input}
            onChange={handleInputChange}
            required
            className="p-2 border border-gray-400 rounded w-[150px]"
          />
        </div>

        {verified && (
          <div className="text-green-600 font-medium">Verified!</div>
        )}
        {!verified && input && input !== captcha && (
          <div className="text-red-500">Captcha incorrect</div>
        )}
      </div>

      <div className="flex justify-between mt-6 border-t pt-4">
        <button
          type="button"
          onClick={prevPage}
          disabled={isSubmitting}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={!isChecked || isSubmitting}
          className={`${
            isChecked && !isSubmitting
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          } text-white font-medium py-2 px-4 rounded flex items-center`}
        >
          {isSubmitting && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
