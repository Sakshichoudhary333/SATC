import { logger } from './logger.js';

const cache = new Map();

export const geocodeAddress = async (address) => {
  if (!address) return null;
  const cleanAddress = address.trim();

  // Return cached coordinates if available
  if (cache.has(cleanAddress)) {
    return cache.get(cleanAddress);
  }

  try {
    let queryAddr = cleanAddress;
    if (!queryAddr.toLowerCase().includes('india')) {
      queryAddr += ', India';
    }

    logger.info('Geocoding address from Nominatim', { address: queryAddr });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddr)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'SATC-Truck-Management-System/1.0',
        },
      }
    );

    const data = await response.json();
    const first = data?.[0];

    if (!first) {
      cache.set(cleanAddress, null); // cache negative result
      return null;
    }

    const coords = {
      lat: Number.parseFloat(first.lat),
      lng: Number.parseFloat(first.lon),
    };

    cache.set(cleanAddress, coords);
    logger.info('Geocoding success', { address: cleanAddress, coords });
    return coords;
  } catch (error) {
    logger.error('Geocoding failed', { address, error: error.message });
    return null;
  }
};
