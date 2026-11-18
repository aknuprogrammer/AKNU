import React from "react";

export default function CustomTextarea({
  label,
  register,
  name,
  errors,
  placeholder,
  rows = 4,
  hidden,
  ref,
}) {
  const error = errors?.[name];

  return (
    <div className="flex flex-col">
      {label && <label className="text-sm font-semibold">{label}</label>}
      <textarea
        hidden={hidden}
        ref={ref}
        rows={rows}
        {...register(name)}
        placeholder={placeholder}
        className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:ring-blue-200"
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
