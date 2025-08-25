import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// Import models to ensure they are registered
import "./models/User.js";
import "./models/Car.js";
import "./models/Booking.js";

// Async function to start the server
const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Initialize Express App
    const app = express();

    //Middleware
    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => res.send("Server is running"));
    app.use('/api/user/', userRouter);
    app.use('/api/owner', ownerRouter);
    app.use('/api/bookings', bookingRouter);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();