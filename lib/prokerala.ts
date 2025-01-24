import { format } from 'date-fns';

export interface KundaliData {
  ascendant: string;
  planets: {
    name: string;
    position: string;
    house: number;
  }[];
  houses: {
    number: number;
    sign: string;
    planets: string[];
  }[];
}

export async function getKundaliData(userData: {
  dateOfBirth: Date;
  timeOfBirth: string;
  birthLocation: string;
}): Promise<KundaliData> {
  const { dateOfBirth, timeOfBirth, birthLocation } = userData;
  
  // Format date and time for ProKerala API
  const formattedDate = format(dateOfBirth, 'yyyy-MM-dd');
  
  try {
    // Replace with actual ProKerala API call
    const response = await fetch('https://api.prokerala.com/v2/astrology/birth-chart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PROKERALA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        datetime: `${formattedDate}T${timeOfBirth}`,
        location: birthLocation,
      }),
    });

    const data = await response.json();
    return transformKundaliData(data);
  } catch (error) {
    console.error('Error fetching Kundali data:', error);
    throw error;
  }
}

function transformKundaliData(data: any): KundaliData {
  // Transform ProKerala API response to our KundaliData format
  // This is a placeholder implementation
  return {
    ascendant: data.ascendant || 'Aries',
    planets: data.planets?.map((p: any) => ({
      name: p.name,
      position: p.position,
      house: p.house,
    })) || [],
    houses: data.houses?.map((h: any) => ({
      number: h.number,
      sign: h.sign,
      planets: h.planets || [],
    })) || [],
  };
}