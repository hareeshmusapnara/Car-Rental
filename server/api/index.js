import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "../config/db.js";
import userRouter from "../routes/userRoutes.js";
import ownerRouter from "../routes/ownerRoutes.js";
import bookingRouter from "../routes/bookingRoutes.js";

// Import models to ensure they are registered
import "../models/User.js";
import "../models/Car.js";
import "../models/Booking.js";

// Initialize Express App
const app = express()

// Connect Database
let isConnected = false;

const initializeApp = async () => {
  if (!isConnected) {
    try {
      await connectDB()
      isConnected = true;
      console.log("Database connected successfully")
    } catch (error) {
      console.error("Database connection failed:", error)
    }
  }
}

// Initialize database connection before handling requests
app.use(async (req, res, next) => {
  await initializeApp();
  next();
});

//Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => res.json({ message: "Car Rental API is running", status: "success" }))
app.use('/api/user/', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export for Vercel
export default app;
