/**
 * If the request is coming from a trusted source
 * (something in the allowedOrigins array), then
 * we will allow the request to continue by setting
 * the Access-Control-Allow-Origin header to true to
 * allow the request to continue through CORS policy.
 *
 * Run this before the cors() middleware.
 */

const allowedOrigins = require("../config/AllowedOrigins");

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = credentials;