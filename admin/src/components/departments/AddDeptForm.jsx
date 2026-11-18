import { useFormHook } from "../../Hooks/FormHook";
import CustomInput from "../../utils/CustomInput";
import CustomButton from "../../utils/CustomButton";
import { departmentSchema } from "../../validations/DepartmentValidation";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import { API } from "../../config/urls";
import { useEffect } from "react";
export default function AddDeptForm({ getDepts, setFormOpen, defaultValues }) {
  const { FormWrapper, errors, register, reset, setError, setValue, watch } =
    useFormHook({ validation: departmentSchema, defaultValues: defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const handleSubmit = async (data) => {
    console.log(data._id);

    try {
      let resp;
      if (data._id) {
        resp = await API.put(`/departments/edit/${data._id}`, data);
      } else {
        resp = await API.post("/departments/add", data);
      }
      console.log(resp.data);

      reset();
      getDepts();
      showSuccessMessage(resp.data.message);
      setFormOpen(false);
    } catch (error) {
      showAxiosError(error);
    }
  };

  return (
    <FormWrapper
      submitFn={handleSubmit}
      className={"space-y-4 bg-white p-5 rounded-lg w-[50%]"}
    >
      <CustomInput
        label={"Department Name"}
        placeholder={"Enter Department Name ex: Controller of Exams"}
        register={register}
        name={"title"}
        errors={errors}
      />
      <CustomInput
        label={"Short Code"}
        placeholder={"Enter Short Code ex: COE"}
        register={register}
        name={"shortCode"}
        errors={errors}
      />
      <CustomButton title={"Submit"} />
    </FormWrapper>
  );
}
