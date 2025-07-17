import fs from 'fs'
import path from 'path';
import { createLogger, format, transports } from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3, 
        debug: 4
    },
};

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

export const logger = createLogger({
    levels: customLevels.levels,
    level: "http",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),

        new DailyRotateFile({
            filename: path.join(logDir, 'http-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'http',
            maxFiles: '2m',              // ❗ keep only last 7 days
            zippedArchive: true          // optional: compress old logs
        }),

        new DailyRotateFile({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '2m',
            zippedArchive: true
        }),

        new DailyRotateFile({
            filename: path.join(logDir, 'app-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            maxFiles: '2m',
            zippedArchive: true
        })
        // new transports.File({
        //     filename: path.join(logDir, 'http.log'),
        //     level: 'http'
        // }),
        // new transports.File({
        //     filename: path.join(logDir, 'error.log'),
        //     level: 'error'
        // }),
        // new transports.File({
        //     filename: path.join(logDir, 'app.log'),
        //     level: 'info'
        // })
    ]

});

export const morganStream = {
    write: (message: string) => logger.http(message.trim())
};