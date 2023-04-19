const mongoose = require("mongoose");
const { userModel } = require("../models/User");
const { roleModel } = require("../models/Role");

/**
 * Gets list of existing roles
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and list of roles
 */
const getRoles = async (req, res) => {
  try {
    const roles = await roleModel.find({}).exec();
    return res.status(200).json({ result: roles, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting roles" });
  }
};

/**
 * Takes request with role id and returns role object if it exists, null otherwise
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried role
 */
const getRole = async (req, res) => {
  try {
    const role = await roleModel.findById(req.params.id).exec();
    return res.status(200).json({ result: role, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error getting role" });
  }
};

/**
 * Takes request with role name and clearance level and returns role object created
 *
 * Expects:
 * ```json
 * { "name": String, "memberType": Number }
 * ```
 * name should be a string, memberType should be a number, both are required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and created role
 */
const createRole = async (req, res) => {
  try {
    let { name, clearance } = req.body;
    if (!name || !clearance) {
      return res
        .status(400)
        .json({
          result: null,
          message: "Role name and clearance are required",
        });
    }
    const role = await roleModel.create({ name, clearance });
    return res.status(200).json({ result: role, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error creating role" });
  }
};

/**
 * Takes request with role id, name, and clearance level and
 * returns role object updated as result.
 *
 * Replaces existing role with new role created with passed name and clearance
 *
 * Expects:
 * ```json
 * { "id": String, "name": String, "clearance": Number }
 * ```
 * id should be an object id in String format, required
 *
 * name should be a string, clearance should be a number, both are required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated role
 */
const updateRole = async (req, res) => {
  try {
    let { id, name, clearance } = req.body;
    if (!name || !clearance) {
      return res
        .status(400)
        .json({
          result: null,
          message: "Role name and clearance are required",
        });
    }
    const roleToUpdate = await roleModel.findById(id).exec();
    if (!roleToUpdate) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid role id ${id}` });
    }
    const role = await roleModel
      .findByIdAndUpdate(id, { name, clearance }, { new: true })
      .exec();
    return res.status(200).json({ result: role, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error updating role" });
  }
};

/**
 * Takes request with role name and
 * returns json object with message of success or failure
 * Applies role to all users corresponding to passed usernames
 *
 * Expects:
 * ```json
 * { "id": String, "usernames": [String] }
 * ```
 * id should be an object id for the role to be applied in String format, required
 *
 * usernames should be an array of strings, required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated genre
 */
const addUsersToRole = async (req, res) => {
  try {
    let { id, usernames } = req.body;
    if (!id || !usernames) {
      return res
        .status(400)
        .json({ result: null, message: "Role id and usernames are required" });
    }
    // ensure role exists
    const role = await roleModel.findById(id).exec();
    if (!role) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid role id ${id}` });
    }
    // ensure users exist and add role if they do
    for (let i = 0; i < usernames.length; i++) {
      const user = await userModel.findOne({ username: usernames[i] }).exec();
      if (!user) {
        return res
          .status(400)
          .json({ result: null, message: `Invalid username ${usernames[i]}` });
      }
      user.roles.push(role._id);
      await user.save();
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error adding users to role" });
  }
};

/**
 * Takes request with role id of role to delete
 *
 * Expects:
 * ```json
 * { "id": String }
 * ```
 * id is required, with id being the object id of the role to delete in String format
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */
const deleteRole = async (req, res) => {
  try {
    let { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Role id is required" });
    }
    // ensure role exists
    const role = await roleModel.findById(id).exec();
    if (!role) {
      return res
        .status(400)
        .json({ message: `Invalid role id ${id}` });
    }
    // remove role from all users with role in roles array
    await userModel.updateMany({ roles: id }, { $pull: { roles: id } }).exec();
    // delete role
    await roleModel.findByIdAndDelete(id).exec();
    return res.status(200).json({ message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error deleting role" });
  }
};

module.exports = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  addUsersToRole,
  deleteRole,
};




