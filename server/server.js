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


// Initialize Express App
const app = express()

// Database connection state
let isConnected = false;

// Connect Database function
const connectDatabase = async () => {
  if (!isConnected) {
    try {
      await connectDB()
      isConnected = true;
      console.log("Database connected successfully")
    } catch (error) {
      console.error("Database connection failed:", error)
      throw error;
    }
  }
}

//Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// Routes
app.get('/', (req, res) => res.json({ message: "Car Rental API is running", status: "success" }))
app.get('/test', (req, res) => res.json({ message: "Test endpoint working", timestamp: new Date().toISOString() }))
app.use('/api/user/', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))
}

// Export for Vercel
export default app;