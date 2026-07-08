const WINDOW_MS = 60 * 1000;
const DEFAULT_SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS || 1000);

const state = {
  totalRequests: 0,
  totalDurationMs: 0,
  slowRequests: 0,
  recentRequests: [],
  byRoute: new Map(),
};

const pruneRecentRequests = (now) => {
  while (state.recentRequests.length > 0 && now - state.recentRequests[0] > WINDOW_MS) {
    state.recentRequests.shift();
  }
};

export const recordRequestMetrics = ({ method, path, statusCode, durationMs }) => {
  const now = Date.now();
  const routeKey = `${method} ${path}`;
  const duration = Number(durationMs) || 0;

  state.totalRequests += 1;
  state.totalDurationMs += duration;
  state.recentRequests.push(now);
  pruneRecentRequests(now);

  if (duration >= DEFAULT_SLOW_REQUEST_MS) {
    state.slowRequests += 1;
  }

  const existing = state.byRoute.get(routeKey) || {
    count: 0,
    totalDurationMs: 0,
    slowRequests: 0,
    lastStatusCode: null,
    minDurationMs: Infinity,
    maxDurationMs: 0,
  };

  existing.count += 1;
  existing.totalDurationMs += duration;
  existing.lastStatusCode = statusCode;
  existing.minDurationMs = Math.min(existing.minDurationMs, duration);
  existing.maxDurationMs = Math.max(existing.maxDurationMs, duration);

  if (duration >= DEFAULT_SLOW_REQUEST_MS) {
    existing.slowRequests += 1;
  }

  state.byRoute.set(routeKey, existing);
};

export const getPerformanceMetrics = () => {
  const now = Date.now();
  pruneRecentRequests(now);

  const routeStats = Array.from(state.byRoute.entries())
    .map(([route, stats]) => ({
      route,
      count: stats.count,
      avgDurationMs: stats.count ? Number((stats.totalDurationMs / stats.count).toFixed(2)) : 0,
      minDurationMs: Number.isFinite(stats.minDurationMs) ? Number(stats.minDurationMs.toFixed(2)) : 0,
      maxDurationMs: Number(stats.maxDurationMs.toFixed(2)),
      slowRequests: stats.slowRequests,
      lastStatusCode: stats.lastStatusCode,
    }))
    .sort((a, b) => b.avgDurationMs - a.avgDurationMs);

  const avgResponseTimeMs = state.totalRequests
    ? Number((state.totalDurationMs / state.totalRequests).toFixed(2))
    : 0;

  return {
    windowSeconds: Math.floor(WINDOW_MS / 1000),
    slowRequestThresholdMs: DEFAULT_SLOW_REQUEST_MS,
    totalRequests: state.totalRequests,
    avgResponseTimeMs,
    throughputRps: Number((state.recentRequests.length / (WINDOW_MS / 1000)).toFixed(2)),
    requestsLast60s: state.recentRequests.length,
    slowRequests: state.slowRequests,
    routeStats,
  };
};

