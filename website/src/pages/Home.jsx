import React from "react";
import Carousel from "../components/home/Carousel";
import Card from "../components/Card";
import Section_LatestNews from "@/sections/page_home/Section_LatestNews";
import Section_Tabs from "@/sections/page_home/Section_Information";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function Home() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash === "#important-links") {
      const el = document.getElementById("important-links");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);
  const images = [
    "https://aknu.edu.in/images/Prof.%20S.%20Prasanna%20Sree.jpeg",
    "https://aknu.edu.in/images/slider/university%20gate.jpeg",
    "https://aknu.edu.in/images/slider/university%20gate.jpeg",
  ];

  const cards = [
    { title: "Programs", description: "Explore our diverse programs." },
    { title: "Faculty", description: "Meet our experienced faculty." },
    { title: "Campus", description: "Discover our beautiful campus." },
  ];

  return (
    <div className="home-container ">
      <Carousel images={images} />
      <Section_LatestNews />
      <Section_Tabs />

      <div className="cards-container">
        {cards.map((card, index) => (
          <Card key={index} title={card.title} description={card.description} />
        ))}
      </div>
    </div>
  );
}

export default Home;
