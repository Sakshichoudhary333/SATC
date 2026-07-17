import Truck from '../models/Truck.js';
import mongoose from 'mongoose';
import { getDistance } from '../utils/distanceCalculator.js';
import { calculateETA } from '../utils/etaCalculator.js';
import { emitLocationUpdated, emitGeofenceAlert } from '../sockets/socket.js';
import { logger } from '../utils/logger.js';
import { geocodeAddress } from '../utils/geocoder.js';


const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// ➤ Add Truck
export const addTruck = async (req, res) => {
  const { truckNumber, model, capacity, status, location } = req.body;
  const truck = await Truck.create({ truckNumber, model, capacity, status, location });
  res.status(201).json(truck);
};

// ➤ Get All Trucks
export const getTrucks = async (req, res) => {
  const trucks = await Truck.find().populate('driver');
  res.json(trucks);
};

// ➤ Get Single Truck (public — used for shareable live-track links)
export const getTruckById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid truck id' });
    }
    const truck = await Truck.findById(id).populate('driver', 'name');
    if (!truck) return res.status(404).json({ message: 'Truck not found' });
    res.json(truck);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ➤ Get Active Trip for a truck (public — used by shareable live-track page)
export const getTruckActiveTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId } = req.query;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid truck id' });
    }

    // Find the trip for this truck (by specific orderId if provided)
    const Trip = (await import('../models/Trip.js')).default;
    const query = { truck: id };
    if (orderId && isValidObjectId(orderId)) {
      query.order = orderId;
    }
    const trip = await Trip.findOne(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'order',
        select: 'pickupLocation destination status goodsDetails',
      })
      .populate('driver', 'name');

    if (!trip) return res.json(null);
    res.json(trip);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateTruckLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid truck id' });
    }

    const truck = await Truck.findById(id);
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    const nextLat = parseNumber(lat);
    const nextLng = parseNumber(lng);
    if (nextLat === null || nextLng === null) {
      return res.status(400).json({ message: 'lat and lng must be valid numbers' });
    }

    truck.location = { lat: nextLat, lng: nextLng };
    truck.lastUpdated = new Date();
    await truck.save();
    emitLocationUpdated({
      truckId: truck._id.toString(),
      lat: nextLat,
      lng: nextLng,
      lastUpdated: truck.lastUpdated,
    });

    // Geofencing Check (run asynchronously to avoid blocking the HTTP response)
    setImmediate(async () => {
      try {
        const Trip = (await import('../models/Trip.js')).default;
        const activeTrip = await Trip.findOne({ truck: id, status: { $ne: 'completed' } })
          .populate({
            path: 'order',
            select: 'destination pickupLocation',
          });

        if (activeTrip && activeTrip.order?.destination) {
          const destCoords = await geocodeAddress(activeTrip.order.destination);
          if (destCoords) {
            const distance = await getDistance(nextLat, nextLng, destCoords.lat, destCoords.lng);
            if (distance <= 2.0) { // 2 km threshold
              emitGeofenceAlert({
                truckId: truck._id.toString(),
                tripId: activeTrip._id.toString(),
                distance: Number(distance.toFixed(2)),
                destination: activeTrip.order.destination,
                message: `Truck is near destination: within ${distance.toFixed(2)} km`,
              });
            }
          }
        }
      } catch (err) {
        logger.error('Failed to run geofence check during location update', err);
      }
    });

    return res.json(truck);
  } catch (error) {
    logger.error('Failed to update truck location', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ➤ Get ETA for truck to destination coords
export const getTruckETA = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      logger.warn('Invalid truck id for ETA request', { truckId: id });
      return res.status(400).json({ message: 'Invalid truck id' });
    }

    const truck = await Truck.findById(id);
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    const destLat = parseNumber(req.query.destLat);
    const destLng = parseNumber(req.query.destLng);
    if (destLat === null || destLng === null) {
      logger.warn('Invalid destination coordinates for ETA request', { query: req.query });
      return res.status(400).json({ message: 'destLat and destLng must be valid numbers' });
    }

    const truckLat = parseNumber(truck.location?.lat);
    const truckLng = parseNumber(truck.location?.lng);
    if (truckLat === null || truckLng === null) {
      return res.status(422).json({ message: 'Truck location is not available' });
    }

    const distance = await getDistance(truckLat, truckLng, destLat, destLng);
    const eta = calculateETA(distance);

    logger.info('Calculated truck ETA', {
      truckId: id,
      truckLocation: truck.location,
      destination: { lat: destLat, lng: destLng },
      distanceKm: Number(distance.toFixed(2)),
      eta,
    });

    return res.json({
      distance: Number(distance.toFixed(2)),
      eta,
      truckLocation: truck.location,
    });
  } catch (error) {
    logger.error('Failed to calculate truck ETA', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
