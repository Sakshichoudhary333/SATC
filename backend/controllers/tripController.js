import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Truck from '../models/Truck.js';
import { emitTripStatusUpdated } from '../sockets/socket.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const ORDER_STATUS_BY_TRIP = {
  started: 'assigned',
  'in-transit': 'in-transit',
  completed: 'completed',
};

// ➤ Create Trip
export const createTrip = async (req, res) => {
  const { order, truck, driver } = req.body;

  if (!order || !truck || !driver) {
    return res.status(400).json({ message: 'order, truck and driver are required' });
  }

  if (!isValidObjectId(order) || !isValidObjectId(truck) || !isValidObjectId(driver)) {
    return res.status(400).json({ message: 'order, truck and driver must be valid ObjectIds' });
  }

  const existingTrip = await Trip.findOne({ order });
  if (existingTrip) {
    return res.status(400).json({ message: 'Trip already exists for this order' });
  }

  const orderDoc = await Order.findById(order);
  if (!orderDoc) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!['approved', 'assigned'].includes(orderDoc.status)) {
    return res.status(400).json({ message: 'Order must be approved before creating a trip' });
  }

  const truckDoc = await Truck.findById(truck).populate('driver');
  if (!truckDoc) {
    return res.status(404).json({ message: 'Truck not found' });
  }

  if (truckDoc.status === 'maintenance') {
    return res.status(400).json({ message: 'Truck is under maintenance' });
  }

  const driverDoc = await User.findById(driver);
  if (!driverDoc || driverDoc.role !== 'driver') {
    return res.status(404).json({ message: 'Driver not found' });
  }

  if (driverDoc.driverStatus === 'inactive') {
    return res.status(400).json({ message: 'Driver is inactive' });
  }

  const driverTruck = await Truck.findOne({ driver });
  if (driverTruck && driverTruck._id.toString() !== truckDoc._id.toString()) {
    return res.status(400).json({ message: 'Driver is already assigned to another truck' });
  }

  if (truckDoc.driver && truckDoc.driver._id.toString() !== driver.toString()) {
    return res.status(400).json({ message: 'Truck is already assigned to another driver' });
  }

  truckDoc.driver = driver;
  truckDoc.isAvailable = false;
  await truckDoc.save();

  orderDoc.truck = truckDoc._id;
  orderDoc.driver = driver;
  orderDoc.status = 'assigned';
  await orderDoc.save();

  const trip = await Trip.create({
    order,
    truck,
    driver,
    status: 'started',
  });

  emitTripStatusUpdated({
    tripId: trip._id.toString(),
    orderId: orderDoc._id.toString(),
    status: trip.status,
  });

  const populatedTrip = await Trip.findById(trip._id)
    .populate('order')
    .populate('truck')
    .populate('driver');

  res.status(201).json(populatedTrip);
};

// ➤ Update Trip Status
export const updateTripStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const allowedStatuses = ['started', 'in-transit', 'completed'];

  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid trip id' });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid trip status' });
  }

  const trip = await Trip.findById(id);
  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  trip.status = status;
  await trip.save();

  if (trip.order) {
    await Order.findByIdAndUpdate(trip.order, {
      status: ORDER_STATUS_BY_TRIP[status] || 'assigned',
    });
  }

  emitTripStatusUpdated({
    tripId: trip._id.toString(),
    orderId: trip.order?.toString?.() || trip.order,
    status,
  });

  res.json(trip);
};

// ➤ Get Trips
export const getTrips = async (req, res) => {
  const query = req.user?.role === 'driver'
    ? { driver: req.user.id }
    : req.user?.role === 'customer'
      ? { order: { $exists: true } }
      : {};

  const trips = await Trip.find(query)
    .populate('order')
    .populate('truck')
    .populate('driver');

  res.json(trips);
};
