/**
 * Order API Tests — /api/orders
 */

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

import User from '../models/User.js';
import Order from '../models/Order.js';
import Truck from '../models/Truck.js';
import Trip from '../models/Trip.js';
import orderRoutes from '../routes/orderRoutes.js';

const JWT_SECRET = 'test_secret_key';

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

let mongoServer;
let customerToken;
let customerId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = JWT_SECRET;
});

beforeEach(async () => {
  // Create a fresh verified customer before each test
  const hashed = await bcrypt.hash('Test@1234', 10);
  const customer = await User.create({
    name: 'Test Customer',
    email: 'customer@example.com',
    password: hashed,
    role: 'customer',
    isVerified: true,
  });
  customerId = customer._id.toString();
  customerToken = jwt.sign({ id: customerId, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
});

afterEach(async () => {
  await User.deleteMany({});
  await Order.deleteMany({});
  await Truck.deleteMany({});
  await Trip.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ══════════════════════════════════════════════════════════════════════════
// CREATE ORDER
// ══════════════════════════════════════════════════════════════════════════
describe('POST /api/orders', () => {
  test('TC-11 | creates order with valid fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        pickupLocation: 'Mumbai Warehouse',
        destination: 'Delhi Hub',
        goodsDetails: 'Electronics 200kg',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.status).toBe('pending');
    expect(res.body.pickupLocation).toBe('Mumbai Warehouse');
  });

  test('TC-12 | rejects order with empty pickup location', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        pickupLocation: '',
        destination: 'Delhi Hub',
        goodsDetails: 'Furniture',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/pickup/i);
  });

  test('TC-13 | rejects order with empty destination', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        pickupLocation: 'Mumbai',
        destination: '',
        goodsDetails: 'Clothes',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/destination/i);
  });

  test('TC-14 | rejects order without auth token', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        pickupLocation: 'Mumbai',
        destination: 'Delhi',
        goodsDetails: 'Goods',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no token/i);
  });

  test('TC-15 | rejects goods details exceeding 500 characters', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        pickupLocation: 'Mumbai',
        destination: 'Delhi',
        goodsDetails: 'A'.repeat(510),
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/goods/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// GET ORDER BY ID
// ══════════════════════════════════════════════════════════════════════════
describe('GET /api/orders/:id', () => {
  test('TC-16 | returns order for valid ID owned by customer', async () => {
    const order = await Order.create({
      customer: customerId,
      pickupLocation: 'Jaipur',
      destination: 'Kota',
      goodsDetails: 'Textiles',
    });

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(order._id.toString());
  });

  test('TC-17 | returns 400 for invalid Mongo ID format', async () => {
    const res = await request(app)
      .get('/api/orders/badid123')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid order id/i);
  });

  test('TC-18 | returns 404 for order belonging to another customer', async () => {
    const otherHashed = await bcrypt.hash('Other@1234', 10);
    const otherUser = await User.create({
      name: 'Other',
      email: 'other@example.com',
      password: otherHashed,
      role: 'customer',
      isVerified: true,
    });

    const order = await Order.create({
      customer: otherUser._id,
      pickupLocation: 'Pune',
      destination: 'Nagpur',
      goodsDetails: 'Steel',
    });

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
