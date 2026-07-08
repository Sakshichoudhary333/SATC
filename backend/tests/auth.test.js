/**
 * Auth API Tests — /api/auth
 * Uses supertest + in-memory MongoDB (no real DB or email needed)
 */

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';

import User from '../models/User.js';
import authRoutes from '../routes/authRoutes.js';

// ── App setup ──────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test_secret_key';
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ── Helper: create a verified user directly in DB ─────────────────────────
const createVerifiedUser = async ({
  name = 'Test User',
  email = 'test@example.com',
  password = 'Test@1234',
  role = 'customer',
} = {}) => {
  const hashed = await bcrypt.hash(password, 10);
  return User.create({ name, email, password: hashed, role, isVerified: true });
};

// ══════════════════════════════════════════════════════════════════════════
// REGISTER
// ══════════════════════════════════════════════════════════════════════════
describe('POST /api/auth/register', () => {
  test('TC-01 | registers a new customer with valid data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'Rahul@1234',
      role: 'customer',
    });

    // 201 or emailFailed is acceptable (email service not available in test)
    expect([201]).toContain(res.status);
    expect(res.body.message).toMatch(/registered|OTP/i);
  });

  test('TC-02 | blocks registration with an already-verified email', async () => {
    await createVerifiedUser({ email: 'existing@example.com' });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate',
      email: 'existing@example.com',
      password: 'Test@1234',
      role: 'customer',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('TC-03 | rejects registration with invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad Email',
      email: 'notanemail',
      password: 'Test@1234',
      role: 'customer',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  test('TC-04 | rejects password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Pass',
      email: 'short@example.com',
      password: 'Ab@1',
      role: 'customer',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  test('TC-05 | rejects admin role during self-registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker',
      email: 'hacker@example.com',
      password: 'Hack@1234',
      role: 'admin',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/customer or driver/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════
describe('POST /api/auth/login', () => {
  test('TC-06 | logs in with correct credentials and returns JWT token', async () => {
    await createVerifiedUser({ email: 'login@example.com', password: 'Login@1234' });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'Login@1234',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toBe('customer');
  });

  test('TC-07 | rejects login with wrong password', async () => {
    await createVerifiedUser({ email: 'wrong@example.com', password: 'Correct@1234' });

    const res = await request(app).post('/api/auth/login').send({
      email: 'wrong@example.com',
      password: 'Wrong@9999',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('TC-08 | rejects login for unverified user', async () => {
    const hashed = await bcrypt.hash('Test@1234', 10);
    await User.create({
      name: 'Unverified',
      email: 'unverified@example.com',
      password: hashed,
      role: 'customer',
      isVerified: false,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'unverified@example.com',
      password: 'Test@1234',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not verified/i);
  });

  test('TC-09 | rejects login with missing email field', async () => {
    const res = await request(app).post('/api/auth/login').send({
      password: 'Test@1234',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  test('TC-10 | rejects login with non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@example.com',
      password: 'Ghost@1234',
    });

    expect(res.status).toBe(401);
  });
});
