import Billing from "../models/Billing.js";
import Trip from "../models/Trip.js";
import User from "../models/User.js";

const DRIVER_MONTHLY_PAYOUT = 20000;
const DEFAULT_CUSTOMER_ADVANCE = 5000;

const getMonthKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const toPlain = (doc) => (doc?.toObject ? doc.toObject() : doc);

const hydrateBill = async (billDoc) => {
  const bill = toPlain(billDoc);
  if (!bill) return bill;

  const normalized = { ...bill };
  const inferredBillType = normalized.billType || (normalized.driverId ? "driver_payout" : "customer_advance");

  if (!normalized.partyName) {
    normalized.partyName = normalized.customerName || normalized.driverName || "—";
  }

  if (inferredBillType === "customer_advance") {
    if ((!normalized.customerName || normalized.customerName === "Customer" || !normalized.partyName) && normalized.tripId) {
      const trip = await Trip.findById(normalized.tripId)
        .populate({ path: "order", populate: { path: "customer", select: "name" } });

      const customerName = trip?.order?.customer?.name || trip?.order?.customerName || normalized.customerName;
      if (customerName) {
        normalized.customerName = customerName;
        normalized.partyName = customerName;
      }
      if (trip?.order?._id) {
        normalized.orderId = trip.order._id.toString();
      }
    }
  }

  if (inferredBillType === "driver_payout" && !normalized.driverName && normalized.driverId) {
    const driver = await User.findById(normalized.driverId).select("name");
    const driverName = driver?.name || normalized.partyName;
    if (driverName) {
      normalized.driverName = driverName;
      normalized.partyName = driverName;
    }
  }

  if (!normalized.customerName && normalized.partyRole === "customer") {
    normalized.customerName = normalized.partyName;
  }

  if (!normalized.driverName && normalized.partyRole === "driver") {
    normalized.driverName = normalized.partyName;
  }

  return normalized;
};

export const createBill = async (req, res) => {
  try {
    const billType = req.body?.billType || "customer_advance";
    const partyRole = req.body?.partyRole || (billType === "driver_payout" ? "driver" : "customer");
    const amount = Number(req.body?.amount ?? (billType === "driver_payout" ? DRIVER_MONTHLY_PAYOUT : DEFAULT_CUSTOMER_ADVANCE));
    const partyName = req.body?.partyName || req.body?.customerName || req.body?.driverName || "";
    const bill = await Billing.create({
      ...req.body,
      billType,
      partyRole,
      amount: Number.isFinite(amount) ? amount : (billType === "driver_payout" ? DRIVER_MONTHLY_PAYOUT : DEFAULT_CUSTOMER_ADVANCE),
      partyName,
      customerName: req.body?.customerName || (partyRole === "customer" ? partyName : undefined),
      driverName: req.body?.driverName || (partyRole === "driver" ? partyName : undefined),
      paymentStatus: req.body?.paymentStatus || "Pending",
    });
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBills = async (req, res) => {
  try {
    const bills = await Billing.find().sort({ createdAt: -1 });
    const normalized = await Promise.all(bills.map(hydrateBill));
    res.status(200).json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBill = async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(req.params.id, { paymentStatus: "Paid" }, { new: true });
    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    await Billing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Bill Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateMonthEndDriverPayouts = async (req, res) => {
  try {
    const targetDate = req.body?.date ? new Date(req.body.date) : new Date();
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const periodKey = getMonthKey(targetDate);
    const drivers = await User.find({ role: "driver", driverStatus: "active" }).select("name");
    const createdBills = [];
    const skippedDrivers = [];

    for (const driver of drivers) {
      const existingBill = await Billing.findOne({
        billType: "driver_payout",
        driverId: driver._id.toString(),
        periodKey,
      });

      if (existingBill) {
        skippedDrivers.push(driver.name || driver._id.toString());
        continue;
      }

      const bill = await Billing.create({
        billType: "driver_payout",
        partyRole: "driver",
        partyName: driver.name || "Driver",
        driverName: driver.name || "Driver",
        driverId: driver._id.toString(),
        periodKey,
        amount: DRIVER_MONTHLY_PAYOUT,
        paymentStatus: "Pending",
        notes: `Month-end driver payout for ${periodKey}`,
      });

      createdBills.push(await hydrateBill(bill));
    }

    res.status(201).json({
      message: createdBills.length
        ? `Generated ${createdBills.length} driver payout bill(s) for ${periodKey}`
        : `No new driver payouts were needed for ${periodKey}`,
      periodKey,
      bills: createdBills,
      skippedDrivers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
