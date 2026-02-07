
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Booking, BookingStatus, ServiceStatus } from '../types';
import { SERVICE_TYPES } from '../constants';
import { Star, Clock, CheckCircle, Wrench, Droplet, Sparkles, Hammer, Info, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ServiceBooking() {
  const { addBooking, currentUser, cars, bookings, addNotification } = useApp();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(SERVICE_TYPES[0].id);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [customCarName, setCustomCarName] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'In progress' | 'Completed'>('All');
  const [showServiceDetails, setShowServiceDetails] = useState<boolean>(false);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'wrench': return <Wrench size={20} />;
      case 'droplet': return <Droplet size={20} />;
      case 'sparkles': return <Sparkles size={20} />;
      case 'hammer': return <Hammer size={20} />;
      default: return <Wrench size={20} />;
    }
  };

  const openServiceDetails = (service: any) => {
    setSelectedServiceForDetails(service);
    setShowServiceDetails(true);
  };

  const closeServiceDetails = () => {
    setShowServiceDetails(false);
    setSelectedServiceForDetails(null);
  };

  useEffect(() => {
    if (cars.length > 0 && !selectedCarId) {
      setSelectedCarId(cars[0].id);
    }
  }, [cars, selectedCarId]);

  // Reset customCarName when component mounts or cars change
  useEffect(() => {
    setCustomCarName('');
  }, []);

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
             carName: b.customCarName || (c ? `${c.brand} ${c.model}` : 'Tata Nexon'),
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

    // Validate custom car name if 'Other' is selected
    if (selectedCarId === 'other' && !customCarName.trim()) {
      addNotification("Please enter a car name for 'Other'.");
      return;
    }

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      serviceId: service.id,
      carId: selectedCarId === 'other' ? undefined : selectedCarId,
      customCarName: selectedCarId === 'other' ? customCarName.trim() : undefined,
      type: 'SERVICE',
      startDate: serviceDate ? serviceDate.toISOString() : new Date().toISOString(),
      totalCost: service.basePrice,
      status: ServiceStatus.PENDING,
    };

    addBooking(newBooking);
    addNotification("Service Request Sent! We will contact you shortly.");
  };

  const handleCallAssistance = () => {
    // Support phone number - in a real app, this would come from config
    const supportNumber = '+1-800-CAR-HELP'; // Example: 1-800-227-4357
    // Initiate phone call
    window.location.href = `tel:${supportNumber}`;
    // Add notification for user feedback
    addNotification("Connecting to support... Please wait.");
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

      {/* Service Details Modal */}
      {showServiceDetails && selectedServiceForDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  {getServiceIcon(selectedServiceForDetails.icon)}
                </div>
                <h3 className="font-bold text-lg text-gray-900">{selectedServiceForDetails.name}</h3>
              </div>
              <button onClick={closeServiceDetails} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">{selectedServiceForDetails.description}</p>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>Duration: {selectedServiceForDetails.duration}</span>
              </div>

              <div className="flex items-center space-x-2 text-lg font-bold text-green-600">
                <span>₹{selectedServiceForDetails.basePrice}</span>
              </div>

              {selectedServiceForDetails.includes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What's included:</h4>
                  <ul className="space-y-1">
                    {selectedServiceForDetails.includes.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedServiceId(selectedServiceForDetails.id);
                  closeServiceDetails();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Select This Service
              </button>
            </div>
          </div>
        </div>
      )}

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
                        onChange={(e) => {
                          setSelectedCarId(e.target.value);
                          if (e.target.value !== 'other') {
                            setCustomCarName('');
                          }
                        }}
                        className="w-full appearance-none bg-white border border-gray-200 text-black py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    >
                        {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
                        <option value="other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                 </div>
                 {selectedCarId === 'other' && (
                   <div className="mt-2">
                     <input
                       type="text"
                       value={customCarName}
                       onChange={(e) => setCustomCarName(e.target.value)}
                       placeholder="Enter your car name"
                       className="w-full border border-gray-200 rounded-lg py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                     />
                   </div>
                 )}
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

           <div className="space-y-4">
              <div className="flex items-center space-x-3">
                 <input
                   type="checkbox"
                   id="emailNotify"
                   className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                 />
                 <label htmlFor="emailNotify" className="text-sm text-gray-600">
                   Send email notifications for status updates
                 </label>
              </div>
              <div className="flex items-center space-x-3">
                 <input
                   type="checkbox"
                   id="smsNotify"
                   defaultChecked
                   className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                 />
                 <label htmlFor="smsNotify" className="text-sm text-gray-600">
                   Send SMS notifications for status updates
                 </label>
              </div>

              <div className="flex space-x-4">
                 <button
                   onClick={handleBooking}
                   className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                 >
                   Submit booking
                 </button>
                 <button
                   onClick={handleCallAssistance}
                   className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                 >
                   Call for assistance
                 </button>
              </div>
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
                 <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50">
                    <div className="flex justify-between items-start">
                       <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                               {getServiceIcon(SERVICE_TYPES.find(s => s.name === item.serviceName)?.icon || 'wrench')}
                             </div>
                             <div>
                                <h3 className="font-semibold text-gray-900">{item.serviceName}</h3>
                                <p className="text-gray-600 text-sm">{item.carName}</p>
                             </div>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                             <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{item.date}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                                <span>₹{SERVICE_TYPES.find(s => s.name === item.serviceName)?.basePrice || 'N/A'}</span>
                             </div>
                          </div>

                          {item.rating > 0 && (
                            <div className="flex items-center space-x-2">
                               <span className="text-xs text-gray-500">Rating:</span>
                               <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={14} fill={i < item.rating ? "currentColor" : "none"} stroke="currentColor" className={i < item.rating ? "" : "text-gray-300"} />
                                  ))}
                               </div>
                               <span className="text-xs text-gray-600 italic">"{item.feedback}"</span>
                            </div>
                          )}
                          {!item.rating && item.status === ServiceStatus.COMPLETED && (
                             <div className="flex items-center space-x-2">
                                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                   Rate this service
                                </button>
                                <span className="text-xs text-gray-400">• No feedback yet</span>
                             </div>
                          )}
                       </div>

                       <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(item.status)} shadow-sm`}>
                             {item.status}
                          </span>
                          {item.status === ServiceStatus.IN_PROGRESS && (
                             <div className="flex items-center space-x-1 text-xs text-blue-600">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>In progress</span>
                             </div>
                          )}
                          {item.status === ServiceStatus.PENDING && (
                             <div className="flex items-center space-x-1 text-xs text-yellow-600">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span>Waiting</span>
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Progress bar for in-progress services */}
                    {item.status === ServiceStatus.IN_PROGRESS && (
                       <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                             <span>Service Progress</span>
                             <span>75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                             <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{width: '75%'}}></div>
                          </div>
                       </div>
                    )}
                 </div>
              ))}
              {filteredHistory.length === 0 && (
                 <div className="text-center text-gray-400 py-12">
                    <Wrench size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium text-lg">No service history</p>
                    <p className="text-sm">Book your first service to get started</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
