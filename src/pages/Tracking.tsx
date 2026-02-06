import React from 'react';
import { MapPin, Navigation, ArrowLeft, Clock, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingStatus } from '../types';

export default function Tracking() {
  const { cars, bookings, drivers } = useApp();
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  // Find the booking
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-500 mb-4">The booking you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  // Find associated car and driver
  const car = cars.find(c => c.id === booking.carId);
  const driver = drivers.find(d => d.id === booking.driverId);

  if (!car) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Car Not Found</h2>
          <p className="text-gray-500 mb-4">The vehicle for this booking is not available.</p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  // Mock current location (in real app, this would come from GPS API)
  const currentLocation = car.location.name || "Current Location";
  const destination = booking.location || "Destination";

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/bookings')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live GPS Tracking</h1>
          <p className="text-gray-500">Real-time location of your rented vehicle.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-blue-50">
           {/* Grid lines to look like a map */}
           <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

           {/* Mock Streets */}
           <div className="absolute top-1/4 left-0 w-full h-4 bg-white border-y border-gray-200 transform -rotate-2"></div>
           <div className="absolute top-0 right-1/3 w-4 h-full bg-white border-x border-gray-200 transform rotate-12"></div>

           {/* Current Car Marker */}
           <div className="absolute top-1/4 right-1/3 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="relative">
                 <div className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-lg animate-ping absolute opacity-75"></div>
                 <div className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-lg relative z-20"></div>
                 <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap z-20">
                   Your Vehicle
                 </div>
              </div>
           </div>

           {/* Destination Marker */}
           <div className="absolute bottom-1/4 left-1/4 z-10">
               <MapPin size={32} className="text-red-500 drop-shadow-md" />
           </div>
        </div>

        {/* Overlay Info Card */}
        <div className="absolute top-4 left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-72 z-20">
           <div className="flex items-start space-x-3 mb-4">
              <img src={car.image} alt="Car" className="w-16 h-10 object-cover rounded" />
              <div>
                 <h4 className="font-bold text-gray-900">{car.brand} {car.model}</h4>
                 <p className="text-xs text-gray-500">Booking ID: {booking.id.slice(-8)}</p>
              </div>
           </div>

           <div className="space-y-3 relative">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
              <div className="flex items-center text-sm relative z-10">
                 <div className="w-3 h-3 rounded-full bg-indigo-600 border border-white mr-3"></div>
                 <div>
                   <p className="text-gray-500 text-xs">Current Location</p>
                   <p className="font-medium">{currentLocation}</p>
                 </div>
              </div>
              <div className="flex items-center text-sm relative z-10">
                 <div className="w-3 h-3 rounded-full bg-red-500 border border-white mr-3"></div>
                 <div>
                   <p className="text-gray-500 text-xs">Destination</p>
                   <p className="font-medium">{destination}</p>
                 </div>
              </div>
           </div>

           {/* Driver Info */}
           {driver && (
             <div className="mt-4 pt-4 border-t border-gray-100">
               <div className="flex items-center space-x-3">
                 <img src={driver.avatar} alt={driver.name} className="w-8 h-8 rounded-full" />
                 <div>
                   <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                   <p className="text-xs text-gray-500 flex items-center">
                     <User size={10} className="mr-1" /> Driver
                   </p>
                 </div>
               </div>
             </div>
           )}

           <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <div>
                 <p className="text-gray-500 text-xs">Status</p>
                 <p className={`font-bold ${booking.status === BookingStatus.CONFIRMED ? 'text-green-600' : 'text-blue-600'}`}>
                   {booking.status}
                 </p>
              </div>
              <div>
                 <p className="text-gray-500 text-xs">Trip Time</p>
                 <p className="font-bold text-gray-900 flex items-center">
                   <Clock size={12} className="mr-1" />
                   {new Date(booking.startDate).toLocaleTimeString()}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}