import React, { useState, useEffect } from "react";
import { useFormHook } from "../../../Hooks/FormHook";
import CustomInput from "../../../utils/CustomInput";
import CustomTextarea from "../../../utils/CustomTextarea";
import CustomButton from "../../../utils/CustomButton";
import CustomSelect from "../../../utils/CustomSelect";
import { hiringNotificationSchema } from "../../../validations/HiringValidation";
import { departmentsApi } from "../../../services/apiService";
import { toast } from "react-hot-toast";

const HiringNotification = ({ onClose, onSubmit, initialData = null, mode = "create" }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentsApi.getAll();
      const deptData = Array.isArray(response) ? response : (response.data || []);
      setDepartments(deptData.map(d => ({ label: d.title, value: d._id })));
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    }
  };

  const { FormWrapper, errors, register, reset, setValue, watch } = useFormHook({
    validation: hiringNotificationSchema,
    defaultValues: initialData ? {
      ...initialData,
      departmentId: initialData.departmentId?._id || initialData.departmentId,
      applicationDeadline: initialData.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString().split('T')[0] : ""
    } : {
      jobTitle: "",
      departmentId: "",
      requiredExperience: "",
      requiredSkills: "",
      openings: "",
      applicationDeadline: "",
      description: ""
    }
  });

  // Re-reset if initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        departmentId: initialData.departmentId?._id || initialData.departmentId,
        applicationDeadline: initialData.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString().split('T')[0] : ""
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    if (mode === "view") return;
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting notification:", error);
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === "view";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Header - Following Commencement style */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-500 sticky top-0 z-20 text-white">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">
              {mode === "create" ? "New Hiring Notification" : mode === "edit" ? "Edit Notification" : "View Notification"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <FormWrapper
          submitFn={handleFormSubmit}
          className="p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInput
              label="Job Title"
              placeholder="e.g. Frontend Developer"
              name="jobTitle"
              register={register}
              errors={errors}
              disabled={isViewMode}
            />
            <CustomSelect
              label="Department"
              placeholder="Select Department"
              name="departmentId"
              options={departments}
              value={watch("departmentId")}
              setValue={setValue}
              register={register}
              errors={errors}
              disabled={isViewMode}
            />
            <CustomInput
              label="Experience"
              placeholder="e.g. 3-5 Years"
              name="requiredExperience"
              register={register}
              errors={errors}
              disabled={isViewMode}
            />
            <CustomInput
              label="Number of Openings"
              placeholder="e.g. 5"
              name="openings"
              register={register}
              errors={errors}
              disabled={isViewMode}
            />
            <CustomInput
              label="Required Skills"
              placeholder="e.g. React, Node.js, MongoDB"
              name="requiredSkills"
              register={register}
              errors={errors}
              disabled={isViewMode}
            />
            <CustomInput
              label="Application Deadline"
              type="date"
              name="applicationDeadline"
              register={register}
              errors={errors}
              disabled={isViewMode}
            />
          </div>

          <CustomTextarea
            label="Job Description"
            placeholder="Detailed description of the role and requirements..."
            name="description"
            rows={6}
            register={register}
            errors={errors}
            disabled={isViewMode}
          />

          <div className="flex justify-end pt-6 border-t border-gray-100 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <CustomButton
                title={mode === "create" ? "Create Notification" : "Update Notification"}
                loading={loading}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md border-none"
              />
            )}
          </div>
        </FormWrapper>
      </div>
    </div>
  );
};

export default HiringNotification;


