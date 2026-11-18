import React, { useState } from "react";

const categories = [
    "All",
    "Academics & Literature",
    "Arts & Entertainment",
    "Entrepreneurs & Leaders",
    "National Leaders",
    "Science & Technology",
    "Sports",
];

const alumniData = [
    {
        name: "Bharat Ratna C.V. Raman",
        category: "Science & Technology",
        title: "Physics, 1928 Nobel Prize",
        description:
            "Renowned physicist who discovered the Raman effect, bringing international recognition to the university and Indian science.",
        badge: "Nobel Laureate",
        image: "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202111/raman_647_110716100405_1200x768.jpeg?size=1200:675", // replace with real img
    },
    {
        name: "Prof. C.R. Rao",
        category: "Academics & Literature",
        title: "Mathematics & Statistics",
        description:
            "Distinguished mathematician and statistician whose contributions have shaped modern statistical theory and methodology.",
        badge: "Padma Vibhushan",
        image: "https://www.hindustantimes.com/ht-img/img/2023/04/12/550x309/CR_Rao_1681284724609_1681284749487_1681284749487.png",
    },
    {
        name: "Shri M. Venkaiah Naidu",
        category: "National Leaders",
        title: "Politics & Governance",
        description:
            "Former Vice-President of India whose political career spans decades of public service and leadership roles.",
        badge: "Former Vice-President",
        image: "https://akm-img-a-in.tosshub.com/indiatoday/images/story/201909/Vice_President_0.jpeg?size=690:388",
    },
    {
        name: "Dr. Duvvuri Subba Rao",
        category: "Economics & Finance",
        title: "Former RBI Governor",
        description:
            "Former Governor of the Reserve Bank of India who guided India's economic policies during challenging times.",
        badge: "Former RBI Governor",
        image: "https://images.cnbctv18.com/wp-content/uploads/2018/09/D-Subbarao1.jpeg",
    },
    {
        name: "Shri G.M. Rao",
        category: "Entrepreneurs & Leaders",
        title: "Founder Chairman, GMR Group",
        description:
            "Visionary entrepreneur who built GMR Group into a global infrastructure developer and guest of honor for the centenary.",
        badge: "Business Leader",
        image: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/201301/gmrao505_122912033725.jpg",
    },

];

export default function CelebrateAlumni() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredAlumni =
        activeCategory === "All"
            ? alumniData
            : alumniData.filter((a) => a.category === activeCategory);

    return (
        <section className="py-10 px-4 sm:px-16">
            <div className="mx-auto">
                {/* Section Heading */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-teal-900 sm:text-4xl font-serif">
                        Celebrate Your Alumni
                    </h2>
                    <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
                        Celebrating the distinguished graduates who have made significant
                        contributions in various fields and brought honor to Andhra University.
                    </p>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {categories.map((cat, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat
                                    ? "bg-teal-600 text-white shadow-md"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Alumni Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {filteredAlumni.map((alumni, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl duration-300 transition"
                        >
                            {/* Image */}
                            <div className="relative h-64 w-full">
                                <img
                                    src={alumni.image}
                                    alt={alumni.name}
                                    className="h-full w-full object-cover"
                                />
                                <span className="absolute bottom-3 left-3 bg-teal-600 text-xs font-semibold px-3 py-1 rounded-full text-white">
                                    {alumni.badge}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900">{alumni.name}</h3>
                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                    {alumni.title}
                                </p>
                                <p className="text-gray-600 text-sm mt-2">{alumni.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
