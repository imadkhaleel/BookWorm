/**
 * This is a logging middleware that logs all requests to the server.
 * It logs the request method, the request path, and the request origin.
 */

const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

/**
 * Every time this function is called, it will log the event to the
 * specified file. If the file does not exist, it will create it in 
 * the logs directory (../logs/{logName}) and then log your message
 * prefixed with the timestamp.
 * 
 * @param {String} message note to be logged
 * @param {String} logName name of the log file to be written to
 */
const logEvents = async (message, logName) => {
  const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // if the logs directory does not exist, create it
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }

    // if the log file doesn't exist create it, 
    // then append the logItem to the end of the file
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

/**
 * Middleware function that logs all requests to the server in
 * the ../logs/reqestLog.txt file.
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @param {HttpMiddleware} next next middleware in the chain
 */
const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "requestLog.txt");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logger, logEvents };
