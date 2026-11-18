const jwt = require("jsonwebtoken");
const User = require("../models/User");

const facultyAuthenticationMiddleware = async (req, res, next) => {
  try {
    // If user is already authenticated, skip
    if (req.user) {
      return next();
    }

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Invalid token format. Expected 'Bearer <token>'" });
    }

    const token = authHeader.split(" ")[1];

    // Check if token exists and is not empty
    if (!token || token === "undefined" || token === "null") {
      return res
        .status(401)
        .json({ message: "Access denied. Token is missing." });
    }

    console.log("TOKEN:", token.substring(0, 20) + "..."); // Log first 20 chars only

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded, "DECODED");

    const user = await User.findById(decoded.id).select("-pin"); // Don't select password/pin

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token.",
        error: error.message,
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired.",
        error: error.message,
      });
    }

    return res.status(401).json({
      message: "Authentication failed.",
      error: error.message,
    });
  }
};

module.exports = facultyAuthenticationMiddleware;
