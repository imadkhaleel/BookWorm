// Required modules
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Connect to database
mongoose.connect('mongodb://127.0.0.1:27017/testuserdb', { useNewUrlParser: true });

// User schema and model
const customerFullSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  age: String,
  userType: String,
  email: String,
  password: String,
  readingList: String,
});

const Customer = mongoose.model('Customer', customerFullSchema);

// Passport configuration
const initializePassport = require('./passport-config');
const users = [];
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

// Initialize app
const app = express();

// Middleware
app.set('view-engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//routes 
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        name: req.user.name,
        lastname:req.user.lastName,
        email: req.user.email,
        id: req.user.id
    });
});

  
app.get('/login', checkNotAuthenticated, (req, res) => {
     res.render('login.ejs')
})
  
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})


Customer.find({}, function(err, customers) {
    if (err) {
      console.log(err);
    } else {
      // Iterate over the documents and push each document's data to the users array
      customers.forEach(function(customer) {
        users.push({
          id: customer.id,
          name: customer.firstName,
          lastName: customer.lastName,
          age: customer.age,
          userType: customer.userType,
          email: customer.email,
          password: customer.password,
          readingList: customer.readingList,
          _id: customer._id
        });
      });
    }
});

  
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user_temp = new Customer({

        id: Date.now().toString(),
        firstName: req.body.name,
        lastName: req.body.lastname,
        age: req.body.age,
        userType: "Member",
        email: req.body.email,
        password: hashedPassword,
        readingList: "Empty"
    
    })
    user_temp.save();

    users.push({
        id: Date.now().toString(),
        name: req.body.name,
        lastName: req.body.lastname,
        age: req.body.age,
        userType: "Member",
        email: req.body.email,
        password: hashedPassword,
        readingList: "Empty",
        _id: 1

    })
    
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })

  
  
app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
});

app.post('/search', (req, res) => {
    const searchInput = req.body.searchInput;
    const jsonData = JSON.parse(fs.readFileSync('ebooks.json', 'utf-8'));
    const result = jsonData.find(item => item.title === searchInput);
    if (result) {
        console.log(result.author)
        res.render('details.ejs', {item: result, 
           
        id:result.id,
        author:result.author,
        publisher:result.publisher,
        genre:result.genre,
        title:result.title,
        numberOfPages:result.numberOfPages,
        ISBN:result.ISBN,
        description:result.description,
        publishDate:result.publishDate,
        coverImageURL:result.coverImageURL,
        availableCopies:result.availableCopies,

        });
    } else {
      res.send('Nothing found!');
    }
});


app.post('/catalog', (req, res) => {
    const jsonData = JSON.parse(fs.readFileSync('ebooks.json', 'utf-8'));
    const bookTitles = jsonData.map(book => book.title);
    console.log(bookTitles);
  
    res.render('catalog.ejs',{bookTitles});
});
  

//functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}
  
  app.listen(3000)