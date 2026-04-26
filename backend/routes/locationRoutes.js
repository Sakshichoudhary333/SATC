import express from "express";
import Truck from "../models/Truck.js";

const router = express.Router();

// ✅ Update location
router.post("/update-location", async (req, res) => {
  const { truckId, lat, lng } = req.body;

  if (!truckId || lat == null || lng == null) {
    return res.status(400).json({
      error: "truckId, lat and lng are required",
    });
  }

  try {
    const truck = await Truck.findOneAndUpdate(
      { truckId },
      {
        location: { lat, lng },
        lastUpdated: new Date(),
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Location updated",
      truck,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
    });
  }
});

// ✅ Get truck location
router.get("/:truckId", async (req, res) => {
  try {
    const truck = await Truck.findOne({
      truckId: req.params.truckId,
    });

    if (!truck) {
      return res.status(404).json({
        error: "Truck not found",
      });
    }

    res.json(truck);
  } catch (err) {
    res.status(500).json({
      error: "Server error",
    });
  }
});

export default router;