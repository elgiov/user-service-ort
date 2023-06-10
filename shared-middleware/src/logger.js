"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckLogger = exports.logger = void 0;
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const winston_sumologic_transport_1 = require("winston-sumologic-transport");
const { combine, timestamp, printf, colorize, errors, splat, json, simple } = winston_1.format;
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: combine(timestamp(), errors({ stack: true }), splat(), json()),
    defaultMeta: { service: 'GestionInventario' },
    transports: [
        new winston_1.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.transports.File({ filename: 'logs/combined.log' }),
        new winston_sumologic_transport_1.SumoLogic({
            url: 'https://endpoint6.collection.us2.sumologic.com/receiver/v1/http/ZaVnC4dhaV31-EHgRxKhzkHjs1rxgtn7niquJat-S7Xy7OyFrYiAWfsfk6wUsaUWakVLR1q_c6F6uyqWKfzlAdgeHPG97FovRKrD6XfLfkVOS0D2zjuktw==',
            level: 'info',
            interval: 1000
        }),
        new winston_daily_rotate_file_1.default({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '1d'
        }),
        new winston_1.transports.Console({
            format: combine(colorize(), timestamp(), logFormat)
        })
    ],
    exceptionHandlers: [new winston_1.transports.File({ filename: 'logs/exceptions.log' })],
    rejectionHandlers: [new winston_1.transports.File({ filename: 'logs/rejections.log' })]
});
exports.logger = logger;
const healthCheckLogger = (0, winston_1.createLogger)({
    level: 'info',
    format: combine(timestamp(), errors({ stack: true }), splat(), json()),
    defaultMeta: { service: 'GestionInventario' },
    transports: [new winston_1.transports.File({ filename: 'logs/health-check.log' })]
});
exports.healthCheckLogger = healthCheckLogger;
//change when we launch to prod maybe
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.transports.Console({
        format: combine(colorize(), timestamp(), logFormat)
    }));
}
