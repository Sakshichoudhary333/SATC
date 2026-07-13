import Truck from '../models/Truck.js';
import mongoose from 'mongoose';
import { getDistance } from '../utils/distanceCalculator.js';
import { calculateETA } from '../utils/etaCalculator.js';
import { emitLocationUpdated } from '../sockets/socket.js';
import { logger } from '../utils/logger.js';

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
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid truck id' });
    }

    // Find the most recent non-completed trip for this truck
    const Trip = (await import('../models/Trip.js')).default;
    const trip = await Trip.findOne({ truck: id })
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

    const distance = getDistance(truckLat, truckLng, destLat, destLng);
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
