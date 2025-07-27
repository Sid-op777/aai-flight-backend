import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Get the API key from environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Internal URLs for our own services
const AIRPORT_SERVICE_URL = 'http://airport-service-svc/api/airports';

// --- Interfaces for Type Safety ---
interface Airport {
  iata_code: string;
  name: string;
  city: string;
  country: string;
  latitude: number; // We need to add this to our Airport Service!
  longitude: number;// We need to add this to our Airport Service!
}

interface WeatherResponse {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  main: { temp: number; feels_like: number; temp_min: number; temp_max: number; pressure: number; humidity: number; };
  wind: { speed: number; deg: number; };
  sys: { country: string; sunrise: number; sunset: number; };
  name: string;
}
// ------------------------------------

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Weather Service' });
});

app.get('/api/weather/:iataCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { iataCode } = req.params;

    if (!OPENWEATHER_API_KEY) {
      throw new Error("OpenWeatherMap API key is not configured.");
    }
    
    // --- Step 1: Get airport coordinates from our Airport Service ---
    let airportData: Airport;
    try {
      // We will need to create this endpoint in the Airport Service
      const response = await axios.get<Airport>(`${AIRPORT_SERVICE_URL}/${iataCode}`);
      airportData = response.data;
    } catch (error) {
      console.error('Error fetching airport data:', error);
      return res.status(404).json({ message: `Airport with IATA code ${iataCode} not found.` });
    }

    const { latitude, longitude } = airportData;

    // --- Step 2: Get weather data from OpenWeatherMap ---
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const weatherResponse = await axios.get<WeatherResponse>(weatherApiUrl);
    
    // --- Step 3: Return a simplified, formatted response ---
    const formattedResponse = {
      airport: {
        iata: airportData.iata_code,
        name: airportData.name,
        city: airportData.city,
      },
      weather: {
        main: weatherResponse.data.weather[0]?.main,
        description: weatherResponse.data.weather[0]?.description,
        icon_url: `https://openweathermap.org/img/wn/${weatherResponse.data.weather[0]?.icon}@2x.png`,
      },
      temperature: {
        current: `${weatherResponse.data.main.temp}°C`,
        feels_like: `${weatherResponse.data.main.feels_like}°C`,
      },
      wind: {
        speed_kph: (weatherResponse.data.wind.speed * 3.6).toFixed(2), // m/s to km/h
        direction: weatherResponse.data.wind.deg,
      },
      humidity: `${weatherResponse.data.main.humidity}%`,
    };

    res.json(formattedResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching weather data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Weather Service listening on port ${PORT}`);
});