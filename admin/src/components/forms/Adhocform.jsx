import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/urls";
import { toast } from "react-hot-toast";
import { 
  CheckCircleIcon, 
  UserIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  DocumentArrowUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from "@heroicons/react/24/outline";

const Adhocform = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    postGraduationUniversity: "",
    phdPassedYear: "",
    mphil: "",
    mEd: "",
    bEd: "",
    phdTopic: "",
    phdTopicPapers: "",
    phdTopicPapersInternational: "",
    PublicationsNational: "",
    PublicationsInternational: "",
    PatentsAndPublications242025: "",
    conferencesAndSeminarsNationalOrganized: "",
    conferencesAndSeminarsInterNationalAttended: "",
    conferencesAndSeminarsInterNationalOrganized: "",
    conferencesAndSeminarsInterNationalPresented: "",
    conferencesAndSeminarsNationalPresented: "",
    conferencesAndSeminarsNational: "",
    nptelORswayamORmoocs: "",
    membersInternational: "",
    membersNational: "",
    best3Articles: "",
    awardsIfAny: "",
    experienceInHOD: "",
    totalTeachingExperience: "",
    Contribution: "",
    anyOtherConsideration: "",
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
    religion: "",
    phCategory: "No",
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
    netORsetORslet: null,
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

  const steps = [
    { id: 1, title: "Personal", icon: <UserIcon className="h-6 w-6" /> },
    { id: 2, title: "Academic", icon: <AcademicCapIcon className="h-6 w-6" /> },
    { id: 3, title: "Experience", icon: <BriefcaseIcon className="h-6 w-6" /> },
    { id: 4, title: "Documents", icon: <DocumentArrowUpIcon className="h-6 w-6" /> },
  ];

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Numeric-only validation for mobile, Aadhaar, years, and percentages
    const isNumeric = ["mobileNumber", "alternateMobileNumber", "aadharNumber"].includes(name) || 
                     name.toLowerCase().includes("year") || 
                     name.toLowerCase().includes("percentage");

    if (isNumeric) {
      value = value.replace(/\D/g, ""); // Remove non-digits
      const maxLength = name === "aadharNumber" ? 12 : 10;
      if (["mobileNumber", "alternateMobileNumber", "aadharNumber"].includes(name)) {
        if (value.length > maxLength) value = value.slice(0, maxLength);
      }
    }
    
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: {
        const required = ["name", "fatherName", "motherName", "department", "dob", "religion", "nationality", "mobileNumber", "email", "caste", "aadharNumber", "address"];
        for (const field of required) {
          if (!form[field]) {
            toast.error(`Please fill the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`);
            return false;
          }
        }
        if (!/^\d{10}$/.test(form.mobileNumber)) {
          toast.error("Mobile number must be exactly 10 digits.");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          toast.error("Please enter a valid email address.");
          return false;
        }
        if (!/^\d{12}$/.test(form.aadharNumber)) {
          toast.error("Aadhaar number must be exactly 12 digits.");
          return false;
        }
        return true;
      }
      case 2: {
        const eduTypes = [
          { prefix: "ssc", label: "SSC" },
          { prefix: "intermediate", label: "Intermediate" },
          { prefix: "graduation", label: "Graduation" },
          { prefix: "postGraduation", label: "Post Graduation" }
        ];
        for (const edu of eduTypes) {
          const boardKey = `${edu.prefix}${edu.prefix.includes('ssc') || edu.prefix.includes('intermediate') ? 'Board' : 'University'}`;
          if (!form[boardKey] || !form[`${edu.prefix}Degree`] || !form[`${edu.prefix}Percentage`] || !form[`${edu.prefix}YearOfPassing`]) {
            toast.error(`Please complete all fields for ${edu.label} education.`);
            return false;
          }
        }
        return true;
      }
      case 3: {
        const required = ["totalTeachingExperience", "experienceInHOD", "Contribution"];
        for (const field of required) {
          if (!form[field]) {
            toast.error(`Please fill the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`);
            return false;
          }
        }
        return true;
      }
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFiles = [
      { name: "aadhaar", label: "Aadhaar Card" },
      { name: "ssc", label: "SSC Certificate" },
      { name: "intermediate", label: "Intermediate (+2)" },
      { name: "graduation", label: "Graduation Cert" },
      { name: "postGraduation", label: "PG Certificate" },
      { name: "photo", label: "Passport Photo" }
    ];

    for (const file of requiredFiles) {
      if (!files[file.name]) {
        toast.error(`Please upload ${file.label}`);
        return;
      }
    }

    setIsSubmitting(true);

    const formData = new FormData();
    
    // Append all fields directly instead of JSON wrapper
    const formattedForm = { ...form };
    
    // Package Graduation Degree
    if (form.graduationDegree || form.graduationPercentage || form.graduationYearOfPassing) {
       formattedForm.graduationDegrees = JSON.stringify([{
          degree: form.graduationDegree,
          percentage: form.graduationPercentage,
          yearOfPassing: form.graduationYearOfPassing,
       }]);
    }
    
    // Package Post Graduation Degree
    if (form.postGraduationDegree || form.postGraduationPercentage || form.postGraduationYearOfPassing) {
       formattedForm.postGraduationDegrees = JSON.stringify([{
          degree: form.postGraduationDegree,
          percentage: form.postGraduationPercentage,
          yearOfPassing: form.postGraduationYearOfPassing,
          university: form.postGraduationUniversity,
       }]);
    }
    
    // Sync academic flags for display
    formattedForm.net = form.netQualified === "NET" ? "Yes" : "No";
    formattedForm.set = form.netQualified === "SET" ? "Yes" : "No";
    formattedForm.slet = form.netQualified === "SLET" ? "Yes" : "No";

    Object.keys(formattedForm).forEach((key) => {
      if (key === "_id" && !formattedForm[key]) return; // Avoid sending empty _id
      formData.append(key, formattedForm[key]);
    });

    Object.keys(files).forEach((key) => {
      if (files[key]) {
        formData.append(key, files[key], files[key].name || `${key}.pdf`);
      }
    });

    try {
      await axios.post(BASE_URL + "/adhoc-upload", formData);
      toast.success("Application submitted successfully!");
      // Reset form or redirect
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        toast.error(err.response.data.error || "Duplicate application found.");
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = [
    "Commerce", "Computer Science", "Economics", "English", "Hindi", 
    "History", "Mathematics", "Physics", "Political Science", 
    "Sanskrit", "Telugu", "Urdu"
  ];

  const casteOptions = ["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name*</label>
                <input name="name" required onChange={handleChange} value={form.name} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Father's Name*</label>
                <input name="fatherName" required onChange={handleChange} value={form.fatherName} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mother's Name*</label>
                <input name="motherName" required onChange={handleChange} value={form.motherName} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department*</label>
                <select name="department" required onChange={handleChange} value={form.department} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border">
                  <option value="">Select Department</option>
                  {departmentOptions.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Specialization</label>
                <input name="specialization" onChange={handleChange} value={form.specialization} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender*</label>
                <select name="gender" required onChange={handleChange} value={form.gender} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date of Birth*</label>
                <input name="dob" type="date" required onChange={handleChange} value={form.dob} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Religion*</label>
                <input name="religion" required onChange={handleChange} value={form.religion} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nationality*</label>
                <input name="nationality" required onChange={handleChange} value={form.nationality} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mobile Number*</label>
                <input name="mobileNumber" type="tel" required onChange={handleChange} value={form.mobileNumber} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Alternate Mobile</label>
                <input name="alternateMobileNumber" type="tel" onChange={handleChange} value={form.alternateMobileNumber} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address*</label>
                <input name="email" type="email" required onChange={handleChange} value={form.email} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Caste*</label>
                <select name="caste" required onChange={handleChange} value={form.caste} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border">
                  <option value="">Select Caste</option>
                  {casteOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sub-Caste</label>
                <input name="subCaste" onChange={handleChange} value={form.subCaste} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PH Category*</label>
                <select name="phCategory" required onChange={handleChange} value={form.phCategory} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Aadhaar Number*</label>
                <input name="aadharNumber" required onChange={handleChange} value={form.aadharNumber} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PAN Number</label>
                <input name="panNumber" onChange={handleChange} value={form.panNumber} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" placeholder="ABCDE1234F" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Permanent Address*</label>
              <textarea name="address" required onChange={handleChange} value={form.address} rows="3" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#525b88] focus:border-[#525b88] p-2.5 bg-white border" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {[
              { label: "SSC / 10th*", prefix: "ssc" },
              { label: "Intermediate / +2*", prefix: "intermediate" },
              { label: "Graduation*", prefix: "graduation" },
              { label: "Post Graduation*", prefix: "postGraduation" },
            ].map((edu) => (
              <div key={edu.prefix} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4">{edu.label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">{edu.prefix.includes('ssc') || edu.prefix.includes('intermediate') ? 'Board' : 'University'}</label>
                    <input name={`${edu.prefix}${edu.prefix.includes('ssc') || edu.prefix.includes('intermediate') ? 'Board' : 'University'}`} onChange={handleChange} value={form[`${edu.prefix}${edu.prefix.includes('ssc') || edu.prefix.includes('intermediate') ? 'Board' : 'University'}`]} className="w-full border-gray-300 rounded-lg p-2 bg-white border" placeholder={edu.prefix.includes('ssc') ? "e.g. BSEAP / CBSE" : "e.g. University Name"} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Degree / Course</label>
                    <input name={`${edu.prefix}Degree`} onChange={handleChange} value={form[`${edu.prefix}Degree`]} className="w-full border-gray-300 rounded-lg p-2 bg-white border" placeholder="e.g. B.Tech / M.A." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Percentage / CGPA</label>
                    <input name={`${edu.prefix}Percentage`} type="number" step="0.01" onChange={handleChange} value={form[`${edu.prefix}Percentage`]} className="w-full border-gray-300 rounded-lg p-2 bg-white border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Year of Passing</label>
                    <input name={`${edu.prefix}YearOfPassing`} type="number" onChange={handleChange} value={form[`${edu.prefix}YearOfPassing`]} className="w-full border-gray-300 rounded-lg p-2 bg-white border" />
                  </div>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4">Higher Qualifications</h4>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ph.D. Qualified?</span>
                      <select name="phdQualified" onChange={(e) => setForm(prev => ({...prev, phdPassedYear: e.target.value === 'Yes' ? prev.phdPassedYear || new Date().getFullYear().toString() : ""}))} className="border-gray-300 rounded-lg p-1.5 bg-white border text-sm">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {form.phdPassedYear && (
                      <div className="space-y-2 border-t pt-2 mt-2">
                        <input name="phdPassedYear" type="number" placeholder="Year of Award" onChange={handleChange} value={form.phdPassedYear} className="w-full border-gray-300 rounded-lg p-2 bg-white border text-sm" />
                        <input name="phdTopic" placeholder="PhD Topic" onChange={handleChange} value={form.phdTopic} className="w-full border-gray-300 rounded-lg p-2 bg-white border text-sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">NET / SET / SLET?</span>
                      <select name="netQualified" onChange={handleChange} value={form.netQualified} className="border-gray-300 rounded-lg p-1.5 bg-white border text-sm">
                        <option value="No">No</option>
                        <option value="NET">NET</option>
                        <option value="SET">SET</option>
                        <option value="SLET">SLET</option>
                      </select>
                    </div>
                    {form.netQualified !== "No" && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <input name="netSubject" placeholder="Subject" onChange={handleChange} value={form.netSubject} className="w-full border-gray-300 rounded-lg p-2 bg-white border text-sm" />
                        <input name="netYear" type="number" placeholder="Year" onChange={handleChange} value={form.netYear} className="w-full border-gray-300 rounded-lg p-2 bg-white border text-sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">M.Phil / M.Ed / B.Ed?</span>
                      <div className="flex gap-2">
                        {[
                          { key: 'mphil', label: 'M.PHIL' },
                          { key: 'mEd', label: 'M.ED' },
                          { key: 'bEd', label: 'B.ED' }
                        ].map(item => (
                          <label key={item.key} className="flex items-center gap-1 text-xs">
                            <input type="checkbox" name={item.key} checked={form[item.key] === "Yes"} onChange={(e) => setForm(prev => ({...prev, [item.key]: e.target.checked ? "Yes" : "No"}))} className="rounded text-[#525b88]" />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4">Other Certifications</h4>
                <textarea name="otherQualification" placeholder="List any other relevant qualifications..." onChange={handleChange} className="w-full border-gray-300 rounded-lg p-2 bg-white border text-sm" rows="3" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 bg-[#525b88]/5 rounded-2xl border border-[#525b88]/10">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-[#525b88] rounded-xl text-white">
                    <BriefcaseIcon className="h-6 w-6" />
                 </div>
                 <div>
                    <h4 className="text-lg font-bold text-gray-900">Professional Experience</h4>
                    <p className="text-sm text-gray-500">Tell us about your teaching and research background</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Total Teaching Experience*</label>
                  <input name="totalTeachingExperience" placeholder="e.g. 5 Years" required onChange={handleChange} className="w-full border-gray-300 rounded-lg p-2.5 bg-white border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ad-hoc Experience (at University)*</label>
                  <input name="experienceInHOD" placeholder="Details of university level experience" required onChange={handleChange} className="w-full border-gray-300 rounded-lg p-2.5 bg-white border" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Research Publications (National)</label>
                  <input name="phdTopicPapers" type="number" placeholder="Count" onChange={handleChange} value={form.phdTopicPapers} className="w-full border-gray-300 rounded-lg p-2.5 bg-white border" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Research Publications (International)</label>
                  <input name="phdTopicPapersInternational" type="number" placeholder="Count" onChange={handleChange} value={form.phdTopicPapersInternational} className="w-full border-gray-300 rounded-lg p-2.5 bg-white border" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Publications (Total)</label>
                  <input name="publications" placeholder="Any other publication details" onChange={handleChange} value={form.publications} className="w-full border-gray-300 rounded-lg p-2.5 bg-white border" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Patents / Publications (2024–2025)</label>
                  <input name="PatentsAndPublications242025" placeholder="Details" onChange={handleChange} value={form.PatentsAndPublications242025} className="w-full border-gray-300 rounded-lg p-2.5 bg-white border" />
               </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
               <h4 className="font-semibold text-gray-800 mb-4">Conferences & Seminars</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: "National Organized", name: "conferencesAndSeminarsNationalOrganized" },
                    { label: "International Organized", name: "conferencesAndSeminarsInterNationalOrganized" },
                    { label: "National Presented", name: "conferencesAndSeminarsNationalPresented" },
                    { label: "International Presented", name: "conferencesAndSeminarsInterNationalPresented" },
                  ].map(item => (
                    <div key={item.name} className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 uppercase">{item.label}</label>
                      <input name={item.name} type="number" onChange={handleChange} value={form[item.name]} className="border-gray-300 rounded-lg p-1.5 bg-white border" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contribution to Academic/Research (Last 2 Years)*</label>
              <textarea name="Contribution" rows="3" required onChange={handleChange} value={form.Contribution} placeholder="Summarize your key contributions..." className="w-full border-gray-300 rounded-lg p-2.5 bg-white border" />
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
               <h4 className="font-semibold text-gray-800 mb-4">Other Research & Memberships</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 uppercase">NPTEL / SWAYAM / MOOCs</label>
                    <input name="nptelORswayamORmoocs" onChange={handleChange} value={form.nptelORswayamORmoocs} className="border-gray-300 rounded-lg p-1.5 bg-white border" placeholder="Courses completed" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 uppercase">Memberships (National)</label>
                    <input name="membersNational" onChange={handleChange} value={form.membersNational} className="border-gray-300 rounded-lg p-1.5 bg-white border" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 uppercase">Memberships (International)</label>
                    <input name="membersInternational" onChange={handleChange} value={form.membersInternational} className="border-gray-300 rounded-lg p-1.5 bg-white border" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 uppercase">Awards / Honors</label>
                    <input name="awardsIfAny" onChange={handleChange} value={form.awardsIfAny} className="border-gray-300 rounded-lg p-1.5 bg-white border" />
                  </div>
               </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
               <div className="flex">
                  <div className="ml-3">
                     <p className="text-sm text-yellow-700 font-medium">Important Note:</p>
                     <p className="text-xs text-yellow-600">Please ensure all documents are in PDF format and less than 5MB each.</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "aadhaar", label: "Aadhaar Card*", required: true },
                { name: "ssc", label: "SSC Certificate*", required: true },
                { name: "intermediate", label: "Intermediate (+2)*", required: true },
                { name: "graduation", label: "Graduation Cert*", required: true },
                { name: "postGraduation", label: "PG Certificate*", required: true },
                { name: "phdGraduation", label: "PhD Certificate", required: false },
                { name: "experience", label: "Experience Certificate", required: false },
                { name: "photo", label: "Passport Photo", required: true },
              ].map((file) => (
                <div key={file.name} className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#525b88]/50 transition-colors bg-white">
                  <label className="flex flex-col cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700 mb-1">{file.label}</span>
                    <span className="text-xs text-gray-400 mb-3">{files[file.name] ? files[file.name].name : "No file selected"}</span>
                    <input type="file" name={file.name} accept={file.name === 'photo' ? 'image/*' : 'application/pdf'} onChange={handleFileChange} className="hidden" />
                    <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-[#525b88]">
                       <DocumentArrowUpIcon className="h-4 w-4" />
                       Upload
                    </div>
                  </label>
                </div>
              ))}
            </div>

             <div className="flex items-start gap-3 mt-8 p-4 bg-blue-50 rounded-xl text-blue-800">
                <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-blue-400 text-[#525b88]" />
                <p className="text-xs font-medium leading-relaxed">
                   I hereby declare that the particulars furnished by me in this application are true to the best of my knowledge and belief. I understand that any false information will lead to disqualification.
                </p>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#525b88] tracking-tight">Guest Faculty Application</h2>
          <p className="mt-2 text-gray-500 font-medium">Adikavi Nannaya University - Performance Review System</p>
        </div>

        {/* Stepper Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-4 sm:p-8">
            {/* Progress Bar and Step Labels */}
            <div className="relative mb-12">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0 hidden sm:block" />
              <div className="relative z-10 flex justify-between items-center px-4">
                {steps.map((step) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`
                      h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${currentStep >= step.id ? 'bg-[#525b88] text-white shadow-lg shadow-[#525b88]/30 scale-110' : 'bg-white text-gray-400 border-2 border-gray-100'}
                    `}>
                      {currentStep > step.id ? <CheckCircleIcon className="h-7 w-7" /> : step.icon}
                    </div>
                    <span className={`mt-3 text-xs font-bold uppercase tracking-wider ${currentStep >= step.id ? 'text-[#525b88]' : 'text-gray-400'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="min-h-[400px]">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                    ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-100'}
                  `}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  Back
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-2.5 bg-[#525b88] text-white rounded-xl font-bold hover:bg-[#444b71] shadow-lg shadow-[#525b88]/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Continue
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm font-medium">Need help? Contact university support at <span className="text-[#525b88] border-b border-[#525b88]/30">support@aknu.edu.in</span></p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-right { from { transform: translateX(1rem); } to { transform: translateX(0); } }
        .animate-in { animation: fade-in 0.3s ease-out, slide-in-from-right 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Adhocform;