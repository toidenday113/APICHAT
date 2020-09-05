/**
 * Configurations of logger.
 */
// var winston = require('winston');
// const logger = winston.createLogger({
//   level: 'debug',
//   //format: winston.format.json(),
//   format: winston.format.combine(
//     winston.format.timestamp("DD-MM-YYYY HH:mm"),
//     winston.format.json()
// ),
//   transports: [
//     new winston.transports.File({ filename: 'logger/error.log', level: 'error' }),
//     new winston.transports.File({ filename: 'logger/info.log', level: 'info' }),
//     new winston.transports.File({ filename: 'logger/debug.log', level: 'debug' }),
//     new winston.transports.File({ filename: 'logger/combined.log' }),
//   ],
// });

// // chỉ ghi log ra console nếu không phải là môi trường production
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     })
//   );
// }
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
