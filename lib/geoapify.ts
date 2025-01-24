import { UserFormData } from "@/components/user-form-modal";

interface GeoapifyFeature {
  properties: {
    lat: number;
    lon: number;
    timezone: {
      offset_STD: string;
      offset_STD_seconds: number;
    };
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

export async function getLocationCoordinates(location: string): Promise<{
  latitude: number;
  longitude: number;
  timezone: number;
}> {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        location
      )}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
    );
    
    const data: GeoapifyResponse = await response.json();
    
    if (!data.features?.[0]) {
      throw new Error('Location not found');
    }

    // Get the first result (most relevant)
    const feature = data.features[0];
    const { lat, lon, timezone } = feature.properties;
    
    // Convert timezone offset from seconds to hours
    const timezoneOffset = timezone.offset_STD_seconds / 3600;
    
    return {
      latitude: lat,
      longitude: lon,
      timezone: timezoneOffset,
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    throw error;
  }
}