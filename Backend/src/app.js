import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Terhal API"
  });
});

export default app;