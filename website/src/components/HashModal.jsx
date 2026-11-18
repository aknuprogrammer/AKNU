import { useEffect, useState } from "react";

export default function HashModal({ hash, children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      setIsOpen(window.location.hash === hash);
    };

    // Run once on mount
    checkHash();

    // Listen for both hash & manual history changes
    window.addEventListener("hashchange", checkHash);
    window.addEventListener("popstate", checkHash);

    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("popstate", checkHash);
    };
  }, [hash]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 w-[100vw] h-[100vh] overflow-hidden ">
      <div className="rounded-2xl w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-3xl relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide transform transition-all duration-300 ease-out animate-slide-up">
        <style>{`
              @keyframes slideUp {
                0% {
                  transform: translateY(50px);
                  opacity: 0;
                }
                100% {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
              .animate-slide-up {
                animation: slideUp 0.3s ease-out forwards;
              }
            `}</style>
        <div className="p-1.5 sm:p-4">{children}</div>
      </div>
    </div>
  );
}
