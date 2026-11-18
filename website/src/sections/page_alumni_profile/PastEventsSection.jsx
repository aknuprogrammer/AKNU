import React from "react";
import { ExternalLink, Calendar } from "lucide-react";

// Sample past events data - this can be replaced with API data later
const pastEvents = [
  {
    id: 1,
    date: "15",
    month: "Mar",
    year: "2024",
    name: "Centenary Inauguration Ceremony",
    description: "A grand celebration marking 100 years of academic excellence with dignitaries, alumni, and students coming together to commemorate this historic milestone.",
    link: "https://example.com/event/centenary-inauguration",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: 2,
    date: "22",
    month: "Feb",
    year: "2024",
    name: "Alumni Networking Summit",
    description: "An exclusive networking event bringing together alumni from various batches to share experiences, forge new connections, and explore collaborative opportunities.",
    link: "https://example.com/event/networking-summit",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80",
  },
  {
    id: 3,
    date: "10",
    month: "Jan",
    year: "2024",
    name: "Academic Excellence Awards",
    description: "Celebrating outstanding achievements of alumni in their respective fields, recognizing contributions to academia, industry, and society.",
    link: "https://example.com/event/awards-ceremony",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 4,
    date: "05",
    month: "Dec",
    year: "2023",
    name: "Alumni Homecoming Reunion",
    description: "A nostalgic reunion event where alumni reconnected with classmates, visited campus landmarks, and shared memories of their time at AKNU.",
    link: "https://example.com/event/homecoming-reunion",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1484&q=80",
  },
];

export default function PastEventsSection() {
  return (
    <section className="py-12 bg-white" id="past-events">
      <div className="mx-auto px-4 sm:px-16 max-w-7xl">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-800 sm:text-3xl">
            Past Events
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-[16px]">
            Relive the memorable moments from our recent alumni events and celebrations
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-8">
          {pastEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Part 1: Date and Month */}
                <div className="bg-gradient-to-br from-[#00786F] to-teal-600 text-white flex flex-col items-center justify-center px-6 py-8 md:py-12 md:min-w-[120px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">{event.month} {event.year}</span>
                  </div>
                  <div className="text-5xl font-bold leading-none">{event.date}</div>
                  {/* <div className="text-sm mt-1 opacity-90">Date</div> */}
                </div>

                {/* Part 2: Event Name, Description, and Link */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-teal-800 mb-3 group-hover:text-[#00786F] transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 text-[16px] leading-relaxed mb-4 text-justify">
                      {event.description}
                    </p>
                  </div>
                  {/* <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#00786F] font-semibold hover:text-teal-600 transition-colors text-sm"
                  >
                    <span>View Event Details</span>
                    <ExternalLink className="w-4 h-4" />
                  </a> */}
                </div>

                {/* Part 3: Event Image */}
                <div className="md:w-80 lg:w-96 h-64 md:h-auto relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

