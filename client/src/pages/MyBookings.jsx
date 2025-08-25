import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const MyBookings = () => {
  const { axios, user, currency } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const fetchMyBookings = async () => {
    try {
      console.log("Fetching my bookings...");
      const { data } = await axios.get("/api/bookings/user");
      console.log("MyBookings response:", data);
      if (data.success) {
        setBookings(data.bookings);
        console.log("MyBookings set:", data.bookings);
      } else {
        console.error("MyBookings error:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("MyBookings fetch error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    user && fetchMyBookings();
  }, [user]);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl-px-32 2xl:px-48 mt-16 text-sm max-w-7xl">
      <Title
        title="My Bookings"
        subTitle="View and Manage your all car bookings"
        align="left"
      />

      <div>
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12"
            >
              {/* Car Image + Info */}
              <div className="md:col-span-1">
                <div className="rounded-md overflow-hidden mb-3">
                  <img
                    src={booking.car?.image || "/placeholder-car.jpg"}
                    alt=""
                    className="w-full h-auto aspect-video object-cover"
                  />
                </div>
                <p className="text-lg font-medium mt-2">
                  {booking.car?.brand || "Unknown"}{" "}
                  {booking.car?.model || "Car"}
                </p>
                <p className="text-gray-500">
                  {booking.car?.year || "N/A"} .{" "}
                  {booking.car?.category || "N/A"} .{" "}
                  {booking.car?.location || "N/A"}
                </p>
              </div>

              {/* Booking info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <p className="px-3 py-1.5 bg-light rounded">
                    Booking # {index + 1}
                  </p>
                  <p
                    className={`px-3 py-1 text-xs rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-green-400/15 text-green-600"
                        : "bg-red-400/15 text-red-600"
                    }`}
                  >
                    {booking.status}
                  </p>
                </div>

                <div className="flex items-start gap-2 mt-3 ">
                  <img
                    src={assets.calendar_icon_colored}
                    alt=""
                    className="w-4 h-4 mt-1"
                  />

                  <div>
                    <p className="text-gray-500">Rental Period </p>
                    <p>
                      {new Date(booking.pickupDate).toLocaleDateString()} TO{" "}
                      {new Date(booking.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-3 ">
                  <img
                    src={assets.location_icon_colored}
                    alt=""
                    className="w-4 h-4 mt-1"
                  />

                  <div>
                    <p className="text-gray-500">Pickup Location </p>
                    <p>{booking.car?.location || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="md:col-span-1 flex flex-col justify-between gap-6">
                <div className="text-sm text-gray-500 text-right">
                  <p>Total Price </p>
                  <h1 className="text-2xl font-semibold text-primary">
                    {currency}
                    {booking.price}
                  </h1>
                  <p>
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 text-sm mt-2">
              Your car bookings will appear here once you make a reservation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
