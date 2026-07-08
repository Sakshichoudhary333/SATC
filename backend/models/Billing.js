import mongoose from "mongoose";

const billingSchema = new mongoose.Schema({
  billType: {
    type: String,
    enum: ["customer_advance", "driver_payout"],
    default: "customer_advance",
  },
  partyRole: {
    type: String,
    enum: ["customer", "driver"],
    default: "customer",
  },
  partyName: String,
  customerName: String,
  driverName: String,
  tripId: String,
  orderId: String,
  driverId: String,
  periodKey: String,
  amount: Number,
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Billing", billingSchema);
