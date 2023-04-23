"use strict";
const path = require("path");

const mongoose = require("mongoose");
const { genreModel } = require("../models/Genre");
const { userModel } = require("../models/User");
const { eBookModel } = require("../models/Ebook");
const { listedEbookModel } = require("../models/ListedEbook");
//const { formatModel } = require("../models/Format");
const { authorModel } = require("../models/Author");
const ROLES_LIST = require("../config/RolesList");
const {bodyParser} = require("body-parser");
/**
 * Gets list of existing ebooks
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and result containing list of ebooks if found
 */
const populateCatalog = async (req, res) => {
  try {
    const ebooks = await eBookModel.find({}).exec();
    return res.status(200).json({ result: ebooks, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error getting ebooks" });
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
const getEbook = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res
        .status(400)
        .json({ message: "ebook id is required" });
  }
  try {
    const ebookDocument = await eBookModel.findById(id).exec();
    if(!ebookDocument) {
      return res.status(400).json({ message: "No ebook found with that ID"});
    }
    return res.status(200).json({ result: ebookDocument, message: "Success" });
  } catch (err) {
    //console.log(err);
    return res
        .status(500)
        .json({ error: err, message: "Error getting ebook" });
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
 * numberOfPages should be the duration in seconds of the ebook as a Number, required
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
try{
  let {
    authorId,
    publisher,
    genreId,
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
      !authorId ||
      !publisher ||
      !genreId ||
      !title ||
      !numberOfPages ||
      !ISBN ||
      !description ||
      !publishDate ||
      !coverImageURL ||
      !availableCopies ||
      !formatType
  ) {
    return res.status(400).json({message: "Missing inputs"});
  }

  if (
      !mongoose.isValidObjectId(authorId) ||
      !mongoose.isValidObjectId(genreId)
  ) {
    return res.status(400).json({ message: "Invalid author or genre" });
  }

  // const authorId = await authorModel.findById(author).exec();
  // if (!authorId) {
  //   return res
  //       .status(400)
  //       .json({ message: "Invalid author id" });
  // }

  // const Genre = await genreModel.findById(genre).exec();
  // if (!Genre) {
  //   return res
  //       .status(400)
  //       .json({ message: "Invalid genre id" });
  // }
  // const { user, roles } = req;
  // if (!user || !roles) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  // const User = userModel.findOne({ username: user }).exec();
  // if (!User) {
  //   return res
  //       .status(401)
  //       .json({ message: "Invalid user, unauthorized" });
  // }
  //
  // if (
  //     !roles.includes(ROLES_LIST.ADMIN) //&&
  //     //!(author.user.toString() === User._id.toString())
  // ) {
  //   return res
  //       .status(401)
  //       .json({
  //         message:
  //             "Unauthorized, you may not create an ebook under another author's name",
  //       });
  // }

  // check if ebook with same author and title and description already exists
  const existingebook = await eBookModel
      .findOne({
        authorId,
        title,
        description,
      })
      .exec();
  if (existingebook) {
    return res.status(400).json({
      message: "ebook with same name, title, and description already exists",
    });
  }

  let totalCopies = availableCopies;
  let holdQueue = [];
  const createdEbook = await eBookModel.create({
    author: authorId,
    publisher,
    genre: genreId,
    title,
    numberOfPages,
    ISBN,
    description,
    publishDate,
    coverImageURL,
    availableCopies,
    totalCopies,
    holdQueue,
  });

  // add ebook to author's ebooks
  const authorDocument = authorModel.findById(authorId);//, function (err, docs) {
  //   if (err){
  //     console.log(err);
  //   }
  //   else{
  //     console.log("Result : ", docs);
  //   }
  // });;
  console.log(authorDocument);
  authorDocument.ebooks.unshift(createdEbook);//.ebooks.unshift(createdEbook);
  //const updatedauthor = await authorDocument.sa

  // add ebook to genre's ebooks
  // ebook.genre.unshift(genre);
  // const updatedGenre = await Genre.save();

   return res.status(200).json({result: createdEbook, message: "Success"});

  } catch (err) {
    console.log(err);
    return res
        .status(500)
        .json({ message: `Error creating ebook: ${err}` });
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
/*const initialize_eBook = async (req, res) => {
  const { user, roles } = req;
  const {
    authorId,
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

  // let coverImage = "";
  // let format = "";

  if (!user || !roles) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!authorId || !genre || !title || !numberOfPages || !description || !publishDate || !formatType) {
    return res.status(400).json({ message: "Missing inputs" });
  }

  try {
    const foundAuthor = await authorModel.findOne({ _id: authorId }).exec();
    if (!foundAuthor) {
      return res.status(400).json({ message: "Invalid author" });
    }
    let Genre = await genreModel.findOne({ _id: genre }).exec();
    if (!Genre) {
      // create genre if it doesn't exist
      const newGenre = await genreModel.create({ name: genre });
      Genre = newGenre;
    }

    // check if ebook with same author and title and description already exists
    const existingebook = await eBookModel.findOne({ author: authorId._id, title, description }).exec();
    if(existingebook) {
      return res.status(400).json({ message: "ebook with same name, title, and description already exists" });
    }

    // create ebook
    const ebook = await eBookModel.create({
      author: authorId._id,
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
    const listing = await listedEbookModel.create({
      creator: authorId._id,
      ebook: ebook._id,
      formats: [new_format._id]
    });

    // add ebook to author's ebooks
    authorId.ebooks.unshift(ebook);
    const updatedauthor = await authorId.save();

    // add ebook to genre's ebooks
    // Genre.ebooks.unshift(ebook);
    // const updatedGenre = await Genre.save();

    return res.status(200).json({ result: ebook, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
        .status(500)
        .json({ message: "Error creating ebook" });
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
const updateEbookInformation = async (req, res) => {
  try {
    let {
      eBookId,
      authorId,
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
        !eBookId ||
        !authorId ||
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
      ){
      return res
          .status(400)
          .json({ message: "Invalid request inputs." });
      }
      const ebookToUpdate = await eBookModel.findById(eBookId).exec();
      if (!ebookToUpdate) {
        return res
            .status(400)
            .json({ message: `Invalid ebook id ${eBookId}` });
      }

    // ensure user is admin or author of ebook being edited
    // const { user, roles } = req;
    // if (!user || !roles) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }
    // const User = userModel.findOne({ username: user }).exec();
    // if (!User) {
    //   return res
    //       .status(401)
    //       .json({ message: "Invalid user, unauthorized" });
    // }
    // if (!(await canAccess(user, roles, ebookId))) {
    //   return res
    //       .status(401)
    //       .json({
    //         message: "Unauthorized, you may not edit this ebook",
    //       });
    // }

    // if author is different, remove ebook from old author's ebooks and
    // add to new author's ebooks
    let author = authorModel.findById(authorId);
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
        .json({ message: "Error updating ebook" });
  }
};

//updateEbookProperties

/**
 * Takes request with ebook id of ebook to delete
 *
 * Expects:
 * ```json
 * {
 *  "ebookId": String (UUID)
 * }
 * ```
 * ebookId is required, with id being the object id of the ebook to delete in String format
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */
const deleteEbook = async (req, res) => {
  try {
    const { ebookId } = req.body;
    if (!ebookId) {
      return res
          .status(400)
          .json({ message: "ebook id is required" });
    }
    const ebookToDelete = await eBookModel.findById(ebookId).exec();
    if (!ebookToDelete) {
      return res
          .status(400)
          .json({ message: `Invalid ebook id ${ebookId}` });
    }

    // remove from author's ebooks
    const author = await authorModel.findById(ebookToDelete.author).exec();
    author.ebooks = author.ebooks.filter((ebook) => ebook != ebookId);
    await author.save();

    // remove from genre's ebooks
    const genre = await genreModel.findById(ebookToDelete.genre).exec();
    genre.ebooks = genre.ebooks.filter((ebook) => ebook != ebookId);
    await genre.save();

    await eBookModel.findByIdAndDelete(ebookId).exec();
    return res.status(200).json({ message: "Success" });
  }
  catch (err) {
    console.log(err);
    return res
        .status(500)
        .json({ message: "Error deleting ebook" });
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
    const currentebook = eBookModel.findById(ebookId).exec();
    if (!(await currentauthor) || !(await currentebook)) {
      return false;
    }
    if (
        !roles.includes(ROLES_LIST.ADMIN) &&
        (await currentauthor)._id != currentebook.author
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
/*
* Takes in a userID and eBookID in the body
* {
*   userId: UUID,
*   eBookId: UUID
* }
 */
const Return = async (req,res) => { //eBookToReturn)
  try {
    let userReturningId = req.body.userId;
    let eBookToReturnId = req.body.eBookId;
    if (
        !userReturningId ||
        !eBookToReturnId
    ) {
      return res.status(400).json({ message: "Missing inputs" });
    }
    let positionOfBook = null;
    let userReturning = userModel.findById(userReturningId).exec();
    for(let i = 0; i < (await userReturning).checkedOutBookIds.length; i++){
      if(userReturning.checkedOutBookIds[i] === eBookToReturnId){
        positionOfBook = i;
        break;
      }
  }

    if(positionOfBook === null){
      console.log("You do not currently have that book, return failed");
      return res.status(400).json({ message: "You do not currently have that book, return failed" });
    }
    let eBookToReturn = eBookModel.findById(eBookToReturnId);
    (await eBookToReturn).availableCopies++; //Increase available copies to reflect the
    (await userReturning).checkedOutBookIds.splice(positionOfBook, 1);
    return res.status(200).json({result:"Success", message: "Book Successfully Returned",
                                ebook: eBookToReturn,
                                user: userReturning});

    //Add ebook to the user that is next in line in the queue (if it is not empty for this book)

    if(!(await eBookToReturn).holdQueue.isEmpty){
      let userRecievingBookId = (await eBookToReturn).holdQueue.dequeue();
      //userRecievingBook.CheckOut(eBookToReturn);
      let userRecievingDocument = userModel.findById(userRecievingBookId);
      (await userRecievingDocument).checkedOutBookIds.push(eBookToReturnId);
      (await eBookToReturn).availableCopies--;
      await userRecievingDocument.save();
      console.log("User with UUID " + userRecievingBookId + " received book with UUID " + eBookToReturnId);
      return res.status(200).json({ result: "Success", message: userRecievingBookId + " received " + eBookToReturnId });
    }
    await eBookToReturn.save();
    return res.status(200).json({ result: "ebookReturned" , message: "Success" }); 
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error Returning ebook" });
  }
};

/*
* Takes in 2 arguments in the body
* {
*   userId: UUID,
*   eBookId: UUID
* }
 */
const CheckOut = async (req, res) => {
  let userCheckingOutId = req.body.userId;
  let eBookToCheckOutId = req.body.eBookId;
  if(!userCheckingOutId){
    return res.status(400).json({ message: "Missing or invalid User ID"});
  }
  if(!eBookToCheckOut){
    return res.status(400).json({ message:"Missing or invalid eBook ID"});
  }
  try{
    let eBookToCheckOut = eBookModel.findById(eBookToCheckOutId);
    if((await eBookToCheckOut).availableCopies < 1){
      console.log("Not enough copies, checkout failed");
      return res.status(401).json({ message:"Not enough copies, checkout failed"});
    }
    let userCheckingOut = userModel.findById(userCheckingOutId);
    if((await userCheckingOut).checkedOutBookIds?.length >= 5){
      console.log("Too many books checked out, checkout failed");
      return res.status(401).json({ message:"Too many books checked out, checkout failed"});
    }
    eBookToCheckOut.availableCopies--;
    await eBookToCheckOut.save();
    userCheckingOut.checkedOutBookIds.push(eBookToCheckOutId);
//    db.collection("ebook").findByIdAndUpdate({_id:eBookToCheckOut._id}, 
//                                {$set: {"availableCopies":eBookToCheckOut.availableCopies}});
    console.log("Checkout Success");
    return res.status(200).json({ message:"Checkout Success!",
          ebook: eBookToCheckOut, 
          user: userCheckingOut});
  }
  catch (err) {
    console.log(err);
    console.log("Error checking out book");
    return res.status(400).json({ message:"Checkout failed"});
  }
}
/*
* Hold takes in 2 arguments in the body
* {
*   userId: UUID,
*   eBookId: UUID
* }
* userId is the ID of the user that wants to hold the book
* eBookId is the ID of the book that the user wants to borrow
 */
const Hold = async (req, res) => {
  let userHoldingId = req.body.userId;
  let eBookToHoldId = req.body.eBookId;
  if(!userHoldingId){
    return res.status(400).json({ message: "Missing User"})
  }
  if(!eBookToHoldId){
    return res.status(400).json({ message: "Missing eBook"})
  }
  try{
    const eBookToHold = await eBookModel.findById(eBookToHoldId);
    (await eBookToHold).holdQueue.push(userHolding._id);
    console.log("You are #" + eBookToHold.holdQueue.length + " in line.");
    return res.status(200).json({result:"success", message:"You are #" + eBookToHold.holdQueue.length + " in line.",
                              ebook: eBookToHold,
                              user: userHoldingId});
  }
  catch (err) {
    console.log(err);
    //console.log("Error Holding Book");
    return res.status(400).json({ error: err, message: "Error Holding Book"});
  }
}

module.exports = {
  populateCatalog,
  get_eBook: getEbook,
  addEbook,
  //initialize_eBook,
  updateEbookInformation,
  deleteEbook,
  Return,
  CheckOut,
  Hold
};