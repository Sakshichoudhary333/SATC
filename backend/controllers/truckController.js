import Truck from '../models/Truck.js';
import mongoose from 'mongoose';
import { getDistance } from '../utils/distanceCalculator.js';
import { calculateETA } from '../utils/etaCalculator.js';
import { emitLocationUpdated } from '../sockets/socket.js';

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

// ➤ Update Truck Location
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
    console.error('[updateTruckLocation] error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ➤ Get ETA for truck to destination coords
export const getTruckETA = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      console.warn('[getTruckETA] invalid truck id:', id);
      return res.status(400).json({ message: 'Invalid truck id' });
    }

    const truck = await Truck.findById(id);
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    const destLat = parseNumber(req.query.destLat);
    const destLng = parseNumber(req.query.destLng);
    if (destLat === null || destLng === null) {
      console.warn('[getTruckETA] invalid destination coords:', req.query);
      return res.status(400).json({ message: 'destLat and destLng must be valid numbers' });
    }

    const truckLat = parseNumber(truck.location?.lat);
    const truckLng = parseNumber(truck.location?.lng);
    if (truckLat === null || truckLng === null) {
      return res.status(422).json({ message: 'Truck location is not available' });
    }

    const distance = getDistance(truckLat, truckLng, destLat, destLng);
    const eta = calculateETA(distance);

    console.log('[getTruckETA] success:', {
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
    console.error('[getTruckETA] error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
