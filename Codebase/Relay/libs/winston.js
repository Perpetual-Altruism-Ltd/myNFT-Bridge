const Winston = require('winston')
const { createLogger, format, transports }  = require('winston')
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const Logger = function(section){
    return Winston.createLogger({
            transports: [
                new Winston.transports.Console(),
                //new Winston.transports.File({ filename: 'combined.log' })
            ],
            format: combine(
                label({ label: section }),
                timestamp(),
                myFormat
            ),
        });
}

module.exports = Logger