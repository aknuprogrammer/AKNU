import React, { useState } from "react";
import axios from "axios";

export default function FormUpload() {
  const [form, setForm] = useState({
    _id: "",
    department: "",
    specialization: "",
    name: "",
    gender: "Male",
    dob: "",
    fatherName: "",
    motherName: "",
    nationality: "Indian",
    caste: "",
    subCaste: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    email: "",
    address: "",
    sscPercentage: "",
    sscYearOfPassing: "",
    sscBoard: "",
    intermediatePercentage: "",
    intermediateYearOfPassing: "",
    intermediateBoard: "",
    graduationDegree: "",
    graduationPercentage: "",
    graduationYearOfPassing: "",
    graduationUniversity: "",
    postGraduationDegree: "",
    postGraduationPercentage: "",
    postGraduationYearOfPassing: "",
    phdPassedYear: "",
    net: "",
    set: "",
    slet: "",
    mPhil: "",
    mEd: "",
    bEd: "",
    phdTopic: "",
    phdTopicPapersInternational: "",
    PublicationsNational: "",
    PublicationsInternational: "",
    PatentsAndPublications242025: "",
    conferencesAndSeminarsNationalOrganized: "",
    conferencesAndSeminarsInterNationalAttended: "",
    nptelORswayamORmoocs: "",
    membersInternational: "",
    membersNational: "",
    best3Articles: "",
    awardsIfAny: "",
    experienceInHOD: "",
    totalTeachingExperience: "",
    Contribution: "",
    anyOtherConsideration: "",
    conferencesAndSeminarsInterNationalOrganized: "",
    conferencesAndSeminarsInterNationalPresented: "",
    conferencesAndSeminarsNationalPresented: "",
    conferencesAndSeminarsNational: "",
    PatentsAndPublicationsInter242025: "",
    phdTopicPapers: "",
    ResearchPublications: "",
    postGraduationUniversity: "",
    netQualified: "No",
    netSubject: "",
    netYear: "",
    setQualified: "No",
    setSubject: "",
    setYear: "",
    otherQualification: "",
    workExperience: "No",
    experienceDetails: "",
    publications: "",
    aadharNumber: "",
    panNumber: "",
  });

  const [files, setFiles] = useState({
    aadhaar: null,
    pan: null,
    ssc: null,
    intermediate: null,
    graduation: null,
    postGraduation: null,
    phdGraduation: null,
    net: null,
    set: null,
    slet: null,
    mphil: null,
    med: null,
    bed: null,
    set: null,
    experience: null,
    publication: null,
    patentsProof: null,
    photo: null,
    signature: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
  };
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("data", JSON.stringify(form));
    Object.keys(files).forEach((key) => {
      if (files[key]) formData.append(key, files[key], `${key}.pdf`);
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Form submitted successfully");
      navigate("/")
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  // Department options from the Google Form
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

  // Caste options from the Google Form
  const casteOptions = [
    "OC",
    "BC-A",
    "BC-B",
    "BC-C",
    "BC-D",
    "BC-E",
    "SC",
    "ST",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Application Form for Guest Faculty
      </h2>

      {/* Department and Specialization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Name of the Department*</label>

          <input
            name="department"
            placeholder="Department"
            required
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {/* <select
            name="department"
            required
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select> */}
        </div>
        <div>
          <label className="block mb-1">Specialization*</label>
          <input
            name="specialization"
            placeholder="Specialization"
            required
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* Personal Details */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Full Name*</label>
            <input
              name="name"
              placeholder="Full Name"
              required
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Gender*</label>
            <select
              name="gender"
              required
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Date of Birth*</label>
            <input
              name="dob"
              type="date"
              required
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Father's Name*</label>
            <input
              name="fatherName"
              placeholder="Father's Name"
              required
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
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Nationality*</label>
            <select
              name="nationality"
              required
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="Indian">Indian</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Caste*</label>
            <select
              name="caste"
              required
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
              placeholder="Sub Caste*"
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Mobile Number*</label>
            <input
              name="mobileNumber"
              placeholder="Mobile Number"
              type="tel"
              required
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Alternate Mobile Number</label>
            <input
              name="alternateMobileNumber"
              placeholder="Alternate Mobile Number"
              type="tel"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Email*</label>
            <input
              name="email"
              placeholder="Email"
              type="email"
              required
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Address*</label>
            <textarea
              name="address"
              placeholder="Address"
              required
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows="3"
            />
          </div>
        </div>
      </div>

      {/* Educational Qualifications */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">
          Educational Qualifications
        </h3>

        {/* SSC */}
        <div className="mb-4 border-b pb-4">
          <h4 className="font-medium mb-2">SSC/10th Class*</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Percentage*</label>
              <input
                name="sscPercentage"
                placeholder="Percentage"
                type="number"
                step="0.01"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Year of Passing*</label>
              <input
                name="sscYearOfPassing"
                placeholder="Year"
                type="number"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Intermediate */}
        <div className="mb-4 border-b pb-4">
          <h4 className="font-medium mb-2">Intermediate/+2*</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Percentage*</label>
              <input
                name="intermediatePercentage"
                placeholder="Percentage"
                type="number"
                step="0.01"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Year of Passing*</label>
              <input
                name="intermediateYearOfPassing"
                placeholder="Year"
                type="number"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Graduation */}
        <div className="mb-4 border-b pb-4">
          <h4 className="font-medium mb-2">Graduation*</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Degree*</label>
              <input
                name="graduationDegree"
                placeholder="Degree"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Percentage*</label>
              <input
                name="graduationPercentage"
                placeholder="Percentage"
                type="number"
                step="0.01"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Year of Passing*</label>
              <input
                name="graduationYearOfPassing"
                placeholder="Year"
                type="number"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Post Graduation */}
        <div className="mb-4 border-b pb-4">
          <h4 className="font-medium mb-2">
            Post Graduation / MTech / MPharmacy*
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Degree*</label>
              <input
                name="postGraduationDegree"
                placeholder="Degree"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Percentage*</label>
              <input
                name="postGraduationPercentage"
                placeholder="Percentage"
                type="number"
                step="0.01"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Year of Passing*</label>
              <input
                name="postGraduationYearOfPassing"
                placeholder="Year"
                type="number"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* M.Ed */}
        <div className="mb-4 border-b pb-4 ">
          <h4 className="font-medium mb-2">M.Ed</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Year of Passing</label>
              <input
                name="mEd"
                placeholder="Year"
                type="date"
                // required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* B.Ed */}
        <div className="mb-4 border-b pb-4">
          <h4 className="font-medium mb-2">B.Ed</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Year of Passing</label>
              <input
                name="bEd"
                placeholder="Year"
                type="date"
                // required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Phd */}
        <div className="mb-4 border-b pb-4">
          <h4 className="font-medium mb-2">Phd*</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Year of Passing*</label>
              <input
                name="phdPassedYear"
                placeholder="Year"
                type="date"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Qualifications */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">
          Eligibility Qualifications
        </h3>

        {/* NET */}
        <div className="mb-4 border-b pb-4">
          <h4 className="font-medium mb-2">NET/SLET/SET</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Year of Passing</label>
              <input
                name="netORSetORSLET"
                placeholder="Year"
                type="date"
                // required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* M.phil */}
        <div className="mb-4 border-b pb-4">
          <h4 className="font-medium mb-2">M.Phil</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Year of Passing</label>
              <input
                name="mPhil"
                placeholder="Year"
                type="date"
                // required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* SET */}
        {/* <div className="mb-4">
          <h4 className="font-medium mb-2">SET</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Qualified?*</label>
              <select
                name="setQualified"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {form.setQualified === "Yes" && (
              <>
                <div>
                  <label className="block mb-1">Subject*</label>
                  <input
                    name="setSubject"
                    placeholder="Subject"
                    required={form.setQualified === "Yes"}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Year*</label>
                  <input
                    name="setYear"
                    placeholder="Year"
                    type="number"
                    required={form.setQualified === "Yes"}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </>
            )}
          </div>
        </div> */}
      </div>

      {/* Other Information */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Other Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block mb-1">Other Qualifications (if any)</label>
            <textarea
              name="otherQualification"
              placeholder="Other Qualifications"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows="3"
            />
          </div>
          <div>
            <label className="block mb-1">Phd Topic </label>
            <input
              name="phdTopic"
              placeholder="Phd Topic"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              //   rows="3"
            />
          </div>
          <div>
            <label className="block mb-1">
              Publications Research Papers in referred Journals National{" "}
            </label>
            <input
              name="phdTopicPapers"
              placeholder=" Publications Research Papers in referred Journals National"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              //   rows="3"
            />
          </div>
          <div>
            <label className="block mb-1">
              Publications Research Papers in referred Journals International
            </label>
            <input
              name="phdTopicPapersInternational"
              placeholder="Publications  Research Papers in referred Journals  International "
              onChange={handleChange}
              className="w-full border p-2 rounded"
              //   rows="3"
            />
          </div>
          <div>
            <label className="block mb-1">Publications Books - National</label>
            <input
              name="PublicationsNational"
              placeholder="Publications  Books - National"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              //   rows="3"
            />
          </div>
          <div>
            <label className="block mb-1">
              Publications Books - International
            </label>
            <input
              name="PublicationsInternational"
              placeholder="Publications  Books - International"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              //   rows="3"
            />
          </div>
          <div>
            <label className="block mb-1">Research Publications </label>
            <input
              name="ResearchPublications"
              placeholder="ResearchPublications"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              //   rows="3"
            />
          </div>
          <div>
            <label className="block mb-1">
              Patents Filed/Published during the academic year 2024-25 National
            </label>
            <input
              name="PatentsAndPublications242025"
              placeholder="Patents Filed/Published during the academic year 2024-25 National"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              Patents Filed/Published during the academic year 2024-25
              International
            </label>
            <input
              name="PatentsAndPublicationsInter242025"
              placeholder="Patents Filed/Published during the academic year 2024-25 International"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              Conferences/Seminars/Workshops - National -Attended
            </label>
            <input
              name="conferencesAndSeminarsNational"
              placeholder=" Conferences/Seminars/Workshops - National -Attended"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              Conferences/Seminars/Workshops - National -Presented
            </label>
            <input
              name="conferencesAndSeminarsNationalPresented"
              placeholder=" Conferences/Seminars/Workshops - National -Presented"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              Conferences/Seminars/Workshops - National -Organized
            </label>
            <input
              name="conferencesAndSeminarsNationalOrganized"
              placeholder="Conferences/Seminars/Workshops - National -Organized"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              Conferences/Seminars/Workshops - International -Attended
            </label>
            <input
              name="conferencesAndSeminarsInterNationalAttended"
              placeholder="Conferences/Seminars/Workshops - International -Attended"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              Conferences/Seminars/Workshops - International -Presented
            </label>
            <input
              name="conferencesAndSeminarsInterNationalPresented"
              placeholder="Conferences/Seminars/Workshops - International -Attended"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              Conferences/Seminars/Workshops - International -Organized
            </label>
            <input
              name="conferencesAndSeminarsInterNationalOrganized"
              placeholder="Conferences/Seminars/Workshops - International -Organized"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">NPTEL/ SWAYAM/ MOOCS</label>
            <input
              name="nptelORswayamORmoocs"
              placeholder=" NPTEL/ SWAYAM/ MOOCS"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              Memberships if any - International
            </label>
            <input
              name="membersInternational"
              placeholder="Memberships if any - International"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Memberships if any - National</label>
            <input
              name="membersNational"
              placeholder="Memberships if any - National"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Best 3 Articles</label>
            <input
              name="best3Articles"
              placeholder="Best 3 Articles"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1"> Awards if any</label>
            <input
              name="awardsIfAny"
              placeholder=" Awards if any"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              {" "}
              Experience as Ad-hoc Faculty in detail (At University Level)*
            </label>
            <input
              name="experienceInHOD"
              placeholder=" Experience as Ad-hoc Faculty in detail (At University Level)"
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1"> Total Teaching experience*</label>
            <input
              name="totalTeachingExperience"
              placeholder=" Total Teaching experience"
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              {" "}
              Contribution to the academic / Research in last two year (2023-24,
              2024-25)*
            </label>
            <input
              name="Contribution"
              placeholder=" Contribution to the academic / Research  in last two year (2023-24, 2024-25)"
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              {" "}
              Any other relevant particulars which the candidate wishes for
              consideration*
            </label>
            <input
              name="anyOtherConsideration"
              placeholder="Any other relevant particulars which the candidate wishes for consideration"
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Work Experience*</label>
            <select
              name="workExperience"
              required
              onChange={handleChange}
              className="w-full border p-2 rounded mb-2"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
            {form.workExperience === "Yes" && (
              <textarea
                name="experienceDetails"
                placeholder="Experience Details*"
                required={form.workExperience === "Yes"}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                rows="3"
              />
            )}
          </div>
          <div>
            <label className="block mb-1">Publications (if any)</label>
            <textarea
              name="publications"
              placeholder="Publications"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Aadhar Number*</label>
              <input
                name="aadharNumber"
                placeholder="Aadhar Number"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">PAN Number</label>
              <input
                name="panNumber"
                placeholder="PAN Number"
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Document Uploads */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Document Uploads</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Aadhaar Card (PDF)*</label>
            <input
              type="file"
              name="aadhaar"
              accept="application/pdf"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">PAN Card (PDF)</label>
            <input
              type="file"
              name="pan"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">SSC Certificate (PDF)*</label>
            <input
              type="file"
              name="ssc"
              accept="application/pdf"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">
              Intermediate Certificate (PDF)*
            </label>
            <input
              type="file"
              name="intermediate"
              accept="application/pdf"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Graduation Certificate (PDF)*</label>
            <input
              type="file"
              name="graduation"
              accept="application/pdf"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">
              Post Graduation Certificate (PDF)*
            </label>
            <input
              type="file"
              name="postGraduation"
              accept="application/pdf"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Phd Certificate (PDF)*</label>
            <input
              type="file"
              name="phdGraduation"
              accept="application/pdf"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">NET/SET/SLET Certificate (PDF)</label>
            <input
              type="file"
              name="netORsetORslet"
              accept="application/pdf"
              required={form.netQualified === "Yes"}
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">M.Phil Certificate (PDF)</label>
            <input
              type="file"
              name="mphil"
              accept="application/pdf"
              required={form.setQualified === "Yes"}
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">M.ed Certificate (PDF)</label>
            <input
              type="file"
              name="med"
              accept="application/pdf"
              required={form.setQualified === "Yes"}
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">B.ed Certificate (PDF)</label>
            <input
              type="file"
              name="bed"
              accept="application/pdf"
              required={form.setQualified === "Yes"}
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Experience Certificate (PDF)*</label>
            <input
              type="file"
              name="experience"
              accept="application/pdf"
              required={form.workExperience === "Yes"}
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">
              Publication Proof (PDF, if any)
            </label>
            <input
              type="file"
              name="publication"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Patents Proof (JPG/PNG)</label>
            <input
              type="file"
              name="patentsProof"
              accept="application/pdf"
              //   required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          {/* <div>
            <label className="block mb-1">Signature (JPG/PNG)*</label>
            <input
              type="file"
              name="signature"
              accept="image/*"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div> */}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          I declare that all the information provided above is true to the best
          of my knowledge.
        </p>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          Submit Application
        </button>
      </div>
    </form>
  );
}
