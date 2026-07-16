import Billing from "../models/Billing.js";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import PDFDocument from 'pdfkit';

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

export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Billing.findById(id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    doc.pipe(res);

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
  } catch (error) {
    res.status(500).json({ message: "Failed to generate PDF invoice", error: error.message });
  }
};
