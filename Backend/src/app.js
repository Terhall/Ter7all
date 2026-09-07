require("dotenv").config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
const app = express();
const userRoutes = require("./routes/user.routes");

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Terhal API"
  });
});

export default app;