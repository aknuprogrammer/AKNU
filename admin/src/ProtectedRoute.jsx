// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ FIXED

export const isTokenExpired = (token) => {
  if (!token) return true;
  if (token === "undefined" || token === "null") return true;
  
  try {
    const decoded = jwtDecode(token);
    // Check if token has expiration (exp claim)
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const isExpired = decoded.exp < currentTime;
      
      if (isExpired) {
        console.warn(`[AUTH] Token expired. Exp: ${new Date(decoded.exp * 1000).toLocaleString()}, Now: ${new Date().toLocaleString()}`);
      }
      return isExpired;
    }
    return false; // If no exp claim, assume token is valid
  } catch (error) {
    console.error(`[AUTH] Token decoding failed:`, error.message, "Token snippet:", token.substring(0, 15) + "...");
    return true; // If we can't decode, consider it expired to be safe
  }
};

export const getRoleFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  // Check if token is expired
  if (isTokenExpired(token)) {
    console.warn("[AUTH] Session invalidated: Token is expired or malformed. Clearing localStorage.");
    // Clear expired token
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("isAuthenticated");
    return null;
  }

  try {
    const decoded = jwtDecode(token); // ✅ FIXED
    return decoded.role;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export const getNameFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.email || null;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded || null;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

const ProtectedRoute = ({ isAuthenticated, allowedRoles, children }) => {
  const userRole = getRoleFromToken();
  if (!isAuthenticated) {
    return <Navigate to="/login-page" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
