import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import util from 'node:util';

const isTestEnv = process.env.NODE_ENV === 'test';
const isProductionEnv = process.env.NODE_ENV === 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../logs');
const logFile = path.join(logDir, 'app.log');
const logStream = isTestEnv ? null : (() => {
  fs.mkdirSync(logDir, { recursive: true });
  return fs.createWriteStream(logFile, { flags: 'a' });
})();
const colorMap = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[90m',
  http: '\x1b[35m',
};
const resetColor = '\x1b[0m';

const serialize = (value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
};

const safeJson = (value) => {
  try {
    return JSON.stringify(value, (_key, currentValue) => serialize(currentValue));
  } catch (_err) {
    return JSON.stringify({ message: 'Unserializable log payload' });
  }
};

const writeToFile = (line) => {
  if (!logStream) return;

  const ok = logStream.write(`${line}\n`);
  if (!ok) {
    logStream.once('drain', () => {});
  }
};

const formatConsole = (entry) => {
  const color = colorMap[entry.level] || '';
  const level = entry.level.toUpperCase().padEnd(5, ' ');
  const meta =
    entry.meta === undefined
      ? ''
      : ` ${util.inspect(entry.meta, { depth: 5, colors: true, compact: true, breakLength: Infinity })}`;

  return `${color}${entry.timestamp} [${level}] ${entry.message}${meta}${resetColor}`;
};

const write = (level, message, meta) => {
  if (isTestEnv && level !== 'error') return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta !== undefined ? { meta } : {}),
  };

  const line = safeJson(entry);
  writeToFile(line);

  const output = isProductionEnv ? line : formatConsole(entry);

  if (level === 'error') {
    console.error(output);
    return;
  }

  if (level === 'warn') {
    console.warn(output);
    return;
  }

  console.log(output);
};

export const logger = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
  debug: (message, meta) => write('debug', message, meta),
  http: (message, meta) => write('http', message, meta),
};
