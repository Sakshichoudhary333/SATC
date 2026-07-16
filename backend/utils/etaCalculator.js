export const calculateETA = (distanceKm, speedKmPerHr = 65) => {
    if (!distanceKm) return { hours: 0, minutes: 0 };
  
    const time = distanceKm / speedKmPerHr;
  
    return {
      hours: Math.floor(time),
      minutes: Math.round((time - Math.floor(time)) * 60),
    };
  };