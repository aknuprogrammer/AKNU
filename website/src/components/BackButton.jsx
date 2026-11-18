import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

//   Polinaidu: 2/11/2025:
// added the handleBack to navigate to previous page when the page is opened in a new tab
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex cursor-pointer items-center text-teal-700 hover:text-[#005f53] font-semibold text-base mb-2 ${className}`}
    >
      <ChevronLeft className="w-5 h-5 mr-1" />
      Back
    </button>
  );
};
