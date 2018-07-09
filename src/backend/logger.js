
const path = require('path');
const winston = require('winston');

const myFormat = winston.format.printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logPath = path.join(__dirname, '../../', 'logs');

module.exports = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.label({ label: 'server' }),
        winston.format.timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logPath, 'combined.log')
        }),
        new winston.transports.Console()
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logPath, 'combined.log')
        })
    ]
});
