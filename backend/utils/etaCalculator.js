export const calculateETA = (distanceKm, speedKmPerHr = 40) => {
    if (!distanceKm) return 0;
  
    const time = distanceKm / speedKmPerHr;
  
    return {
      hours: Math.floor(time),
      minutes: Math.round((time - Math.floor(time)) * 60),
    };
  };