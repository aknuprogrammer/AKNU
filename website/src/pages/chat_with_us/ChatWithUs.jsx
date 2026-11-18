import {
  campusPreference,
  indianStatesAndUTs,
  universityOffices,
} from "./ChatWithUs.Data";
import { PhoneInput as ReactPhoneInput } from "react-international-phone";
import ReCAPTCHA from "react-google-recaptcha";
import "react-international-phone/style.css";
import Select from "react-select";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

import Modal from "react-modal";
import "./ChatWithUs.css";
import {
  MessageSquare,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  BadgeCheck,
  X,
} from "lucide-react";
import { BackButton } from "../../components/BackButton";

Modal.setAppElement("#root");

// ================================================================================================== DATA

const MessageIconSVG = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
    style={{ width: "20px" }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z"></path>
  </svg>
);

const ProgressChip = ({ thisNum = 0, progressNum = 0, text = "" }) => {
  const isDone = progressNum > thisNum;
  const isActive = progressNum >= thisNum;
  return (
    <div
      className={`${
        isActive ? "" : "text-gray-400"
      } flex gap-[1px] items-center justify-center`}
    >
      <span
        className={`${
          isActive ? "bg-teal-700 text-white" : ""
        } border-1 text-[22px] flex items-center justify-center h-[40px] w-[40px] aspect-square rounded-full`}
      >
        {isDone ? <span className="text-[23px]">&#10003;</span> : thisNum}
      </span>
      <span className={`${isActive ? "" : ""} whitespace-nowrap text-[19px]`}>
        {text}
      </span>
    </div>
  );
};

// ================================================================================================== UI
// const ChatModalCard = ({ office, closeModal = () => null }) => {
//   const [message, setMessage] = useState("");
//   const [progress, setProgress] = useState(1);
//   const [formDetails, setFormDetails] = useState({
//     name: "",
//     email: "",
//     mobile_number: "",
//     whatsapp_number: "",
//     is_whatsapp: true,
//     is_withInIndia: true,
//     campus_preferance: { label: "", value: "" },
//     state: { label: "", value: "" },
//     city: { label: "", value: "" },
//     captcha: false,
//     i_agree: false,
//   });

//   const mainButtonContent = progress <= 1 ? <>Continue ＞</> : "Send Message";
//   const mainButtonActive =
//     progress <= 1
//       ? !!message
//       : formDetails.name &&
//         formDetails.email &&
//         formDetails.mobile_number &&
//         (formDetails.whatsapp_number || formDetails.is_whatsapp) &&
//         formDetails.campus_preferance &&
//         formDetails.state.value &&
//         formDetails.city.value &&
//         formDetails.captcha &&
//         formDetails.i_agree;

//   if (!office) return null;

//   return (
//     <div className="lg:max-w-[40vw] md:max-w-[60vw] w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl mx-2 md:mx-0">
//       {/* Header */}
//       <div className="flex items-center gap-4 p-4 md:p-6">
//         <div className="p-2 rounded-full bg-[#00736710]">
//           <img
//             src="https://cdn-icons-png.flaticon.com/512/2541/2541843.png"
//             alt="Office"
//             className="w-8 md:w-10 aspect-square"
//           />
//         </div>
//         <h1 className="text-xl md:text-3xl font-bold text-teal-700">
//           {office.officeName}
//         </h1>
//       </div>

//       <hr className="border-[#00736720] mx-4 md:mx-6" />

//       {/* Progress Steps */}
//       <div className="flex justify-center items-center gap-2 md:gap-4 p-4 md:p-6">
//         <ProgressChip
//           thisNum={1}
//           text={progress === 1 ? "Your Message" : ""}
//           progressNum={progress}
//           active={progress === 1}
//           color="#007367"
//         />

//         {/* <div
//           className={`h-[2px] w-6 md:w-12 ${
//             progress >= 2 ? "bg-teal-700" : "bg-gray-300"
//           }`}
//         ></div> */}

//         {/* <ProgressChip
//           thisNum={2}
//           text={progress === 2 ? "Your Info" : ""}
//           progressNum={progress}
//           active={progress === 2}
//           color="#007367"
//         /> */}

//         <div
//           className={`h-[2px] w-6 md:w-12 ${
//             progress === 3 ? "bg-teal-700" : "bg-gray-300"
//           }`}
//         ></div>

//         <ProgressChip
//           thisNum={2}
//           text={progress === 2 ? "Done" : ""}
//           progressNum={progress}
//           active={progress === 2}
//           color="#007367"
//         />
//       </div>
//       {/* Content Sections */}
//       <div className="p-4">
//         {progress <= 1 ? (
//           <div className="border border-[#00736720] rounded-lg p-4 space-y-4">
//             <form className="space-y-4">
//               <section className="grid md:grid-cols-2 gap-3">
//                 <fieldset className="space-y-1">
//                   <label
//                     htmlFor="office_name"
//                     className="text-xs font-medium text-teal-700"
//                   >
//                     Your Name
//                   </label>
//                   <input
//                     required
//                     type="text"
//                     id="office_name"
//                     placeholder="Enter your name"
//                     value={formDetails.name}
//                     onChange={(e) =>
//                       setFormDetails((prev) => ({
//                         ...prev,
//                         name: e.target.value,
//                       }))
//                     }
//                     className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
//                   />
//                 </fieldset>

//                 <fieldset className="space-y-1">
//                   <label
//                     htmlFor="office_email"
//                     className="text-xs font-medium text-teal-700"
//                   >
//                     Email Address
//                   </label>
//                   <input
//                     id="office_email"
//                     required
//                     type="email"
//                     placeholder="Enter your email"
//                     value={formDetails.email}
//                     onChange={(e) =>
//                       setFormDetails((prev) => ({
//                         ...prev,
//                         email: e.target.value,
//                       }))
//                     }
//                     className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
//                   />
//                 </fieldset>
//               </section>

//               <section className="grid md:grid-cols-2 gap-3">
//                 <fieldset className="space-y-1">
//                   <label
//                     htmlFor="office_ph"
//                     className="text-xs font-medium text-teal-700"
//                   >
//                     Mobile Number
//                   </label>
//                   <ReactPhoneInput
//                     value={formDetails.mobile_number}
//                     onChange={(value) =>
//                       setFormDetails((prev) => ({
//                         ...prev,
//                         mobile_number: value,
//                       }))
//                     }
//                     required
//                     id="office_ph"
//                     defaultCountry="in"
//                     inputClass="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
//                   />
//                 </fieldset>

//                 {!formDetails.is_whatsapp && (
//                   <fieldset className="space-y-1">
//                     <label
//                       htmlFor="office_ph"
//                       className="text-xs font-medium text-teal-700"
//                     >
//                       WhatsApp Number
//                     </label>
//                     <ReactPhoneInput
//                       value={formDetails.whatsapp_number}
//                       onChange={(value) =>
//                         setFormDetails((prev) => ({
//                           ...prev,
//                           whatsapp_number: value,
//                         }))
//                       }
//                       required
//                       id="office_ph"
//                       defaultCountry="in"
//                       inputClass="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
//                     />
//                   </fieldset>
//                 )}
//               </section>

//               <fieldset className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="office_isWhatsapp"
//                   checked={formDetails.is_whatsapp}
//                   onChange={(e) =>
//                     setFormDetails((prev) => ({
//                       ...prev,
//                       is_whatsapp: e.target.checked,
//                     }))
//                   }
//                   className="h-4 w-4 text-teal-700 rounded focus:ring-teal-700"
//                 />
//                 <label
//                   htmlFor="office_isWhatsapp"
//                   className="text-xs text-gray-600"
//                 >
//                   This is also my WhatsApp number
//                 </label>
//               </fieldset>
//               <fieldset className="space-y-1">
//                 <label className="block text-xs font-medium text-teal-700 mb-1">
//                   Department
//                 </label>
//                 <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:border-teal-700 focus:ring-1 focus:ring-teal-700 bg-white">
//                   <option value="" disabled selected className="text-gray-400">
//                     Select Department
//                   </option>
//                   <option className="text-gray-700">Architecture</option>
//                   <option className="text-gray-700">Engineering</option>
//                   <option className="text-gray-700">
//                     Humanities & Social Sciences
//                   </option>
//                   <option className="text-gray-700">Law</option>
//                   <option className="text-gray-700">Management</option>
//                   <option className="text-gray-700">Paramedical</option>
//                   <option className="text-gray-700">Pharmacy</option>
//                   <option className="text-gray-700">Physiotherapy</option>
//                   <option className="text-gray-700">Medicine</option>
//                   <option className="text-gray-700">Nursing</option>
//                   <option className="text-gray-700">Public Policy</option>
//                   <option className="text-gray-700">Science</option>
//                 </select>
//               </fieldset>

//               <fieldset className="space-y-1">
//                 <label className="text-xs font-medium text-teal-700">
//                   Your Message
//                 </label>
//                 <textarea
//                   className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[100px]"
//                   value={message}
//                   placeholder="Ask me about university courses, campus life and more!"
//                   onChange={(e) => setMessage(e.target.value)}
//                 />
//               </fieldset>

//               <div className="space-y-3">
//                 <div className="flex flex-wrap gap-2">
//                   {office?.suggestions?.map((ele, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => setMessage(ele + "\n" || "")}
//                       className="inline-flex items-center gap-1 border border-[#00736730] text-teal-700 text-xs px-2 py-1 rounded hover:bg-[#00736710] transition-colors"
//                     >
//                       <MessageIconSVG className="w-3 h-3" />
//                       <span>{ele}</span>
//                     </button>
//                   ))}
//                 </div>

//                 <div className="scale-90 origin-left">
//                   <ReCAPTCHA
//                     onChange={(value) =>
//                       setFormDetails((prev) => ({ ...prev, captcha: true }))
//                     }
//                     sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
//                   />
//                 </div>

//                 <fieldset className="flex items-start gap-2">
//                   <input
//                     type="checkbox"
//                     id="office_iAgree"
//                     checked={formDetails.i_agree}
//                     onChange={(e) =>
//                       setFormDetails((prev) => ({
//                         ...prev,
//                         i_agree: e.target.checked,
//                       }))
//                     }
//                     className="h-4 w-4 mt-0.5 text-teal-700 rounded focus:ring-teal-700"
//                   />
//                   <label
//                     htmlFor="office_iAgree"
//                     className="text-xs text-gray-600"
//                   >
//                     I agree to the{" "}
//                     <a href="#" className="text-teal-700 hover:underline">
//                       Terms of Use
//                     </a>
//                     ,{" "}
//                     <a href="#" className="text-teal-700 hover:underline">
//                       Privacy Policy
//                     </a>{" "}
//                     and{" "}
//                     <a href="#" className="text-teal-700 hover:underline">
//                       Chat Rules
//                     </a>
//                   </label>
//                 </fieldset>
//               </div>
//             </form>
//           </div>
//         ) : progress === 3 ? (
//           <div className="flex flex-col items-center justify-center p-8 text-center">
//             <div className="w-16 h-16 bg-[#00736710] rounded-full flex items-center justify-center mb-4">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6 text-teal-700"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//             </div>
//             <h1 className="text-xl font-bold text-teal-700 mb-1">
//               Message sent successfully
//             </h1>
//             <p className="text-sm text-gray-600">We'll get back to you soon</p>
//           </div>
//         ) : null}
//       </div>

//       <hr className="border-[#00736720] mx-4 md:mx-6" />

//       {/* Footer Buttons */}
//       <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 md:p-6">
//         <div>
//           {progress === 2 ? (
//             <button
//               className="cursor-pointer border-teal-700 border-2 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base text-teal-700 rounded-md hover:bg-[#00736710] transition-colors whitespace-nowrap"
//               onClick={() => setProgress((prev) => prev - 1)}
//             >
//               ＜ Go back
//             </button>
//           ) : null}
//         </div>
//         <div className="flex flex-col-reverse md:flex-row gap-3 w-full md:w-auto">
//           <button
//             className="cursor-pointer border-teal-700 border-2 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base text-teal-700 rounded-md hover:bg-[#00736710] transition-colors whitespace-nowrap w-full md:w-auto"
//             onClick={closeModal}
//           >
//             Close
//           </button>
//           {progress !== 3 ? (
//             <button
//               //disabled={!mainButtonActive}
//               onClick={() => setProgress((prev) => prev + 1)}
//               className={`${"cursor-pointer bg-teal-700 hover:bg-[#005a4f]"} transition-colors px-4 py-2 md:px-6 md:py-3 text-sm md:text-base text-white rounded-md whitespace-nowrap w-full md:w-auto`}
//             >
//               {mainButtonContent}
//             </button>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// };

// const Chip = ({ title, value }) => {
//   return (
//     <div>
//       <div className="text-[14px] text-cyan-700 font-bold">{title}</div>
//       <div className="text-[22px]">{value}</div>
//     </div>
//   );
// };

// const ChipList = ({ title, lst }) => {
//   return (
//     <div>
//       <div className="text-[14px] text-cyan-700 font-bold">{title}</div>
//       <div className="flex flex-wrap gap-[10px]">
//         {lst.map((txt, idx) => (
//           <span
//             className="bg-teal-100 p-[4px_10px] rounded-sm cursor-pointer hover:bg-teal-300"
//             key={idx}
//           >
//             {txt}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// };

const OfficeCard = ({ office, onChatClick = () => null }) => {
  return (
    <div className="w-full max-w-xl bg-white p-4 rounded-lg shadow-sm hover:shadow-md hover:shadow-[#00736720] transition-all duration-200 border-l-4 border-teal-700">
      {/* Header - Compact */}
      <div className="flex  items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-[#00736710]">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2541/2541843.png"
            alt="Office"
            className="w-7 aspect-square"
          />
        </div>
        <h1 className="text-xl font-semibold text-teal-700 line-clamp-1">
          {office.officeName}
        </h1>
      </div>

      {/* Content - Two Column Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 col-span-2">
          <CompactChip
            title={"In Charge"}
            value={office.personInCharge.name}
            color="#007367"
          />
        </div>
        <CompactChip title={"Phone"} value={office.phone} color="#007367" />

        <CompactChip
          title={"Email"}
          value={office.email}
          color="#007367"
          className="col-span-2 truncate"
        />
        <CompactChip
          title={"Location"}
          value={office.location}
          color="#007367"
          className="col-span-2 truncate"
        />
      </div>

      {/* Services & Button */}
      <div className="mt-3">
        <CompactChipList
          lst={office.services}
          color="#007367"
          className="mb-3"
        />
        <button
          onClick={onChatClick}
          className="w-full bg-teal-700 hover:bg-[#005a4f] text-white text-sm rounded-md px-3 py-2 flex items-center justify-center gap-1 transition-colors"
        >
          <img
            src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/messages-conversation/chat-round-line-wd82dwuctmjp7knda7m4o.png/chat-round-line-jjht3caxrsj1o67pyd5kf.png"
            className="w-4 aspect-square filter brightness-0 invert"
          />
          <span>Raise a grievance</span>
        </button>
      </div>
    </div>
  );
};

// Example CompactChip component (you'll need to implement this)
const CompactChip = ({ title, value, color, className = "" }) => (
  <div className={`text-xs ${className}`}>
    <div className="text-teal-700 font-medium">{title}</div>
    <div className="truncate text-gray-700">{value}</div>
  </div>
);

// Example CompactChipList component
const CompactChipList = ({ lst, color, className = "" }) => (
  <div className={`flex flex-wrap gap-1 ${className}`}>
    {lst?.map((service, idx) => (
      <span
        key={idx}
        className="text-xs px-2 py-1 bg-[#00736710] text-teal-700 rounded"
      >
        {service}
      </span>
    ))}
  </div>
);

export default function ChatWithUsPage() {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [currentOffice, setCurrentOffice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const recaptchaRefWomen = useRef();
  const [isSubmittingWomen, setIsSubmittingWomen] = useState(false);
  const [womenErrors, setWomenErrors] = useState({});

  const handleSubmitWomen = async (e) => {
    e.preventDefault();
    setIsSubmittingWomen(true);
    setWomenErrors({});

    const form = e.target;
    const newErrors = {};

    // Extract fields
    const formData = {
      name: form.name.value.trim(),
      department: form.department.value.trim(),
      rollNo: form.rollNo.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      complaintTypes: new FormData(form).getAll("complaintType"),
      otherComplaint: form.otherComplaint.value.trim(),
      incidentDate: form.incidentDate.value,
      incidentTime: form.incidentTime.value,
      incidentPlace: form.incidentPlace.value.trim(),
      involvedPerson: form.involvedPerson.value.trim(),
      involvedDesignation: form.involvedDesignation.value.trim(),
      witnessName: form.witnessName.value.trim(),
      witnessContact: form.witnessContact.value.trim(),
      resolution: form.resolution.value,
      otherResolution: form.otherResolution.value.trim(),
      files: form.supportingFiles.files,
      token: recaptchaRefWomen.current?.getValue(),
    };

    // Validations
    if (!/^[A-Za-z\s]{2,50}$/.test(formData.name)) {
      newErrors.name = "Name must be 2-50 alphabets and spaces";
    }

    if (formData.department.length < 2) {
      newErrors.department = "Department/Course/Designation is required";
    }

    if (formData.rollNo.length < 2) {
      newErrors.rollNo = "Roll No/Employee ID is required";
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (formData.address.length < 5) {
      newErrors.address = "Residential address is required";
    }

    if (formData.complaintTypes.length === 0) {
      newErrors.complaintType = "Select at least one complaint type";
    }

    if (!formData.incidentDate) {
      newErrors.incidentDate = "Incident date is required";
    }

    if (!formData.incidentTime) {
      newErrors.incidentTime = "Incident time is required";
    }

    if (formData.incidentPlace.length < 3) {
      newErrors.incidentPlace = "Place of incident is required";
    }

    if (!formData.token) {
      newErrors.recaptcha = "Please verify you're not a robot";
    }

    if (Object.keys(newErrors).length > 0) {
      setWomenErrors(newErrors);
      setIsSubmittingWomen(false);
      return;
    }

    // Prepare FormData for submission
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "complaintTypes") {
        value.forEach((type) =>
          submissionData.append("complaintTypes", type)
        );
      } else if (key === "files") {
        for (let i = 0; i < value.length; i++) {
          submissionData.append("supportingFiles", value[i]);
        }
      } else if (key !== "token") {
        submissionData.append(key, value);
      }
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/women-cell`,
        submissionData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Complaint submitted successfully.");
        form.reset();
        recaptchaRefWomen.current.reset();
        setShowModal(false);
      } else {
        alert("Submission failed: " + (res.data.message || "Please try again"));
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error. Try again later.");
    } finally {
      setIsSubmittingWomen(false);
    }
  };
  const [message, setMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showAutoResponse, setShowAutoResponse] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    otp: "",
    department: "",
    subDepartment: "",
    aadhaar: "",
    message: "",
  });
  // Check localStorage on load
  useEffect(() => {
    if (showModal && currentOffice) {
      // Always start with empty form and chat
      setFormData({
        name: "",
        email: "",
        countryCode: "+91",
        phone: "",
        otp: "",
        department: "",
        subDepartment: "",
        aadhaar: "",
        message: "",
      });
      setFormSubmitted(false);
      setChatMessages([]);
    }
  }, [showModal, currentOffice]);
  // Disable background scroll
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [subDepartments, setSubDepartments] = useState([]);

  const handleDepartmentChange = (e) => {
    const departmentName = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      department: departmentName,
      subDepartment: "", // Reset subDepartment when department changes
    }));

    setSelectedDepartment(departmentName);

    const department = currentOffice.departments.find(
      (dep) => dep.name === departmentName
    );

    if (
      department &&
      Array.isArray(department.subDep) &&
      department.subDep.length > 0
    ) {
      setSubDepartments(department.subDep);
    } else {
      setSubDepartments([]); // If no sub-departments, clear the list
    }
  };
  const handleSubDepartmentChange = (e) => {
    const selectedSubDepartment = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      subDepartment: selectedSubDepartment,
    }));
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showModal]);
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return; // Prevent sending empty messages

    const updatedChats = [
      ...chatMessages,
      {
        sender: "user",
        text: chatMessage,
        timestamp: new Date().toISOString(),
      },
    ];

    setChatMessages(updatedChats);

    localStorage.setItem(
      `chatMessages_${currentOffice.id}`,
      JSON.stringify(updatedChats)
    );
    setChatMessage("");
  };
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (
      !formData.email.trim() ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)
    )
      errors.email = "Valid email is required";
    if (!formData.phone || formData.phone.length !== 10)
      errors.phone = "10-digit phone number required";
    if (!formData.otp || formData.otp.length !== 4)
      errors.otp = "4-digit OTP required";
    if (!formData.aadhaar || formData.aadhaar.replace(/\s/g, "").length !== 12)
      errors.aadhaar = "12-digit Aadhaar required";
    if (!formData.message.trim()) errors.message = "Message is required";
    return errors;
  };

  const handleFormSubmit = async () => {
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Build data object matching schema
    const payload = {
      name: formData.name,
      office: currentOffice.officeName, // 👈 This is required in schema
      email: formData.email,
      countryCode: formData.countryCode || "+91",
      phone: formData.phone,
      aadhaar: formData.aadhaar,
      message: formData.message,
      department: formData.department || null,
      subDepartment: formData.subDepartment || null,
    };

    // Save to localStorage
    localStorage.setItem(
      `chatUserData_${currentOffice.id}`,
      JSON.stringify(payload)
    );

    try {
      // Post data using axios
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}api/chat-with-us/details`,
        payload
      );

      if (response.data.success) {
        alert("Data submitted successfully");
        setFormData({
          name: "",
          email: "",
          countryCode: "+91",
          phone: "",
          otp: "",
          department: "",
          subDepartment: "",
          aadhaar: "",
          message: "",
        });

        setFormSubmitted(true);
        setTimeout(() => {
          setShowAutoResponse(true);
        }, 15000);
      } else {
        alert("Failed to submit data");
        console.error("Failed to submit data:", response.data.message);
        // Optional: Show error message to user
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      // Optional: Show error message to user
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  function openModal(office) {
    setCurrentOffice(office);
    setShowModal(true);
    setFormSubmitted(false);
  }
  const handleModalClose = () => {
    setShowModal(false);
    setFormErrors({});
  };

  return (
    <>
      <div className="px-4 sm:px-16 py-8">
        <BackButton />
      </div>
      <main className="grid grid-cols-1 sm:grid-cols-3 gap-10 px-4 sm:px-16 pb-8">
        {" "}
        {universityOffices.map((ele, idx) => (
          <OfficeCard
            office={ele}
            key={idx}
            onChatClick={() => openModal(ele)}
          />
        ))}
        {/* ----------------------- MODAL ------------------------- */}
        {/* <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        contentLabel="Office Message Model"
        style={{
          overlay: {
            background: "#0008",
            zIndex: 1000000,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "85%",
            padding: 0,
          },
        }}
      >
  
      </Modal> */}
        <div className="p-4">
          <Modal
            isOpen={showModal}
            onRequestClose={() => setShowModal(false)}
            shouldCloseOnOverlayClick={false}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col outline-none mx-auto mt-5"
            overlayClassName="fixed inset-0 z-10000 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
          >
            {/* Modal Header */}
            <div className="bg-teal-700 px-6 sm:px-8 py-4 sm:py-5 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Women's Cell Complaint Form
                </h2>
                <p className="text-teal-100 text-xs sm:text-sm">
                  Please fill out the details below accurately
                </p>
              </div>
              <button 
                onClick={handleModalClose}
                className="p-2 text-teal-100 hover:text-white hover:bg-teal-600 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 sm:p-8 md:p-10 custom-scrollbar max-h-[75vh]">
              <form onSubmit={handleSubmitWomen} noValidate className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3 text-left">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.name ? "border-red-500" : "border-gray-300"}`}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(
                            /[^a-zA-Z' ]/g,
                            ""
                          );
                        }}
                        required
                      />
                      {womenErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{womenErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department/Course/Designation{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        placeholder="E.g. Computer Science, B.Tech"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.department ? "border-red-500" : "border-gray-300"}`}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(
                            /[^a-zA-Z' ]/g,
                            ""
                          );
                        }}
                        required
                      />
                      {womenErrors.department && (
                        <p className="mt-1 text-sm text-red-600">
                          {womenErrors.department}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roll No/Employee ID{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rollNo"
                        placeholder="Your identification number"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.rollNo ? "border-red-500" : "border-gray-300"}`}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        }}
                        required
                      />
                      {womenErrors.rollNo && (
                        <p className="mt-1 text-sm text-red-600">
                          {womenErrors.rollNo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit mobile number"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.phone ? "border-red-500" : "border-gray-300"}`}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        }}
                        maxLength={10}
                        required
                      />
                      {womenErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {womenErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="your.email@example.com"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.email ? "border-red-500" : "border-gray-300"}`}
                        required
                      />
                      {womenErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {womenErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Residential Address{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        rows={2}
                        placeholder="Your complete address"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.address ? "border-red-500" : "border-gray-300"}`}
                        required
                      ></textarea>
                      {womenErrors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {womenErrors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Complaint Details Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3 text-left">
                    Complaint Details
                  </h3>

                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type of Complaint (Select all that apply){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {womenErrors.complaintType && (
                      <p className="mb-2 text-sm text-red-600">
                        {womenErrors.complaintType}
                      </p>
                    )}
                    <div className="space-y-3">
                      {[
                        "Harassment (verbal/physical/sexual)",
                        "Gender Discrimination",
                        "Safety Concern",
                        "Misconduct / Abuse",
                        "Other",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              name="complaintType"
                              value={item}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            />
                          </div>
                          <label className="ml-3 text-sm text-gray-700">
                            {item}
                          </label>
                        </div>
                      ))}
                      <div className="mt-2">
                        <input
                          type="text"
                          name="otherComplaint"
                          placeholder="If other, please specify"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Incident <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="incidentDate"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.incidentDate ? "border-red-500" : "border-gray-300"}`}
                        required
                      />
                      {womenErrors.incidentDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {womenErrors.incidentDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time of Incident <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="incidentTime"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.incidentTime ? "border-red-500" : "border-gray-300"}`}
                        required
                      />
                      {womenErrors.incidentTime && (
                        <p className="mt-1 text-sm text-red-600">
                          {womenErrors.incidentTime}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Place of Incident <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="incidentPlace"
                        placeholder="Location where it happened"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${womenErrors.incidentPlace ? "border-red-500" : "border-gray-300"}`}
                        required
                      />
                      {womenErrors.incidentPlace && (
                        <p className="mt-1 text-sm text-red-600">
                          {womenErrors.incidentPlace}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Involved Parties Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3 text-left">
                    Involved Parties (if applicable)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Person(s) Involved
                      </label>
                      <input
                        type="text"
                        name="involvedPerson"
                        placeholder="Name(s) of involved person(s)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Their Designation/Course
                      </label>
                      <input
                        type="text"
                        name="involvedDesignation"
                        placeholder="Their position or course details"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Witness Name(s) (if any)
                      </label>
                      <input
                        type="text"
                        name="witnessName"
                        placeholder="Name(s) of witness(es)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Witness Contact (if any)
                      </label>
                      <input
                        type="text"
                        name="witnessContact"
                        placeholder="Contact information of witness(es)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3 text-left">
                    Supporting Evidence
                  </h3>

                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supporting Documents/Evidence (Optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="supportingFiles"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none"
                          >
                            <span>Upload files</span>
                            <input
                              id="supportingFiles"
                              name="supportingFiles"
                              type="file"
                              multiple
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution Preferences */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-3 text-left">
                    Resolution Preferences (Optional)
                  </h3>

                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How would you like this matter to be addressed?
                    </label>
                    <div className="space-y-3">
                      {[
                        "Just want to report",
                        "Require counselling",
                        "Request formal inquiry",
                        "Other",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="radio"
                              name="resolution"
                              value={item}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                            />
                          </div>
                          <label className="ml-3 text-sm text-gray-700">
                            {item}
                          </label>
                        </div>
                      ))}
                      <div className="mt-2">
                        <input
                          type="text"
                          name="otherResolution"
                          placeholder="If other, please specify"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ReCAPTCHA */}
                <div className="mt-6 flex flex-col items-center sm:items-start">
                  <ReCAPTCHA
                    sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                    ref={recaptchaRefWomen}
                  />
                  {womenErrors.recaptcha && (
                    <p className="mt-1 text-sm text-red-600 text-left">
                      {womenErrors.recaptcha}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmittingWomen}
                    className={`w-full flex justify-center items-center py-3 sm:py-4 px-6 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ${isSubmittingWomen ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"}`}
                  >
                    {isSubmittingWomen ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Submitting...
                      </>
                    ) : (
                      "Submit Complaint"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </main>
    </>
  );
}
