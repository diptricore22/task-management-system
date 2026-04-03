import winston from 'winston';
import { config } from '@/config/env';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Choose the aspect of your log customizing the log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Define which transports the logger must use
const transports: any[] = [
  // Console transport
  new winston.transports.Console({
    format: format,
    level: config.app.isDevelopment ? 'debug' : 'info',
  }),
];

// If in production, also log to files
if (config.app.isProduction) {
  // @ts-ignore - winston transport type compatibility issue
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Create the logger instance
export const logger = winston.createLogger({
  level: config.app.isDevelopment ? 'debug' : 'info',
  levels,
  transports,
  exitOnError: false,
});

// Stream interface for Morgan
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;