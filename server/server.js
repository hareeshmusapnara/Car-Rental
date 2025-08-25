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

// Connect Database
const initializeApp = async () => {
  try {
    await connectDB()
    console.log("Database connected successfully")
  } catch (error) {
    console.error("Database connection failed:", error)
  }
}

// Initialize database connection
initializeApp()

//Middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=> res.send("Server is running"))
app.use('/api/user/', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)

const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))
}

// Export for Vercel
export default app;