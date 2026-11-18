import React, { useRef } from "react";
import { useFormHook } from "../../../Hooks/FormHook";
import CustomInput from "../../../utils/CustomInput";
import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CustomButton from "../../../utils/CustomButton";
import CustomSelect from "../../../utils/CustomSelect";
import { uploadLetterValidation } from "../../../validations/LetterHeadValidation";

export default function LetterHeadUploadForm({ depts, submitFn }) {
  const { FormWrapper, errors, register, reset, setError, setValue, watch } =
    useFormHook({ validation: uploadLetterValidation });

  const pdf = watch("file");
  const fileInputRef = useRef(null);

  return (
    <FormWrapper className={"bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm w-full font-sans"} submitFn={submitFn}>
      {/* <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5 border-b pb-1">Upload Template</h3> */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 items-start">
        {/* Title Field */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5" title="Enter a descriptive title for this template">Template Title</label>
          <CustomInput
            register={register}
            name={"title"}
            errors={errors}
            placeholder={"e.g. Registrar Official"}
            className="text-sm border-gray-300 focus:border-[#525B88] transition-all py-2.5"
          />
        </div>


        {/* Category Dropdown (formerly Department) */}
        <div className="w-full">
          <CustomSelect
            label="Category"
            name={"letterCode"}
            errors={errors}
            value={watch("letterCode")}
            setValue={setValue}
            placeholder="Select a category"
            options={[
              { value: "1", label: "Admin" },
              { value: "2", label: "Vice Chancellor" },
              { value: "3", label: "Registrar" },
              { value: "4", label: "Principal" },
              { value: "5", label: "CDC" },
              { value: "6", label: "Controller of Examinations" },
              { value: "7", label: "Finance Officer" },
              { value: "8", label: "Director" },
              { value: "9", label: "Dean" },
              { value: "10", label: "Others" },
            ]}
          />
        </div>

        {/* Description Field */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5" title="Add a brief description or purpose of this template">Template Description (Optional)</label>
          <CustomInput
            register={register}
            name={"description"}
            errors={errors}
            placeholder={"Briefly describe template (max 200 chars)"}
            className="text-sm border-gray-300 focus:border-[#525B88] transition-all py-2.5"
          />
        </div>

        {/* File Field */}
        <div className="w-full">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 ml-0.5" title="Select a PDF, PNG, or JPG file">Select File</label>
          <div className="p-2 border border-gray-300 rounded-lg bg-gray-50/30 flex items-center gap-3 w-full h-[38px]">
            <label className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer group/fileIn" title="Browse files">
              <div className="bg-white p-1 rounded border border-gray-200 group-hover/fileIn:border-[#525B88] transition-all shrink-0">
                <DocumentTextIcon className="h-4 w-4 text-[#525B88]" />
              </div>
              
              <div className="flex-1 min-w-0">
                {pdf?.length > 0 ? (
                  <p className="text-xs font-bold text-[#525B88] truncate leading-tight">{pdf[0].name}</p>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-tight">PDF, PNG, JPG (500KB Max)</p>
                )}
              </div>

              <CustomInput
                register={register}
                type="file"
                name={"file"}
                errors={errors}
                hidden={true}
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                ref={fileInputRef}
              />
            </label>

            {pdf?.length > 0 && (
              <button 
                type="button" 
                onClick={() => { if (fileInputRef.current) { fileInputRef.current.value = ""; reset(); } }} 
                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {errors?.file && <p className="text-[10px] text-red-500 font-medium mt-1">{errors.file.message}</p>}
        </div>

        <div className="md:col-span-2 flex justify-end pt-2">
          <CustomButton
            title={"Upload Template"}
            className={"w-full md:w-fit px-8 py-[8px] !bg-[#525B88] !hover:bg-[#464c76] text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"}
            disabled={!pdf?.[0]}
          />
        </div>
      </div>
    </FormWrapper>
  );
}
