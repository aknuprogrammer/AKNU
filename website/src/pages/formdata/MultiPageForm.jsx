import React, { useEffect, useState } from "react";
import PersonalInfo from "./PersonalInfo";
import ContactInfo from "./ContactInfo";
import EducationInfo from "./EducationInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import DocumentsUpload from "./DocumentsUpload";
import axios from "axios";
import DisplayDownload_FormDetails from "../form_upload/DisplayDownload_FormDetails";
import { mockDocAdHoc } from "../form_upload/MockData";
import AlertDialog from "../../components/AlertDialog";

export default function MultiPageForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formUploadedSuccess, setFormUploadedSuccess] = useState(false);
  const [finalObj, setFinalObj] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    // Your existing form state
    department: "", //
    // patents: [""],
    specialization: "", //
    name: "", //
    gender: "Male", //
    phCategory: "", //
    religion: "", //
    dob: "", //
    mphil: "", ///check
    // netORSetORSLET: "", //
    fatherName: "", //
    motherName: "", //
    nationality: "Indian", //
    caste: "", //
    subCaste: "", //
    mobileNumber: "", //
    alternateMobileNumber: "", //
    email: "", //
    address: "", //
    sscPercentage: "", //
    sscYearOfPassing: "", //
    // sscBoard: "",
    intermediatePercentage: "", //
    intermediateYearOfPassing: "", //
    // intermediateBoard: "",

    // graduationUniversity: "",
    phdPassedYear: "",
    net: "",
    set: "",
    slet: "",
    // mPhil: "",

    phdTopic: "", //
    phdTopicPapersInternational: "", //
    PublicationsNational: "", //
    PublicationsInternational: "", //
    PatentsAndPublications242025: "", //
    conferencesAndSeminarsNationalOrganized: "", //
    conferencesAndSeminarsInterNationalAttended: "", //
    nptelORswayamORmoocs: "",
    membersInternational: "",
    membersNational: "",
    best3Articles: [""],
    awardsIfAny: [""],
    experienceInHOD: "",
    totalTeachingExperience: "",
    Contribution: "", //
    anyOtherConsideration: "",
    conferencesAndSeminarsInterNationalOrganized: "",
    conferencesAndSeminarsInterNationalPresented: "",
    conferencesAndSeminarsNationalPresented: "",
    conferencesAndSeminarsNational: "",

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
    aadhaar: null, //
    pan: null, //
    ssc: null, //
    intermediate: null, //
    graduation: [], //
    postGraduation: [], //
    additionalDegree: [], //
    phdGraduation: null, //
    netCert: null, //
    setCert: null, //
    sletCert: null, //
    mphilCertificate: null, //

    publication: null,
    patentsProof: null,
    photo: null,
    signature: null,
  });
  const [graduationDegrees, setGraduationDegrees] = useState(
    form.graduationDegrees || [
      { degree: "", percentage: "", yearOfPassing: "" },
    ]
  );

  const [postGraduationDegrees, setPostGraduationDegrees] = useState(
    form.postGraduationDegrees || [
      { degree: "", percentage: "", yearOfPassing: "" },
    ]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      const today = new Date().toISOString().split("T")[0];
      if (value > today) {
        alert("Date of birth cannot be in the future.");
        return;
      }
    }
    if (name === "mobileNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  console.log("____form", form);
  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    const maxSizeInBytes = 100 * 1024; // 100KB
    if (file.size > maxSizeInBytes) {
      alert("File size must be under 100KB");
      e.target.value = "";
      return;
    }

    // Handle dynamic inputs like graduation_0, postGraduation_1, etc.
    if (name.includes("_")) {
      const [category, indexStr] = name.split("_");
      const index = parseInt(indexStr, 10);

      setFiles((prev) => {
        // Create a new array for the category if it doesn't exist
        const updatedCategory = prev[category] ? [...prev[category]] : [];
        updatedCategory[index] = file;

        return {
          ...prev,
          [category]: updatedCategory,
        };
      });
    } else {
      // For static fields like aadhaar, pan, etc.
      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));
    }
  };
  const handleDynamicInputChange = (e, index, key) => {
    const updatedArray = [...form[key]];
    updatedArray[index] = e.target.value;
    setForm((prev) => ({
      ...prev,
      [key]: updatedArray,
    }));
  };

  const addDynamicField = (key) => {
    setForm((prev) => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
  };

  const removeDynamicField = (key, index) => {
    const updatedArray = [...form[key]];
    updatedArray.splice(index, 1);
    setForm((prev) => ({
      ...prev,
      [key]: updatedArray,
    }));
  };

  const nextPage = () => {
    console.log();
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const [nationalPatents, setNationalPatents] = useState(
    form.nationalPatents || [{ series: "", name: "", year: "", status: "" }]
  );

  const [internationalPatents, setInternationalPatents] = useState(
    form.internationalPatents || [
      { series: "", name: "", year: "", status: "" },
    ]
  );
  const [patents, setPatents] = useState(form.patents || []);
  console.log("______patentspatents", patents);
  const [hasFIR, setHasFIR] = useState("No");
  const [firDescription, setFirDescription] = useState("");

  const [additionalDegrees, setAdditionalDegrees] = useState(
    form.additionalDegrees || []
  );

  useEffect(() => {
    const national = patents.filter((p) => p.type === "National");
    const international = patents.filter((p) => p.type === "International");

    const combined = [
      ...nationalPatents.map((p) => ({ ...p, type: "National" })),
      ...internationalPatents.map((p) => ({ ...p, type: "International" })),
    ];

    setPatents(combined); // ✅ still useful for UI updates

    setNationalPatents(
      national.length > 0
        ? national
        : [{ series: "", name: "", year: "", status: "" }]
    );
    setInternationalPatents(
      international.length > 0
        ? international
        : [{ series: "", name: "", year: "", status: "" }]
    );
  }, []);

  const handleSubmit = async () => {
    console.log("🔥 FORM SUBMITTED");

    const formData = new FormData();

    // 1. Add basic form fields except complex arrays
    const complexFields = [
      "graduationDegrees",
      "postGraduationDegrees",
      "additionalDegrees",
      "nationalPatents",
      "internationalPatents",
      "best3Articles",
      "awardsIfAny", // add these two to skip appending as string
    ];

    for (const key in form) {
      if (!complexFields.includes(key)) {
        formData.append(key, form[key]);
      }
    }

    // 2. Add JSON stringified complex arrays
    formData.append("graduationDegrees", JSON.stringify(graduationDegrees));
    formData.append(
      "postGraduationDegrees",
      JSON.stringify(postGraduationDegrees)
    );
    formData.append("patents", JSON.stringify(patents));
    formData.append("additionalDegrees", JSON.stringify(additionalDegrees));
    formData.append("nationalPatents", JSON.stringify(nationalPatents));
    formData.append(
      "internationalPatents",
      JSON.stringify(internationalPatents)
    );
    formData.append("hasFIR", hasFIR);
    formData.append("firDescription", hasFIR === "Yes" ? firDescription : "");

    // ✅ Fix here: Ensure these are arrays before stringifying
    const articles =
      typeof form.best3Articles === "string"
        ? form.best3Articles.split(",").map((s) => s.trim())
        : form.best3Articles;

    const awards =
      typeof form.awardsIfAny === "string"
        ? form.awardsIfAny.split(",").map((s) => s.trim())
        : form.awardsIfAny;

    formData.append("best3Articles", JSON.stringify(articles));
    formData.append("awardsIfAny", JSON.stringify(awards));

    // 3. Add files
    for (const key in files) {
      const fileValue = files[key];
      if (Array.isArray(fileValue)) {
        fileValue.forEach((file) => {
          if (file) formData.append(key, file);
        });
      } else if (fileValue) {
        formData.append(key, fileValue);
      }
    }
    console.log("Uploading files:", Array.from(formData.entries()));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/adhoc-upload/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      localStorage.setItem("formId", JSON.stringify(res.data.id));
      setFinalObj(Object.fromEntries(formData.entries()));

      setIsSuccess(true);
      setFormUploadedSuccess(true);
      console.log("✅ Upload success:", res.data);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    } finally {
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <PersonalInfo
            form={form}
            handleChange={handleChange}
            nextPage={nextPage}
          />
        );
      case 2:
        return (
          <ContactInfo
            form={form}
            handleChange={handleChange}
            nextPage={nextPage}
            prevPage={prevPage}
          />
        );
      case 3:
        return (
          <EducationInfo
            form={form}
            files={files}
            setFiles={setFiles}
            handleChange={handleChange}
            graduationDegrees={graduationDegrees}
            setGraduationDegrees={setGraduationDegrees}
            postGraduationDegrees={postGraduationDegrees}
            setPostGraduationDegrees={setPostGraduationDegrees}
            additionalDegrees={additionalDegrees}
            setAdditionalDegrees={setAdditionalDegrees}
            nextPage={nextPage}
            prevPage={prevPage}
          />
        );
      case 4:
        return (
          <ProfessionalInfo
            form={form}
            files={files}
            handleFileChange={handleFileChange} // ✅ ADD THIS
            nationalPatents={nationalPatents}
            setNationalPatents={setNationalPatents}
            internationalPatents={internationalPatents}
            setInternationalPatents={setInternationalPatents}
            patents={patents}
            prevPage={prevPage}
            setPatents={setPatents}
            handleChange={handleChange}
            nextPage={nextPage}
            handleSubmit={handleSubmit}
            removeDynamicField={removeDynamicField}
            addDynamicField={addDynamicField}
            handleDynamicInputChange={handleDynamicInputChange}
          />
        );

      case 5:
        return (
          <DocumentsUpload
            form={form}
            files={files}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            prevPage={prevPage}
            setFirDescription={setFirDescription}
            setHasFIR={setHasFIR}
            firDescription={firDescription}
            hasFIR={hasFIR}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return <PersonalInfo form={form} handleChange={handleChange} />;
    }
  };

  return (
    <div className=" p-4 w-[100vw] px-24 py-12 bg-[#525B88] text-white">
      <h2 className="text-2xl font-bold text-center">
        Appraisal Form for Adhoc faculty
      </h2>

      <p className=" mb-4 text-center border-b">
        * Please fill the below details to submit the appraisal data.
      </p>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((page) => (
            <div
              key={page}
              className="flex flex-col items-center text-xs gap-2"
            >
              <div
                key={page}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentPage >= page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 "
                }`}
              >
                {page}
              </div>
              <span>
                {
                  [
                    "Personal",
                    "Contact",
                    "Education",
                    "Professional",
                    "Declaration",
                  ][page - 1]
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      {renderPage()}
      <p className="text-sm my-4 ">
        Note:- To change any information, please contact computer center.
      </p>

      <AlertDialog
        open={formUploadedSuccess}
        onClose={() => setFormUploadedSuccess(false)}
        title="Form uploaded successfully!"
      />

      {isSuccess ? (
        <DisplayDownload_FormDetails
          obj={finalObj}
          files={Object.keys(files).filter((key) => files[key] !== null)}
        />
      ) : null}
    </div>
  );
}
