// Edge-compatible logger for middleware
// Since Winston uses Node.js streams which aren't available in Edge Runtime,
// we need a simpler logging approach for middleware

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, unknown>;
}

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const isProduction = process.env.NODE_ENV === 'production';
const currentLogLevel = isProduction ? logLevels.warn : logLevels.debug;

function shouldLog(level: keyof typeof logLevels): boolean {
  return logLevels[level] <= currentLogLevel;
}

function _formatLogEntry(
  level: string,
  message: string,
  metadata?: Record<string, unknown>
): string {
  const timestamp = new Date().toISOString();
  const logEntry: LogEntry = {
    timestamp,
    level,
    message,
    ...(metadata && { metadata }),
  };
  return JSON.stringify(logEntry);
}

function consoleLog(level: string, message: string, metadata?: Record<string, unknown>) {
  const formattedMessage = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}`;

  if (metadata) {
    console.log(formattedMessage, metadata);
  } else {
    console.log(formattedMessage);
  }
}

// Edge-compatible logging functions
export const edgeLogError = (message: string, metadata?: Record<string, unknown>) => {
  if (shouldLog('error')) {
    consoleLog('error', message, metadata);
  }
};

export const edgeLogWarn = (message: string, metadata?: Record<string, unknown>) => {
  if (shouldLog('warn')) {
    consoleLog('warn', message, metadata);
  }
};

export const edgeLogInfo = (message: string, metadata?: Record<string, unknown>) => {
  if (shouldLog('info')) {
    consoleLog('info', message, metadata);
  }
};

export const edgeLogHttp = (message: string, metadata?: Record<string, unknown>) => {
  if (shouldLog('http')) {
    consoleLog('http', message, metadata);
  }
};

export const edgeLogDebug = (message: string, metadata?: Record<string, unknown>) => {
  if (shouldLog('debug')) {
    consoleLog('debug', message, metadata);
  }
};
