export default function PersonalInfo({ form, handleChange, nextPage }) {
  const departmentOptions = [
    "Commerce",
    "Computer Science",
    "Economics",
    "English",
    "Hindi",
    "History",
    "Mathematics",
    "Physics",
    "Political Science",
    "Sanskrit",
    "Telugu",
    "Urdu",
  ];
  const today = new Date();
  const maxDOB = new Date(
    today.getFullYear() - 21,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];
  console.log("_________maxDOB", maxDOB);
  const casteOptions = [
    "OC",
    "BC-A",
    "BC-B",
    "BC-C",
    "BC-D",
    "BC-E",
    "SC",
    "ST",
    "Minority",
    "Others",
  ];
  const today1 = new Date().toISOString().split("T")[0];
  console.log("______form.dob <= today", form.dob, today1, form.dob <= today1);
  const isFormValid = () => {
    const today = new Date().toISOString().split("T")[0];
    const minDOB = "1900-01-01";
    return (
      form.department &&
      form.specialization &&
      form.name &&
      form.gender &&
      form.dob <= today &&
      form.dob >= minDOB &&
      form.fatherName &&
      form.motherName &&
      form.nationality &&
      form.caste &&
      form.subCaste
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-yellow-500">
        Personal Information
      </h3>

      {/* Department and Specialization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Name of the Department*</label>
          <input
            name="department"
            placeholder="Department"
            required
            value={form.department}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
            }}
          />
        </div>
        <div>
          <label className="block mb-1">Specialization*</label>
          <input
            name="specialization"
            placeholder="Specialization"
            required
            value={form.specialization}
            onChange={handleChange}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
            }}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* Personal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Full Name*</label>
          <input
            name="name"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={handleChange}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
            }}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Gender*</label>
          <select
            name="gender"
            required
            value={form.gender}
            onChange={handleChange}
            className="w-full border p-[8px] rounded"
          >
            <option className="text-black" value="">
              Select Gender
            </option>
            <option className="text-black" value="Male">
              Male
            </option>
            <option className="text-black" value="Female">
              Female
            </option>
            <option className="text-black" value="Other">
              Other
            </option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Do you claim under PH category</label>
          <select
            name="phCategory"
            required
            value={form.phCategory}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Category</option>
            <option value="PH-HH">PH-HH</option>
            <option value="PH-OH">PH-OH</option>
            <option value="PH-VH">PH-VH</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Date of Birth*</label>
          <input
            name="dob"
            type="date"
            required
            value={form.dob}
            onChange={handleChange}
            max={maxDOB}
            className="w-full border p-[6px] rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Father's Name*</label>
          <input
            name="fatherName"
            placeholder="Father's Name"
            required
            value={form.fatherName}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
            }}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Mother's Name*</label>
          <input
            name="motherName"
            placeholder="Mother's Name"
            required
            value={form.motherName}
            onChange={handleChange}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
            }}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Nationality*</label>
          <select
            name="nationality"
            required
            value={form.nationality}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Nationality</option>
            <option value="Indian">Indian</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Religion</label>
          <input
            name="religion"
            placeholder="Religion"
            required
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
            }}
            value={form.religion}
            onChange={handleChange}
            className="w-full border p-[6px] rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Caste*</label>
          <select
            name="caste"
            required
            value={form.caste}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Caste</option>
            {casteOptions.map((caste) => (
              <option key={caste} value={caste}>
                {caste}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Sub Caste*</label>
          <input
            name="subCaste"
            placeholder="Sub Caste"
            value={form.subCaste}
            onChange={handleChange}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
            }}
            required
            className="w-full border p-[6px] rounded"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
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
