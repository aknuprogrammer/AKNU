import React from "react";

export default function EducationInfo({
  form,
  handleChange,
  nextPage,
  prevPage,
  files,
  setFiles,
  graduationDegrees,
  setGraduationDegrees,
  postGraduationDegrees,
  setPostGraduationDegrees,
  additionalDegrees,
  setAdditionalDegrees,
}) {
  const today = new Date();
  const maxDOB = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  const isFormValid = () => {

    console.log("___files",files, files.intermediate,files.intermediate)
    const requiredFields = [
      "sscPercentage",
      "sscYearOfPassing",
      "intermediatePercentage",
      "intermediateYearOfPassing",
    ];

    const uploadFiles = files.ssc 
    const basicValid = requiredFields.every(
      (field) => form[field] && form[field].trim() !== ""
    );

    const graduationValid = graduationDegrees.every(
      (deg) =>
        deg.degree?.trim() &&
        deg.yearOfPassing?.trim() &&
        deg.percentage !== "" &&
        deg.percentage !== null &&
        !isNaN(deg.percentage)
    );

    return basicValid && graduationValid;
  };

  const onChangePercentage = (e) => {
    let { value } = e.target;
    value = Math.min(100, Math.max(0, Number.parseFloat(value) || 0));
    handleChange({ target: { name: e.target.name, value: value.toString() } });
  };

  const handleDegreeChange = (type, index, field, value) => {
    const sets = {
      graduation: [graduationDegrees, setGraduationDegrees],
      postGraduation: [postGraduationDegrees, setPostGraduationDegrees],
      additional: [additionalDegrees, setAdditionalDegrees],
    };

    const [arr, setter] = sets[type];
    const updated = [...arr];
    updated[index][field] = value;
    setter(updated);

    handleChange({ target: { name: `${type}Degrees`, value: updated } });
  };

  const manageDegrees = (type, action, index = null) => {
    const setters = {
      graduation: setGraduationDegrees,
      postGraduation: setPostGraduationDegrees,
      additional: setAdditionalDegrees,
    };

    const templates = {
      graduation: { degree: "", percentage: "", yearOfPassing: "" },
      postGraduation: { degree: "", percentage: "", yearOfPassing: "" },
      additional: {
        degree: "",
        university: "",
        percentage: "",
        yearOfPassing: "",
      },
    };

    const arrays = {
      graduation: graduationDegrees,
      postGraduation: postGraduationDegrees,
      additional: additionalDegrees,
    };

    if (action === "add") {
      setters[type]([...arrays[type], templates[type]]);
    } else if (
      action === "remove" &&
      index !== null &&
      arrays[type].length > 1
    ) {
      const updated = arrays[type].filter((_, i) => i !== index);
      setters[type](updated);
      handleChange({ target: { name: `${type}Degrees`, value: updated } });
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    const maxSize = 100 * 1024;
    if (file.size > maxSize) {
      alert("File size must be under 100KB");
      e.target.value = "";
      return;
    }

    if (name.includes("_")) {
      const [category, indexStr] = name.split("_");
      const index = parseInt(indexStr, 10);
      setFiles((prev) => {
        const arr = Array.isArray(prev[category]) ? [...prev[category]] : [];
        arr[index] = file;
        return { ...prev, [category]: arr };
      });
    } else {
      setFiles((prev) => ({ ...prev, [name]: file }));
    }
  };

  const removeFile = (category, index = null) => {
    if (index !== null) {
      setFiles((prev) => {
        const arr = [...prev[category]];
        arr[index] = null;
        return { ...prev, [category]: arr };
      });
    } else {
      setFiles((prev) => ({ ...prev, [category]: null }));
    }
  };

  const FileDisplay = ({ file, onRemove }) => {
    if (!file) return null;

    return (
      <div className="flex items-center mt-1">
        <span className="text-sm mr-2">{file.name}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 text-xs underline"
        >
          Delete
        </button>
      </div>
    );
  };

  const FileInput = ({ name, onChange, className = "" }) => {
    return (
      <div className={`relative inline-block ${className}`}>
        <label className="flex items-center px-3 py-3 bg-white rounded border border-gray-300 cursor-pointer hover:bg-gray-50 text-xs space-x-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-gray-600">Upload</span>
          <input
            type="file"
            name={name}
            onChange={onChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
        </label>
      </div>
    );
  };

  const renderDegreeSection = (type, title, required = false) => {
    const data = {
      graduation: graduationDegrees,
      postGraduation: postGraduationDegrees,
      additional: additionalDegrees,
    }[type];

    return (
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">
          {title} {required && "*"}
        </h4>
        {data.map((deg, index) => (
          <div key={index} className="mb-4 border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              {/* <h5 className="font-medium">
                {title.split(" ")[0]} {index + 1}
              </h5> */}
              {data.length > 1 && (
                <button
                  type="button"
                  onClick={() => manageDegrees(type, "remove", index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
              {/* Degree Input */}
              <div>
                <label className="block mb-1">Degree*</label>
                <input
                  type="text"
                  value={deg.degree}
                  onChange={(e) =>
                    handleDegreeChange(type, index, "degree", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required={required}
                />
              </div>

              {/* University Input (only for additional) */}
              {type === "additional" && (
                <div>
                  <label className="block mb-1">University</label>
                  <input
                    type="text"
                    value={deg.university}
                    onChange={(e) =>
                      handleDegreeChange(
                        type,
                        index,
                        "university",
                        e.target.value
                      )
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              )}

              {/* Percentage Input */}
              <div>
                <label className="block mb-1">Percentage*</label>
                <input
                  type="number"
                  step="0.01"
                  max="100"
                  min="0"
                  value={deg.percentage}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (val > 100) val = 100;
                    handleDegreeChange(type, index, "percentage", val);
                  }}
                  className="w-full border p-2 rounded"
                  required={required}
                />
              </div>

              {/* Year of Passing */}
              <div>
                <label className="block mb-1">Year of Passing*</label>
                <input
                  type="month"
                  value={deg.yearOfPassing}
                  onChange={(e) =>
                    handleDegreeChange(
                      type,
                      index,
                      "yearOfPassing",
                      e.target.value
                    )
                  }
                  max={maxDOB}
                  className="w-full border p-2 rounded"
                  required={required}
                />
              </div>

              {/* File Input and Display on Same Row */}
              <div
                className={`flex  mt-6 gap-2 ${type === "additional" ? "md:col-span-4" : ""}`}
              >
                <FileInput
                  name={`${type}_${index}`}
                  onChange={handleFileChange}
                />
                <FileDisplay
                  file={files[type]?.[index]}
                  onRemove={() => removeFile(type, index)}
                />
                {required && <p>*</p>}
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => manageDegrees(type, "add")}
          className="mt-2 bg-blue-500 text-white px-3 py-1 text-sm rounded"
        >
          + Add Another {title.split(" ")[0]} Degree
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-yellow-500">
        Educational Qualifications
      </h3>

      {/* SSC */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">SSC/10th*</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Percentage Input */}
          <input
            name="sscPercentage"
            type="number"
            step="0.01"
            placeholder="Percentage"
            value={form.sscPercentage}
            onChange={onChangePercentage}
            className="w-full border p-2 rounded"
            required
          />

          {/* Year of Passing */}
          <input
            name="sscYearOfPassing"
            type="month"
            max={new Date().toISOString().slice(0, 7)}
            value={form.sscYearOfPassing}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          {/* File Upload with Label + Aligned File Name */}
           <div className="flex gap-2" >
            
            <div className="flex gap-2 ">
              <FileInput name="ssc" onChange={handleFileChange} />
              <FileDisplay
                file={files.ssc}
                onRemove={() => removeFile("ssc")}
                required
              />
                <p>*</p>
            </div>
          </div>
        </div>
      </div>

      {/* Intermediate */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">Intermediate/+2*</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="intermediatePercentage"
            type="number"
            step="0.01"
            placeholder="Percentage"
            value={form.intermediatePercentage}
            onChange={onChangePercentage}
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="intermediateYearOfPassing"
            type="month"
           max={new Date().toISOString().slice(0, 7)}
            value={form.intermediateYearOfPassing}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <div className="flex gap-2" >
            
            <FileInput name="intermediate" onChange={handleFileChange} />
            <FileDisplay
              file={files.intermediate}
              onRemove={() => removeFile("intermediate")}
              required
            />
             <p>*</p>
          </div>
         
        </div>
      </div>

      {/* Degrees */}
      {renderDegreeSection("graduation", "Under Graduation", true)}
      {renderDegreeSection("postGraduation", "Post Graduation")}
      {renderDegreeSection("additional", "Additional Degrees")}

      {/* MPhil */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">M.Phil</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="mphil"
            type="month"
            max={new Date().toISOString().slice(0, 7)}
            value={form.mphil}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <div className="md:col-span-2">
            <FileInput name="mphilCertificate" onChange={handleFileChange} />
            <FileDisplay
              file={files.mphilCertificate}
              onRemove={() => removeFile("mphilCertificate")}
            />
          </div>
        </div>
      </div>

      {/* PhD */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">Ph.D</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="phdPassedYear"
            type="month"
           max={new Date().toISOString().slice(0, 7)}
            value={form.phdPassedYear}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            name="phdTopic"
            placeholder="Research Topic"
            value={form.phdTopic}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <div>
            <FileInput name="phdGraduation" onChange={handleFileChange} />
            <FileDisplay
              file={files.phdGraduation}
              onRemove={() => removeFile("phdGraduation")}
            />
          </div>
        </div>
      </div>

      {/* NET */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">NET</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="net"
            type="month"
            max={new Date().toISOString().slice(0, 7)}
            value={form.net}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <div className="md:col-span-2">
            <FileInput name="netCert" onChange={handleFileChange} />
            <FileDisplay
              file={files.netCert}
              onRemove={() => removeFile("netCert")}
            />
          </div>
        </div>
      </div>

            {/* SLET*/}
            <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">SLET</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="slet"
            type="month"
            max={new Date().toISOString().slice(0, 7)}
            value={form.slet}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <div className="md:col-span-2">
            <FileInput name="sletCert" onChange={handleFileChange} />
            <FileDisplay
              file={files.sletCert}
              onRemove={() => removeFile("sletCert")}
            />
          </div>
        </div>
      </div>

            {/* SET */}
            <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">SET</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="set"
            type="month"
            max={new Date().toISOString().slice(0, 7)}
            value={form.set}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <div className="md:col-span-2">
            <FileInput name="setCert" onChange={handleFileChange} />
            <FileDisplay
              file={files.setCert}
              onRemove={() => removeFile("setCert")}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevPage}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          // onClick={nextPage}
          disabled={!isFormValid()}
          className={`${
            isFormValid()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          } text-white px-4 py-2 rounded`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
