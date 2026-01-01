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
};

// app.use(cors(corsOptions));
// app.options(/.*/, cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


// app.use(cors())


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
