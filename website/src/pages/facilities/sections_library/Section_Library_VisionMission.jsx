import "../Facilities.css";

export function VisionSection() {
  return (
    <div className="bg-white overflow-hidden mb-6 sm:mb-8">
      <div className="">
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
          Dr. B.R. Ambedkar Central Library engages in learning and discovery as
          essential to the educational community. We support this mission by:
        </p>
        <ul className="mt-4 sm:mt-5 md:mt-6 space-y-2 sm:space-y-3 text-gray-700 text-xs sm:text-sm md:text-base">
          <li className="flex items-start">
            <span className="text-teal-700 mr-3">•</span>
            <span>
              Developing, organizing, and providing access to knowledge
              resources
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-teal-700 mr-3">•</span>
            <span>
              Preserving materials for future generations of students and
              scholars
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-teal-700 mr-3">•</span>
            <span>
              Implementing innovative technologies for anytime/anywhere access
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-teal-700 mr-3">•</span>
            <span>
              Maintaining functional physical spaces for independent learning
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function MissionSection() {
  return (
    <div className="bg-white overflow-hidden mb-6 sm:mb-8">
      <div className="">
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
          Dr. B.R. Ambedkar Central Library strengthens and enhances the
          university's teaching, research, and service through:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-5 md:mt-6">
          <div className="bg-[#f8f8f8] p-3 sm:p-4 md:p-5 rounded-lg border border-teal-700/10">
            <h3 className="font-bold text-teal-700 mb-2 text-sm sm:text-base">
              Collections Development
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm">
              Building comprehensive collections to support academic programs
            </p>
          </div>
          <div className="bg-[#f8f8f8] p-3 sm:p-4 md:p-5 rounded-lg border border-teal-700/10">
            <h3 className="font-bold text-teal-700 mb-2 text-sm sm:text-base">Information Access</h3>
            <p className="text-gray-700 text-xs sm:text-sm">
              Facilitating seamless access to information resources
            </p>
          </div>
          <div className="bg-[#f8f8f8] p-3 sm:p-4 md:p-5 rounded-lg border border-teal-700/10">
            <h3 className="font-bold text-teal-700 mb-2 text-sm sm:text-base">
              Information Literacy
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm">
              Teaching effective use of resources and critical evaluation skills
            </p>
          </div>
          <div className="bg-[#f8f8f8] p-3 sm:p-4 md:p-5 rounded-lg border border-teal-700/10">
            <h3 className="font-bold text-teal-700 mb-2 text-sm sm:text-base">Research Support</h3>
            <p className="text-gray-700 text-xs sm:text-sm">
              Offering specialized research assistance to scholars
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export function TheSpace() {
  return (
    <div className="bg-white overflow-hidden">
      <div className="">
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
          Spanning three floors in the iconic central building, our library
          features multiple reading rooms with comfortable seating designed to
          encourage study and scholarly discussion, including a 24/7 reading
          room for campus residents.
        </p>
      </div>
    </div>
  );
}

export function Collections() {
  // Array of resources with their names and URLs
  const resources = [
    {
      name: "Shodhshuddhi",
      url: "https://shodhshuddhi.inflibnet.ac.in/",
    },
    {
      name: "Shodh Ganga",
      url: "https://shodhganga.inflibnet.ac.in/",
    },
    {
      name: "Shodh Sindhu",
      url: "https://ess.inflibnet.ac.in/",
    },
    {
      name: "Shodhgangotri",
      url: "https://shodhgangotri.inflibnet.ac.in/",
    },
    {
      name: "Knimbus",
      url: "https://aknu.knimbus.com/portal/v2/default/home",
    },
    {
      name: "Epg Pathshala",
      url: "https://epgp.inflibnet.ac.in/",
    },
    {
      name: "Swayam",
      url: "https://swayam.gov.in/",
    },
    {
      name: "NPTEL",
      url: "https://nptel.ac.in/",
    },

    {
      name: "2022-23",
      url: "https://drive.google.com/drive/folders/131xSCgZDV_rhMKIl5sJaQ-PIQCKVINyS",
    },
    {
      name: "2021",
      url: "https://drive.google.com/drive/folders/1SzbEkH7pNSZDZ0R7xa3t8AzeJED3DpPA",
    },
    {
      name: "2018-19",
      url: "https://drive.google.com/drive/folders/1Y6NgJlFslmgd6KHBbc1zSrOOVwLok8bQ",
    },
    {
      name: "2017-18",
      url: "https://drive.google.com/drive/folders/13KRdXemX5Bq5pMt6TiApm_gZEVB-zPa_",
    },
    {
      name: "2016-17",
      url: "https://drive.google.com/drive/folders/1xmdt_qqB9gxKhzOl1H6xfm8g7sXLPOm-",
    },
    {
      name: "2015",
      url: "https://drive.google.com/drive/folders/1LTy3cUkxr-ZzGFwUbdJ_hwhSNj1n7ivC",
    },
  ];

  return (
    <div className="overflow-hidden">
      <div className="mb-6 sm:mb-7 md:mb-8">
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
          Spanning three floors in the iconic central building, our library
          features multiple reading rooms with comfortable seating designed to
          encourage study and scholarly discussion, including a 24/7 reading
          room for campus residents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 sm:p-5 md:p-6 border border-gray-200 rounded-lg hover:border-teal-700 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-b from-white to-gray-50"
          >
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 group-hover:text-teal-700 transition-colors duration-300">
              {resource.name}
            </h3>
            <p className="mt-2 text-gray-600 text-xs sm:text-sm">
              Click to visit {resource.name}
            </p>
            <div className="mt-3 sm:mt-4 flex justify-end">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-teal-700 transition-colors duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
