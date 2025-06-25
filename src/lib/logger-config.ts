// Winston Logger Configuration
export const loggerConfig = {
  // Log levels: error: 0, warn: 1, info: 2, http: 3, debug: 4
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },

  // Colors for console output
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  },

  // Environment settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // File settings
  files: {
    errorLog: 'logs/error-%DATE%.log',
    appLog: 'logs/app-%DATE%.log',
    maxSize: '20m',
    maxFiles: '14d',
    datePattern: 'YYYY-MM-DD',
  },

  // Get appropriate log level based on environment
  getLogLevel(): string {
    return this.isDevelopment ? 'debug' : 'warn';
  },

  // Should log to console?
  shouldLogToConsole(): boolean {
    return this.isDevelopment || process.env.LOG_TO_CONSOLE === 'true';
  },

  // Should log to files?
  shouldLogToFiles(): boolean {
    return this.isProduction || process.env.LOG_TO_FILES === 'true';
  },
};

export default loggerConfig;
