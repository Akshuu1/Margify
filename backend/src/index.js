const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://margify.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));


app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/routes", require("./routes/routePlannerRoutes"));

app.get("/", (req, res) => {
  res.send("Server Working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server Started on", PORT);
});
