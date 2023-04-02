
const mongoose = require('mongoose');
const connectDB = require("./config/DbConnection");
const {authorModel} = require("./models/Author");
const EBookController = require("./controllers/EbookController");
// Database connection

connectDB("mongodb://localhost:27017/bookworm");
// User model

const addEbook = async (req, res)=>{
    let author = req.body;
    if(!author){
        return res.status(400).json({ message: "Missing inputs" });
    }

    if(!mongoose.Types.ObjectId.isValid(author)){
        return res.status(400).json({ message: "Invalid inputs" });
    }

    const authorId = await authorModel.findById(author).exec();
    if (!authorId) {
        return res
            .status(400)
            .json({ message: "Invalid author id" });
    }
    app.post('/Add', (req, res) => {
        EBookController.addEbook(req, res);
    })

}








// // Finding a document whose id=5ebadc45a99bde77b2efb20e
// var id = '641e64ac8e9918f38c03f3f2';
// User.findById(id, function (err, docs) {
//     if (err){
//         console.log(err);
//     }
//     else{
//         console.log("Result : ", docs);
//     }
// });