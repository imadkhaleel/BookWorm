const mongoose = require("mongoose");
const { genreModel } = require("../models/Genre");
const { ebookModel } = require("../models/Ebook");

/**
 * Gets list of existing genres
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and list of genres
 */
const getGenres = async (req, res) => {
  try {
    const genres = await genreModel.find({}).exec();
    return res.status(200).json({ result: genres, message: "Success" });
  } 
  catch (err) {
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting genres" });
  }
};

/**
 * Takes request with genre id and returns genre object if it exists, null otherwise
 * Expects genre id as url parameter:
 * 
 * Ex: www.bookworm.com/api/genre/5f9f1b9f9f1b9f1b9f1b9f1b
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried genre
 */
const getGenre = async (req, res) => {
  try {
    const genre = await genreModel.findById(req.params.id).exec();
    return res.status(200).json({ result: genre, message: "Success" });
  } 
  catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error getting genre" });
  }
};

/**
 * Takes request with genre name and returns genre object created
 * Expects:
 * ```json
 * { "name": String, "ebooks": [String] }
 * ```
 * ebooks should be an array of ebook ids in String format, can be empty
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and created genre
 */
const createGenre = async (req, res) => {
  try {
    let { name, ebooks } = req.body;
    console.log(req.body)
    console.log(req)
    if(!name) {
      return res.status(400).json({ result: null, message: "Genre name is required" });
    }
    if(!ebooks) { ebooks = []; }
    else {
      // check to make sure each element in ebooks is a valid ebook id
      for(let i = 0; i < ebooks.length; i++) {
        const ebook = await ebookModel.findById(ebooks[i]).exec();
        if(!ebook) {
          return res.status(400).json({ result: null, message: `Invalid ebook id ${ebooks[i]}` });
        }
      }
    }
    const genre = await genreModel.create({ name, ebooks });
    return res.status(200).json({ result: genre, message: "Success" });
  } 
  catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error creating genre" });
  }
};

/**
 * Takes request with genre name and returns genre object updated as result
 * Replaces existing genre with new genre created with passed name and ebooks
 * 
 * Expects:
 * ```json
 * { "id": String, "name": String, "ebooks": [String] }
 * ```
 * id and name are required, with id being the object id of the genre to update in String format
 * 
 * ebooks should be an array of ebook ids in String format, can be empty
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated genre
 */
const updateGenre = async (req, res) => {
  try {
    let { id, name, ebooks } = req.body;
    if(!id || !name) {
      return res.status(400).json({ result: null, message: "Genre name and id is required" });
    }
    const genreToUpdate = await genreModel.findById(id).exec();
    if(!genreToUpdate) {
      return res.status(400).json({ result: null, message: `Invalid genre id ${id}` });
    }
    if(!ebooks) { ebooks = []; }
    else {
      // check to make sure each element in ebooks is a valid ebook id
      for(let i = 0; i < ebooks.length; i++) {
        const ebook = await ebookModel.findById(ebooks[i]).exec();
        if(!ebook) {
          return res.status(400).json({ result: null, message: `Invalid ebook id ${ebooks[i]}` });
        }
      }
    }

    const newGenre = await genreModel.findByIdAndUpdate(id, 
      { name, ebooks }, 
      { new: true }
    ).exec();

    return res.status(200).json({ result: newGenre, message: "Success" });
  } 
  catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error updating genre" });
  }
}

/**
 * Takes request with genre id and ebooks to insert and returns genre object updated
 * 
 * Expects:
 * ```json
 * { "id": String, "ebooks": [String] }
 * ```
 * id is required, with id being the object id of the genre to update in String format
 * 
 * ebooks is required, with ebooks being an array of ebook ids in String format
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated genre
 */
const addebooksToGenre = async (req, res) => {
  try {
    const { id, ebooks } = req.body;
    if(!id || !ebooks) {
      return res.status(400).json({ result: null, message: "Genre id and ebooks are required" });
    }
    const genreToUpdate = await genreModel.findById(id).exec();
    if(!genreToUpdate) {
      return res.status(400).json({ result: null, message: `Invalid genre id ${id}` });
    }
    const containedebooks = new Set(genreToUpdate.ebooks.map(ebook => ebook.toString()));
    // check to make sure each element in ebooks is a valid ebook id
    for(let i = 0; i < ebooks.length; i++) {
      const ebook = await ebookModel.findById(ebooks[i]).exec();
      if(!ebook) {
        return res.status(400).json({ result: null, message: `Invalid ebook id ${ebooks[i]}` });
      }
      if(containedebooks.has(ebooks[i])) {
        return res.status(400).json({ result: null, message: `ebook ${ebooks[i]} already in genre` });
      }
    }

    // push each element in ebooks to genreToUpdate.ebooks
    let updatedGenre = await genreModel.findByIdAndUpdate(
      id, 
      { $push: { ebooks: { $each: ebooks } } }
    ).exec();
    updatedGenre = await genreModel.findById(id).exec();
    return res.status(200).json({ result: updatedGenre, message: "Success" });
  } 
  catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error adding ebooks to genre" });
  }
};


/**
 * Takes request with genre id of genre to delete
 * 
 * Expects:
 * ```json
 * { "id": String }
 * ```
 * id is required, with id being the object id of the genre to delete in String format
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */
const deleteGenre = async (req, res) => {
  try {
    const { id } = req.body;
    if(!id) {
      return res.status(400).json({ result: null, message: "Genre id is required" });
    }
    const genreToDelete = await genreModel.findById(id).exec();
    if(!genreToDelete) {
      return res.status(400).json({ result: null, message: `Invalid genre id ${id}` });
    }
    await genreModel.findByIdAndDelete(id).exec();
    return res.status(200).json({ result: null, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error deleting genre" });
  }
};

module.exports = {
  getGenres,
  getGenre,
  createGenre,
  updateGenre,
  addebooksToGenre,
  deleteGenre
};