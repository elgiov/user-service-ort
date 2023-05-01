import { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors, splat, json, simple } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(timestamp(), errors({ stack: true }), splat(), json()),
    defaultMeta: { service: 'GestionInventario' },
    transports: [
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '1d'
        })
    ],

    exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],

    rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })]
});

//change when we launch to prod maybe
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: combine(colorize(), timestamp(), logFormat)
        })
    );
}

export default logger;
