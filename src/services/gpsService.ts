import { supabase } from '../lib/supabase';
import { GPSLocation } from '../types';

export class GPSService {
  // Update car location
  static async updateLocation(carId: string, latitude: number, longitude: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('gps')
        .insert({
          car_id: carId,
          latitude,
          longitude,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update GPS location:', error);
    }
  }

  // Get current location of a car
  static async getCurrentLocation(carId: string): Promise<GPSLocation | null> {
    try {
      const { data, error } = await supabase
        .from('gps')
        .select('*')
        .eq('car_id', carId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data ? {
        carId: data.car_id,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp
      } : null;
    } catch (error) {
      console.error('Failed to get GPS location:', error);
      return null;
    }
  }

  // Get location history for a car
  static async getLocationHistory(carId: string, limit: number = 100): Promise<GPSLocation[]> {
    try {
      const { data, error } = await supabase
        .from('gps')
        .select('*')
        .eq('car_id', carId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.map(item => ({
        carId: item.car_id,
        latitude: item.latitude,
        longitude: item.longitude,
        timestamp: item.timestamp
      }));
    } catch (error) {
      console.error('Failed to get GPS history:', error);
      return [];
    }
  }

  // Simulate GPS tracking (for demo purposes)
  static startTracking(carId: string, intervalMs: number = 30000): () => void {
    const interval = setInterval(() => {
      // Generate random location updates around a base location
      const baseLat = 37.7749;
      const baseLng = -122.4194;
      const lat = baseLat + (Math.random() - 0.5) * 0.01;
      const lng = baseLng + (Math.random() - 0.5) * 0.01;

      this.updateLocation(carId, lat, lng);
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(interval);
  }
}
