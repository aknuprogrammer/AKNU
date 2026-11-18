import React from "react";
import { CheckCircle } from "lucide-react";

const participationOptions = [
  {
    title: "Attend Events",
    image:
      "https://static.vecteezy.com/system/resources/previews/024/277/366/non_2x/business-networking-event-illustration-showcasing-a-business-networking-event-within-an-academic-setting-with-professionals-students-and-alumni-connecting-sharing-ideas-and-building-professional-vector.jpg", // replace with actual image
    description:
      "Participate in our centenary celebration events both on campus and virtually. From academic conferences to cultural showcases, there's something for everyone.",
    points: [
      "Main inauguration ceremony",
      "Alumni gatherings by batch",
      "Academic symposiums",
    ],
  },
  {
    title: "Share Your Story",
    image:
      "https://st4.depositphotos.com/36736796/38709/v/450/depositphotos_387095952-stock-illustration-share-your-story-banner.jpg", // replace with actual image
    description:
      "Your Adikavi Nannaya University journey is part of our collective history. Share your memories, achievements, and how the university shaped your life and career.",
    points: ["Written testimonials", "Video submissions", "Historical photographs"],
  },
  {
    title: "Contribute",
    image:
      "https://media.istockphoto.com/id/507917029/vector/vector-concept-of-creative-teamwork.jpg?s=612x612&w=0&k=20&c=VTO2WCDm9rbpjkyOxMXdAEe-M9kJDt1WUJOI8ucg4T0=", // replace with actual image
    description:
      "Support the university's centenary initiatives through various contribution options. Your support helps create a memorable centenary celebration and lasting legacy.",
    points: [
      "Centenary scholarship fund",
      "Infrastructure development",
      "Commemorative projects",
    ],
  },
];

export default function ParticipationSection() {
  return (
    <section className="py-10 bg-gray-50" id="participation">
      <div className="mx-auto px-4 sm:px-16">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-800 sm:text-3xl">
            Your Participation Matters
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-[16px] ">
            Join the celebration of Adikavi Nannaya University's centenary through numerous
            ways to participate, contribute, and reconnect with your alma mater.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {participationOptions.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image */}
              <div className="relative h-48 w-full">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2 px-6">
                  <h3 className="text-lg font-semibold text-white mt-5">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-justify">{item.description}</p>
                <ul className="mt-4 space-y-2">
                  {item.points.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start text-gray-700 text-sm"
                    >
                      <CheckCircle className="h-5 w-5 text-teal-700 mr-2 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
