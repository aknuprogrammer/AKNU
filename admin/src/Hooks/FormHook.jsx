import React, { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const useFormHook = ({
  validation = null,
  defaultValues = undefined,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    setValue,
    watch,
    getValues,
    control,
  } = useForm({
    resolver: validation ? zodResolver(validation) : undefined,
    defaultValues: defaultValues ? defaultValues : undefined,
    mode: "onBlur", // Only validate on blur to reduce re-renders
  });

  // Memoize FormWrapper to prevent re-renders
  const FormWrapper = useCallback(
    ({ children, className, submitFn }) => {
      const onSubmit = (data) => {
        submitFn(data, reset);
      };
      return (
        <form onSubmit={handleSubmit(onSubmit)} className={className}>
          {children}
        </form>
      );
    },
    [handleSubmit, reset]
  );

  return { register, FormWrapper, reset, errors, setError, setValue, watch, getValues, control, Controller };
};
