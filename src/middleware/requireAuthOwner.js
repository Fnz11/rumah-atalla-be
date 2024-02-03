const jwt = require("jsonwebtoken");

// Middleware untuk verifikasi token JWT
const authenticateTokenOwner = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Anda bukan owner" });
    }
    next();
  });
};

module.exports = { authenticateTokenOwner };
