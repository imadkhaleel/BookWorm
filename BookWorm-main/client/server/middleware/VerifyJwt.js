const jwt = require("jsonwebtoken");

/**
 * This is a middleware function that verifies the JWT token in the request
 * header. If the token is valid, it will add the decoded token to the request
 * object and call the next middleware in the chain. If the token is invalid,
 * it will return a 401 Unauthorized or 403 Forbidden response. 
 * 
 * It expects the auth header to be in the format: "Bearer {token}"
 * It expects the token to have a payload in the following json format:
 * ```json
 * { "UserInfo": { "username": String, "roles": [String] } }
 * ```
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @param {HttpMiddleware} next next middleware in the chain
 * @returns HttpResponse 401 unauthorized if there is no authorization header or if the auth header does not start with 'Bearer ' OR it returns HttpResponse 403 forbidden if the token is invalid
 */
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];
  console.log(`Verifying token: ${token}`);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" }); 
    }

    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    next();
  });
};

/**
 * Takes a JSON Web Token and returns an array of the string roles in the token
 * @param {String} jwt JWT token
 */
const getRolesFromJWT = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err || !decoded.UserInfo || !decoded.UserInfo.roles) {
      return [];
    }

    return decoded.UserInfo.roles;
  });
};

module.exports = {verifyJWT, getRolesFromJWT};