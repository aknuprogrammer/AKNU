import React from "react";
import { API } from "../../../config/urls";
import { useFormHook } from "../../../Hooks/FormHook";
import { useLetterHeadHook } from "../../../Hooks/LetterHeadHook";
import LetterHeadUploadForm from "./LetterHeadUploadForm";
import DisplayLetterHeads from "./DisplayLetterHeads";
import UploadLetterHeadHeading from "./UploadLetterHeadHeading";

export default function UploadLetterHead({ showHeading = true, className = "space-y-6 px-2 lg:px-8", onSuccess }) {
  const { letters, depts, uploadLetterHead } = useLetterHeadHook();

  const handleUploadSuccess = async (...args) => {
    await uploadLetterHead(...args);
    if (onSuccess) onSuccess();
  };

  return (
    <div className={className}>
      {showHeading && <UploadLetterHeadHeading />}
      <LetterHeadUploadForm depts={depts} submitFn={handleUploadSuccess} />
    </div>
  );
}
