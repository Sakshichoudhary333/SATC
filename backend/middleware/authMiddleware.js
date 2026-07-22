import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: 'Server authentication is not configured' });
  }

  if (!authHeader) {
    return res.status(401).json({ message: 'No token' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (!token || scheme?.toLowerCase() !== 'bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ➤ Admin Middleware
export const isAdmin = (req, res, next) => {
  if (req.user && String(req.user.role || '').toLowerCase() === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};
