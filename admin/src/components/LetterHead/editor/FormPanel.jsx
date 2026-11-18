import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import CustomSelect from "../../../utils/CustomSelect";
import React, { useState } from "react";
export default function FormPanel({ data, setData, onDownload, depts = [], isSubmitting = false }) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo" && files[0]) {
      const reader = new FileReader();
      reader.onload = (e2) => setData({ ...data, logo: e2.target.result });
      reader.readAsDataURL(files[0]);
      setErrors((prev) => ({ ...prev, logo: "" }));
    } else {
      setData({ ...data, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...data[field]];
    newArray[index] = value;
    setData({ ...data, [field]: newArray });
  };

  const addArrayField = (field) => {
    setData({ ...data, [field]: [...data[field], ""] });
  };

  const removeArrayField = (index, field) => {
    if (data[field].length > 1) {
      const newArray = data[field].filter((_, i) => i !== index);
      setData({ ...data, [field]: newArray });
    }
  };

  const handleDownloadClick = () => {
    const newErrors = {};
    if (!data.logo) newErrors.logo = "Please upload a logo";
    if (!data.title?.trim()) newErrors.title = "Please enter title";
    if (!data.description?.[0]?.trim()) newErrors.description = "Please enter description";
    if (!data.email?.trim()) newErrors.email = "Please enter email";
    if (!data.phone?.trim()) newErrors.phone = "Please enter phone number";
    if (!data.footerText?.[0]?.trim()) newErrors.footerText = "Please enter footer text";
    if (!data.layout) newErrors.layout = "Please select header layout";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onDownload();
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50"
        : "border-gray-300 focus:border-[#525B88] focus:ring-[#525B88]/20 hover:border-gray-400"
    }`;

  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5";
  const sectionHeader = "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b pb-1";

  return (
    <div className="bg-transparent">
      <div className="space-y-4">
        {/* SECTION 1: HEADER & IDENTITY */}
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          {/* <h3 className={sectionHeader} title="Basic information that appears at the top of the letterhead">Header & Identity</h3> */}
          <div className="space-y-4">
            <div className="z-10">
              <CustomSelect
                label="Header layout"
                value={data.layout || ""}
                onChange={(val) => setData({ ...data, layout: val })}
                placeholder="Select Layout"
                options={[
                  { label: "Logo | Title | Contact", value: "1" },
                  { label: "Title | Logo | Contact", value: "2" },
                  { label: "Title | Contact | Logo", value: "3" },
                ]}
                errors={errors}
                name="layout"
              />
            </div>

            <div className="p-2 border rounded-xl bg-gray-50/50">
              <label className={labelClass} title="Upload the official institution or department logo">Logo</label>
              <div className="flex items-center gap-3">
                <input type="file" name="logo" accept=".png,.jpg,.jpeg" onChange={handleChange} className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#525B88] file:text-white file:font-semibold" />
                {data.logo && <img src={data.logo} alt="Logo" className="w-10 h-10 object-contain border bg-white rounded-lg p-1" />}
              </div>
              {errors.logo && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.logo}</p>}
            </div>

            <div className="z-20">
              <CustomSelect
                label="Whom to create"
                value={data.letterCode}
                onChange={(val) => setData({ ...data, letterCode: val })}
                placeholder="Select Role"
                options={[
                  { label: "Admin", value: "1" },
                  { label: "Vice Chancellor", value: "2" },
                  { label: "Registrar", value: "3" },
                  { label: "Principal", value: "4" },
                  { label: "CDC", value: "5" },
                  { label: "Controller of Examination", value: "6" },
                  { label: "Finance Officer", value: "7" },
                  { label: "Director", value: "8" },
                  { label: "Dean", value: "9" },
                  { label: "Others", value: "10" },
                ]}
                errors={errors}
                name="letterCode"
              />
            </div>

            <div>
              <label className={labelClass} title="The primary name that will stand out at the top (e.g. Adikavi Nannaya University)">Title</label>
              <input type="text" name="title" value={data.title} onChange={handleChange} placeholder="University Name" className={inputClass("title")} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className={labelClass} title="Additional lines of text appearing under the main title">Description</label>
                <button type="button" onClick={() => addArrayField("description")} className="p-1 rounded-full bg-gray-100 hover:bg-[#525B88] hover:text-white transition-colors">
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {(Array.isArray(data.description) ? data.description : [data.description || ""]).map((desc, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <input type="text" value={desc} onChange={(e) => handleArrayChange(idx, e.target.value, "description")} placeholder={`Row ${idx + 1}`} className={inputClass("description")} />
                    {Array.isArray(data.description) && data.description.length > 1 && (
                      <button type="button" onClick={() => removeArrayField(idx, "description")} className="px-2 text-gray-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className={labelClass} title="The official contact email address for the header">Email</label>
                <input type="email" name="email" value={data.email} onChange={handleChange} placeholder="example@univ.edu" className={inputClass("email")} />
              </div>
              <div>
                <label className={labelClass} title="The official phone or contact number for the header">Phone</label>
                <input type="text" name="phone" value={data.phone} onChange={handleChange} placeholder="+91 000 000" className={inputClass("phone")} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: FOOTER PART */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className={sectionHeader} title="Information that appears at the very bottom of the page">Footer part</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className={labelClass} title="Text that will be printed in the footer area across the bottom">Footer text</label>
                <button type="button" onClick={() => addArrayField("footerText")} className="p-1 rounded-full bg-gray-100 hover:bg-[#525B88] hover:text-white transition-colors">
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {(Array.isArray(data.footerText) ? data.footerText : [data.footerText || ""]).map((feet, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <input type="text" value={feet} onChange={(e) => handleArrayChange(idx, e.target.value, "footerText")} placeholder={`Footer line ${idx + 1}`} className={inputClass("footerText")} />
                    {Array.isArray(data.footerText) && data.footerText.length > 1 && (
                      <button type="button" onClick={() => removeArrayField(idx, "footerText")} className="px-2 text-gray-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button disabled={isSubmitting} onClick={handleDownloadClick} className={`w-full text-white py-2.5 rounded-xl text-sm font-bold shadow-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#525B88] hover:bg-[#464c76] shadow-[#525B88]/20'}`}>
          {isSubmitting ? "Creating template..." : "Create Template"}
        </button>
      </div>
    </div>
  );
}
