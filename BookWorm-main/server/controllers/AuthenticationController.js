"use strict";

// =========================
// Get Environment Variables
// =========================
const path = require("path");
const rootDir = path.resolve(__dirname, ".");
const env = require("dotenv").config({ path: "../" }).parsed;

if (!env) {
  console.log("Environment variables file not found");
}

// ==========================
// General Require Statements
// ==========================
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/User");
const { roleModel } = require("../models/Role");
const { getRolesFromJWT } = require("../middleware/VerifyRoles");
const { authorModel } = require("../models/Author");

// ====================================
// Endpoints for Registration and Login
// ====================================
const register = async (req, res) => {
  const { username, password, firstName, lastName, email, status, roles, dateOfBirth } =
    req.body;

  if (
    !req.body ||
    !password ||
    !username ||
    !firstName ||
    !lastName ||
    !email ||
    !status ||
    !roles ||
    !dateOfBirth
  ) {
    res.status(400).json({ message: "All registration fields are required." });
    return;
  }
  let today = Date.now(); //Validate they are over 18
  if((today.getFullYear() - dateOfBirth.toTimeString().getFullYear()) <= 18){
    if(dateOfBirth.getMonth() < today.getMonth()) {
      if(dateOfBirth.getDay() < today.getDay()) {
        res.status(400).json({ message: "Must be over 18 to create an account." })
      }
    }
  }
  //Verifying roles
  let requestedRoleStrings = [];
  if (roles.length === 0) {
    requestedRoleStrings.push("Member");
  } else if (roles.includes("Admin") || roles.includes("Curator")) {
    // Admins can only be created by other admins
    // Validate that the person attempting to create an admin is an admin
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Requester ")) {
      return res.status(401).json({ message: "No authorization header" });
    }

    // Get the token from the header, get roles from token,
    // and ensure user trying to create an admin user has admin role
    const token = authHeader.split(" ")[1];
    const tokenRoles = getRolesFromJWT(token);
    if (!tokenRoles.includes("Admin")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    requestedRoleStrings = [...roles];
  } 
  else {
    requestedRoleStrings = [...roles];
  }

  try {
    const foundUser = await userModel.findOne({ username: username }).exec();
    if (foundUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    //Increase the amount in gensalt to increase security but will slow down registration significantly.
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    // requested roles to be used for applying roles if valid
    let requestedRoles = [];
    const foundRoles = await roleModel
      .find({ name: { $in: requestedRoleStrings } })
      .exec();
    if (!foundRoles || foundRoles.length === 0) {
      return res.status(400).json({ message: "Invalid roles." });
    }
    // if all roles are valid, then add their roleIds to the requestedRoles array
    requestedRoles = foundRoles.map((role) => role._id);

    await userModel.create([
      {
        username: username,
        firstName: firstName,
        lastName: lastName,
        password: encryptedPassword,
        email: email,
        status: status || "Normal",
        roles: requestedRoles,
        dateOfBirth: dateOfBirth,
      },
    ]);
    return res.status(200).json({ message: "User registered successfully!" });
  } 
  
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const foundUser = await userModel.findOne({ username: username }).exec();
    if (!foundUser)
      return res.status(401).json({ message: "No user with that username." }); //Unauthorized

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return res.status(401).json({ message: "Incorrect Password." }); //Unauthorized

    const rolesObjects = await roleModel
      .find({ _id: { $in: foundUser.roles } })
      .exec();
    const roles = rolesObjects.map((role) => role.name);

    const accessSecret =
      process.env.ACCESS_TOKEN_SECRET ||
      env["ACCESS_TOKEN_SECRET"] ||
      "SuperSecret";
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      accessSecret,
      { expiresIn: 5*60 }
    );

    const refreshSecret =
      process.env.REFRESH_TOKEN_SECRET ||
      env["REFRESH_TOKEN_SECRET"] ||
      "SuperSecret";
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      refreshSecret,
      { expiresIn: "1d" }
    );

    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();

    // Creates Secure Cookie with refresh token
    // res.cookie("jwt", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "None",
    //   maxAge: 24 * 60 * 60 * 1000,
    // });

    // Send authorization roles and access token to user
    return res
      .status(200)
      .json({ roles, accessToken, message: "Login Success!" });
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = {
  register,
  login,
};