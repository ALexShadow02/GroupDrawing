const winston = require('winston')
const appRoot = require('app-root-path')
const options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
    }
}
const logger = winston.createLogger({
    transports : [
        new winston.transports.File(options.file)
    ],
    exitOnError: false
})
logger.stream = {
    write: (message, encoding) => logger.info(message)
}
module.exports = logger