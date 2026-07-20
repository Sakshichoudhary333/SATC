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
import Expense from '../models/Expense.js';
import expenseRoutes from '../routes/expenseRoutes.js';

const JWT_SECRET = 'test_secret_key_expense';

const app = express();
app.use(express.json());
app.use('/api/expenses', expenseRoutes);

let mongoServer;
let driverToken;
let driverId;
let tripId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = JWT_SECRET;
});

beforeEach(async () => {
  const hashed = await bcrypt.hash('Driver@1234', 10);
  const driver = await User.create({
    name: 'Test Driver',
    email: 'driver@example.com',
    password: hashed,
    role: 'driver',
    isVerified: true,
  });
  driverId = driver._id.toString();
  driverToken = jwt.sign({ id: driverId, role: 'driver' }, JWT_SECRET, { expiresIn: '1h' });

  // Create a truck
  const truck = await Truck.create({
    truckNumber: 'MH-12-AB-1234',
    model: 'Tata Signa',
    capacity: '25 Ton',
    driver: driverId,
  });

  // Create an order
  const order = await Order.create({
    pickupLocation: 'Pune',
    destination: 'Mumbai',
    goodsDetails: 'Electronics',
    price: 15000,
    status: 'assigned',
  });

  // Create a trip
  const trip = await Trip.create({
    order: order._id,
    truck: truck._id,
    driver: driverId,
    status: 'started',
  });
  tripId = trip._id.toString();
});

afterEach(async () => {
  await User.deleteMany({});
  await Order.deleteMany({});
  await Truck.deleteMany({});
  await Trip.deleteMany({});
  await Expense.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Expense API - Receipt Image Functionality', () => {
  it('should successfully create an expense with a receipt image', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        trip: tripId,
        fuelCost: 2000,
        notes: 'Filled tank at pump #5',
        receiptImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      });

    expect(response.status).toBe(201);
    expect(response.body.expense).toBeDefined();
    expect(response.body.expense.receiptImage).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');

    // Double check DB
    const savedExpense = await Expense.findOne({ trip: tripId });
    expect(savedExpense).not.toBeNull();
    expect(savedExpense.receiptImage).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  });

  it('should successfully update an existing expense and change receipt image', async () => {
    const expense = await Expense.create({
      trip: tripId,
      driver: driverId,
      fuelCost: 2000,
      notes: 'Initial fuel',
      receiptImage: 'initial_base64_string',
    });

    const response = await request(app)
      .put(`/api/expenses/${expense._id}`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        fuelCost: 2500,
        notes: 'Updated fuel log',
        receiptImage: 'updated_base64_string',
      });

    expect(response.status).toBe(200);
    expect(response.body.expense.fuelCost).toBe(2500);
    expect(response.body.expense.receiptImage).toBe('updated_base64_string');

    // Double check DB
    const updated = await Expense.findById(expense._id);
    expect(updated.receiptImage).toBe('updated_base64_string');
  });

  it('should fail validation if receiptImage is not a string', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        trip: tripId,
        fuelCost: 2000,
        receiptImage: 12345, // invalid type
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Receipt image must be a string');
  });
});
