"use strict";
const path = require("path");

const mongoose = require("mongoose");
const { genreModel } = require("../models/Genre");
const { userModel } = require("../models/User");
const { ebookModel } = require("../models/Ebook");
const { listedebookModel } = require("../models/ListedEbook");
//const { formatModel } = require("../models/Format");
const { authorModel } = require("../models/Author");
const ROLES_LIST = require("../config/RolesList");

/**
 * Gets list of existing ebooks
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and result containing list of ebooks if found
 */
const populateCatalog = async (req, res) => {
  try {
    const ebooks = await ebookModel.find({}).exec();
    return res.status(200).json({ result: ebooks, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting ebooks" });
  }
};

/**
 * Takes request with ebook id and returns ebook object if it exists, null otherwise
 * Expects ebook id as url parameter:
 *
 * Ex: www.bookworm.com/api/ebook/5f9f1b9f9f1b9f1b9f1b9f1b
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried ebook
 */
const get_eBook = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
        .status(400)
        .json({ result: null, message: "ebook id is required" });
  }
  try {
    const ebook = await ebookModel.findById(id).exec();
    return res.status(200).json({ result: ebook, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
        .status(500)
        .json({ result: null, message: "Error getting ebook" });
  }
};

/**
 * Takes request with ebook author,publisher, genre, title, numberOfPages,
 * ISBN, description, publishDate, coverImageURL, availableCopies, and formatType.
 * coverImageURL url and creates a new ebook, adds it to the
 * author's ebooks, and ebooks associated with the passed genre
 * and returns ebook object created.
 *
 * Expects:
 * ```json
 * {
 *  "author": String,
 *  "publisher: String,
 *  "genre": String,
 *  "title": String,
 *  "numberOfPages": Number,
 *  "ISBN": String
 *  "description": String,
 *  "publishDate": Date,
 *  "coverImageURL": String,
 *  "availableCopies": Number,
 *  "formatType": String,
 * }
 * ```
 * author and genre should be object ids in String format, required
 *
 * title, license, and description should be Strings, required
 *
 * duration should be the duration in seconds of the ebook as a Number, required
 *
 * published should be the date the ebook was published as a Date, required
 *
 * coverImageURL should be a url to the cover art of the ebook as a String, required
 *
 * ebooks should be an array of ebook ids in String format, can be empty
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and created genre
 */
const addEbook = async (req, res) => {
  try {
    let {
      author,
      publisher,
      genre,
      title,
      numberOfPages,
      ISBN,
      description,
      publishDate,
      coverImageURL,
      availableCopies,
      formatType,
    } = req.body;
    const maxAvailableCopies = 0;

    if (
        !author ||
        !publisher ||
        !genre ||
        !title ||
        !numberOfPages ||
        !ISBN ||
        !description ||
        !publishDate ||
        !coverImageURL||
        !availableCopies ||
        !formatType
    ) {
      return res.status(400).json({ result: null, message: "Missing inputs" });
    }

    if (
        !mongoose.Types.ObjectId.isValid(author) ||
        !mongoose.Types.ObjectId.isValid(genre)
    ) {
      return res.status(400).json({ result: null, message: "Invalid inputs" });
    }

    const authorId = await authorModel.findById(author).exec();
    if (!authorId) {
      return res
          .status(400)
          .json({ result: null, message: "Invalid author id" });
    }

    const Genre = await genreModel.findById(genre).exec();
    if (!Genre) {
      return res
          .status(400)
          .json({ result: null, message: "Invalid genre id" });
    }

    const { user, roles } = req;
    if (!user || !roles) {
      return res.status(401).json({ result: null, message: "Unauthorized" });
    }
    const User = userModel.findOne({ username: user }).exec();
    if (!User) {
      return res
          .status(401)
          .json({ result: null, message: "Invalid user, unauthorized" });
    }

    if (
        !roles.includes(ROLES_LIST.ADMIN) &&
        !(author.user.toString() === User._id.toString())
    ) {
      return res
          .status(401)
          .json({
            result: null,
            message:
                "Unauthorized, you may not create a ebook under another author's name",
          });
    }

    // check if ebook with same author and title and description already exists
    const existingebook = await ebookModel
        .findOne({
          author,
          title,
          description,
        })
        .exec();
    if (existingebook) {
      return res.status(400).json({
        result: null,
        message: "ebook with same name, title, and description already exists",
      });
    }

    const ebook = await ebookModel.create({
      author,
      publisher,
      genre,
      title,
      numberOfPages,
      ISBN,
      description,
      publishDate,
      coverImageURL,
      availableCopies,
      formatType,
    });

    // add ebook to author's ebooks
    author.ebooks.unshift(ebook);
    const updatedauthor = await author.save();

    // add ebook to genre's ebooks
    ebook.genre.unshift(genre);
    const updatedGenre = await Genre.save();

    return res.status(200).json({ result: ebook, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
        .status(500)
        .json({ result: null, message: "Error creating ebook" });
  }
};

/**
 * Takes request with ebook author username, genre name, title, duration,
 * description, publishDate, coverImage file,
 * format, formatType, and creates a new ebook, adds it to the
 * author's ebooks, and ebooks associated with the passed genre and the format object
 * and returns ebook object created.
 *
 * Expects:
 * ```json
 * {
 *  "author": String,
 *  "publisher: String,
 *  "genre": String,
 *  "title": String,
 *  "numberOfPages": Number,
 *  "ISBN": String
 *  "description": String,
 *  "publishDate": Date,
 *  "coverImageURL": String,
 *  "availableCopies": Number,
 *  "formatType": String,
 * }
 * ```
 * author (username) and genre (name) should be Strings, required
 *
 * title and description should be Strings, required
 *
 * numberOfPages should be the number of pages in the ebook as a Number, required
 *
 * publishDate should be the date the ebook was published as a Date, required
 *
 * coverImageURL should be a link to an image (png), required
 *
 * ebooks should be an array of ebook ids in String format, can be empty
 *
 * formatType should be a string (pdf), required
 *
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and created genre
 */
const initialize_eBook = async (req, res) => {
  const { user, roles } = req;
  const {
    author,
    publisher,
    genre,
    title,
    numberOfPages,
    ISBN,
    description,
    publishDate,
    coverImageURL,
    availableCopies,
    formatType,
  } = req.body;

  let coverImage = "";
  let format = "";

  if (!user || !roles) {
    return res.status(401).json({ result: null, message: "Unauthorized" });
  }
  if (!author || !genre || !title || !numberOfPages || !description || !publisheDate || !formatType) {
    return res.status(400).json({ result: null, message: "Missing inputs" });
  }

  try {
    const author = await authorModel.findOne({ username: author }).exec();
    if (!author) {
      return res.status(400).json({ result: null, message: "Invalid author" });
    }
    let Genre = await genreModel.findOne({ name: genre }).exec();
    if (!Genre) {
      // create genre if it doesn't exist
      const newGenre = await genreModel.create({ name: genre });
      Genre = newGenre;
    }

    // check if ebook with same author and title and description already exists
    const existingebook = await ebookModel.findOne({ author: author._id, title, description }).exec();
    if(existingebook) {
      return res.status(400).json({ result: null, message: "ebook with same name, title, and description already exists" });
    }

    // create ebook
    const ebook = await ebookModel.create({
      author: author._id,
      genre: Genre._id,
      publisher,
      title,
      numberOfPages,
      ISBN,
      description,
      publishDate,
      coverImageURL,
      availableCopies,
      formatType,
    });

    // create format
    const new_format = await formatModel.create({
      ebook: ebook._id,
      type: formatType,
      preview: format,
      source: format
    });

    // create ebook listing
    const listing = await listedebookModel.create({
      creator: author._id,
      ebook: ebook._id,
      formats: [new_format._id]
    });

    // add ebook to author's ebooks
    author.ebooks.unshift(ebook);
    const updatedauthor = await author.save();

    // add ebook to genre's ebooks
    Genre.ebooks.unshift(ebook);
    const updatedGenre = await Genre.save();

    return res.status(200).json({ result: ebook, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
        .status(500)
        .json({ result: null, message: "Error creating ebook" });
  }
};

/**
 * Takes request with ebook author, genre, title, numberOfPage,
 * description, publishDate, coverImage
 * and updates the ebook with passed parameters,
 * if the new author is different, it adds the ebook to the new
 * author's ebooks, removes from old author's ebooks, and
 * if the new genre is different, it adds it to the ebooks associated with the
 * newly passed genre, removes from old genre's ebooks
 * and returns ebook object updated.
 *
 * Expects:
 * ```json
 * {
 *  "author": String,
 *  "publisher: String,
 *  "genre": String,
 *  "title": String,
 *  "numberOfPages": Number,
 *  "ISBN": String
 *  "description": String,
 *  "publishDate": Date,
 *  "coverImageURL": String,
 *  "availableCopies": Number,
 *  "formatType": String,
 * }
 * ```
 *
 * ebookId should be the object id of the ebook to update as a String, required
 *
 * author and genre should be object ids in String format, required
 *
 * title and description should be Strings, required
 *
 * numberOfPage should be the duration in seconds of the ebook as a Number, required
 *
 * publishDate should be the date the ebook was published as a Date, required
 *
 * coverImage should be a url to the cover art of the ebook as a String, required
 *
 * ebooks should be an array of ebook ids in String format, can be empty
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated ebook
 */
const update_ebook_Information = async (req, res) => {
  try {
    let {
      author,
      publisher,
      genre,
      title,
      numberOfPages,
      ISBN,
      description,
      publishDate,
      coverImageURL,
      formatType,
      availableCopies,
      totalCopies,
      holdQueue
    } = req.body;
    if (
        !author ||
        !publisher ||
        !genre ||
        !title ||
        !numberOfPages ||
        !ISBN ||
        !description ||
        !publishDate ||
        !coverImageURL||
        !formatType ||
        !availableCopies ||
        !totalCopies ||
        !holdQueue
    ) {
      return res
          .status(400)
          .json({ result: null, message: "Invalid request inputs." });
    }
    const ebookToUpdate = await ebookModel.findById(ebookId).exec();
    if (!ebookToUpdate) {
      return res
          .status(400)
          .json({ result: null, message: `Invalid ebook id ${ebookId}` });
    }

    // ensure user is admin or author of ebook being edited
    const { user, roles } = req;
    if (!user || !roles) {
      return res.status(401).json({ result: null, message: "Unauthorized" });
    }
    const User = userModel.findOne({ username: user }).exec();
    if (!User) {
      return res
          .status(401)
          .json({ result: null, message: "Invalid user, unauthorized" });
    }
    if (!(await canAccess(user, roles, ebookId))) {
      return res
          .status(401)
          .json({
            result: null,
            message: "Unauthorized, you may not edit this ebook",
          });
    }

    // if author is different, remove ebook from old author's ebooks and
    // add to new author's ebooks
    if (ebookToUpdate.author.toString() !== author) {
      const oldauthor = await authorModel.findById(ebookToUpdate.author).exec();
      oldauthor.ebooks = oldauthor.ebooks.filter(
          (ebook) => ebook.toString() !== ebookId
      );
      await oldauthor.save();
      const newauthor = await authorModel.findById(author).exec();
      newauthor.ebooks.unshift(ebookId);
      await newauthor.save();
    }

    // if genre is different, remove ebook from old genre's ebooks and
    // add to new genre's ebooks
    if (ebookToUpdate.genre.toString() !== genre) {
      const oldGenre = await genreModel.findById(ebookToUpdate.genre).exec();
      oldGenre.ebooks = oldGenre.ebooks.filter(
          (ebook) => ebook.toString() !== ebookId
      );
      await oldGenre.save();
      const newGenre = await genreModel.findById(genre).exec();
      newGenre.ebooks.unshift(ebookId);
      await newGenre.save();
    }

    // update ebookToUpdate
    ebookToUpdate.author = author;
    ebookToUpdate.publisher = publisher;
    ebookToUpdate.genre = genre;
    ebookToUpdate.title = title;
    ebookToUpdate.numberOfPages = numberOfPages;
    ebookToUpdate.ISBN = ISBN;
    ebookToUpdate.description = description;
    ebookToUpdate.publisher = publishDate;
    ebookToUpdate.coverImageURL = coverImageURL;
    ebookToUpdate.formatType = formatType;
    ebookToUpdate.availableCopies = availableCopies;
    ebookToUpdate.totalCopies = totalCopies;
    ebookToUpdate.holdQueue = holdQueue;


    const updatedebook = await ebookToUpdate.save();

    return res.status(200).json({ result: updatedebook, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
        .status(500)
        .json({ result: null, message: "Error updating ebook" });
  }
};

//updateEbookProperties

/**
 * Takes request with ebook id of ebook to delete
 *
 * Expects:
 * ```json
 * { "ebookId": String }
 * ```
 * ebookId is required, with id being the object id of the ebook to delete in String format
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */
const deleteebook = async (req, res) => {
  try {
    const { ebookId } = req.body;
    if (!ebookId) {
      return res
          .status(400)
          .json({ result: null, message: "ebook id is required" });
    }
    const ebookToDelete = await ebookModel.findById(ebookId).exec();
    if (!ebookToDelete) {
      return res
          .status(400)
          .json({ result: null, message: `Invalid ebook id ${ebookId}` });
    }

    // remove from author's ebooks
    const author = await authorModel.findById(ebookToDelete.author).exec();
    author.ebooks = author.ebooks.filter((ebook) => ebook != ebookId);
    await author.save();

    // remove from genre's ebooks
    const genre = await genreModel.findById(ebookToDelete.genre).exec();
    genre.ebooks = genre.ebooks.filter((ebook) => ebook != ebookId);
    await genre.save();

    await ebookModel.findByIdAndDelete(ebookId).exec();
    return res.status(200).json({ result: null, message: "Success" });
  }
  catch (err) {
    console.log(err);
    return res
        .status(500)
        .json({ result: null, message: "Error deleting ebook" });
  }
};

/**
 * Checks if a user can access a ebook to modify it
 *
 * @param {String} username username of the user trying to access this resource
 * @param {[String]} roles roles of the user trying to access this resource
 * @param {String} ebookId id of the ebook to access
 * @returns {Boolean} true if the user can access the ebook, false otherwise
 */
const canAccess = async (username, roles, ebookId) => {
  if (!username || !roles || !ebookId) {
    return false;
  }

  try {
    const currentauthor = authorModel.findOne({ user: username }).exec();
    const currentebook = ebookModel.findById(ebookId).exec();
    if (!currentauthor || !currentebook) {
      return false;
    }
    if (
        !roles.includes(ROLES_LIST.ADMIN) &&
        currentauthor._id != currentebook.author
    ) {
      return false;
    }
  }
  catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

const Return = async (req,res) => { //eBookToReturn)
  try {
    let userReturning = req.body.user;
    let eBookToReturn = req.body.eBook;
    if (
        !userReturning ||
        !eBookToReturn
    ) {
      return res.status(400).json({ result: null, message: "Missing inputs" });
    }
  let positionOfBook = null;
  for(let i = 0; i < userReturning.checked_out_books.length; i++){
      if(userReturning.checked_out_books[i].book._id === eBookToReturn._id){
        positionOfBook = i;
        break;
      }
  }

  if(positionOfBook == null){
    console.log("You do not currently have that book, return failed");
    return res.status(400).json({ result: null, message: "You do not currently have that book, return failed" });  
  }

  //eBookToReturn.availableCopies++;
  userReturning.checked_out_books.splice(positionOfBook, 1);
  return res.status(200).json({result:"Success", message: "Book Successfully Returned"});

  if(!eBookToReturn.holdQueue.isEmpty){
    let userRecievingBook = eBookToReturn.holdQueue.dequeue();
    //userRecievingBook.CheckOut(eBookToReturn);
    console.log(userRecievingBook + " recieved " + eBookToReturn);
    return res.status(200).json({ result: "Success", message: userRecievingBook + " recieved " + eBookToReturn });
  }

  return res.status(200).json({ result: "ebookReturned" , message: "Success" }); 
} catch (err) {
  console.log(err);
  return res
      .status(500)
      .json({ result: null, message: "Error Returning ebook" });
}
};


const CheckOut = async (req, res) => {
  let userCheckingOut = req.body.user;
  let eBookToCheckOut = req.body.eBook;
  if(!userCheckingOut){
    return res.status(400).json({result:null, message:"Missing User"});
  }
  if(!eBookToCheckOut){
    return res.status(400).json({result:null, message:"Missing eBook"});
  }
  try{
    if(eBookToCheckOut.availableCopies < 1){
      console.log("Not enough copies, checkout failed");
      return res.status(401).json({result:null, message:"Not enough copies, checkout failed"});
    }
    if(userCheckingOut.checked_out_books.length >= 5){
      console.log("Too many books checked out, checkout failed");
      return res.status(401).json({result:null, message:"Too many books checked out, checkout failed"});
    }
    eBookToCheckOut.availableCopies--;
    userCheckingOut.checked_out_books.push(eBookToCheckOut);
    console.log("Checkout Success");
    return res.status(200).json({result:null, message:"Checkout Success!"});
  }
  catch (err) {
    console.log("Error checking out book");
    return res.status(400).json({result:null, message:"Checkout failed"});
  }
}

const Hold = async (req, res) => {
  let userHolding = req.body.user;
  let eBookToHold = req.body.eBook;
  if(!userHolding){
    return res.status(400).json({result:null, message:"Missing User"})
  }
  if(!eBookToHold){
    return res.status(400).json({result:null, message:"Missing eBook"})
  }
  try{
    eBookToHold.holdQueue.push(userHolding);
    console.log("You are #" + eBookToHold.holdQueue.length + " in line.");
    return res.status(200).json({result:"success", message:"You are #" + eBookToHold.holdQueue.length + " in line."});
  }
  catch (err) {
    console.log("Error Holding Book");
    return res.status(400).json({result:null, message:"Error Holding Book"});
  }
}

module.exports = {
  populateCatalog,
  get_eBook,
  addEbook,
  initialize_eBook,
  update_ebook_Information,
  deleteebook,
  Return,
  CheckOut,
  Hold,
};