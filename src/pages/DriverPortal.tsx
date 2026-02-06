
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Star, MapPin, Navigation, UserCheck, CheckCircle, Clock, 
  DollarSign, Shield, Calendar, AlertTriangle, Bell, Radio, User, Edit2, Info, Car as CarIcon, Upload, Plus
} from 'lucide-react';
import { BookingStatus, Driver, FuelType, Transmission } from '../types';

export default function DriverPortal({ activeTab: initialTab = 'dashboard' }: { activeTab?: string }) {
  const { bookings, updateBookingStatus, currentUser, openEditProfile, addCar } = useApp();
  const currentDriver = currentUser as Driver;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Derive driver-specific data
  const driverBookings = bookings.filter(b => b.type === 'RENTAL'); 
  const activeTrip = driverBookings.find(b => b.status === BookingStatus.CONFIRMED && b.driverId === currentDriver.id);
  const pendingTrip = driverBookings.find(b => b.status === BookingStatus.PENDING && (!b.driverId || b.driverId === currentDriver.id));
  const completedTrips = driverBookings.filter(b => b.status === BookingStatus.COMPLETED && b.driverId === currentDriver.id);
  const totalEarnings = currentDriver.earnings || completedTrips.reduce((sum, b) => sum + (b.totalCost * 0.4), 0);
  
  const [status, setStatus] = useState(currentDriver.status);
  
  // New Car Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [newCar, setNewCar] = useState({
     brand: '',
     model: '',
     image: '',
     pricePerHour: 0,
     fuelType: FuelType.PETROL,
     seats: 4
  });

  useEffect(() => {
    if (activeTrip) {
      setStatus('ON_TRIP');
    }
  }, [activeTrip]);

  const handleStatusChange = (newStatus: 'AVAILABLE' | 'OFF_DUTY') => {
    if (activeTrip) {
      alert("Cannot change status while on a trip.");
      return;
    }
    setStatus(newStatus);
  };

  const handleAcceptTrip = (bookingId: string) => {
     updateBookingStatus(bookingId, BookingStatus.CONFIRMED, { driverId: currentDriver.id });
  };

  const handleCarSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsUploading(true);
      
      // Simulate API call
      setTimeout(() => {
         addCar({
             id: Math.random().toString(36).substr(2, 9),
             brand: newCar.brand,
             model: newCar.model,
             image: newCar.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
             pricePerHour: Number(newCar.pricePerHour),
             pricePerDay: Number(newCar.pricePerHour) * 8, // Approx
             fuelType: newCar.fuelType,
             transmission: Transmission.AUTOMATIC,
             seats: Number(newCar.seats),
             location: { lat: 37.77, lng: -122.41, name: 'Driver Location' },
             available: true,
             rating: 5.0
         });
         setIsUploading(false);
         setNewCar({ brand: '', model: '', image: '', pricePerHour: 0, fuelType: FuelType.PETROL, seats: 4 });
         alert("Vehicle added to fleet successfully!");
      }, 1500);
  };

  // Tab Navigation
  const renderTabNavigation = () => (
      <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
          <button 
             onClick={() => setActiveTab('dashboard')} 
             className={`pb-2 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
             Dashboard
          </button>
          <button 
             onClick={() => setActiveTab('vehicle')} 
             className={`pb-2 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'vehicle' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
             My Vehicle
          </button>
          <button 
             onClick={() => setActiveTab('profile')} 
             className={`pb-2 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
             Profile
          </button>
      </div>
  );

  // Profile View
  if (activeTab === 'profile') {
     return (
       <div className="space-y-8 animate-fade-in-up">
         {renderTabNavigation()}
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Driver Profile</h1>
            <button onClick={openEditProfile} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm">
               <Edit2 size={16} className="mr-2" /> Edit Details
            </button>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Details Card */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 flex items-center"><User size={18} className="mr-2 text-indigo-600" /> Personal Details</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Verified</span>
               </div>
               <div className="p-6">
                  <div className="flex items-start mb-6">
                     <img src={currentDriver.avatar} alt="Profile" className="w-20 h-20 rounded-full border-4 border-gray-100 mr-6 object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }} />
                     <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{currentDriver.name}</h2>
                        <p className="text-gray-500 text-sm">Professional Chauffeur</p>
                        <div className="flex items-center mt-2 text-sm text-gray-600"><MapPin size={14} className="mr-1" /> {currentDriver.address || 'Address not set'}</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 uppercase font-semibold">Contact</p><p className="font-medium">{currentDriver.phone}</p></div>
                     <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 uppercase font-semibold">Email</p><p className="font-medium">{currentDriver.email}</p></div>
                  </div>
               </div>
            </div>
         </div>
       </div>
     );
  }

  // Vehicle Management View
  if (activeTab === 'vehicle') {
      return (
         <div className="space-y-8 animate-fade-in-up">
            {renderTabNavigation()}
            <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Add New Car Form */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                     <CarIcon className="mr-2 text-indigo-600" size={20} /> Add/Update Vehicle
                  </h3>
                  <form onSubmit={handleCarSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Car Brand</label>
                        <input type="text" required value={newCar.brand} onChange={e => setNewCar({...newCar, brand: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-black" placeholder="e.g. Toyota" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Car Model</label>
                        <input type="text" required value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-black" placeholder="e.g. Camry" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                           <input type="number" required value={newCar.pricePerHour} onChange={e => setNewCar({...newCar, pricePerHour: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-black" placeholder="15" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                           <input type="number" required value={newCar.seats} onChange={e => setNewCar({...newCar, seats: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-black" placeholder="4" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <div className="flex">
                           <input type="text" value={newCar.image} onChange={e => setNewCar({...newCar, image: e.target.value})} className="flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-indigo-500 bg-white text-black" placeholder="https://..." />
                           <button type="button" className="bg-gray-100 px-4 border border-l-0 rounded-r-lg hover:bg-gray-200"><Upload size={18} className="text-gray-600" /></button>
                        </div>
                     </div>
                     <button type="submit" disabled={isUploading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center">
                        {isUploading ? 'Uploading...' : <><Plus size={18} className="mr-2" /> Add Vehicle</>}
                     </button>
                  </form>
               </div>

               {/* Current Vehicle Status */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                     {newCar.image ? <img src={newCar.image} className="w-full h-full object-cover" /> : <CarIcon size={64} className="text-gray-300" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No Active Vehicle</h3>
                  <p className="text-gray-500 mt-2">You haven't assigned a vehicle to your profile yet. Add one to start receiving ride requests.</p>
               </div>
            </div>
         </div>
      );
  }

  // Dashboard View
  return (
    <div className="space-y-8 animate-fade-in-up">
       {renderTabNavigation()}
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-500">Welcome back, {currentDriver.name}</p>
         </div>
         
         <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 pl-2">Status:</span>
            <div className="flex space-x-1">
               <button onClick={() => handleStatusChange('AVAILABLE')} disabled={status === 'ON_TRIP'} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                 <Radio size={14} className="mr-1" /> Available
               </button>
               <button onClick={() => handleStatusChange('OFF_DUTY')} disabled={status === 'ON_TRIP'} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${status === 'OFF_DUTY' ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                 <Clock size={14} className="mr-1" /> Off Duty
               </button>
            </div>
            {status === 'ON_TRIP' && (
               <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center animate-pulse"><Navigation size={14} className="mr-1" /> On Trip</span>
            )}
         </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-start">
                <div><p className="text-xs text-gray-500 uppercase font-semibold">Earnings</p><h3 className="text-2xl font-bold text-gray-900 mt-1">${totalEarnings.toLocaleString()}</h3></div>
                <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign size={20} /></div>
             </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-start">
                <div><p className="text-xs text-gray-500 uppercase font-semibold">Trips</p><h3 className="text-2xl font-bold text-gray-900 mt-1">{completedTrips.length}</h3></div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Navigation size={20} /></div>
             </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-start">
                <div><p className="text-xs text-gray-500 uppercase font-semibold">Rating</p><h3 className="text-2xl font-bold text-gray-900 mt-1">{currentDriver.rating}</h3></div>
                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-500"><Star size={20} fill="currentColor" /></div>
             </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-start">
                <div><p className="text-xs text-gray-500 uppercase font-semibold">Online</p><h3 className="text-2xl font-bold text-gray-900 mt-1">142h</h3></div>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Clock size={20} /></div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             {pendingTrip && (
               <div className="bg-white rounded-xl shadow-lg border-l-4 border-yellow-400 overflow-hidden animate-pulse">
                  <div className="p-6">
                     <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg text-gray-900 flex items-center"><Bell className="text-yellow-500 mr-2" size={20} /> New Assignment</h3><span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded uppercase">Pending</span></div>
                     <div className="space-y-2 mb-6">
                        <div className="flex items-center text-gray-700"><MapPin size={16} className="mr-2 text-gray-400" /><span className="font-medium">Pickup:</span> <span className="ml-1">{pendingTrip.location || 'Central Station'}</span></div>
                        <div className="flex items-center text-gray-700"><Navigation size={16} className="mr-2 text-gray-400" /><span className="font-medium">Route:</span> <span className="ml-1">City Tour</span></div>
                     </div>
                     <div className="flex space-x-3">
                        <button onClick={() => handleAcceptTrip(pendingTrip.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">Accept</button>
                        <button onClick={() => updateBookingStatus(pendingTrip.id, BookingStatus.REJECTED)} className="px-4 border border-gray-300 hover:bg-red-50 text-gray-600 py-2 rounded-lg font-medium transition-colors">Reject</button>
                     </div>
                  </div>
               </div>
             )}

             {!pendingTrip && !activeTrip && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Radio size={32} className="text-gray-400" /></div>
                   <h3 className="text-lg font-medium text-gray-900">No Active Trips</h3>
                   <p className="text-gray-500 mt-1">You are currently visible to new customers.</p>
                </div>
             )}
          </div>
          
          <div className="space-y-6">
             <div className="bg-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Earnings Summary</h3>
                <div className="flex items-end justify-between mb-2"><span className="text-3xl font-bold">${(totalEarnings * 0.8).toFixed(0)}</span><span className="text-sm bg-indigo-500 px-2 py-1 rounded">+5%</span></div>
                <p className="text-xs text-indigo-200 mb-6">Total Payout Pending</p>
                <button className="w-full bg-white text-indigo-600 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">View Report</button>
             </div>
          </div>
       </div>
    </div>
  );
}
