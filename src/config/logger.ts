import { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { SumoLogic } from 'winston-sumologic-transport';

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
        new SumoLogic({
            url: 'https://endpoint6.collection.us2.sumologic.com/receiver/v1/http/ZaVnC4dhaV31-EHgRxKhzkHjs1rxgtn7niquJat-S7Xy7OyFrYiAWfsfk6wUsaUWakVLR1q_c6F6uyqWKfzlAdgeHPG97FovRKrD6XfLfkVOS0D2zjuktw==',
            level: 'info',
            interval: 1000
        }),
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '1d'
        }),
        new transports.Console({
            format: combine(colorize(), timestamp(), logFormat)
        })
    ],
    exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
    rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })]
});

const healthCheckLogger = createLogger({
    level: 'info',
    format: combine(timestamp(), errors({ stack: true }), splat(), json()),
    defaultMeta: { service: 'GestionInventario' },
    transports: [new transports.File({ filename: 'logs/health-check.log' })]
});

//change when we launch to prod maybe
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: combine(colorize(), timestamp(), logFormat)
        })
    );
}

export { logger, healthCheckLogger };
