import { BookOpen, MessageSquareText, Phone } from "lucide-react";
import { useState } from "react";

const HoverExpandIcons = () => {
  const [hovered, setHovered] = useState(null);

  const items = [
    {
      id: 1,
      label: "Admissions / Apply Now",
      icon: BookOpen,
      link: "/AdmissionPage",
    },
    { id: 2, label: "Contact Us", icon: Phone, link: "/contact" },
    {
      id: 3,
      label: "Raise a Grievance",
      icon: MessageSquareText,
      link: "/chat-with-us",
    },
  ];

  return (
    <div className="flex flex-col items-end mt-10 pointer-events-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isHovered = hovered === item.id;

        return (
          <a
            key={item.id}
            href={item.link}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center group cursor-pointer overflow-hidden mb-[1px] pointer-events-auto"
          >
            <div
              className={`p-3 h-14 w-14 flex justify-center items-center 
                transition-colors duration-300  
                ${isHovered ? "bg-[#2B7367]" : "bg-[#fcc203]"}`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Smoothly expanding label */}
            <div
              className={`bg-[#2B7367] text-white text-sm h-14 flex items-center 
                whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
                px-0 ${
                  isHovered
                    ? "max-w-xs pl-4 pr-4 opacity-100"
                    : "max-w-0 pl-0 pr-0 opacity-0"
                }
              `}
              style={{
                transitionProperty: "max-width, padding, opacity",
              }}
            >
              {item.label}
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default HoverExpandIcons;
