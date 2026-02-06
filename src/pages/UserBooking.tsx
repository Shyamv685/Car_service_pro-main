import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Booking, BookingStatus, Driver } from '../types';
import {
  FileText, Navigation, User as UserIcon, Phone, MapPin,
  Clock, Shield, Car as CarIcon, Download, AlertCircle, Calendar, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import TrackingComponent from '../components/TrackingComponent';

export default function UserBookings() {
  const { bookings, cars, drivers, currentUser } = useApp();
  const navigate = useNavigate();
  const [trackingVisible, setTrackingVisible] = useState<{[bookingId: string]: boolean}>({});

  // Reset tracking visibility when component mounts
  useEffect(() => {
    setTrackingVisible({});
  }, []);

  // Filter rentals for current user
  const myBookings = bookings.filter(b => b.userId === currentUser.id && b.type === 'RENTAL')
                             .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const generateInvoice = (booking: Booking, car: any, driver?: Driver) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Car Service Pro", 20, 25);
    doc.setFontSize(12);
    doc.text("INVOICE", 180, 25, { align: 'right' });

    // Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${booking.id}`, 20, 50);
    doc.text(`Date: ${new Date(booking.startDate).toLocaleDateString()}`, 20, 55);

    doc.text(`Bill To:`, 20, 70);
    doc.setFontSize(12);
    doc.text(currentUser.name, 20, 75);
    doc.setFontSize(10);
    doc.text(currentUser.email, 20, 80);
    doc.text(currentUser.address || '', 20, 85);

    // Car & Trip Details
    const tableData = [
      ['Vehicle', `${car.brand} ${car.model}`],
      ['Pickup Location', booking.location || 'N/A'],
      ['Start Date', new Date(booking.startDate).toLocaleString()],
      ['End Date', booking.endDate ? new Date(booking.endDate).toLocaleString() : 'N/A'],
      ['Driver', driver ? driver.name : 'Self-Drive / Pending'],
      ['Total Amount', `INR ${booking.totalCost.toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Details']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Footer
    doc.text("Thank you for choosing Car Service Pro!", 105, 280, { align: 'center' });

    doc.save(`invoice_${booking.id}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">Manage your active trips and view history.</p>
      </div>

      <div className="grid gap-6">
        {myBookings.length > 0 ? (
          myBookings.map(booking => {
            const car = cars.find(c => c.id === booking.carId);
            // Find assigned driver if any
            const driver = drivers.find(d => d.id === booking.driverId);
            const isConfirmed = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED;

            if (!car) return null;

            return (
              <div key={booking.id}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                   {/* Car Image & Basic Info */}
                   <div className="w-full md:w-64 bg-gray-100 relative">
                      <img src={car.image} alt={car.model} className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${
                           booking.status === BookingStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                           booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                           booking.status === BookingStatus.COMPLETED ? 'bg-gray-100 text-gray-600' :
                           'bg-red-100 text-red-600'
                         }`}>
                           {booking.status}
                         </span>
                      </div>
                   </div>

                   {/* Booking Details */}
                   <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                         <div>
                            <h3 className="text-xl font-bold text-gray-900">{car.brand} {car.model}</h3>
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                               <Calendar size={14} className="mr-1" />
                               {new Date(booking.startDate).toLocaleDateString()} - {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
                            </div>
                         </div>
                         <div className="mt-2 md:mt-0 text-right">
                            <p className="text-2xl font-bold text-indigo-600">₹{booking.totalCost.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{booking.notes || 'Paid'}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                         {/* Driver Info Section */}
                         <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center">
                               <UserIcon size={16} className="mr-2 text-indigo-500" /> Driver Details
                            </h4>
                            {driver ? (
                               <div className="flex items-start bg-gray-50 p-3 rounded-xl">
                                  <img src={driver.avatar} alt={driver.name} className="w-10 h-10 rounded-full mr-3 border border-gray-200" />
                                  <div>
                                     <p className="font-bold text-sm text-gray-900">{driver.name}</p>
                                     <p className="text-xs text-gray-500 flex items-center">
                                        <Phone size={10} className="mr-1" /> {driver.phone}
                                     </p>
                                     <p className="text-xs text-green-600 font-medium mt-1">Verified & Assigned</p>
                                  </div>
                               </div>
                            ) : (
                               <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex items-center text-yellow-700 text-sm">
                                  <AlertCircle size={16} className="mr-2" />
                                  {booking.status === BookingStatus.PENDING
                                     ? 'Waiting for driver assignment...'
                                     : 'Self-drive / No driver assigned'}
                               </div>
                            )}
                         </div>

                         {/* Actions */}
                         <div className="flex flex-col space-y-3 justify-center">
                            {isConfirmed && (
                               <button
                                 onClick={() => setTrackingVisible(prev => ({ ...prev, [booking.id]: !prev[booking.id] }))}
                                 className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                               >
                                  <Navigation size={16} className="mr-2" /> {trackingVisible[booking.id] ? 'Hide' : 'Track'} Location
                               </button>
                            )}
                            <button
                               onClick={() => generateInvoice(booking, car, driver)}
                               className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                            >
                               <Download size={16} className="mr-2" /> Download Invoice
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
                {trackingVisible[booking.id] && (
                  <TrackingComponent booking={booking} car={car} driver={driver} />
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
             <CarIcon size={48} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-lg font-bold text-gray-900">No bookings yet</h3>
             <p className="text-gray-500 mb-6">You haven't rented any cars yet.</p>
             <Link to="/rentals" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Browse Cars
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
