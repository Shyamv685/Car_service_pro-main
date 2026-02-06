
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star, ChevronLeft, CreditCard, Banknote, X, CheckCircle,
  Smartphone, Building, Loader2, Calendar, MapPin, ShieldCheck, Search
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CarRental() {
  const { cars, addBooking, currentUser } = useApp();
  const navigate = useNavigate();
  
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<'hours' | 'days'>('hours');
  const [duration, setDuration] = useState<number>(4);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Modal & Payment States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline' | null>(null);
  const [onlineOption, setOnlineOption] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Banking State
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const selectedCar = cars.find(c => c.id === selectedCarId);
  const fallbackImage = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80';

  // Comprehensive List of Global Banks
  const banks = [
    // India
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda", "IndusInd Bank", "Yes Bank",
    // USA
    "JPMorgan Chase", "Bank of America", "Wells Fargo", "Citigroup", "Goldman Sachs", "Morgan Stanley", "US Bancorp", "PNC Financial Services",
    // UK & Europe
    "HSBC Holdings", "Barclays", "Lloyds Banking Group", "NatWest Group", "Standard Chartered", "Deutsche Bank", "BNP Paribas", "Santander", "UBS Group", "Credit Suisse", "Société Générale", "ING Group",
    // Asia & Pacific
    "Mitsubishi UFJ Financial", "China Construction Bank", "Agricultural Bank of China", "Bank of China", "ICBC", "DBS Bank", "OCBC Bank", "United Overseas Bank", "Commonwealth Bank of Australia", "Westpac", "ANZ",
    // Canada
    "Royal Bank of Canada", "Toronto-Dominion Bank", "Scotiabank", "Bank of Montreal"
  ].sort();

  const filteredBanks = banks.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()));

  const calculateTotal = () => {
    if (!selectedCar) return 0;
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return selectedCar.pricePerDay * diffDays;
    }
    return bookingMode === 'hours'
      ? selectedCar.pricePerHour * duration
      : selectedCar.pricePerDay * duration;
  };

  const handlePaymentAndBook = () => {
    if (!selectedCar) return;
    
    // Validation
    if (paymentMethod === 'online' && onlineOption === 'netbanking' && !selectedBank) {
        alert("Please select a bank to proceed.");
        return;
    }

    setIsProcessing(true);

    // Simulate Payment Gateway Delay
    setTimeout(() => {
        const totalAmount = calculateTotal();
        const isOnline = paymentMethod === 'online';
        
        let paymentNote = 'Payment Due at Pickup';
        if (isOnline) {
             if (onlineOption === 'netbanking') paymentNote = `NetBanking: ${selectedBank}`;
             else if (onlineOption === 'upi') paymentNote = `UPI Payment`;
             else paymentNote = `Card Payment`;
             paymentNote += ` (Txn: ${Math.floor(Math.random() * 1000000)})`;
        }
        
        const newBooking: Booking = {
          id: Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: currentUser.id,
          carId: selectedCar.id,
          type: 'RENTAL',
          startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
          endDate: endDate ? endDate.toISOString() : new Date(Date.now() + (bookingMode === 'hours' ? duration * 3600000 : duration * 86400000)).toISOString(),
          totalCost: totalAmount,
          // Online payments are auto-confirmed, offline are pending
          status: isOnline ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
          location: selectedCar.location.name,
          notes: paymentNote
        };

        addBooking(newBooking);
        setIsProcessing(false);
        setShowConfirmModal(false);
        setShowSuccessModal(true); // Show Success Popup
    }, 2000);
  };

  const openConfirmation = () => {
    setShowConfirmModal(true);
    setPaymentMethod(null); // Force user to select method first
    setOnlineOption('card');
    setBankSearch('');
    setSelectedBank('');
  };

  const closeSuccess = () => {
      setShowSuccessModal(false);
      setSelectedCarId(null);
      navigate('/bookings');
  };

  if (selectedCar) {
    return (
      <div className="space-y-6 animate-fade-in-up relative">
        <button 
          onClick={() => setSelectedCarId(null)}
          className="flex items-center text-gray-600 hover:text-green-600 font-medium transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" /> Back to Fleet
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
             <div className="p-6 border-b border-gray-100">
               <h2 className="text-xl font-bold text-gray-900">Car details</h2>
             </div>
             <div className="p-6">
                <div className="bg-black rounded-xl overflow-hidden mb-6 relative h-64 flex items-center justify-center group">
                   <img 
                      src={selectedCar.image} 
                      alt={selectedCar.model} 
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
                      onError={(e) => { e.currentTarget.src = fallbackImage; }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{selectedCar.brand} {selectedCar.model}</h3>
                   </div>
                </div>

                <div className="space-y-3 text-sm">
                   <div className="flex justify-between border-b border-gray-50 pb-2">
                     <span className="text-gray-500">Fuel Type</span>
                     <span className="font-medium text-gray-900">{selectedCar.fuelType}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-50 pb-2">
                     <span className="text-gray-500">Transmission</span>
                     <span className="font-medium text-gray-900">{selectedCar.transmission}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-50 pb-2">
                     <span className="text-gray-500">Rate</span>
                     <span className="font-medium text-gray-900">₹{selectedCar.pricePerHour}/hr • ₹{selectedCar.pricePerDay}/day</span>
                   </div>
                   <div className="flex justify-between pt-1">
                     <span className="text-gray-500">Location</span>
                     <div className="flex items-center text-gray-900">
                       <MapPin size={14} className="mr-1 text-gray-400" />
                       <span className="font-medium">{selectedCar.location.name}</span>
                     </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Rental Booking Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-fit">
             <div className="p-6 border-b border-gray-100">
               <h2 className="text-xl font-bold text-gray-900">Configure Rental</h2>
             </div>
             <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Duration Type</label>
                      <div className="flex rounded-lg overflow-hidden border border-gray-200">
                        <button
                          onClick={() => setBookingMode('hours')}
                          className={`flex-1 py-2 text-sm font-medium transition-colors ${bookingMode === 'hours' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                          Hours
                        </button>
                        <button
                          onClick={() => setBookingMode('days')}
                          className={`flex-1 py-2 text-sm font-medium transition-colors ${bookingMode === 'days' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                          Days
                        </button>
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">{bookingMode === 'hours' ? 'Number of Hours' : 'Number of Days'}</label>
                      <input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full border border-gray-200 rounded-lg py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      />
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Estimated Total</label>
                      <div className="w-full border border-green-100 bg-green-50 rounded-lg py-2 px-3 font-bold text-green-700 text-lg">
                         ₹{calculateTotal().toLocaleString()}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Start Date</label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                        className="w-full border border-gray-200 rounded-lg py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        placeholderText="Select start date"
                      />
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">End Date</label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        minDate={startDate || new Date()}
                        className="w-full border border-gray-200 rounded-lg py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        placeholderText="Select end date"
                      />
                   </div>
                </div>

                <div className="pt-4">
                   <button 
                     onClick={openConfirmation}
                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-200 transform hover:-translate-y-0.5 flex items-center justify-center"
                   >
                     Proceed to Checkout <ChevronLeft size={16} className="rotate-180 ml-1" />
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Confirmation & Payment Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-900">Secure Checkout</h3>
                  <button onClick={() => !isProcessing && setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                   {/* Order Summary */}
                   <div className="flex items-start mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <img src={selectedCar.image} alt="car" className="w-20 h-14 object-cover rounded-lg mr-4" />
                      <div>
                         <p className="font-bold text-gray-900">{selectedCar.brand} {selectedCar.model}</p>
                         <div className="flex items-center text-xs text-gray-500 mt-1">
                             <Calendar size={12} className="mr-1" />
                             {duration} {bookingMode}
                         </div>
                         <p className="font-bold text-green-600 mt-1 text-lg">₹{calculateTotal().toLocaleString()}</p>
                      </div>
                   </div>

                   <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Select Payment Mode</h4>
                   
                   {/* Payment Method Toggle */}
                   <div className="grid grid-cols-2 gap-3 mb-6">
                      <button 
                        onClick={() => setPaymentMethod('online')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${paymentMethod === 'online' ? 'border-green-600 bg-green-50 text-green-700 shadow-sm' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                      >
                         <div className={`p-2 rounded-full mb-2 ${paymentMethod === 'online' ? 'bg-green-200' : 'bg-gray-100'}`}>
                           <CreditCard size={20} className={paymentMethod === 'online' ? 'text-green-700' : 'text-gray-500'} />
                         </div>
                         <span className="font-bold text-sm">Pay Online</span>
                         <span className="text-[10px] text-gray-500 mt-1">Cards, UPI, NetBanking</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('offline')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${paymentMethod === 'offline' ? 'border-green-600 bg-green-50 text-green-700 shadow-sm' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                      >
                         <div className={`p-2 rounded-full mb-2 ${paymentMethod === 'offline' ? 'bg-green-200' : 'bg-gray-100'}`}>
                           <Banknote size={20} className={paymentMethod === 'offline' ? 'text-green-700' : 'text-gray-500'} />
                         </div>
                         <span className="font-bold text-sm">Pay Later</span>
                         <span className="text-[10px] text-gray-500 mt-1">Cash at Pickup</span>
                      </button>
                   </div>

                   {/* DYNAMIC: Online Payment Options */}
                   {paymentMethod === 'online' && (
                      <div className="animate-fade-in border-t border-gray-100 pt-4">
                         <h5 className="font-bold text-gray-800 mb-3 text-sm">Select Payment Gateway</h5>
                         {/* Gateway Tabs */}
                         <div className="flex border-b border-gray-200 mb-4">
                            <button onClick={() => setOnlineOption('card')} className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${onlineOption === 'card' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Debit/Credit Card</button>
                            <button onClick={() => setOnlineOption('upi')} className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${onlineOption === 'upi' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>UPI</button>
                            <button onClick={() => setOnlineOption('netbanking')} className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${onlineOption === 'netbanking' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Netbanking</button>
                         </div>

                         {/* Card Input - WHITE BACKGROUND */}
                         {onlineOption === 'card' && (
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 animate-slide-up">
                               <input type="text" placeholder="Card Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white text-black placeholder-gray-400" />
                               <div className="flex gap-3">
                                  <input type="text" placeholder="MM/YY" className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white text-black placeholder-gray-400" />
                                  <input type="text" placeholder="CVV" className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white text-black placeholder-gray-400" />
                               </div>
                               <input type="text" placeholder="Card Holder Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white text-black placeholder-gray-400" />
                               <div className="flex items-center text-xs text-gray-500 mt-2">
                                  <ShieldCheck size={12} className="mr-1 text-green-600" />
                                  Secure 128-bit SSL Encrypted
                               </div>
                            </div>
                         )}

                         {/* UPI Input - WHITE BACKGROUND */}
                         {onlineOption === 'upi' && (
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 animate-slide-up">
                               <div className="flex items-center space-x-2 text-gray-600 mb-2">
                                  <Smartphone size={18} />
                                  <span className="text-sm">Enter UPI ID (e.g., mobile@upi)</span>
                               </div>
                               <input type="text" placeholder="username@bank" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white text-black placeholder-gray-400" />
                               <button className="text-xs text-green-600 font-bold hover:underline">Verify VPA</button>
                            </div>
                         )}

                         {/* Netbanking Input - SEARCH & LIST */}
                         {onlineOption === 'netbanking' && (
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 animate-slide-up">
                               <div className="flex items-center space-x-2 text-gray-600 mb-2">
                                  <Building size={18} />
                                  <span className="text-sm">Select Bank</span>
                               </div>
                               
                               <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <Search size={14} className="text-gray-400" />
                                 </div>
                                 <input 
                                    type="text" 
                                    placeholder="Search for your bank..." 
                                    value={bankSearch}
                                    onChange={(e) => setBankSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white text-black placeholder-gray-400"
                                 />
                               </div>

                               <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg mt-2 custom-scrollbar">
                                  {filteredBanks.length > 0 ? (
                                      filteredBanks.map((bank, idx) => (
                                          <button 
                                            key={idx}
                                            onClick={() => setSelectedBank(bank)}
                                            className={`w-full text-left px-3 py-2.5 text-sm border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center ${
                                                selectedBank === bank 
                                                ? 'bg-green-50 text-green-800 font-bold' 
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                          >
                                            {bank}
                                            {selectedBank === bank && <CheckCircle size={14} className="text-green-600" />}
                                          </button>
                                      ))
                                  ) : (
                                      <div className="p-4 text-xs text-gray-400 text-center">No banks found</div>
                                  )}
                               </div>
                               {selectedBank && (
                                   <p className="text-xs text-green-600 font-medium mt-1">Selected: {selectedBank}</p>
                               )}
                            </div>
                         )}
                      </div>
                   )}

                   {/* Offline Warning */}
                   {paymentMethod === 'offline' && (
                      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 flex items-start animate-slide-up">
                         <MapPin size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                         <span>Please pay the full amount of <strong>₹{calculateTotal().toLocaleString()}</strong> at the pickup location ({selectedCar.location.name}) to receive the keys.</span>
                      </div>
                   )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                   <button 
                     onClick={() => !isProcessing && setShowConfirmModal(false)}
                     disabled={isProcessing}
                     className="flex-1 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
                   >
                      Cancel
                   </button>
                   <button 
                     onClick={handlePaymentAndBook}
                     disabled={!paymentMethod || isProcessing}
                     className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg ${
                       !paymentMethod || isProcessing 
                         ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                         : 'bg-green-600 hover:bg-green-700 text-white'
                     }`}
                   >
                      {isProcessing ? (
                         <>
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Processing...
                         </>
                      ) : (
                         <>
                            <CheckCircle size={18} className="mr-2" />
                            {paymentMethod === 'online' ? `Pay ₹${calculateTotal().toLocaleString()}` : 'Confirm Booking'}
                         </>
                      )}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Success Popup Modal */}
        {showSuccessModal && (
           <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
                 {/* Confetti / Decoration Background */}
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                 
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                    <CheckCircle size={40} className="text-green-600" />
                 </div>
                 
                 <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
                 <p className="text-gray-500 mb-6">Your {selectedCar.brand} {selectedCar.model} has been successfully reserved.</p>
                 
                 <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
                    <div className="flex justify-between mb-2">
                       <span className="text-gray-500">Booking ID</span>
                       <span className="font-mono font-bold text-gray-900">#RES-{Math.floor(Math.random() * 99999)}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-500">Amount Paid</span>
                       <span className="font-bold text-green-600">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                 </div>

                 <button 
                    onClick={closeSuccess}
                    className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg"
                 >
                    View My Bookings
                 </button>
              </div>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
         <h1 className="text-2xl font-bold text-gray-900">Car Rental</h1>
         <p className="text-gray-500 mt-1">Browse our curated selection. View details and book in minutes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cars.map(car => (
          <div key={car.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
            <div className="h-48 overflow-hidden bg-gray-100 relative">
               <img 
                 src={car.image} 
                 alt={car.model} 
                 className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                 onError={(e) => { e.currentTarget.src = fallbackImage; }}
               />
               {!car.available && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Rented</span>
                 </div>
               )}
            </div>
            <div className="p-4 flex flex-col flex-1">
               <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{car.brand}<br/>{car.model}</h3>
                    <p className="text-xs text-gray-500 mt-1">{car.fuelType} • {car.transmission}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{car.pricePerHour}/hr</p>
                    <p className="text-xs text-gray-500">₹{car.pricePerDay}/day</p>
                    <div className="flex items-center justify-end mt-1 text-yellow-500">
                       <Star size={10} fill="currentColor" className="mr-0.5" />
                       <span className="text-xs font-medium text-gray-600">{car.rating} (120)</span>
                    </div>
                  </div>
               </div>
               
               <div className="mt-auto pt-4">
                 <button 
                   onClick={() => setSelectedCarId(car.id)}
                   disabled={!car.available}
                   className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                     car.available 
                       ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                   }`}
                 >
                   {car.available ? 'Select' : 'Unavailable'}
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
