import { supabase } from '../lib/supabase';
import { Booking, Car, Driver, User } from '../types';
import { NotificationService } from './notificationService';

export class BookingService {
  // Create rental booking
  static async createRentalBooking(booking: Omit<Booking, 'id'>): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('rental_bookings')
        .insert({
          user_id: booking.userId,
          car_id: booking.carId,
          start_date: booking.startDate,
          end_date: booking.endDate,
          total_price: booking.totalCost,
          payment_status: 'PENDING',
          driver_assigned: booking.driverId || null
        })
        .select()
        .single();

      if (error) throw error;

      const newBooking: Booking = {
        id: data.id,
        userId: data.user_id,
        carId: data.car_id,
        driverId: data.driver_assigned,
        type: 'RENTAL',
        startDate: data.start_date,
        endDate: data.end_date,
        totalCost: data.total_price,
        status: data.status,
        location: data.location,
        notes: data.notes
      };

      // Send notification
      await NotificationService.notifyBookingEvent(booking.userId, 'confirmed', newBooking);

      return newBooking;
    } catch (error) {
      console.error('Failed to create rental booking:', error);
      return null;
    }
  }

  // Create service booking
  static async createServiceBooking(booking: Omit<Booking, 'id'>): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .insert({
          user_id: booking.userId,
          car_number: booking.carId, // Assuming carId is used as car number
          service_type: booking.serviceId,
          status: booking.status,
          date: booking.startDate
        })
        .select()
        .single();

      if (error) throw error;

      const newBooking: Booking = {
        id: data.id,
        userId: data.user_id,
        serviceId: data.service_type,
        carId: data.car_number,
        type: 'SERVICE',
        startDate: data.date,
        totalCost: booking.totalCost,
        status: data.status
      };

      // Send notification
      await NotificationService.notifyBookingEvent(booking.userId, 'service booked', newBooking);

      return newBooking;
    } catch (error) {
      console.error('Failed to create service booking:', error);
      return null;
    }
  }

  // Get user bookings
  static async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      // Get rental bookings
      const { data: rentalData, error: rentalError } = await supabase
        .from('rental_bookings')
        .select('*')
        .eq('user_id', userId);

      if (rentalError) throw rentalError;

      // Get service bookings
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_bookings')
        .select('*')
        .eq('user_id', userId);

      if (serviceError) throw serviceError;

      const rentalBookings: Booking[] = rentalData.map(item => ({
        id: item.id,
        userId: item.user_id,
        carId: item.car_id,
        driverId: item.driver_assigned,
        type: 'RENTAL',
        startDate: item.start_date,
        endDate: item.end_date,
        totalCost: item.total_price,
        status: item.status,
        location: item.location,
        notes: item.notes
      }));

      const serviceBookings: Booking[] = serviceData.map(item => ({
        id: item.id,
        userId: item.user_id,
        serviceId: item.service_type,
        carId: item.car_number,
        type: 'SERVICE',
        startDate: item.date,
        totalCost: item.total_price || 0,
        status: item.status
      }));

      return [...rentalBookings, ...serviceBookings];
    } catch (error) {
      console.error('Failed to get user bookings:', error);
      return [];
    }
  }

  // Update booking status
  static async updateBookingStatus(bookingId: string, status: string, type: 'RENTAL' | 'SERVICE'): Promise<void> {
    try {
      const table = type === 'RENTAL' ? 'rental_bookings' : 'service_bookings';
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Send notification based on status
      if (status === 'COMPLETED') {
        // Get booking details to notify user
        const booking = await this.getBookingById(bookingId, type);
        if (booking) {
          await NotificationService.notifyBookingEvent(booking.userId, 'completed', booking);
        }
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  }

  // Get booking by ID
  static async getBookingById(bookingId: string, type: 'RENTAL' | 'SERVICE'): Promise<Booking | null> {
    try {
      const table = type === 'RENTAL' ? 'rental_bookings' : 'service_bookings';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;

      if (type === 'RENTAL') {
        return {
          id: data.id,
          userId: data.user_id,
          carId: data.car_id,
          driverId: data.driver_assigned,
          type: 'RENTAL',
          startDate: data.start_date,
          endDate: data.end_date,
          totalCost: data.total_price,
          status: data.status,
          location: data.location,
          notes: data.notes
        };
      } else {
        return {
          id: data.id,
          userId: data.user_id,
          serviceId: data.service_type,
          carId: data.car_number,
          type: 'SERVICE',
          startDate: data.date,
          totalCost: data.total_price || 0,
          status: data.status
        };
      }
    } catch (error) {
      console.error('Failed to get booking:', error);
      return null;
    }
  }
}
