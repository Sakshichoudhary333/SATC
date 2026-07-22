import MaintenanceLog from '../models/MaintenanceLog.js';
import Truck from '../models/Truck.js';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ➤ Create Maintenance Log
export const createMaintenanceLog = async (req, res) => {
  try {
    const { truckId, serviceType, serviceDate, nextDueDate, cost, notes } = req.body;

    if (!truckId || !isValidObjectId(truckId)) {
      return res.status(400).json({ message: 'Invalid or missing truckId' });
    }

    const truck = await Truck.findById(truckId);
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    if (!serviceType || !nextDueDate) {
      return res.status(400).json({ message: 'serviceType and nextDueDate are required' });
    }

    const parsedServiceDate = serviceDate ? new Date(serviceDate) : new Date();
    const parsedNextDueDate = new Date(nextDueDate);

    if (Number.isNaN(parsedServiceDate.getTime())) {
      return res.status(400).json({ message: 'Invalid serviceDate' });
    }

    if (Number.isNaN(parsedNextDueDate.getTime())) {
      return res.status(400).json({ message: 'Invalid nextDueDate' });
    }

    const log = await MaintenanceLog.create({
      truck: truckId,
      serviceType,
      serviceDate: parsedServiceDate,
      nextDueDate: parsedNextDueDate,
      cost: Number(cost) || 0,
      notes,
    });

    if (truck.status !== 'maintenance') {
      await Truck.updateOne({ _id: truckId }, { $set: { status: 'maintenance' } });
    }

    const populated = await log.populate('truck');
    res.status(201).json(populated);
  } catch (error) {
    logger.error('Failed to create maintenance log', {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ message: 'Failed to create maintenance log', error: error.message });
  }
};

// ➤ Get All Maintenance Logs
export const getMaintenanceLogs = async (req, res) => {
  try {
    const logs = await MaintenanceLog.find().populate('truck').sort({ nextDueDate: 1 });

    // Dynamic verification of overdue status
    const today = new Date();
    let updated = false;

    for (const log of logs) {
      if (log.status === 'scheduled' && today > new Date(log.nextDueDate)) {
        log.status = 'overdue';
        await log.save();
        updated = true;
      }
    }

    // Re-fetch if updates happened
    const finalLogs = updated 
      ? await MaintenanceLog.find().populate('truck').sort({ nextDueDate: 1 })
      : logs;

    res.status(200).json(finalLogs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch maintenance logs', error: error.message });
  }
};

// ➤ Complete Maintenance Service
export const completeMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { cost, notes } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid maintenance log id' });
    }

    const log = await MaintenanceLog.findById(id);
    if (!log) {
      return res.status(404).json({ message: 'Maintenance log not found' });
    }

    log.status = 'completed';
    if (cost !== undefined) log.cost = Number(cost) || 0;
    if (notes !== undefined) log.notes = notes;

    await log.save();

    const truck = await Truck.findById(log.truck);
    if (truck && truck.status !== 'available') {
      await Truck.updateOne({ _id: truck._id }, { $set: { status: 'available' } });
    }

    const populated = await log.populate('truck');
    res.status(200).json(populated);
  } catch (error) {
    logger.error('Failed to complete maintenance service', {
      message: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body,
    });
    res.status(500).json({ message: 'Failed to complete maintenance service', error: error.message });
  }
};

// ➤ Delete Maintenance Log
export const deleteMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid maintenance log id' });
    }

    const log = await MaintenanceLog.findById(id);
    if (!log) {
      return res.status(404).json({ message: 'Maintenance log not found' });
    }

    await log.deleteOne();
    res.status(200).json({ message: 'Maintenance log deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete maintenance log', {
      message: error.message,
      stack: error.stack,
      params: req.params,
    });
    res.status(500).json({ message: 'Failed to delete maintenance log', error: error.message });
  }
};
