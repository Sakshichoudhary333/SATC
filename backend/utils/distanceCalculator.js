export const getDistance = async (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius (km)

  // Try fetching actual road distance from OSRM driving route API if fetch is available
  if (typeof fetch === 'function') {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
      );
      const data = await response.json();
      if (data?.routes?.[0]?.distance !== undefined) {
        return data.routes[0].distance / 1000; // convert meters to km
      }
    } catch (error) {
      console.log('OSRM route fetch failed, falling back to Haversine with circuity factor');
    }
  }

  // Fallback: Haversine formula (straight-line distance) * 1.25 circuity factor for road distance
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1.25;
};