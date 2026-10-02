import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import attractionRoutes from "./routes/attraction.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import hotelRoutes from "./routes/hotel.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/attractions", attractionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Terhal API"
  });
});

export default app;