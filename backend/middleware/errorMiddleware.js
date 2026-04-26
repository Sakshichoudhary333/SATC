import mongoose from 'mongoose';

export const errorMiddleware = (err, req, res, next) => {
  console.error('[errorMiddleware]', err);

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: `Invalid ${err.path || 'value'}`,
      field: err.path,
      value: err.value,
    });
  }

  if (err?.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message || 'Validation failed',
    });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Server Error',
  });
};
