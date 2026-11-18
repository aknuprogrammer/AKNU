export default function DropDownSection({
  children,
  isSectionOpen = false,
  sectionTitle = "",
  onOpenClick = () => null,
  onCloseClick = () => null,
}) {
  return (
    <div className="mb-3 sm:mb-4 border border-[#ddd] shadow-sm duration-300 overflow-hidden">
      <button
        className="w-full text-left py-2.5 sm:py-3 px-3 sm:px-4 bg-teal-700 text-white font-semibold text-sm sm:text-base md:text-lg flex justify-between items-center"
        onClick={isSectionOpen ? onOpenClick : onCloseClick}
      >
        {sectionTitle}
        <span
          className={`transform transition-transform duration-300 text-base sm:text-lg md:text-xl ${
            isSectionOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          ▼
        </span>
      </button>

      {isSectionOpen && (
        <div className="flex flex-col p-4 sm:p-5 md:p-6 lg:p-8 w-full duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
