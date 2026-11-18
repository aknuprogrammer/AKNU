import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import HashModal from "../components/HashModal";
import AlumniEventForm from "../forms/AlumniEventForm";
import AlumniProfileSection from "../sections/page_alumni_profile/AlumniProfileSection";
import AlumniTable from "../sections/page_alumni_profile/AlumniTable";
import DonationsTable from "../sections/page_alumni_profile/DonationsTable";
import { useNavigate } from "react-router-dom";

export default function AlumniProfilePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Read the token from cookie
        const token = Cookies.get("alumni_token");
        if (!token) {
            navigate("/alumni");
        } else {
            setIsLoggedIn(!!token);
        }
    }, [navigate]);

    const handleLogout = () => {
        // Clear token cookie
        Cookies.remove("alumni_token");
        // Navigate to alumni page
        navigate("/alumni");
    };

    return (
        <main>
            {isLoggedIn ? <>
                <AlumniProfileSection />
                <div className="max-w-6xl mx-auto px-4 flex gap-2">
                    <a href="#alumni/add-event" className="mt-8 px-6 py-3 bg-teal-700 hover:bg-teal-700 text-white font-semibold  transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Add Event
                    </a>
                    <button className="mt-8 px-6 py-3 bg-teal-700 hover:bg-teal-700 text-white font-semibold  transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
                <AlumniTable />
                <DonationsTable />
                <HashModal hash="#alumni/add-event">
                    <AlumniEventForm />
                </HashModal>
            </> : null}
        </main>
    );
}