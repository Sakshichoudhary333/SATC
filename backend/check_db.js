import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/apple/SATC/backend/.env' });

import Order from '/Users/apple/SATC/backend/models/Order.js';
import Trip from '/Users/apple/SATC/backend/models/Trip.js';
import Truck from '/Users/apple/SATC/backend/models/Truck.js';
import User from '/Users/apple/SATC/backend/models/User.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const truckId = "6a007d37be84ab5778250488";
  
  // Find all trips for this truck sorted by createdAt desc
  const trips = await Trip.find({ truck: truckId })
    .sort({ createdAt: -1 })
    .populate('order')
    .populate('driver', 'name email role');
    
  console.log(`Found ${trips.length} trips:`);
  trips.forEach((t, i) => {
    console.log(`Trip ${i+1}:`);
    console.log(`  ID: ${t._id}`);
    console.log(`  Status: ${t.status}`);
    console.log(`  Driver: ${t.driver?.name} (${t.driver?.email})`);
    console.log(`  Pickup: ${t.order?.pickupLocation}`);
    console.log(`  Destination: ${t.order?.destination}`);
    console.log(`  CreatedAt: ${t.createdAt}`);
  });

  // Let's print the truck document itself
  const truck = await Truck.findById(truckId).populate('driver');
  console.log("TRUCK DOCUMENT:");
  console.log(JSON.stringify(truck, null, 2));

  mongoose.connection.close();
}

run().catch(console.error);
