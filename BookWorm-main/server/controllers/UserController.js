const mongoose = require("mongoose");
const { userModel } = require("../models/User");
const { roleModel } = require("../models/Role");
const ROLES_LIST = require("../config/RolesList");


/**
 * Gets list of existing users
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and list of users
 */
const getUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).exec();
    return res.status(200).json({ result: users, message: "Success" });
  } 
  catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error getting Users" });
  }
};

/**
 * Makes sure the current user matches the jwt, then returns the current user
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and user
 */
const getUser = async (req, res) => {
  const { user } = req;
  if (!user) {
    return res.status(400).json({ message: "No Username" });
  }
  const currentUser = await userModel.findOne({ username: user }).exec();
  if (currentUser._id.toString() === req.params.id) {
    return res
      .status(200)
      .json({ result: currentUser, message: "Success" });
  } 
  else {
    return res
      .status(403)
      .json({
        message: "Forbidden: Cannot access other Users info",
      });
  }
};

/**
 * Takes request with user parameters and returns user object created
 * Expects:
 * ```json
 * {"roles":[String], "username": String, "firstName": String, "lastName": String, "email": String, "password": String, "status"}
 * 
 * ```
 * roles should be an array of roles in String format
 * 
 * @param {HttpRequest} req request objec
 * @param {HttpResponse} res response object  
 * @returns json object with message and created user
 */

const createUser = async (req, res) => {
  try {
    let {roles, username, firstName, lastName, email, password, status} = req.body

    if(!(roles && username && firstName && lastName && email && password && status)){
      return res.status(400).json({ message: "All fields required"})
    }
    if (!verifyRoles(roles)){
      return res.status(400).json({ message: "Role does not exist"})
    }
    const checkUser = await userModel.findOne({username: req.username})
    if (!checkUser){
      return res.status(500).json({ message : "Username already exists"})
    }
    const user = await userModel.create({roles, username, firstName, lastName, email, password, status});
    return res.status(200).json({result: user, message: "Success"});
  } 
  catch (err){
    console.log((err));
    return res.status(500).json({ message : "Error creating user"})
  }
};

const updateUser = async (req, res) => {
  const canEdit = await userCanEdit(req)
  if (canEdit){
    let {roles, username, firstName, lastName, email, password, status, dateOfBirth} = req.body
    if(!(roles && username && firstName && lastName && email && password && status && dateOfBirth)){
      return res.status(400).json({ message: "All fields required"})
    }
    const verifiedRoles = await verifyRoles(roles)
    if (!verifiedRoles){
      return res.status(400).json({ message: "Role does not exist"})
    }
    const {user} = req
    if (!user){
      return res.status(400).json({ message: "User does not exist"})
    }
    try{
      const userToUpdate = await userModel.findOne({username: req.user}).exec();
      if(!userToUpdate){
        return res.status(400).json({ message: "Invalid user"});
      }
      const newUser = await userModel.findOneAndUpdate({roles, username, firstName, lastName, email, password, status, dateOfBirth});
      if(newUser){
        return res.status(200).json({ message: "Success updating user"})
      } 
      else {
        return res.status(400).json({ message: "Failure updating user"})
      } 
    } 
    catch {
      return res.status(400).json({ message: "Error updating user"})
    }
  } 
  else {
    return res.status(400).json({ message: "Invalid permissions to update user"})
  }
};

const updateUserProperties = async (req, res) => {
  const canEdit = await userCanEdit(req)
  if (canEdit){
    try{
      const userToUpdate = await userModel.findOne({username: req.username}).exec();
      if(!userToUpdate){
        return res.status(400).json({ message: "Invalid user"});
      }
    } 
    catch{
      return res.status(400).json({ message: "Error updating user"})
    }
    let {roles, username, firstName, lastName, email, password, status, dateOfBirth} = req.body
    let roleR, usernameR, firstNameR, lastNameR, emailR, passwordR, statusR, dateOfBirthR;
    if (roles){
      const verifiedRoles = await verifyRoles(roles)
      if(!verifiedRoles){
        return res.status(400).json({ message: "Invalid role"})
      }
      roleR = roles
    } 
    else {
      roleR = userToUpdate.roles
    }

    if (username){
      const checkUser = await userModel.findOne({username: req.username})
      if (!checkUser){
        return res.status(500).json({ message : "Username already exists"})
      }
      usernameR = username
    } 
    else {
      usernameR = userToUpdate.username
    }
    if (firstName){
      firstNameR = firstName
    } 
    else{
      firstNameR = userToUpdate.firstName
    }
    if (lastName){
      lastNameR = lastName
    } 
    else{
      lastNameR = userToUpdate.lastName
    }
    if (email){
      emailR = email
    } 
    else {
      emailR = userToUpdate.email
    }
    if (password){
      passwordR = password
    } 
    else {
      passwordR = userToUpdate.password
    }
    if (status){
      statusR = status
    } 
    else {
      statusR = userToUpdate.status
    }
    if (firstName){
      dateOfBirthR = firstName
    }
    else{
      dateOfBirthR = userToUpdate.dateOfBirth
    }
    try {
      const newUser = await userModel.findOneAndUpdate({roleR, usernameR, firstNameR, lastNameR, emailR, passwordR, statusR, dateOfBirthR});
      if(newUser){
        return res.status(200).json({ message: "Success updating user"})
      } 
      else {
        return res.status(400).json({ message: "Failure updating user"})
      }
    } 
    catch(err){
      console.log(err);
      return res.status(400).json({ message: "Could not make new user"})
    }
  } 
  else {
    return res.status(400).json({ message: "Invalid permissions to update user"})
  }
};
/**
 * Takes request with username to delete
 * 
 * Expects:
 * ```json
 * { "user": String, "roles" [String]}
 * ```
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */

const deleteUser = async (req, res) => {
  const canEdit = await userCanEdit(req)
  if (canEdit){
    try{
      const {user} = req
      if(!user){
        return res.status(400).json({ message:"User does not exist"})
      }
      const userToDelete = userModel.findOne({username: user}).exec();
      if(!userToDelete){
        return res.status(400).json({ message: "invalid user" });
      }
      await userModel.findOneAndDelete({username:user}).exec();
      return res.status(200).json({ message: "Success"});
    } 
    catch (err){
      console.log(err);
      return res.status(500).json({ message: "Error deleting user"});
    }
  }
  else {
    return res.status(400).json({ message: "Invalid permissions to delete user"})
  }
};

/**
 * Determines whether or not the user is either the correct user or if they are an admin
 * @param {HttpRequest} req 
 * @returns {Boolean} whether the user can edit the information requested
 */
const userCanEdit = async (req) => {
  if (!req.roles){
    return false
  }
  if (req.roles.includes(ROLES_LIST.ADMIN)){
    return true
  }
  const { user } = req;
  if (!user) {
    console.log("User does not exist")
    return false;
  }
  try{
    const currentUser = await userModel.findOne({ username: user }).exec();
    return (currentUser._id.toString() === req.params.id);
  } 
  catch (err) {
    console.log("Error querying user");
    return false;
  }
}

/**
 * Determines whether or not the input roles are valid and exist.
 * @param {[String]} inputRoles array of roles as strings
 * @returns {Boolean} whether or not the roles exist.
 */
const verifyRoles = async(inputRoles) =>{
  try{
    const existingRoles = await roleModel.find({}).exec();
    const existingRoleNames = new Set(existingRoles.map(role => role.name));
    for(let i = 0; i < inputRoles.length; i++){
      if(!existingRoleNames.has(inputRoles[i])){
        return false
      }
    }
    return true
  } 
  catch(err){
    return false
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserProperties,
  deleteUser,
};
