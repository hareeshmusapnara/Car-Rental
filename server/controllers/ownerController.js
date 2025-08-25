import imagekit from "../config/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";


// API to Change Role to User
export const changeRoleToOwner = async (req, res) => {
  try {
         const {_id} = req.user;
         console.log("Changing role to owner for user:", _id.toString());
         const updatedUser = await User.findByIdAndUpdate(_id, {role: "owner"}, {new: true});
         console.log("User role updated:", {
             userId: updatedUser._id.toString(),
             newRole: updatedUser.role
         });
         res.json({ success: true, message: "Now you can list your cars"});
  } catch (error) {
      console.log("Error changing role to owner:", error.message);
      res.json({ success: false, message: error.message});
  }
}
// API to List Car

export const addCar = async (req, res) => {
   try {
      const {_id} = req.user;
      let car = JSON.parse(req.body.carData);
      const imageFile = req.file;

      // Validate image file
      if (!imageFile) {
        return res.json({ success: false, message: "Car image is required" });
      }

      // upload image to imagekit
      const fileBuffer = fs.readFileSync(imageFile.path)
  const response =    await imagekit.upload({
        file: fileBuffer,
        fileName: imageFile.originalname,
        folder: "/cars"
      })
    
      // optimization through imagekit URL transformation
var optimizedImageUrl = imagekit.url({
    path : response.filePath,
    transformation : [
        {width : "1280"},// width resizing
        {quality: "auto"}, // auto compression
        {format: "webp"}  // conver to modern format
    ]
});

const image = optimizedImageUrl;
await Car .create({
    ...car,
    image,
    owner: _id
})
res.json({success: true, message: "Car added successfully"});
      

   } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message});
   }
}

// API to Get Owner Cars
export const getOwnerCars = async (req, res) => {
    try {
        const {_id} = req.user;
        const cars = await Car.find({owner:_id});
        res.json({success: true, cars});
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message});
    }
}

// API to TOGGLE CAR AVAILABILITY
export const toggleCarAvailability = async (req, res) => {
    try {
        const {_id} = req.user; 
        const {carId} = req.body;
        const car = await Car.findById(carId);
       
        // checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({success: false, message: "Unauthorized"});
        }
        car.isAvailable = !car.isAvailable;
        await car.save();
        res.json({success: true, message: "Car availability toggled"});
        
    } catch (error) {
        console.log(error.message); 
        res.json({ success: false, message: error.message});
    }
   }

   // API to Delete Car
   export const deleteCar = async (req, res) => {
    try {
        const {_id} = req.user;
        const {carId} = req.body;
        const car = await Car.findById(carId);

        // Check if car exists
        if (!car) {
            return res.json({success: false, message: "Car not found"});
        }

        // checking if car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({success: false, message: "Unauthorized"});
        }

        // Actually delete the car from database
        await Car.findByIdAndDelete(carId);
        res.json({success: true, message: "Car deleted successfully"});

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message});
    }
   }

   // API to Get Dashboard Data
    export const getDashboardData = async (req, res) => {
    try {
        const {_id , role} = req.user;
        console.log("Dashboard - User details:", {
            userId: _id.toString(),
            userRole: role
        });

        if(role !== "owner"){
            console.log("Dashboard - User is not an owner, role:", role);
            return res.json({success: false, message: "Unauthorized - User must be an owner"});
        }
        // Check all cars in database first
        const allCars = await Car.find({});
        console.log("Dashboard - Total cars in database:", allCars.length);
        console.log("Dashboard - All cars:", allCars.map(c => ({
            id: c._id,
            brand: c.brand,
            model: c.model,
            owner: c.owner.toString()
        })));

        const cars = await Car.find({owner:_id});
        console.log("Dashboard - Owner ID:", _id.toString());
        console.log("Dashboard - Found cars for this owner:", cars.length);
        console.log("Dashboard - Owner's cars details:", cars.map(c => ({
            id: c._id,
            brand: c.brand,
            model: c.model,
            owner: c.owner.toString()
        })));

        const bookings = await Booking.find({owner:_id}).populate("car").sort({createdAt: -1})
        console.log("Dashboard - Found bookings:", bookings.length);
        console.log("Dashboard - Bookings details:", bookings.map(b => ({
            id: b._id,
            carBrand: b.car?.brand,
            carModel: b.car?.model,
            status: b.status,
            price: b.price
        })));;

        const pendingBookings = await Booking.find({owner:_id, status: "pending"})
        const completedBookings = await Booking.find({owner:_id, status: "confirmed"})
        
        // Calculate monthly revenue from bookings where status is confirmed
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyRevenue = bookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return booking.status === "confirmed" &&
                   bookingDate.getMonth() === currentMonth &&
                   bookingDate.getFullYear() === currentYear;
        }).reduce((acc, booking) => {
            return acc + booking.price;
        }, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 5),
            monthlyRevenue
        }

        console.log("Dashboard Data:", dashboardData);
        res.json({success: true, dashboardData});

    } catch (error) {
        console.log(error.message); 
        res.json({ success: false, message: error.message});
    }
   }

   // API to update user image
   export const updateUserImage = async (req, res) => { try {
       const {_id} = req.user; 
      const imageFile =req.file;

      // upload image to imagekit

      const fileBuffer = fs.readFileSync(imageFile.path)
  const response =    await imagekit.upload({
        file: fileBuffer,
        fileName: imageFile.originalname,
        folder: "/users"
      })
    
      // optimization through imagekit URL transformation
var optimizedImageUrl = imagekit.url({
    path : response.filePath,
    transformation : [
        {width : "400"},// width resizing
        {quality: "auto"}, // auto compression
        {format: "webp"}  // conver to modern format
    ]
});

const image = optimizedImageUrl;

 await User.findByIdAndUpdate(_id, {image});
 res.json({success: true, message: "Image updated"});


   } catch (error) {
     console.log(error.message); 
     res.json({ success: false, message: error.message});
   }
}