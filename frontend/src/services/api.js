
const BASE_URL = 'http://localhost:5001/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

const isValidMongoId = (value) =>
  typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value.trim());

const parseFiniteNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// ── Auth ──────────────────────────────────────────────
export const loginUser = (body) =>
  fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse);

export const registerUser = (body) =>
  fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse);

export const verifyRegisterOtp = (body) =>
  fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse);

export const resendRegisterOtp = (body) =>
  fetch(`${BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse);

export const forgotPasswordUser = (body) =>
  fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse);

export const resetPasswordUser = (body) =>
  fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse);

// ── Orders ────────────────────────────────────────────
export const createOrder = (body) =>
  fetch(`${BASE_URL}/orders`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

export const getMyOrders = () =>
  fetch(`${BASE_URL}/orders/my`, { headers: getHeaders() }).then(handleResponse);

export const getOrderById = (id) =>
{
  const orderId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(orderId)) {
    const error = new Error('Invalid order id');
    console.error('[getOrderById] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/orders/${orderId}`, { headers: getHeaders() }).then(handleResponse);
}

export const getAllOrders = () =>
  fetch(`${BASE_URL}/orders`, { headers: getHeaders() }).then(handleResponse);

// ── Trucks ────────────────────────────────────────────
export const getTrucks = () =>
  fetch(`${BASE_URL}/trucks`, { headers: getHeaders() }).then(handleResponse);

export const getTruckById = (id) => {
  const truckId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(truckId)) return Promise.reject(new Error('Invalid truck id'));
  return fetch(`${BASE_URL}/trucks/${truckId}`).then(handleResponse); // public — no auth header
};

export const getTruckActiveTrip = (id, orderId) => {
  const truckId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(truckId)) return Promise.reject(new Error('Invalid truck id'));
  let url = `${BASE_URL}/trucks/${truckId}/trip`;
  if (orderId && isValidMongoId(orderId)) {
    url += `?orderId=${orderId}`;
  }
  return fetch(url).then(handleResponse); // public — no auth header
};

export const getPublicTrucks = () => {
  return fetch(`${BASE_URL}/trucks`).then(handleResponse); // public — no auth header
};

export const addTruck = (body) =>
  fetch(`${BASE_URL}/trucks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

export const updateTruckApi = (id, body) =>
{
  const truckId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(truckId)) {
    const error = new Error('Invalid truck id');
    console.error('[updateTruckApi] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/trucks/${truckId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);
}

export const deleteTruckApi = (id) =>
{
  const truckId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(truckId)) {
    const error = new Error('Invalid truck id');
    console.error('[deleteTruckApi] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/trucks/${truckId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);
}


export const updateTruckLocation = (id, body) =>
{
  const truckId = typeof id === 'string' ? id.trim() : '';
  const latitude = parseFiniteNumber(body?.lat);
  const longitude = parseFiniteNumber(body?.lng);

  if (!isValidMongoId(truckId)) {
    const error = new Error('Invalid truck id');
    console.error('[updateTruckLocation] invalid id:', { id });
    return Promise.reject(error);
  }

  if (latitude === null || longitude === null) {
    const error = new Error('Invalid truck coordinates');
    console.error('[updateTruckLocation] invalid coordinates:', body);
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/trucks/${truckId}/location`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ lat: latitude, lng: longitude }),
  }).then(handleResponse);
}

export const getTruckETA = (id, destLat, destLng) => {
  const truckId = typeof id === 'string' ? id.trim() : '';
  const latitude = parseFiniteNumber(destLat);
  const longitude = parseFiniteNumber(destLng);

  if (!isValidMongoId(truckId)) {
    const error = new Error('Invalid truck id');
    console.error('[getTruckETA] invalid id:', { id });
    return Promise.reject(error);
  }

  if (latitude === null || longitude === null) {
    const error = new Error('Invalid destination coordinates');
    console.error('[getTruckETA] invalid destination coordinates:', { destLat, destLng });
    return Promise.reject(error);
  }

  const params = new URLSearchParams({
    destLat: String(latitude),
    destLng: String(longitude),
  });

  return fetch(`${BASE_URL}/trucks/${truckId}/eta?${params.toString()}`, { headers: getHeaders() }).then(handleResponse);
};
export const getTrips = () =>
  fetch(`${BASE_URL}/trips`, { headers: getHeaders() }).then(handleResponse);

export const createTrip = (body) =>
  fetch(`${BASE_URL}/trips`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

export const updateTripStatus = (id, status, otp) =>
{
  const tripId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(tripId)) {
    const error = new Error('Invalid trip id');
    console.error('[updateTripStatus] invalid id:', { id });
    return Promise.reject(error);
  }

  const body = { status };
  if (otp !== undefined) body.otp = otp;

  return fetch(`${BASE_URL}/trips/${tripId}/status`, { 
    method: 'PUT', 
    headers: getHeaders(), 
    body: JSON.stringify(body) 
  }).then(handleResponse);
}

export const updateTripDetails = (id, body) => {
  const tripId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(tripId)) return Promise.reject(new Error('Invalid trip id'));
  return fetch(`${BASE_URL}/trips/${tripId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);
};

export const cancelTrip = (id) => {
  const tripId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(tripId)) return Promise.reject(new Error('Invalid trip id'));
  return fetch(`${BASE_URL}/trips/${tripId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  }).then(handleResponse);
};

// ── Expenses ──────────────────────────────────────────
export const addExpense = (body) =>
{
  const tripId = typeof body?.trip === 'string' ? body.trip.trim() : '';
  if (!isValidMongoId(tripId)) {
    const error = new Error('Invalid trip id');
    console.error('[addExpense] invalid trip id:', { trip: body?.trip });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/expenses`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...body, trip: tripId }) }).then(handleResponse);
}

export const getMyExpenses = () =>
  fetch(`${BASE_URL}/expenses/my`, { headers: getHeaders() }).then(handleResponse);

export const getAllExpenses = () =>
  fetch(`${BASE_URL}/expenses`, { headers: getHeaders() }).then(handleResponse);

export const updateExpenseStatus = (id, status) => {
  const expenseId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(expenseId)) return Promise.reject(new Error('Invalid expense id'));
  return fetch(`${BASE_URL}/expenses/${expenseId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  }).then(handleResponse);
};

export const updateExpense = (id, body) => {
  const expenseId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(expenseId)) return Promise.reject(new Error('Invalid expense id'));
  return fetch(`${BASE_URL}/expenses/${expenseId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);
};

export const deleteExpense = (id) => {
  const expenseId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(expenseId)) return Promise.reject(new Error('Invalid expense id'));
  return fetch(`${BASE_URL}/expenses/${expenseId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  }).then(handleResponse);
};

export const ocrScanReceipt = (body) =>
  fetch(`${BASE_URL}/expenses/ocr`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);

// ── Reviews ───────────────────────────────────────────
export const addReview = (body) =>
{
  const orderId = typeof body?.order === 'string' ? body.order.trim() : '';
  const driverId = body?.driver ? (typeof body.driver === 'string' ? body.driver.trim() : '') : '';

  if (!isValidMongoId(orderId)) {
    const error = new Error('Invalid order id');
    console.error('[addReview] invalid order id:', { order: body?.order });
    return Promise.reject(error);
  }

  if (body?.driver && !isValidMongoId(driverId)) {
    const error = new Error('Invalid driver id');
    console.error('[addReview] invalid driver id:', { driver: body?.driver });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...body, order: orderId, ...(body?.driver ? { driver: driverId } : {}) }),
  }).then(handleResponse);
}

export const getAllReviews = () =>
  fetch(`${BASE_URL}/reviews`, { headers: getHeaders() }).then(handleResponse);

// ── Admin ─────────────────────────────────────────────
export const getAdminDashboard = () =>
  fetch(`${BASE_URL}/admin/dashboard`, { headers: getHeaders() }).then(handleResponse);

export const getUsers = ({ page = 1, limit = 50, search = '', role = 'all' } = {}) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);
  if (role && role !== 'all') params.set('role', role);

  return fetch(`${BASE_URL}/admin/users?${params.toString()}`, { headers: getHeaders() }).then(handleResponse);
};

export const updateUserApi = (id, body) => {
  const userId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(userId)) {
    const error = new Error('Invalid user id');
    console.error('[updateUserApi] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);
};

export const deleteUserApi = (id) => {
  const userId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(userId)) {
    const error = new Error('Invalid user id');
    console.error('[deleteUserApi] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  }).then(handleResponse);
};

export const addDriver = (body) =>
  fetch(`${BASE_URL}/admin/drivers`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

export const updateDriverApi = (id, body) =>
{
  const driverId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(driverId)) {
    const error = new Error('Invalid driver id');
    console.error('[updateDriverApi] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/drivers/${driverId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);
}

export const deleteDriver = (id) =>
{
  const userId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(userId)) {
    const error = new Error('Invalid user id');
    console.error('[deleteDriver] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/users/${userId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);
}

export const assignTruck = (body) =>
  fetch(`${BASE_URL}/admin/assign-truck`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

export const approveOrder = (id) =>
{
  const orderId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(orderId)) {
    const error = new Error('Invalid order id');
    console.error('[approveOrder] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/orders/${orderId}/approve`, {
    method: 'PUT',
    headers: getHeaders(),
  }).then(handleResponse);
}

export const rejectOrder = (id) =>
{
  const orderId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(orderId)) {
    const error = new Error('Invalid order id');
    console.error('[rejectOrder] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/orders/${orderId}/reject`, {
    method: 'PUT',
    headers: getHeaders(),
  }).then(handleResponse);
}

export const updateOrderApi = (id, body) =>
{
  const orderId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(orderId)) {
    const error = new Error('Invalid order id');
    console.error('[updateOrderApi] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/admin/orders/${orderId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);
}



export const updateOrderStatus = (id, status) =>
{
  const orderId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(orderId)) {
    const error = new Error('Invalid order id');
    console.error('[updateOrderStatus] invalid id:', { id });
    return Promise.reject(error);
  }

  return fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getHeaders(),   // ✅ includes token
    body: JSON.stringify({ status }),
  }).then(handleResponse);
}

// ── Billing ───────────────────────────────────────────
export const getBills = () =>
  fetch(`${BASE_URL}/billing/all`, { headers: getHeaders() }).then(handleResponse);

export const createBill = (body) =>
  fetch(`${BASE_URL}/billing/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

export const payBill = (id) => {
  const billId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(billId)) return Promise.reject(new Error('Invalid bill id'));
  return fetch(`${BASE_URL}/billing/pay/${billId}`, { method: 'PUT', headers: getHeaders() }).then(handleResponse);
};

export const generateMonthEndDriverPayouts = (body = {}) =>
  fetch(`${BASE_URL}/billing/driver-payouts/month-end`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const deleteBill = (id) => {
  const billId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(billId)) return Promise.reject(new Error('Invalid bill id'));
  return fetch(`${BASE_URL}/billing/delete/${billId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);
};

// ── Maintenance ───────────────────────────────────────
export const getMaintenanceLogs = () =>
  fetch(`${BASE_URL}/maintenance`, { headers: getHeaders() }).then(handleResponse);

export const createMaintenanceLog = (body) =>
  fetch(`${BASE_URL}/maintenance`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const completeMaintenanceLog = (id, body) => {
  const logId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(logId)) return Promise.reject(new Error('Invalid maintenance log id'));
  return fetch(`${BASE_URL}/maintenance/${logId}/complete`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);
};

export const deleteMaintenanceLog = (id) => {
  const logId = typeof id === 'string' ? id.trim() : '';
  if (!isValidMongoId(logId)) return Promise.reject(new Error('Invalid maintenance log id'));
  return fetch(`${BASE_URL}/maintenance/${logId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  }).then(handleResponse);
};
