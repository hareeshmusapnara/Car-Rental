import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";

// Function to check availability of car for a given Date 
export const checkAvailability = async (car, pickupDate, returnDate) => {

  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate }
    
})

    return bookings.length === 0;
}

// API to check Availability of car for a given Date and location 
export const checkAvailabilityofCar = async (req, res) => { 
    try {
        const {location, pickupDate, returnDate} = req.body;  
        //  fetch all available cars at a given location
         const cars = await Car.find({location, isAvailable: true});

    // check car availability for the given date range using promise
     const availableCarsPromises = cars.map(async(car)=>{
        const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
        return{...car._doc, isAvailable: isAvailable};
     }) 

     let availableCars = await Promise.all(availableCarsPromises);
     availableCars = availableCars.filter((car)=>car.isAvailable === true);
     res.json({success: true, availableCars});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// API to Create Booking
export const createBooking = async (req, res) => { 
 try {   
    const{_id} = req.user;
    const {car, pickupDate, returnDate} = req.body;
    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if(!isAvailable){
        return res.json({success: false, message: "Car is not available"});
    }

    const carData = await Car.findById(car);
    // calculate price based on pickup and return date
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil(Math.abs(returned - picked) / (1000 * 60 * 60 * 24));
    const price = noOfDays * carData.pricePerDay;

    await Booking.create({
        car,
        user: _id,
        owner: carData.owner,
        pickupDate,
        returnDate,
        price
    })
    res.json({success: true, message: "Booking Created"});
  
 } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message});
  
 }         

}

// API to List User BOokings
export const getUserBookings = async (req, res) => {
  try {
      const{_id} = req.user;
      const bookings = await Booking.find({user:_id}).populate("car").sort({createdAt: -1})
      res.json({success: true, bookings});
  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message});

  }
}
//  API to get Owner Bookings

export const getOwnerBookings = async (req, res) => { 
  try {
      if(req.user.role !== "owner"){
        return res.json({success: false, message: "Unauthorized"});
      }
      const bookings = await Booking.find({owner:req.user._id})
        .populate("car")
        .populate("user", "-password")
        .sort({createdAt: -1})
      res.json({success: true, bookings});
  } catch (error) { 
    console.log(error.message);
    res.json({success: false, message: error.message});
    
  }
}
// API to change booking status
export const changeBookingStatus = async (req, res) => { 
  try {
       const{_id} = req.user;
       const {bookingId , status} = req.body;
       const booking = await Booking.findById(bookingId);
       if(booking.owner.toString() !== _id.toString()){
        return res.json({success: false, message: "Unauthorized"});
       }
       booking.status = status;
       await booking.save();
       res.json({success: true, message: "Booking Status Changed"});
  } catch (error) { 
    console.log(error.message);
    res.json({success: false, message: error.message});
    
  }
}