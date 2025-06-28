import path from 'path';
import { createLogger, format, transports, } from 'winston';

const logFormat = format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});


const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }), format.errors({ stack: true }),
        format.splat(),
        format.json(),
        logFormat
    ),

    transports: [
        new transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
        }),
        new transports.File({
            filename: path.join(__dirname, '../../logs/combine.log'),
        })
    ]
});

export default logger;