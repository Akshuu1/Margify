const jwt = require("jsonwebtoken");
const User = require("../models/User");

const secure = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json("No authorization header provided")
    }
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    next()
  } catch (err) {
    return res.status(401).json("Invalid token")
  }
}

module.exports = { secure }
