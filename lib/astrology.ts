import { UserFormData } from "@/components/user-form-modal";
import { getLocationCoordinates } from "./geoapify";

// Zodiac signs mapping
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Houses meanings
const HOUSE_MEANINGS = [
  "Self/Personality", // 1st house
  "Wealth/Values", // 2nd house
  "Communication/Siblings", // 3rd house
  "Home/Mother", // 4th house
  "Creativity/Children", // 5th house
  "Health/Service", // 6th house
  "Relationships/Marriage", // 7th house
  "Transformation/Occult", // 8th house
  "Higher Learning/Fortune", // 9th house
  "Career/Status", // 10th house
  "Gains/Aspirations", // 11th house
  "Spirituality/Loss" // 12th house
];

export interface PlanetData {
  name: string;
  sign: string;
  house: number;
  degree: number;
  isRetrograde: boolean;
}

export interface AstrologyData {
  ascendant: {
    sign: string;
    degree: number;
  };
  planets: PlanetData[];
}

function getHouseFromDegree(totalDegree: number, ascendantDegree: number): number {
  // Calculate house number (1-12) based on degree and ascendant
  const relativeDegree = (totalDegree - ascendantDegree + 360) % 360;
  return Math.floor(relativeDegree / 30) + 1;
}

function formatAstrologyData(apiData: any): AstrologyData {
  const ascendantData = apiData.output[1].Ascendant;
  const ascendantDegree = ascendantData.fullDegree;

  // Format planets data
  const planets = Object.entries(apiData.output[1])
    .filter(([name]) => !['ayanamsa', 'Ascendant'].includes(name))
    .map(([name, data]: [string, any]) => ({
      name,
      sign: ZODIAC_SIGNS[data.current_sign - 1],
      house: getHouseFromDegree(data.fullDegree, ascendantDegree),
      degree: data.normDegree,
      isRetrograde: data.isRetro === "true"
    }));

  return {
    ascendant: {
      sign: ZODIAC_SIGNS[ascendantData.current_sign - 1],
      degree: ascendantData.normDegree
    },
    planets
  };
}

function formatAstrologyReport(data: AstrologyData): string {
  const { ascendant, planets } = data;
  
  let report = `Birth Chart Analysis:

1. Ascendant (Rising Sign):
   ${ascendant.sign} at ${ascendant.degree.toFixed(2)}°
   This represents your outer personality and approach to life.

2. Planetary Positions:`;

  // Group planets by house for better readability
  const planetsByHouse = planets.reduce((acc: Record<number, PlanetData[]>, planet) => {
    if (!acc[planet.house]) {
      acc[planet.house] = [];
    }
    acc[planet.house].push(planet);
    return acc;
  }, {});

  // Add house-wise planet positions
  for (let house = 1; house <= 12; house++) {
    const planetsInHouse = planetsByHouse[house] || [];
    if (planetsInHouse.length > 0) {
      report += `\n\n   House ${house} (${HOUSE_MEANINGS[house - 1]}):
      ${planetsInHouse.map(p => 
        `${p.name} in ${p.sign} at ${p.degree.toFixed(2)}°${p.isRetrograde ? ' (R)' : ''}`
      ).join('\n      ')}`;
    }
  }
  // Add retrograde planets section if any
  const retrogradePlanets = planets.filter(p => p.isRetrograde);
  if (retrogradePlanets.length > 0) {
    report += "\n\n3. Retrograde Planets:";
    retrogradePlanets.forEach(planet => {
      report += `\n   ${planet.name} in ${planet.sign}`;
    });
  }

  return report;
}

export async function getAstrologyData(userData: UserFormData): Promise<{
  raw: AstrologyData;
  formatted: string;
}> {
  try {
    // Get coordinates and timezone from location
    const { latitude, longitude, timezone } = await getLocationCoordinates(userData.birthLocation);
    
    // Parse birth date and time
    const birthDate = new Date(userData.dateOfBirth);
    const [hours, minutes] = userData.timeOfBirth.split(':').map(Number);
    
    const response = await fetch('https://json.freeastrologyapi.com/planets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_FREE_ASTROLOGY_API_KEY || '',
      },
      body: JSON.stringify({
        year: birthDate.getFullYear(),
        month: birthDate.getMonth() + 1,
        date: birthDate.getDate(),
        hours,
        minutes,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        settings: {
          observation_point: "topocentric",
          ayanamsha: "lahiri"
        }
      }),
    });

    const data = await response.json();
    
    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch astrological data');
    }

    const formattedData = formatAstrologyData(data);
    const report = formatAstrologyReport(formattedData);

    return {
      raw: formattedData,
      formatted: report
    };
  } catch (error) {
    console.error('Error fetching astrological data:', error);
    throw error;
  }
}