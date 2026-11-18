import AlumniNavbar from "./AlumniNavbar";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

const MainNavBar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isAlumni = pathname === "/alumni" || pathname.startsWith("/alumni/");
  return <div>{isAlumni ? <AlumniNavbar /> : <Navbar />}</div>;
};
export default MainNavBar;
