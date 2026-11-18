import { useState } from "react";

export default function ProfessionalInfo({
  form,
  handleChange,
  nextPage,
  files,
  handleFileChange,
  prevPage,
  nationalPatents,
  patents,
  setPatents,
  handleDynamicInputChange,
  addDynamicField,
  removeDynamicField,
  setNationalPatents,
  internationalPatents,
  setInternationalPatents,
}) {
  const [validationErrors_PATENT_FILE, setValidationErrors_PATENT_FILE] = useState({});
  const [fileSizeErrors_PATENT_FILE, setFileSizeErrors_PATENT_FILE] = useState({});
  // Validation function
  const isFormValid = () => {
    // Check all required fields
    const requiredFields = [
      "workExperience",
      "experienceInHOD",
      "totalTeachingExperience",
      "Contribution",
      "anyOtherConsideration",
      "aadharNumber",
      // "aadhaar",
    ];

    // Special case for experience details if work experience is "Yes"
    if (form.workExperience === "Yes" && !form.experienceDetails) {
      return false;
    }
    if(`${form.aadharNumber}`.length < 12) return false;

    return requiredFields.every((field) => {
      const value = form[field];
      return value !== undefined && value !== null && value !== "";
    });
  };
  // const isFormValid = () => {
  //   // Check all required fields
  //   const requiredFields = [
  //     "workExperience",
  //     "experienceInHOD",
  //     "totalTeachingExperience",
  //     "Contribution",
  //     "anyOtherConsideration",
  //     "aadharNumber",
  //   ];

  //   // Special case for experience details if work experience is "Yes"
  //   if (form.workExperience === "Yes" && !form.experienceDetails) {
  //     return false;
  //   }

  //   return requiredFields.every((field) => {
  //     const value = form[field];
  //     return value !== undefined && value !== null && value !== "";
  //   });
  // };

  // Handle national patent changes
  // const [nationalPatents, setNationalPatents] = useState(
  //   form.nationalPatents || [{ series: "", name: "", year: "", status: "" }]
  // );

  // const [internationalPatents, setInternationalPatents] = useState(
  //   form.internationalPatents || [
  //     { series: "", name: "", year: "", status: "" },
  //   ]
  // );
  const handleNationalPatentChange = (index, field, value) => {
    const updatedPatents = [...nationalPatents];
    updatedPatents[index][field] = value;
    setNationalPatents(updatedPatents);
    handleChange({
      target: {
        name: "nationalPatents",
        value: updatedPatents,
      },
    });
  };

  // Handle international patent changes
  const handleInternationalPatentChange = (index, field, value) => {
    const updatedPatents = [...internationalPatents];
    updatedPatents[index][field] = value;
    setInternationalPatents(updatedPatents);
    handleChange({
      target: {
        name: "internationalPatents",
        value: updatedPatents,
      },
    });
  };

  // Add new national patent
  const addNationalPatent = () => {
    setNationalPatents([
      ...nationalPatents,
      { series: "", name: "", year: "", status: "" },
    ]);
  };

  // Remove national patent
  const removeNationalPatent = (index) => {
    const updatedPatents = nationalPatents.filter((_, i) => i !== index);
    setNationalPatents(updatedPatents);
    handleChange({
      target: {
        name: "nationalPatents",
        value: updatedPatents,
      },
    });
  };

  // Add new international patent
  const addInternationalPatent = () => {
    setInternationalPatents([
      ...internationalPatents,
      { series: "", name: "", year: "", status: "" },
    ]);
  };

  // Remove international patent
  const removeInternationalPatent = (index) => {
    const updatedPatents = internationalPatents.filter((_, i) => i !== index);
    setInternationalPatents(updatedPatents);
    handleChange({
      target: {
        name: "internationalPatents",
        value: updatedPatents,
      },
    });
  };
  // const [patents, setPatents] = useState([]);

  const addPatent = () => {
    setPatents([
      ...patents,
      { type: "", series: "", name: "", year: "", status: "" },
    ]);
  };

  

  const removePatent = (index) => {
    const updated = [...patents];
    updated.splice(index, 1);
    setPatents(updated);
  };

  const handlePatentChange = (index, field, value) => {
    const updated = [...patents];
    updated[index][field] = value;
    setPatents(updated);
  };
  // ------------------- PATENT FILE UPLOAD CODE
  const handleFileUpload_PATENT_FILE = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file && file.size > 100 * 1024) {
      setFileSizeErrors_PATENT_FILE((prev) => ({
        ...prev,
        [name]: "File size must be less than 100KB",
      }));
      e.target.value = ""; // Clear the file input
      return;
    } else {
      setFileSizeErrors_PATENT_FILE((prev) => ({ ...prev, [name]: undefined }));
      handleFileChange(e); // Proceed with normal handling if size is valid
    }
  };

  const fileInputs_PATENT_FILE = [
    {
      label: "Patents Proof (JPG/PNG)",
      name: "patentsProof",
      // required: true,
      accept: "image/png, image/jpeg",
    },
  ];


  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-yellow-500">
        Professional Information
      </h3>

      {/* Work Experience */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Have Work Experience?*</label>
            <select
              name="workExperience"
              required
              value={form.workExperience}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-2"
            >
              <option value="">Select</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          {form.workExperience === "Yes" && (
            <div className="md:col-span-2">
              <label className="block mb-1">Experience Details*</label>
              <textarea
                name="experienceDetails"
                placeholder="Experience Details"
                required
                value={form.experienceDetails}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                rows="3"
              />
              {!form.experienceDetails && form.workExperience === "Yes" && (
                <p className="text-red-500 text-sm mt-1">
                  Experience details are required
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Teaching Experience */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">
              Teaching Experience as Ad-hoc Faculty / Contract in detail (At
              University Level)*
            </label>
            <input
              name="experienceInHOD"
              placeholder="Experience details"
              required
              value={form.experienceInHOD}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {!form.experienceInHOD && (
              <p className="text-red-500 text-sm mt-1">
                This field is required
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1">Total Teaching experience*</label>
            <input
              name="totalTeachingExperience"
              placeholder="Total experience"
              required
              value={form.totalTeachingExperience}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, ""); // Remove non-digits
                handleChange({
                  target: { name: "totalTeachingExperience", value: onlyNums },
                });
              }}
              className="w-full border p-2 rounded"
            />

            {!form.totalTeachingExperience && (
              <p className="text-red-500 text-sm mt-1">
                This field is required
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Other Qualifications */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Other Qualifications and Research</h4>

        <div className="space-y-4">
          <div>
            <label className="block mb-1">
              Number of Research Papers - National
            </label>
            <input
              name="phdTopicPapers"
              placeholder="Publications Research Papers - National"
              value={form.phdTopicPapers}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">
              Number of Research Papers - International
            </label>
            <input
              name="phdTopicPapersInternational"
              placeholder="Publications Research Papers - International"
              value={form.phdTopicPapersInternational}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">
              No Of Books Published - National
            </label>
            <input
              name="PublicationsNational"
              placeholder="Publications Books - National"
              value={form.PublicationsNational}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">
              No Of Books Published - International
            </label>
            <input
              name="PublicationsInternational"
              placeholder="Publications Books - International"
              value={form.PublicationsInternational}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            {/* National Patents */}
            <div className="mb-6">
              <h5 className="font-medium mb-2 text-white">Patents</h5>

              {patents.map((patent, index) => (
                <div key={`patent-${index}`} className="mb-4 border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h6 className="font-medium">Patent #{index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removePatent(index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block mb-1">Type</label>
                      <select
                        value={patent.type}
                        onChange={(e) =>
                          handlePatentChange(index, "type", e.target.value)
                        }
                        className="w-full border p-2 rounded"
                      >
                        <option value="">Select Type</option>
                        <option value="National">National</option>
                        <option value="International">International</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Serial/Number</label>
                      <input
                        placeholder="Patent series/number"
                        value={patent.series}
                        onChange={(e) =>
                          handlePatentChange(index, "series", e.target.value)
                        }
                        className="w-full border p-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Patent Name</label>
                      <input
                        placeholder="Patent name"
                        value={patent.name}
                        onChange={(e) =>
                          handlePatentChange(index, "name", e.target.value)
                        }
                        className="w-full border p-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="Year"
                        value={patent.year}
                        onChange={(e) =>
                          handlePatentChange(index, "year", e.target.value)
                        }
                        className="w-full border p-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Status</label>
                      <select
                        value={patent.status}
                        onChange={(e) =>
                          handlePatentChange(index, "status", e.target.value)
                        }
                        className="w-full border p-2 rounded"
                      >
                        <option value="">Select Status</option>
                        <option value="Filed">Filed</option>
                        <option value="Published">Published</option>
                        <option value="Granted">Granted</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPatent}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                + Add Patent
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* -------------------------- NEWLY ADDED CODE: "PATENT PROOF FILE" */}
        {fileInputs_PATENT_FILE.map((file, index) => {
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
                    name={file.name}
                    accept={file.accept || "application/pdf"}
                    // required={file.required}
                    onChange={handleFileUpload_PATENT_FILE}
                    className="hidden"
                  />
                </label>
                <span
                  className={`text-sm ${!files[file.name]?.name ? "" : ""}`}
                >
                  {files[file.name]?.name || "No file chosen"}
                </span>
              </div>
              {validationErrors_PATENT_FILE[file.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors_PATENT_FILE[file.name]}
                </p>
              )}
              {fileSizeErrors_PATENT_FILE[file.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {fileSizeErrors_PATENT_FILE[file.name]}
                </p>
              )}
            </div>
          );
        })}
      </div>
          </div>
        </div>
      </div>

      {/* Conferences Section */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Conferences/Seminars/Workshops</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">National - Attended</label>
            <input
              name="conferencesAndSeminarsNational"
              placeholder="National - Attended"
              value={form.conferencesAndSeminarsNational}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">National - Presented</label>
            <input
              name="conferencesAndSeminarsNationalPresented"
              placeholder="National - Presented"
              value={form.conferencesAndSeminarsNationalPresented}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">National - Organized</label>
            <input
              name="conferencesAndSeminarsNationalOrganized"
              placeholder="National - Organized"
              value={form.conferencesAndSeminarsNationalOrganized}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">International - Attended</label>
            <input
              name="conferencesAndSeminarsInterNationalAttended"
              placeholder="International - Attended"
              value={form.conferencesAndSeminarsInterNationalAttended}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">International - Presented</label>
            <input
              name="conferencesAndSeminarsInterNationalPresented"
              placeholder="International - Presented"
              value={form.conferencesAndSeminarsInterNationalPresented}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">International - Organized</label>
            <input
              name="conferencesAndSeminarsInterNationalOrganized"
              placeholder="International - Organized"
              value={form.conferencesAndSeminarsInterNationalOrganized}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
      </div>

      {/* Additional Contributions */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Additional Contributions</h4>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">NPTEL / SWAYAM / MOOCs</label>
            <input
              name="nptelORswayamORmoocs"
              placeholder="NPTEL / SWAYAM / MOOCs"
              value={form.nptelORswayamORmoocs}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Memberships - International</label>
              <input
                name="membersInternational"
                placeholder="Memberships - International"
                value={form.membersInternational}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Memberships - National</label>
              <input
                name="membersNational"
                placeholder="Memberships - National"
                value={form.membersNational}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Best 3 Articles</label>
            {form.best3Articles.map((article, index) => (
              <div key={index} className="flex mb-2 gap-2">
                <input
                  type="text"
                  value={article}
                  onChange={(e) =>
                    handleDynamicInputChange(e, index, "best3Articles")
                  }
                  placeholder={`Article ${index + 1}`}
                  className="w-full border p-2 rounded"
                />
                {form.best3Articles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDynamicField("best3Articles", index)}
                    className="text-red-500"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addDynamicField("best3Articles")}
               className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                + Add Article
              </button>
          </div>

          <div className="mt-4">
            <label className="block mb-1">Awards if any</label>
            {form.awardsIfAny.map((award, index) => (
              <div key={index} className="flex mb-2 gap-2">
                <input
                  type="text"
                  value={award}
                  onChange={(e) =>
                    handleDynamicInputChange(e, index, "awardsIfAny")
                  }
                  placeholder={`Award ${index + 1}`}
                  className="w-full border p-2 rounded"
                />
                {form.awardsIfAny.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDynamicField("awardsIfAny", index)}
                    className="text-red-500"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addDynamicField("awardsIfAny")}
               className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                + Add Award
              </button>
          </div>

          <div>
            <label className="block mb-1">
              Contribution to the academic / Research in last two year (2023-24,
              2024-25)*
            </label>
            <input
              name="Contribution"
              placeholder="Contribution details"
              required
              value={form.Contribution}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {!form.Contribution && (
              <p className="text-red-500 text-sm mt-1">
                This field is required
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">
              Any other relevant particulars which the candidate wishes for consideration*
            </label>
            <input
              name="anyOtherConsideration"
              placeholder="Other considerations"
              required
              value={form.anyOtherConsideration}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {!form.anyOtherConsideration && (
              <p className="text-red-500 text-sm mt-1">
                This field is required
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Identification */}
      <div className="mb-6">
        <h4 className="font-medium text-lg mb-4">Identification Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aadhar Section */}
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">
              Aadhar Number*
            </label>
            <input
              name="aadharNumber"
              placeholder="Aadhar Number"
              required
              value={form.aadharNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                handleChange({ target: { name: "aadharNumber", value: val } });
              }}
              className="w-full border border-gray-300 p-2 rounded"
            />
            {form?.aadharNumber?.length > 0 &&
              form?.aadharNumber?.length < 12 && (
                <p className="text-red-500 text-sm mt-1">
                  Aadhar number should be 12 digits
                </p>
              )}
            {!form.aadharNumber && (
              <p className="text-red-500 text-sm mt-1">
                Aadhar number is required
              </p>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">
              Aadhar Card Upload*
            </label>
            <input
              type="file"
              name="aadhaar"
              onChange={handleFileChange}
              className="w-full border border-gray-300 p-2 rounded"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            {files?.aadhaar && (
              <p className="text-xs text-green-600 mt-1">
                Selected: {files.aadhaar.name} (
                {(files.aadhaar.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* PAN Section */}
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">PAN Number</label>
            <input
              name="panNumber"
              placeholder="PAN Number"
              maxLength={10}
              value={form.panNumber}
              onChange={(e) => {
                const upper = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "");
                handleChange({ target: { name: "panNumber", value: upper } });
              }}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">
              PAN Card Upload
            </label>
            <input
              type="file"
              name="pan"
              onChange={handleFileChange}
              className="w-full border border-gray-300 p-2 rounded"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            {files?.pan && (
              <p className="text-xs text-green-600 mt-1">
                Selected: {files.pan.name} ({(files.pan.size / 1024).toFixed(1)}{" "}
                KB)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
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
