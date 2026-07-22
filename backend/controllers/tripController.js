import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Billing from '../models/Billing.js';
import Truck from '../models/Truck.js';
import { emitTripStatusUpdated } from '../sockets/socket.js';
import { logger } from '../utils/logger.js';
import sendEmail from '../utils/sendEmail.js';
import PDFDocument from 'pdfkit';
import generateOTP from '../utils/generateOTP.js';

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

  const orderDoc = await Order.findById(order).populate('customer');
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

  // Block if driver has an active (non-completed) trip
  const activeTrip = await Trip.findOne({ driver, status: { $in: ['started', 'in-transit'] } });
  if (activeTrip) {
    return res.status(400).json({
      message: 'Driver has an active trip in progress. Complete it before assigning a new one.',
    });
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

  const tripWithRelations = await Trip.findById(trip._id)
    .populate({
      path: 'order',
      populate: { path: 'customer', select: 'name' },
    })
    .populate('truck')
    .populate('driver', 'name');

  const customerName = tripWithRelations?.order?.customer?.name || tripWithRelations?.order?.customerName || 'Customer';

  const existingBill = await Billing.findOne({
    tripId: trip._id.toString(),
    billType: 'customer_advance',
  });

  if (!existingBill) {
    const newBill = await Billing.create({
      billType: 'customer_advance',
      partyRole: 'customer',
      partyName: customerName,
      customerName,
      tripId: trip._id.toString(),
      orderId: tripWithRelations?.order?._id?.toString(),
      amount: 5000,
      paymentStatus: 'Pending',
      notes: `Advance payment for trip ${trip._id.toString().slice(-6)}`,
    });

    logger.info('Advance bill created for trip', {
      billId: newBill._id.toString(),
      tripId: trip._id.toString(),
    });
  } else {
    logger.info('Advance bill already exists for trip', {
      tripId: trip._id.toString(),
    });
  }

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

  const trip = await Trip.findById(id).select('+deliveryOtp +deliveryOtpExpiry').populate('order');
  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  // Completed trips are read-only — status cannot be changed
  if (trip.status === 'completed') {
    return res.status(403).json({ message: 'Completed trips cannot be modified' });
  }

  if (status === 'completed') {
    const { otp } = req.body;
    if (!otp) {
      const generatedOtp = generateOTP();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      trip.deliveryOtp = generatedOtp;
      trip.deliveryOtpExpiry = expiry;
      await trip.save();

      const orderId = trip.order?._id || trip.order;
      const populatedOrder = await Order.findById(orderId).populate('customer');
      if (populatedOrder && populatedOrder.customer?.email) {
        const customerEmail = populatedOrder.customer.email;

        console.log(`\n${"─".repeat(48)}`);
        console.log(`  🔑  Delivery OTP  : ${generatedOtp}`);
        console.log(`  📧  For Customer   : ${customerEmail}`);
        console.log(`  ✈️   Trip ID        : ${trip._id.toString()}`);
        console.log(`${"─".repeat(48)}\n`);

        sendEmail(
          customerEmail,
          "Delivery Verification OTP - SATC Logistics",
          `Hello ${populatedOrder.customer.name || 'Customer'},\n\nYour driver is ready to complete your shipment delivery (Order ID: ${orderId.toString()}).\n\nPlease share the following One-Time Password (OTP) with the driver to verify and complete the delivery:\n\nOTP: ${generatedOtp}\n\nValid for 10 minutes.\n\nThank you for choosing SATC Logistics!`
        ).catch((err) => logger.error("Failed to send delivery OTP email", err));
      }

      return res.status(200).json({
        otpRequired: true,
        message: "An OTP has been sent to the customer's email. Please enter it to complete the trip."
      });
    } else {
      if (!trip.deliveryOtp || !trip.deliveryOtpExpiry || trip.deliveryOtpExpiry < new Date()) {
        return res.status(400).json({ message: 'OTP expired or not requested. Please request a new OTP.' });
      }

      if (trip.deliveryOtp !== String(otp).trim()) {
        return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
      }

      // Valid OTP, clear it
      trip.deliveryOtp = null;
      trip.deliveryOtpExpiry = null;
    }
  }

  trip.status = status;
  await trip.save();

  if (trip.order) {
    await Order.findByIdAndUpdate(trip.order._id, {
      status: ORDER_STATUS_BY_TRIP[status] || 'assigned',
    });
  }

  if (status === 'completed') {
    logger.info('Trip completed', { tripId: trip._id.toString() });

    // Free up the truck when trip is done
    await Truck.findByIdAndUpdate(trip.truck, { driver: null, isAvailable: true });

    // Send delivery success confirmation email to the customer with PDF receipt attachment
    const orderId = trip.order?._id || trip.order;
    const populatedOrder = await Order.findById(orderId).populate('customer');
    if (populatedOrder && populatedOrder.customer?.email) {
      const emailSubject = `ORDER DELIVERED SUCCESSFULLY`;
      const emailText = `Your shipment has been verified and safely delivered. A confirmation receipt has been sent to your email. Thank you for choosing SATC Logistics!`;
      
      const bill = await Billing.findOne({ tripId: trip._id.toString() }) || {
        _id: 'N/A',
        createdAt: new Date(),
        partyName: populatedOrder.customer?.name || 'Customer',
        partyRole: 'customer',
        billType: 'customer_advance',
        notes: `Delivery invoice for Order #${populatedOrder._id.toString().slice(-6)}`,
        amount: populatedOrder.price || 5000,
        paymentStatus: 'Paid',
      };

      try {
        const pdfBuffer = await generateInvoiceBuffer(bill);
        const attachments = [
          {
            filename: `invoice-${bill._id.toString()}.pdf`,
            content: pdfBuffer,
          }
        ];

        sendEmail(populatedOrder.customer.email, emailSubject, emailText, attachments)
          .catch((err) => logger.error('Failed to send delivery success email with attachment', err));
      } catch (pdfErr) {
        logger.error('Failed to generate PDF attachment for email', pdfErr);
        sendEmail(populatedOrder.customer.email, emailSubject, emailText)
          .catch((err) => logger.error('Failed to send fallback success email', err));
      }
    }
  }

  emitTripStatusUpdated({
    tripId: trip._id.toString(),
    orderId: trip.order?._id?.toString() || trip.order,
    status,
  });

  res.json(trip);
};

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

// ➤ Update Trip Details (Admin, only when status === 'started')
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { truck, driver } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.status !== 'started') {
      return res.status(403).json({ message: 'Trip details can only be edited before the trip starts moving' });
    }

    if (truck && truck !== trip.truck?.toString()) {
      if (!isValidObjectId(truck)) return res.status(400).json({ message: 'Invalid truck id' });
      const truckDoc = await Truck.findById(truck);
      if (!truckDoc) return res.status(404).json({ message: 'Truck not found' });
      if (truckDoc.status === 'maintenance') return res.status(400).json({ message: 'Truck is under maintenance' });

      // Free old truck
      await Truck.findByIdAndUpdate(trip.truck, { driver: null, isAvailable: true });
      truckDoc.isAvailable = false;
      truckDoc.driver = driver || trip.driver;
      await truckDoc.save();
      trip.truck = truck;
    }

    if (driver && driver !== trip.driver?.toString()) {
      if (!isValidObjectId(driver)) return res.status(400).json({ message: 'Invalid driver id' });
      const driverDoc = await User.findById(driver);
      if (!driverDoc || driverDoc.role !== 'driver') return res.status(404).json({ message: 'Driver not found' });
      if (driverDoc.driverStatus === 'inactive') return res.status(400).json({ message: 'Driver is inactive' });

      // Check new driver has no active trip
      const activeTrip = await Trip.findOne({ driver, status: { $in: ['started', 'in-transit'] }, _id: { $ne: id } });
      if (activeTrip) return res.status(400).json({ message: 'Driver already has an active trip' });

      trip.driver = driver;
      // Update truck's driver reference too
      await Truck.findByIdAndUpdate(trip.truck, { driver });
    }

    // Sync order assignment
    await Order.findByIdAndUpdate(trip.order, {
      truck: trip.truck,
      driver: trip.driver,
    });

    await trip.save();

    const updated = await Trip.findById(trip._id)
      .populate('order')
      .populate('truck')
      .populate('driver');

    res.json({ message: 'Trip updated successfully', trip: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Cancel Trip (Admin only)
export const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    const trip = await Trip.findById(id).populate('order');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.status === 'completed') {
      return res.status(403).json({ message: 'Cannot cancel a completed trip' });
    }

    // Free the truck
    await Truck.findByIdAndUpdate(trip.truck, { driver: null, isAvailable: true });

    // Reset order back to approved so it can be re-assigned
    if (trip.order) {
      await Order.findByIdAndUpdate(trip.order._id, {
        status: 'approved',
        truck: null,
        driver: null,
      });
    }

    await Trip.findByIdAndDelete(id);

    emitTripStatusUpdated({
      tripId: id,
      orderId: trip.order?._id?.toString() || trip.order,
      status: 'cancelled',
    });

    res.json({ message: 'Trip cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateInvoiceBuffer = (bill) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Layout Design
      // Title
      doc.fillColor('#06b6d4').fontSize(20).text('SATC LOGISTICS', 50, 50);
      doc.fillColor('#94a3b8').fontSize(9).text('Smart Trucking & Logistics Platform', 50, 75);
      
      doc.fillColor('#000000').fontSize(24).text('INVOICE / RECEIPT', 300, 50, { align: 'right' });
      doc.fillColor('#94a3b8').fontSize(9).text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 300, 75, { align: 'right' });

      // Divider Line
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

      // Bill Details
      doc.fillColor('#000000').fontSize(12).text('Invoice Details:', 50, 120);
      doc.fillColor('#334155').fontSize(10).text(`Bill ID: ${bill._id}`, 50, 140);
      doc.text(`Party Name: ${bill.partyName || 'Customer'}`, 50, 160);
      doc.text(`Party Role: ${bill.partyRole}`, 50, 180);
      doc.text(`Billing Type: ${bill.billType}`, 50, 200);

      // Table Header
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 240).lineTo(550, 240).stroke();
      doc.fillColor('#475569').fontSize(10).text('Description', 60, 250);
      doc.text('Amount', 450, 250, { align: 'right' });
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 270).lineTo(550, 270).stroke();

      // Table Row
      doc.fillColor('#0f172a').fontSize(10).text(bill.notes || `Logistics payment description`, 60, 290);
      doc.text(`INR ${bill.amount}`, 450, 290, { align: 'right' });

      // Table Footer
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 320).lineTo(550, 320).stroke();
      doc.fillColor('#10b981').fontSize(12).text('Total', 60, 340);
      doc.text(`INR ${bill.amount}`, 450, 340, { align: 'right' });

      // Status Badge
      doc.fillColor(bill.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b')
         .fontSize(14)
         .text(`Status: ${bill.paymentStatus.toUpperCase()}`, 50, 400);

      // Footer note
      doc.fillColor('#94a3b8').fontSize(8).text('Thank you for choosing SATC Logistics platform. For any inquiries, support@satc.com', 50, 500, { align: 'center' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};
