import mongoose from "mongoose";
import User from "./models/User.js";
import { logger } from './utils/logger.js';

mongoose.connect("mongodb://127.0.0.1:27017/truckDB")
  .then(async () => {
    logger.info('MongoDB connected for seed script');

    try {
      // Clear old data
      await User.deleteMany();

      // Insert data
      await User.insertMany([
        {
          name: "Admin User",
          email: "admin@gmail.com",
          password: "12345",
          role: "admin",
          mobile: "9999999999",
          isVerified: true,
        },
        {
          name: "Customer User",
          email: "customer@gmail.com",
          password: "12345",
          role: "customer",
          mobile: "8888888888",
          isVerified: true,
        },
        {
          name: "Amit Sharma",
          email: "amit@gmail.com",
          password: "12345",
          mobile: "9012345678",
          licenseNumber: "DL56789",
          experience: 8,
          role: "driver",
          driverStatus: "active",
          isVerified: true,
        },
        {
          name: "Rajesh Kumar",
          email: "rajesh@gmail.com",
          password: "12345",
          mobile: "9876543210",
          licenseNumber: "DL12345",
          experience: 10,
          role: "driver",
          driverStatus: "active",
          isVerified: true,
        }
      ]);

      logger.info('Data seeded successfully');
      process.exit();

    } catch (error) {
      logger.error('Error seeding data', error);
      process.exit(1);
    }
  })
  .catch((err) => {
    logger.error('Seed database connection failed', err);
  });
