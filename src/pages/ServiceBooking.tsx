
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Booking, BookingStatus, ServiceStatus } from '../types';
import { SERVICE_TYPES } from '../constants';
import { Star } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ServiceBooking() {
  const { addBooking, currentUser, cars, bookings, addNotification } = useApp();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(SERVICE_TYPES[0].id);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'In progress' | 'Completed'>('All');

  useEffect(() => {
    if (cars.length > 0 && !selectedCarId) {
      setSelectedCarId(cars[0].id);
    }
  }, [cars, selectedCarId]);

  // Mock service history merging with context bookings
  const serviceHistory = [
     // Adding some mock data for display purposes to match screenshot
     {
        id: 'mock1',
        serviceName: 'Oil change',
        carName: 'Honda City',
        date: '2025-01-08',
        status: ServiceStatus.COMPLETED,
        rating: 4,
        feedback: 'Quick and professional.'
     },
     {
        id: 'mock2',
        serviceName: 'Wash and polish',
        carName: 'Suzuki Swift',
        date: '2025-03-10',
        status: ServiceStatus.IN_PROGRESS,
        rating: 0,
        feedback: ''
     },
     // Add real bookings from context
     ...bookings.filter(b => b.type === 'SERVICE').map(b => {
         const sType = SERVICE_TYPES.find(s => s.id === b.serviceId);
         const c = cars.find(car => car.id === b.carId); // Assuming carId is stored or can be inferred
         return {
             id: b.id,
             serviceName: sType?.name || 'Service',
             carName: c ? `${c.brand} ${c.model}` : 'Tata Nexon',
             date: b.startDate.split('T')[0],
             status: b.status as ServiceStatus,
             rating: b.rating || 0,
             feedback: b.feedback || ''
         };
     })
  ];

  const filteredHistory = activeTab === 'All' 
    ? serviceHistory 
    : serviceHistory.filter(h => h.status.toLowerCase() === activeTab.toLowerCase());

  const handleBooking = () => {
    const service = SERVICE_TYPES.find(s => s.id === selectedServiceId);
    if (!service) return;

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      serviceId: service.id,
      carId: selectedCarId,
      type: 'SERVICE',
      startDate: serviceDate ? serviceDate.toISOString() : new Date().toISOString(),
      totalCost: service.basePrice,
      status: ServiceStatus.PENDING,
    };

    addBooking(newBooking);
    addNotification("Service Request Sent! We will contact you shortly.");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case ServiceStatus.COMPLETED: return 'bg-emerald-100 text-emerald-800';
        case ServiceStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
        case ServiceStatus.PENDING: return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Car Service</h1>
        <p className="text-gray-500 mt-1">Choose a service type, submit a booking, and track its status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Booking Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-fit">
           <h2 className="text-lg font-bold text-gray-900 mb-6">Service booking</h2>
           
           <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                 <label className="block text-sm text-gray-600 mb-2">Service type</label>
                 <div className="relative">
                    <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 text-black py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    >
                        {SERVICE_TYPES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                 </div>
              </div>

              <div>
                 <label className="block text-sm text-gray-600 mb-2">Car</label>
                 <div className="relative">
                    <select
                        value={selectedCarId}
                        onChange={(e) => setSelectedCarId(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 text-black py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    >
                        {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mb-8">
              <label className="block text-sm text-gray-600 mb-2">Service Date</label>
              <DatePicker
                selected={serviceDate}
                onChange={(date: Date | null) => setServiceDate(date)}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                className="w-full border border-gray-200 rounded-lg py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholderText="Select service date"
              />
           </div>

           <div className="flex space-x-4">
              <button 
                onClick={handleBooking}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
              >
                Submit booking
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
                Notify via Email/SMS
              </button>
           </div>
        </div>

        {/* Service History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
           <h2 className="text-lg font-bold text-gray-900 mb-6">Service history</h2>
           
           <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {['All', 'Pending', 'In progress', 'Completed'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                     activeTab === tab 
                       ? 'bg-blue-500 text-white' 
                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                   }`}
                 >
                   {tab}
                 </button>
              ))}
           </div>

           <div className="space-y-4">
              {filteredHistory.map((item, idx) => (
                 <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="font-semibold text-gray-900">{item.serviceName}</h3>
                          <p className="text-gray-600 text-sm mt-0.5">{item.carName}</p>
                          <p className="text-gray-400 text-xs mt-1">{item.date}</p>
                          
                          {item.rating > 0 && (
                            <div className="flex items-center mt-2">
                               <span className="text-xs text-gray-500 mr-2">Rating:</span>
                               <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={12} fill={i < item.rating ? "currentColor" : "none"} stroke="currentColor" className={i < item.rating ? "" : "text-gray-300"} />
                                  ))}
                               </div>
                               <span className="text-xs text-gray-500 ml-2">"{item.feedback}"</span>
                            </div>
                          )}
                          {!item.rating && item.status === ServiceStatus.COMPLETED && (
                             <p className="text-xs text-gray-400 mt-2 italic">No feedback</p>
                          )}
                       </div>
                       
                       <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                       </span>
                    </div>
                 </div>
              ))}
              {filteredHistory.length === 0 && (
                 <div className="text-center text-gray-400 py-8">
                    No history found for {activeTab.toLowerCase()}.
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
