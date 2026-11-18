import { useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { aknuAdikavi, aknuLogo } from "../../assets";
import ResultHallTicketInput from "../../components/results/ResultHallTicketInput";
import { useResultHallTickerHook } from "../../hooks/results/result-hallticket";

const NewStudentResultViewer = () => {
  const {
    searchTerm,
    setSearchTerm,
    error,
    loading,
    showPreviousResults,
    handleSearch,
    captcha,
    captchaInput,
    setCaptchaInput,
    captchaError,
    setCaptchaError,
    refreshCaptcha,
  } = useResultHallTickerHook();
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <ResultHallTicketInput
        error={error}
        handleSearch={handleSearch}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        captcha={captcha}
        captchaInput={captchaInput}
        setCaptchaInput={setCaptchaInput}
        captchaError={captchaError}
        setCaptchaError={setCaptchaError}
        refreshCaptcha={refreshCaptcha}
      />
    </div>
  );
};

export default NewStudentResultViewer;
