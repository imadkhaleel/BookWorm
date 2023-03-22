/**
 * Generates a middleware function to verify if the user has the required roles
 * for the set of roles passed in. Middleware function generated will return 
 * HttpRespone 403 forbidden if the user does not have the required role or 
 * HttpResponse 401 unauthorized if the request object or request.roles is undefined
 *
 * @param  {...any} allowedRoles comma separated parameters of allowed roles (use ROLES_LIST values from src/config/RolesList.js)
 * @returns 
 */
const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles){
      return res.status(401).json({ message: "Unauthorized request (no roles found)" });
    } 

    const rolesArray = [...allowedRoles];
    const result = req.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true);

    if (!result) {
      return res.status(403).json({ message: "Forbidden request (insufficient clearance)" });
    } 
    next();
  };
};

module.exports = verifyRoles;