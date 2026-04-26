import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Trip from '../models/Trip.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const ORDER_STATUS_BY_TRIP = {
  started: 'assigned',
  'in-transit': 'in-transit',
  completed: 'completed',
};

const attachTracking = async (orderDoc) => {
  if (!orderDoc) return null;

  const trip = await Trip.findOne({ order: orderDoc._id })
    .populate('truck', 'truckNumber model capacity location lastUpdated isAvailable')
    .populate('driver', 'name mobile email licenseNumber experience');

  const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
  return {
    ...order,
    trip: trip ? (trip.toObject ? trip.toObject() : trip) : null,
    trackingStatus: trip?.status || order.status,
  };
};

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { pickupLocation, destination, goodsDetails } = req.body;

    const order = await Order.create({
      customer: req.user.id,
      pickupLocation,
      destination,
      goodsDetails,
    });

    const trackedOrder = await attachTracking(
      await Order.findById(order._id)
        .populate('driver', 'name mobile email licenseNumber experience')
        .populate('truck', 'truckNumber model capacity location lastUpdated isAvailable')
    );

    res.status(201).json(trackedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('driver', 'name mobile email licenseNumber experience')
      .populate('truck', 'truckNumber model capacity location lastUpdated isAvailable');

    const tracked = await Promise.all(orders.map((order) => attachTracking(order)));
    res.json(tracked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findOne({ _id: id, customer: req.user.id })
      .populate('driver', 'name mobile email licenseNumber experience')
      .populate('truck', 'truckNumber model capacity location lastUpdated isAvailable');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(await attachTracking(order));
  } catch (error) {
    console.error('[getOrderById] error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const allowedStatuses = ['pending', 'approved', 'rejected', 'assigned', 'in-transit', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findOne({ _id: id, customer: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updated = await order.save();

    if (updated.truck && updated.driver) {
      const trip = await Trip.findOne({ order: updated._id });
      if (trip && ORDER_STATUS_BY_TRIP[status]) {
        trip.status = status === 'approved' || status === 'assigned' ? trip.status : ORDER_STATUS_BY_TRIP[status];
        await trip.save();
      }
    }

    const populated = await updated.populate([
      { path: 'driver', select: 'name mobile email licenseNumber experience' },
      { path: 'truck', select: 'truckNumber model capacity location lastUpdated isAvailable' },
    ]);

    return res.json(await attachTracking(populated));
  } catch (error) {
    console.error('[updateOrderStatus] error:', error);
    return res.status(500).json({ message: error.message });
  }
};
