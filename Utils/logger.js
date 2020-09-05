/**
 * Configurations of logger.
 */

const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
	// format của log được kết hợp thông qua format.combine
	format: winston.format.combine(
		winston.format.splat(),
		// Định dạng time cho log
		winston.format.timestamp({
			format: 'DD-MM-YYYY HH:mm:ss',
		}),
		// thêm màu sắc
		winston.format.colorize(),
		// thiết lập định dạng của log
		winston.format.printf(log => {
			// nếu log là error hiển thị stack trace còn không hiển thị message của log
			if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
			return `[${log.timestamp}] [${log.level}] ${log.message}`;
		})
	),
	transports: [
		// Thiết lập ghi các errors vào file
		new winston.transports.File({
			level: 'error',
			filename: 'logger/errors.log',
		}),
		new winston.transports.File({
			level: 'info',
			filename: 'logger/info.log',
		}),
		// new winston.transports.File({
		//   level: 'debug',
		//   filename: 'logger/debug.log'
		// }),

		// hiển thị log thông qua console
		//new winston.transports.Console(),
	],
});
module.exports = logger;
