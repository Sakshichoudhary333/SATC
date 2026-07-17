import { logger } from './logger.js';

// Clear cache on startup to ensure fresh geocoding data
const cache = new Map();

// Clear problematic cached entries to force fresh geocoding
const problematicAddresses = ['Shahpura', 'Shahpura, India'];
problematicAddresses.forEach(addr => cache.delete(addr));

// Export cache clearing function for manual cache invalidation
export const clearGeocodeCache = () => {
  cache.clear();
  logger.info('Geocode cache cleared');
};

export const geocodeAddress = async (address) => {
  if (!address) return null;
  const cleanAddress = address.trim();

  // Return cached coordinates if available
  if (cache.has(cleanAddress)) {
    const cached = cache.get(cleanAddress);
    // If cached result is null (failed geocode), try again with new logic
    if (cached === null) {
      cache.delete(cleanAddress);
    } else {
      return cached;
    }
  }

  try {
    // Try multiple query strategies for better accuracy with ambiguous locations
    const queryStrategies = [
      cleanAddress, // Original address
      cleanAddress.includes(', India') ? cleanAddress : `${cleanAddress}, India`, // With country
    ];

    // For Indian locations, try with state context if address contains common Indian city names
    const indianStates = ['Rajasthan', 'Maharashtra', 'Madhya Pradesh', 'Gujarat', 'Uttar Pradesh', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Punjab', 'Haryana', 'Bihar', 'West Bengal', 'Odisha', 'Assam'];
    
    // If address doesn't contain a state, try adding common states for better disambiguation
    if (!indianStates.some(state => cleanAddress.toLowerCase().includes(state.toLowerCase()))) {
      // For Rajasthan context (common for Jaipur area)
      queryStrategies.push(`${cleanAddress}, Rajasthan, India`);
      queryStrategies.push(`${cleanAddress}, Rajasthan`);
    }

    logger.info('Geocoding address from Nominatim', { address: cleanAddress, strategies: queryStrategies });

    for (const queryAddr of queryStrategies) {
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

      if (first) {
        const coords = {
          lat: Number.parseFloat(first.lat),
          lng: Number.parseFloat(first.lon),
        };

        cache.set(cleanAddress, coords);
        logger.info('Geocoding success', { address: cleanAddress, query: queryAddr, coords });
        return coords;
      }
    }

    // All strategies failed
    cache.set(cleanAddress, null);
    logger.warn('Geocoding failed for all strategies', { address: cleanAddress });
    return null;
  } catch (error) {
    logger.error('Geocoding failed', { address, error: error.message });
    return null;
  }
};
