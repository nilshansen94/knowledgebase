import winston, {format} from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    format.simple(),
    format.timestamp(),
    format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'main.log' }),
  ]
});
