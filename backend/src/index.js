const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const { connectDB } = require("./config/db")
dotenv.config()
connectDB()
const app = express()
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/routes", require("./routes/routePlannerRoutes"))
app.use("/api/map", require("./routes/mapRoutes"))
app.use("/api/saved-routes", require("./routes/savedRoutesRoutes"))
app.get("/", (req, res) => res.send("Server Working"))
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log("Server Started on", PORT))
