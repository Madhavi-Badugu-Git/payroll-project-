import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import loggerConfig from './logger-config';

// Add colors to winston
winston.addColors(loggerConfig.colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports based on configuration
const transports: winston.transport[] = [];

// Console transport (for development or when explicitly enabled)
if (loggerConfig.shouldLogToConsole()) {
  transports.push(
    new winston.transports.Console({
      level: loggerConfig.getLogLevel(),
      format,
    })
  );
}

// File transports (for production or when explicitly enabled)
if (loggerConfig.shouldLogToFiles()) {
  // File transport for errors
  transports.push(
    new DailyRotateFile({
      filename: loggerConfig.files.errorLog,
      datePattern: loggerConfig.files.datePattern,
      level: 'error',
      format: fileFormat,
      maxSize: loggerConfig.files.maxSize,
      maxFiles: loggerConfig.files.maxFiles,
      zippedArchive: true,
    })
  );

  // File transport for all logs
  transports.push(
    new DailyRotateFile({
      filename: loggerConfig.files.appLog,
      datePattern: loggerConfig.files.datePattern,
      format: fileFormat,
      maxSize: loggerConfig.files.maxSize,
      maxFiles: loggerConfig.files.maxFiles,
      zippedArchive: true,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: loggerConfig.getLogLevel(),
  levels: loggerConfig.levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for different log levels
export const logError = (message: string, error?: Error | unknown) => {
  if (error) {
    if (error instanceof Error) {
      logger.error(`${message}: ${error.message}`, {
        stack: error.stack,
        name: error.name,
      });
    } else {
      logger.error(`${message}: ${String(error)}`);
    }
  } else {
    logger.error(message);
  }
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: Record<string, unknown>) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: Record<string, unknown>) => {
  logger.http(message, meta);
};

export default logger;
