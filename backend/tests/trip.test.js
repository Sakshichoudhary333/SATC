/**
 * Trip API Tests — /api/trips
 */

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

import User from '../models/User.js';
import Order from '../models/Order.js';
import Trip from '../models/Trip.js';
import Truck from '../models/Truck.js';
import tripRoutes from '../routes/tripRoutes.js';

const JWT_SECRET = 'test_secret_key';

const app = express();
app.use(express.json());
app.use('/api/trips', tripRoutes);

let mongoServer;
let adminToken;
let driverToken;
let driverId;
let truckId;
let orderId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = JWT_SECRET;
});

beforeEach(async () => {
  // Admin
  const adminHashed = await bcrypt.hash('Admin@1234', 10);
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: adminHashed,
    role: 'admin',
    isVerified: true,
  });
  adminToken = jwt.sign({ id: admin._id.toString(), role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // Driver
  const driverHashed = await bcrypt.hash('Driver@1234', 10);
  const driver = await User.create({
    name: 'Test Driver',
    email: 'driver@example.com',
    password: driverHashed,
    role: 'driver',
    isVerified: true,
    driverStatus: 'active',
  });
  driverId = driver._id.toString();
  driverToken = jwt.sign({ id: driverId, role: 'driver' }, JWT_SECRET, { expiresIn: '1h' });

  // Truck
  const truck = await Truck.create({
    truckNumber: 'MH-1234',
    model: 'Tata 407',
    capacity: '5 tons',
    isAvailable: true,
    status: 'available',
  });
  truckId = truck._id.toString();

  // Customer + Order
  const custHashed = await bcrypt.hash('Cust@1234', 10);
  const customer = await User.create({
    name: 'Customer',
    email: 'cust@example.com',
    password: custHashed,
    role: 'customer',
    isVerified: true,
  });
  const order = await Order.create({
    customer: customer._id,
    pickupLocation: 'Mumbai',
    destination: 'Delhi',
    goodsDetails: 'Goods',
    status: 'approved',
  });
  orderId = order._id.toString();
});

afterEach(async () => {
  await User.deleteMany({});
  await Order.deleteMany({});
  await Trip.deleteMany({});
  await Truck.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ══════════════════════════════════════════════════════════════════════════
// CREATE TRIP
// ══════════════════════════════════════════════════════════════════════════
describe('POST /api/trips', () => {
  test('TC-19 | admin creates trip with valid order, truck, driver', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order: orderId, truck: truckId, driver: driverId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.status).toBe('started');
  });

  test('TC-20 | rejects trip creation for order not yet approved', async () => {
    const custHashed = await bcrypt.hash('Cust@1234', 10);
    const customer = await User.create({
      name: 'C2',
      email: 'c2@example.com',
      password: custHashed,
      role: 'customer',
      isVerified: true,
    });
    const pendingOrder = await Order.create({
      customer: customer._id,
      pickupLocation: 'A',
      destination: 'B',
      goodsDetails: 'X',
      status: 'pending',
    });

    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order: pendingOrder._id.toString(), truck: truckId, driver: driverId });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/approved/i);
  });

  test('TC-21 | rejects duplicate trip for same order', async () => {
    // Create first trip
    await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order: orderId, truck: truckId, driver: driverId });

    // Try to create second trip for same order
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order: orderId, truck: truckId, driver: driverId });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('TC-22 | rejects trip with invalid ObjectId for order', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order: 'badid', truck: truckId, driver: driverId });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid ObjectId/i);
  });

  test('TC-23 | blocks driver with active trip from being assigned again', async () => {
    // Create first trip (driver now has active trip)
    await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order: orderId, truck: truckId, driver: driverId });

    // Create a second order and truck
    const custHashed = await bcrypt.hash('Cust@1234', 10);
    const customer2 = await User.create({
      name: 'C3',
      email: 'c3@example.com',
      password: custHashed,
      role: 'customer',
      isVerified: true,
    });
    const order2 = await Order.create({
      customer: customer2._id,
      pickupLocation: 'X',
      destination: 'Y',
      goodsDetails: 'Z',
      status: 'approved',
    });
    const truck2 = await Truck.create({
      truckNumber: 'RJ-5678',
      isAvailable: true,
      status: 'available',
    });

    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order: order2._id.toString(), truck: truck2._id.toString(), driver: driverId });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/active trip/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// UPDATE TRIP STATUS
// ══════════════════════════════════════════════════════════════════════════
describe('PUT /api/trips/:id/status', () => {
  test('TC-24 | driver updates trip status to in-transit', async () => {
    const trip = await Trip.create({
      order: orderId,
      truck: truckId,
      driver: driverId,
      status: 'started',
    });

    const res = await request(app)
      .put(`/api/trips/${trip._id}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ status: 'in-transit' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in-transit');
  });

  test('TC-25 | rejects invalid trip status value', async () => {
    const trip = await Trip.create({
      order: orderId,
      truck: truckId,
      driver: driverId,
      status: 'started',
    });

    const res = await request(app)
      .put(`/api/trips/${trip._id}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ status: 'on-the-way' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid trip status/i);
  });
});
