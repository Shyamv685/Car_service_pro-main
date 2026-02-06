
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BookingStatus, Driver, UserRole, ServiceStatus, Car } from '../types';
import { 
  CheckCircle, XCircle, Trash2, Plus, Car as CarIcon, 
  DollarSign, Star, UserPlus, Phone, CreditCard, MapPin, 
  FileText, Activity, Users, Settings, Search, Filter,
  Navigation, Clock, Target, AlertTriangle, Battery, Droplet, Disc, Gauge
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type AdminTab = 'overview' | 'bookings' | 'fleet' | 'users' | 'tracking';

interface AdminPanelProps {
  activeTab?: AdminTab | 'drivers';
}

export default function AdminPanel({ activeTab: initialTab }: AdminPanelProps = {}) {
  const { 
    bookings, updateBookingStatus, cars, deleteCar, 
    drivers, addDriver, deleteDriver, currentUser 
  } = useApp();
  const navigate = useNavigate();

  const resolveTab = (tab?: string): AdminTab => {
    if (tab === 'drivers') return 'users';
    if (tab && ['overview', 'bookings', 'fleet', 'users', 'tracking'].includes(tab)) return tab as AdminTab;
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(resolveTab(initialTab));
  // Store ID instead of name string for better precision
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  // Sync state with props when URL changes
  useEffect(() => {
    setActiveTab(resolveTab(initialTab));
  }, [initialTab]);

  // Computed Data
  const rentalBookings = bookings.filter(b => b.type === 'RENTAL');
  const serviceBookings = bookings.filter(b => b.type === 'SERVICE');
  
  // Find the full car object if selected
  const selectedCar = cars.find(c => c.id === selectedCarId);

  // Mock Revenue Data
  const revenueData = [
    { name: 'Mon', rentals: 4000, services: 2400 },
    { name: 'Tue', rentals: 3000, services: 1398 },
    { name: 'Wed', rentals: 2000, services: 9800 },
    { name: 'Thu', rentals: 2780, services: 3908 },
    { name: 'Fri', rentals: 1890, services: 4800 },
    { name: 'Sat', rentals: 2390, services: 3800 },
    { name: 'Sun', rentals: 3490, services: 4300 },
  ];

  // Helper function to map lat/lng to CSS percentages for the mock map
  const getMapPosition = (lat: number, lng: number) => {
    const minLat = 37.70;
    const maxLat = 37.82;
    const minLng = -122.52;
    const maxLng = -122.37;
    const top = ((maxLat - lat) / (maxLat - minLat)) * 100;
    const left = ((lng - minLng) / (maxLng - minLng)) * 100;
    return { 
      top: `${Math.max(5, Math.min(95, top))}%`, 
      left: `${Math.max(5, Math.min(95, left))}%` 
    };
  };

  const getRouteHistory = (car: Car | undefined) => {
    if (!car) return [];
    const now = new Date();
    const offset = car.id.charCodeAt(0) % 3; 

    return [
      { 
        time: 'Now', 
        location: car.location.name || 'Unknown Location', 
        status: 'Moving', 
        isCurrent: true 
      },
      { 
        time: new Date(now.getTime() - 15 * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        location: offset === 0 ? 'Market St & 5th' : 'Lombard Street', 
        status: 'Moving',
        isCurrent: false
      },
      { 
        time: new Date(now.getTime() - 45 * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        location: offset === 0 ? 'Union Square' : 'Fisherman\'s Wharf', 
        status: 'Stop',
        isCurrent: false
      },
      { 
        time: new Date(now.getTime() - 90 * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        location: offset === 0 ? 'SOMA District' : 'Golden Gate Park', 
        status: 'Moving',
        isCurrent: false
      },
      { 
        time: new Date(now.getTime() - 120 * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        location: 'Garage Hub', 
        status: 'Idle',
        isCurrent: false
      },
    ];
  };

  const UserCard = ({ name, role }: { name: string, role: string }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
           {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400 uppercase">{role}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg transition-colors">
          Edit
        </button>
        <button className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors">
          Deactivate
        </button>
      </div>
    </div>
  );

  const handleTabClick = (tab: AdminTab) => {
    navigate(tab === 'overview' ? '/admin' : `/admin/${tab}`);
  };

  // Capitalize helper
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // New Component: Circular Progress
  const CircularProgress = ({ value, color, icon: Icon, label }: any) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="40" cy="40" r={radius} stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
            <circle 
              cx="40" cy="40" r={radius} 
              stroke={color} 
              strokeWidth="6" 
              fill="transparent" 
              strokeDasharray={circumference} 
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-gray-700">
            <Icon size={20} className={value < 30 ? "text-red-500 animate-pulse" : "text-gray-600"} />
          </div>
        </div>
        <p className="text-xs font-bold text-gray-600 mt-1">{label}</p>
        <p className={`text-sm font-bold ${value < 30 ? 'text-red-600' : 'text-gray-900'}`}>{value}%</p>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Management</h1>
            <p className="text-gray-500 mt-1 text-sm">Monitor performance, manage fleet, and track operations.</p>
          </div>
        </div>
        
        {/* Navigation Tabs - Styled like screenshot */}
        <div className="sticky top-0 z-20 bg-gray-100/95 backdrop-blur-sm -mx-6 px-6 py-2 md:mx-0 md:px-0 md:py-0 md:static md:bg-transparent">
          <nav className="flex overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-1 px-1">
             <div className="inline-flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm min-w-max">
                {['overview', 'bookings', 'fleet', 'users', 'tracking'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(tab as AdminTab)}
                    className={`
                      relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out whitespace-nowrap
                      ${activeTab === tab 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {capitalize(tab)}
                  </button>
                ))}
             </div>
          </nav>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in-up">
           {/* KPI Cards */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Generate simple reports</h3>
              <p className="text-gray-500 text-sm mb-6">Simple summaries of rentals and services.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="border border-gray-200 rounded-xl p-5 hover:border-indigo-200 transition-colors group cursor-default">
                    <p className="text-gray-500 text-sm font-medium mb-1 group-hover:text-indigo-600 transition-colors">Total cars</p>
                    <h2 className="text-3xl font-bold text-gray-900">{cars.length}</h2>
                 </div>
                 <div className="border border-gray-200 rounded-xl p-5 hover:border-indigo-200 transition-colors group cursor-default">
                    <p className="text-gray-500 text-sm font-medium mb-1 group-hover:text-indigo-600 transition-colors">Service bookings</p>
                    <h2 className="text-3xl font-bold text-gray-900">{serviceBookings.length}</h2>
                 </div>
                 <div className="border border-gray-200 rounded-xl p-5 hover:border-indigo-200 transition-colors group cursor-default">
                    <p className="text-gray-500 text-sm font-medium mb-1 group-hover:text-indigo-600 transition-colors">Rental bookings</p>
                    <h2 className="text-3xl font-bold text-gray-900">{rentalBookings.length}</h2>
                 </div>
              </div>
           </div>

           {/* Charts Section */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">Revenue Analytics</h3>
                    <select className="text-sm border-gray-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                       <option>This Week</option>
                       <option>Last Week</option>
                    </select>
                 </div>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={revenueData} barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                            cursor={{fill: '#f9fafb'}}
                          />
                          <Bar dataKey="rentals" name="Rentals" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="services" name="Services" fill="#10b981" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
                 <div className="space-y-4">
                    {bookings.slice(0, 4).map((booking, idx) => (
                       <div key={idx} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${booking.type === 'RENTAL' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {booking.type === 'RENTAL' ? <CarIcon size={18} /> : <Settings size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-gray-900 truncate">
                                {booking.type === 'RENTAL' ? 'New Rental Booking' : 'Service Request'}
                             </p>
                             <p className="text-xs text-gray-500 truncate">
                                ID: #{booking.id} • {new Date(booking.startDate).toLocaleDateString()}
                             </p>
                          </div>
                          <span className="text-sm font-bold text-gray-900">${booking.totalCost}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            {/* Manage Rental Bookings */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
               <h3 className="font-bold text-lg text-gray-900 mb-2">Manage rental bookings</h3>
               <p className="text-gray-500 text-sm mb-6">Approve, cancel, and view invoices.</p>
               
               <div className="space-y-4">
                  {rentalBookings.map(booking => {
                     const car = cars.find(c => c.id === booking.carId);
                     return (
                        <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <h4 className="font-bold text-gray-900">{car?.brand} {car?.model}</h4>
                                 <p className="text-sm text-gray-500">
                                    {new Date(booking.startDate).toLocaleDateString()} • Total ₹{booking.totalCost}
                                 </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded uppercase font-bold ${
                                 booking.status === BookingStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                                 booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                                 'bg-gray-100 text-gray-600'
                              }`}>
                                 {booking.status}
                              </span>
                           </div>
                           <div className="flex space-x-2">
                              <button 
                                onClick={() => updateBookingStatus(booking.id, BookingStatus.CONFIRMED)}
                                className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                 Approve
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(booking.id, BookingStatus.CANCELLED)}
                                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                 Cancel
                              </button>
                              <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors">
                                 Invoice
                              </button>
                           </div>
                        </div>
                     );
                  })}
                  {rentalBookings.length === 0 && <p className="text-gray-400 text-sm italic">No rental bookings.</p>}
               </div>
            </div>

            {/* Manage Service Bookings */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
               <h3 className="font-bold text-lg text-gray-900 mb-2">Manage service bookings</h3>
               <p className="text-gray-500 text-sm mb-6">Update status and capture feedback.</p>

               <div className="space-y-4">
                  {serviceBookings.map(booking => {
                     return (
                        <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <h4 className="font-bold text-gray-900">General Service</h4>
                                 <p className="text-sm text-gray-500">
                                    {booking.location || 'Workshop A'}
                                 </p>
                                 <p className="text-xs text-gray-400 mt-1">Due: {new Date(booking.startDate).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => updateBookingStatus(booking.id, BookingStatus.PENDING)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${booking.status === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                 Pending
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(booking.id, ServiceStatus.IN_PROGRESS)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${booking.status === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                 In progress
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(booking.id, BookingStatus.COMPLETED)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${booking.status === 'Completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                 Completed
                              </button>
                           </div>
                        </div>
                     );
                  })}
                  {serviceBookings.length === 0 && <p className="text-gray-400 text-sm italic">No service bookings.</p>}
               </div>
            </div>
         </div>
      )}

      {/* FLEET TAB */}
      {activeTab === 'fleet' && (
         <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-lg text-gray-900">Select Vehicle</h3>
                     <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors">
                        <Plus size={16} />
                     </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                     {cars.map(car => {
                        const isHealthy = (car.health?.oilLife || 100) > 30;
                        return (
                           <div 
                              key={car.id} 
                              onClick={() => setSelectedCarId(car.id)}
                              className={`
                                 border rounded-xl p-3 flex items-center cursor-pointer transition-all duration-200
                                 ${selectedCarId === car.id 
                                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 shadow-md' 
                                    : 'border-gray-200 hover:bg-gray-50'
                                 }
                              `}
                           >
                              <img src={car.image} alt={car.model} className="w-16 h-12 object-cover rounded bg-gray-100 mr-4" />
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-gray-900 text-sm truncate">{car.brand} {car.model}</h4>
                                 <p className="text-xs text-gray-500">{car.available ? 'Available' : 'Rented'}</p>
                              </div>
                              {!isHealthy && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
                              {selectedCarId === car.id && <div className="w-2 h-2 rounded-full bg-indigo-600 ml-2"></div>}
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* Digital Twin / Health Monitor */}
               <div className="lg:col-span-2 bg-white p-0 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  {selectedCar && selectedCar.health ? (
                     <>
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                           <div>
                              <div className="flex items-center gap-2">
                                 <h3 className="font-bold text-xl text-gray-900">{selectedCar.brand} {selectedCar.model}</h3>
                                 <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700">ID: {selectedCar.id}</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1 flex items-center">
                                 <Gauge size={14} className="mr-1" /> Odometer: {selectedCar.health.mileage.toLocaleString()} mi
                              </p>
                           </div>
                           <div className="text-right">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                 (selectedCar.health.oilLife < 30) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                 {(selectedCar.health.oilLife < 30) ? 'Needs Service' : 'Healthy'}
                              </span>
                           </div>
                        </div>

                        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                           <CircularProgress 
                              value={selectedCar.health.oilLife} 
                              color={selectedCar.health.oilLife < 30 ? "#ef4444" : "#10b981"}
                              icon={Droplet}
                              label="Oil Life"
                           />
                           <CircularProgress 
                              value={selectedCar.health.batteryHealth} 
                              color={selectedCar.health.batteryHealth < 50 ? "#eab308" : "#10b981"}
                              icon={Battery}
                              label="Battery"
                           />
                           <CircularProgress 
                              value={selectedCar.health.brakePadWear} 
                              color={selectedCar.health.brakePadWear < 20 ? "#ef4444" : "#3b82f6"} // Lower is worse
                              icon={Disc}
                              label="Brake Pads"
                           />
                           <CircularProgress 
                              value={100} // Static for now or mock pressure logic
                              color="#6366f1"
                              icon={Activity}
                              label="Tire Pressure"
                           />
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
                           <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center">
                              <Activity size={16} className="text-indigo-600 mr-2" />
                              AI Diagnostics
                           </h4>
                           <div className="space-y-3">
                              {selectedCar.health.oilLife < 30 ? (
                                 <div className="flex items-center p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                                    <AlertTriangle size={18} className="mr-3 flex-shrink-0" />
                                    <span>
                                       <strong>Critical Alert:</strong> Engine oil is below 30%. Schedule an oil change immediately to prevent engine wear.
                                    </span>
                                    <button className="ml-auto bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700">
                                       Book Service
                                    </button>
                                 </div>
                              ) : (
                                 <div className="flex items-center p-3 bg-green-50 text-green-800 rounded-lg text-sm border border-green-100">
                                    <CheckCircle size={18} className="mr-3 flex-shrink-0" />
                                    <span>Vehicle is in good condition. Next scheduled maintenance recommended in 1,200 miles.</span>
                                 </div>
                              )}
                              
                              <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pl-1">
                                 <span>Last Service: {selectedCar.health.lastServiceDate}</span>
                                 <span className="font-mono">Sensor ID: #SENS-{selectedCar.id}-X99</span>
                              </div>
                           </div>
                        </div>
                     </>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 min-h-[400px]">
                        <Activity size={48} className="mb-4 opacity-20" />
                        <p className="font-medium text-lg">Select a vehicle</p>
                        <p className="text-sm">View real-time telemetry and health diagnostics.</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Drivers List Small View */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
               <h3 className="font-bold text-lg text-gray-900 mb-4">Top Drivers</h3>
               <div className="space-y-4">
                  {drivers.slice(0, 3).map(driver => (
                     <div key={driver.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <img src={driver.avatar} className="w-10 h-10 rounded-full" alt="" />
                        <div className="flex-1">
                           <p className="font-bold text-sm text-gray-900">{driver.name}</p>
                           <div className="flex items-center">
                              <Star size={10} className="text-yellow-400 fill-current mr-1" />
                              <span className="text-xs text-gray-500">{driver.rating}</span>
                           </div>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${driver.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in-up">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Manage users</h3>
            <p className="text-gray-500 text-sm mb-6">View, edit, deactivate users.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <UserCard name="Jordan Smith" role="Customer" />
               <UserCard name="Taylor Swift" role="Customer" />
               <UserCard name="Morgan Freeman" role="Driver" />
               <UserCard name="Sam Altman" role="Admin" />
               <UserCard name="Alex Johnson" role="Driver" />
               <UserCard name="Priya Singh" role="Driver" />
            </div>
         </div>
      )}

      {/* TRACKING TAB */}
      {activeTab === 'tracking' && (
         <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Map View */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[450px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-gray-900">Show current location on a map</h3>
                     {selectedCar && (
                        <div className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                           <Activity size={12} className="mr-1 animate-pulse" /> Live Tracking
                        </div>
                     )}
                  </div>
                  
                  <div className="flex-1 bg-slate-50 rounded-xl border border-gray-200 relative overflow-hidden group">
                     {/* Map Background Grid */}
                     <div className="absolute inset-0 opacity-20" style={{ 
                        backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                     }}></div>
                     
                     {/* "Radar" Scan Effect */}
                     <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent animate-pulse pointer-events-none"></div>

                     {/* Render All Cars on Map */}
                     {cars.map(car => {
                        const pos = getMapPosition(car.location.lat, car.location.lng);
                        const isSelected = selectedCarId === car.id;
                        
                        return (
                           <button
                              key={car.id}
                              onClick={() => setSelectedCarId(car.id)}
                              style={{ top: pos.top, left: pos.left }}
                              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out group/marker focus:outline-none ${
                                 isSelected ? 'z-30 scale-100' : 'z-10 scale-75 hover:scale-90 hover:z-20 opacity-80'
                              }`}
                           >
                              {/* Pulsing Ring for Selected */}
                              {isSelected && (
                                 <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-25 animate-ping"></span>
                              )}
                              
                              {/* Marker Icon */}
                              <div className={`
                                 relative rounded-full shadow-lg border-2 flex items-center justify-center transition-colors
                                 ${isSelected 
                                    ? 'bg-indigo-600 border-white w-10 h-10 text-white' 
                                    : 'bg-white border-gray-300 w-6 h-6 text-gray-500 hover:bg-gray-50 hover:border-indigo-300'
                                 }
                              `}>
                                 {isSelected ? <CarIcon size={18} /> : <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                              </div>

                              {/* Tooltip */}
                              <div className={`
                                 absolute top-full mt-2 left-1/2 transform -translate-x-1/2 
                                 bg-white px-2 py-1 rounded shadow-md border border-gray-100 
                                 text-[10px] font-bold whitespace-nowrap text-gray-800 pointer-events-none
                                 transition-opacity duration-200
                                 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover/marker:opacity-100'}
                              `}>
                                 {car.brand} {car.model}
                              </div>
                           </button>
                        );
                     })}

                     {!selectedCar && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm text-gray-500 font-medium border border-gray-200">
                              Select a car below to track
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Route History */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[450px] flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Display route history</h3>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                     {selectedCar ? (
                        <div className="relative py-2 pl-2">
                           {/* Vertical Line */}
                           <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200"></div>

                           {getRouteHistory(selectedCar).map((point, idx) => (
                              <div key={idx} className="relative flex items-start pl-10 mb-8 last:mb-0 group">
                                 {/* Timeline Dot */}
                                 <div className={`
                                    absolute left-2.5 top-1.5 transform -translate-x-1/2 
                                    w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10
                                    transition-colors duration-300
                                    ${point.isCurrent ? 'bg-indigo-600 scale-110 ring-2 ring-indigo-100' : 'bg-gray-300 group-hover:bg-gray-400'}
                                 `}>
                                    {point.isCurrent && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                                 </div>

                                 <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 transition-all hover:shadow-sm hover:border-gray-200">
                                    <div className="flex justify-between items-start mb-1">
                                       <span className="font-bold text-gray-900 text-sm">{point.location}</span>
                                       <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${
                                          point.status === 'Moving' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                          point.status === 'Stop' ? 'bg-red-50 text-red-600 border-red-100' : 
                                          'bg-gray-100 text-gray-500 border-gray-200'
                                       }`}>
                                          {point.status}
                                       </span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                       <Clock size={12} className="mr-1" />
                                       {point.time}
                                       {point.isCurrent && <span className="ml-2 text-indigo-600 font-medium">• Current Position</span>}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                           <Target size={32} className="mb-2 opacity-20" />
                           <p className="font-medium text-sm">No car selected</p>
                           <p className="text-xs mt-1">Select a vehicle to view history</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Track Buttons */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-lg text-gray-900 mb-4">Track car button for admins</h3>
               <div className="flex flex-wrap gap-3">
                  {cars.map(car => {
                     const isSelected = selectedCarId === car.id;
                     return (
                        <button 
                           key={car.id}
                           onClick={() => setSelectedCarId(car.id)}
                           className={`
                              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center
                              ${isSelected 
                                 ? 'bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-200' 
                                 : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                              }
                           `}
                        >
                           <CarIcon size={14} className={`mr-2 ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`} />
                           Track {car.brand} {car.model}
                           {isSelected && <Activity size={12} className="ml-2 animate-pulse" />}
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
