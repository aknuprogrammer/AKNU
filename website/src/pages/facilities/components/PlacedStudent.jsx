import React, { useEffect, useRef } from "react";
import {
  BadgeCheck,
  User,
  Briefcase,
  DollarSign,
  Hash,
  IndianRupee,
} from "lucide-react";

const ScrollingStudentCards = () => {
  // Sample student data with image URLs
  const students = [
    {
      name: "Ravi Kumar",
      salary: "8,50,000",
      id: 12345678,
      company: "Infosys",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      name: "Lakshmi Priya",
      salary: "7,80,000",
      id: 12345679,
      company: "TCS",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      name: "Sai Charan",
      salary: "9,20,000",
      id: 12345680,
      company: "Google",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      name: "Divya Reddy",
      salary: "8,00,000",
      id: 12345681,
      company: "Microsoft",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      name: "Venkatesh Babu",
      salary: "7,50,000",
      id: 12345682,
      company: "Amazon",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      name: "Anusha Nanduri",
      salary: "8,80,000",
      id: 12345683,
      company: "Capgemini",
      image: "https://randomuser.me/api/portraits/women/6.jpg",
    },
    {
      name: "Kiran",
      salary: "8,20,000",
      id: 12345684,
      company: "Wipro",
      image: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
      name: "Sravani Meka",
      salary: "9,00,000",
      id: 12345685,
      company: "Cognizant",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
    },
  ];

  // Duplicate the array to create seamless looping
  const duplicatedStudents = [...students, ...students];

  // Refs for animation control
  const scrollRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const scrollContainers = scrollRefs.map((ref) => ref.current);

    // Animation function
    const animateScroll = (container, direction, speed) => {
      let scrollAmount = 0;
      const step = speed;

      const scroll = () => {
        scrollAmount += step;

        if (scrollAmount >= container.scrollWidth / 2) {
          scrollAmount = 0;
        }

        if (direction === "left") {
          // Scroll left to right normally
          container.scrollLeft = scrollAmount;
        } else {
          // Scroll right to left: start from max and decrease
          container.scrollLeft = container.scrollWidth / 2 - scrollAmount;
        }

        requestAnimationFrame(scroll);
      };

      scroll();
    };

    // Start animations for each container with different directions
    animateScroll(scrollContainers[0], "left", 0.5); // First: Left to right
    animateScroll(scrollContainers[1], "right", 0.5); // Second: Right to left (opposite)

    return () => {
      // Clean up if needed
    };
  }, []);

  return (
    <div className="p-4 space-y-8">
      {/* First scroll - left to right */}
      <div className="overflow-hidden relative">
        <div
          ref={scrollRefs[0]}
          className="flex space-x-4 py-2 w-full overflow-x-hidden"
        >
          {duplicatedStudents.map((student, index) => (
            <div
              key={`scroll1-${index}`}
              className="flex-shrink-0 flex flex-col items-center"
            >
              <div className="flex justify-center items-center w-84 gap-5 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-200 border-4 border-white shadow-sm text-3xl font-bold text-gray-600">
                    {student.name.charAt(0)}
                  </div>
                  {student.isVerified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-1">
                    {student.name}
                    {student.isPremium && (
                      <span className="text-amber-500 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </h3>

                  <div className="flex items-center text-gray-500 text-sm gap-1.5">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span>ID: {student.id}</span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm gap-1.5">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{student.company}</span>
                  </div>

                  <div className="flex items-center text-blue-600 font-medium gap-1.5 mt-1">
                    <IndianRupee className="w-4 h-4" />
                    <span>{student.salary}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second scroll - right to left (opposite direction) */}
      <div className="overflow-hidden relative">
        <div
          ref={scrollRefs[1]}
          className="flex space-x-4 py-2 w-full overflow-x-hidden"
        >
          {duplicatedStudents.map((student, index) => (
            <div
              key={`scroll2-${index}`}
              className="flex-shrink-0 flex flex-col items-center"
            >
              <div className="flex justify-center items-center w-84 gap-5 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-200 border-4 border-white shadow-sm text-3xl font-bold text-gray-600">
                    {student.name.charAt(0)}
                  </div>
                  {student.isVerified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-1">
                    {student.name}
                    {student.isPremium && (
                      <span className="text-amber-500 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </h3>

                  <div className="flex items-center text-gray-500 text-sm gap-1.5">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span>ID: {student.id}</span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm gap-1.5">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{student.company}</span>
                  </div>

                  <div className="flex items-center text-blue-600 font-medium gap-1.5 mt-1">
                    <IndianRupee className="w-4 h-4" />
                    <span>{student.salary}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollingStudentCards;
