import mongoose from 'mongoose';
import Review from '../models/Review.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ➤ Add Review (Customer)
export const addReview = async (req, res) => {
  try {
    const { order, driver, rating, feedback } = req.body;

    if (!order || !isValidObjectId(order)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    if (driver && !isValidObjectId(driver)) {
      return res.status(400).json({ message: 'Invalid driver id' });
    }

    const review = await Review.create({
      order,
      customer: req.user.id,
      driver,
      rating,
      feedback,
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Get All Reviews (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customer', 'name')
      .populate('driver', 'name')
      .populate('order');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Get Reviews for a Driver
export const getDriverReviews = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId || !isValidObjectId(driverId)) {
      return res.status(400).json({ message: 'Invalid driver id' });
    }

    const reviews = await Review.find({
      driver: driverId,
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Get Average Rating of Driver
export const getDriverRating = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId || !isValidObjectId(driverId)) {
      return res.status(400).json({ message: 'Invalid driver id' });
    }

    const reviews = await Review.find({
      driver: driverId,
    });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) /
      (reviews.length || 1);

    res.json({
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
