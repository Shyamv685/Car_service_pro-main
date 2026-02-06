
import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Star, CheckCircle, Car, Wrench, Clock, MapPin, 
  Calendar, ChevronRight, TrendingUp, AlertCircle, Shield, ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BookingStatus } from '../types';

export default function UserDashboard() {
  const { bookings, cars, drivers, currentUser, rateBooking } = useApp();
  const navigate = useNavigate();

  // 1. Get User Stats
  const userBookings = bookings.filter(b => b.userId === currentUser.id);
  const totalTrips = userBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
  const totalSpend = userBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  
  // 2. Find Active Booking (Confirmed or In Progress)
  const activeBooking = userBookings.find(b => 
    (b.status === BookingStatus.CONFIRMED || b.status === 'In Progress') && b.type === 'RENTAL'
  );
  const activeCar = activeBooking ? cars.find(c => c.id === activeBooking.carId) : null;
  const activeDriver = activeBooking ? drivers.find(d => d.id === activeBooking.driverId) : null;

  // 3. Find Pending Reviews
  const unratedBooking = userBookings.find(b => b.status === BookingStatus.COMPLETED && !b.rating);
  const unratedCar = unratedBooking ? cars.find(c => c.id === unratedBooking.carId) : null;

  // 4. State for inline rating
  const [rating, setRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');

  const handleRateSubmit = () => {
    if (unratedBooking && rating > 0) {
      rateBooking(unratedBooking.id, rating, feedback);
      setRating(0);
      setFeedback('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* Header & Stats Row */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-1">Here is what's happening with your account today.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-indigo-600 font-medium bg-indigo-50 px-4 py-2 rounded-lg">
           <Shield size={16} />
           <span>Premium Member</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
              <Car size={24} />
           </div>
           <div>
              <p className="text-sm text-gray-500 font-medium">Total Trips</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalTrips}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-sm text-gray-500 font-medium">Total Spend</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{totalSpend.toLocaleString()}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
           <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mr-4">
              <Star size={24} />
           </div>
           <div>
              <p className="text-sm text-gray-500 font-medium">Loyalty Points</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalTrips * 150} pts</h3>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Column */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Active Trip Card */}
            {activeBooking && activeCar ? (
              <div className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                             <Clock size={12} className="mr-1" /> Active Trip
                          </span>
                          <h2 className="text-xl font-bold text-gray-900">{activeCar.brand} {activeCar.model}</h2>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                             <MapPin size={14} className="mr-1" /> {activeBooking.location || 'San Francisco, CA'}
                          </p>
                       </div>
                       <button 
                         onClick={() => navigate('/tracking')}
                         className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                       >
                         Track Vehicle
                       </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mt-6">
                       <img 
                          src={activeCar.image} 
                          alt="Car" 
                          className="w-full md:w-48 h-32 object-cover rounded-xl bg-gray-100" 
                       />
                       <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase font-bold">Start</p>
                                <p className="text-sm font-medium text-gray-900">{new Date(activeBooking.startDate).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">{new Date(activeBooking.startDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                             </div>
                             <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase font-bold">End</p>
                                <p className="text-sm font-medium text-gray-900">{new Date(activeBooking.endDate || '').toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">{new Date(activeBooking.endDate || '').toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                             </div>
                          </div>
                          
                          {activeDriver && (
                             <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                                <img src={activeDriver.avatar} className="w-10 h-10 rounded-full mr-3" alt="" />
                                <div>
                                   <p className="text-sm font-bold text-gray-900">{activeDriver.name}</p>
                                   <div className="flex items-center text-xs text-gray-500">
                                      <Star size={10} className="text-yellow-400 fill-current mr-1" />
                                      {activeDriver.rating} • {activeDriver.phone}
                                   </div>
                                </div>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
               // Promotional Card if no active trip
               <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
                  <div className="relative z-10 max-w-lg">
                     <h2 className="text-2xl font-bold mb-2">Ready for your next adventure?</h2>
                     <p className="text-indigo-100 mb-6">Explore our premium fleet of SUVs and Sedans at 20% off this weekend.</p>
                     <button 
                        onClick={() => navigate('/rentals')}
                        className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-colors inline-flex items-center"
                     >
                        Rent a Car <ArrowRight size={18} className="ml-2" />
                     </button>
                  </div>
                  {/* Decorative Circle */}
                  <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white opacity-10 rounded-full"></div>
                  <div className="absolute right-20 -top-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
               </div>
            )}

            {/* Recent Activity List */}
            <div>
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  <Link to="/bookings" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</Link>
               </div>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {userBookings.slice(0, 3).length > 0 ? (
                     userBookings.slice(0, 3).map((booking, idx) => (
                        <div key={idx} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex items-center">
                           <div className={`p-2 rounded-lg mr-4 ${booking.type === 'RENTAL' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                              {booking.type === 'RENTAL' ? <Car size={20} /> : <Wrench size={20} />}
                           </div>
                           <div className="flex-1">
                              <p className="font-bold text-sm text-gray-900">
                                 {booking.type === 'RENTAL' ? 'Car Rental' : 'Car Service'}
                              </p>
                              <p className="text-xs text-gray-500">{new Date(booking.startDate).toLocaleDateString()}</p>
                           </div>
                           <div className="text-right">
                              <p className="font-bold text-sm text-gray-900">₹{booking.totalCost.toFixed(0)}</p>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                 booking.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                              }`}>
                                 {booking.status}
                              </span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="p-8 text-center text-gray-400 text-sm">No recent activity</div>
                  )}
               </div>
            </div>
         </div>

         {/* Sidebar Column */}
         <div className="space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
               <div className="space-y-3">
                  <button onClick={() => navigate('/rentals')} className="w-full flex items-center p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group text-left">
                     <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors"><Car size={20} /></div>
                     <span className="font-medium text-gray-700 group-hover:text-gray-900">Book Rental</span>
                  </button>
                  <button onClick={() => navigate('/services')} className="w-full flex items-center p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group text-left">
                     <div className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors"><Wrench size={20} /></div>
                     <span className="font-medium text-gray-700 group-hover:text-gray-900">Schedule Service</span>
                  </button>
               </div>
            </div>

            {/* Pending Reviews */}
            {unratedBooking && unratedCar && (
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                     <Star size={64} className="text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Rate your recent trip</h3>
                  <p className="text-sm text-gray-500 mb-4">How was your experience with the {unratedCar.brand} {unratedCar.model}?</p>
                  
                  <div className="flex justify-center space-x-2 mb-4">
                     {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} className="focus:outline-none transform hover:scale-110 transition-transform">
                           <Star size={28} className={`${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                        </button>
                     ))}
                  </div>
                  
                  <input 
                     type="text" 
                     placeholder="Write a short review..." 
                     value={feedback}
                     onChange={(e) => setFeedback(e.target.value)}
                     className="w-full text-sm border-gray-200 rounded-lg bg-white mb-3 text-black border focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  
                  <button 
                     onClick={handleRateSubmit}
                     disabled={rating === 0}
                     className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     Submit Review
                  </button>
               </div>
            )}

            {/* Help Card */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
               <div className="flex items-start">
                  <AlertCircle size={20} className="text-blue-600 mr-2 mt-0.5" />
                  <div>
                     <h4 className="font-bold text-blue-900 text-sm">Need Help?</h4>
                     <p className="text-xs text-blue-700 mt-1 mb-3">Our support team is available 24/7 to assist you with your bookings.</p>
                     <button className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded shadow-sm">
                        Contact Support
                     </button>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
