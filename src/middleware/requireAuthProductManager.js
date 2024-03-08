const jwt = require("jsonwebtoken");

// Middleware untuk verifikasi token JWT
const authenticateTokenProductManager = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    console.log("TEST", req.user);
    if (req.user.role !== "product manager" && req.user.role !== "owner") {
      return res.status(403).json({ message: "Not allowed" });
    }
    next();
  });
};

module.exports = { authenticateTokenProductManager };
