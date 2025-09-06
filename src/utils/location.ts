export interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export class LocationService {
  static getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute cache
        }
      );
    });
  }

  // Convert coordinates to address (optional - can be enhanced later)
  static async getAddressFromCoords(
    latitude: number, 
    longitude: number
  ): Promise<string> {
    try {
      // Using OpenStreetMap Nominatim API (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      return data.display_name || `${latitude}, ${longitude}`;
    } catch (error) {
      console.error('Geocoding error:', error);
      return `${latitude}, ${longitude}`;
    }
  }
}
